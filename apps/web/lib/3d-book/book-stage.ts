/**
 * Single shared WebGL canvas for every 3D book on a page.
 *
 * Mirrors how press.stripe.com drives its whole book gallery from one
 * `<canvas>`: instead of each book mounting its own WebGLRenderer (its own
 * GL context, its own shader compile, its own lighting rig), every book
 * registers a THREE.Group with this module-level singleton, which renders
 * each registrant into its own scissored viewport region of one shared
 * full-page canvas — the standard three.js "many DOM-tracked views, one
 * renderer" technique (see three.js's own webgl_multiple_elements example).
 *
 * Lazily created on first `registerBook` call, torn down when the last
 * book unregisters (e.g. on route change).
 */
import * as THREE from 'three'

export interface BookLighting {
  ambient: THREE.AmbientLight
  hemi: THREE.HemisphereLight
  key: THREE.DirectionalLight
  fill: THREE.DirectionalLight
  rim: THREE.DirectionalLight
}

export interface BookCameraConfig {
  fov: number
  position: [number, number, number]
  near?: number
  far?: number
}

export interface BookRegistration {
  /** Root group for this book (rotating book group + its own floor shadow, etc). Added to the shared scene. */
  root: THREE.Group
  /** DOM element whose on-screen rect drives this book's scissor/viewport region. */
  container: HTMLElement
  camera: BookCameraConfig
  /**
   * Called once per animation frame before this book's region is rendered.
   * `inViewport` reports whether the book is currently on-screen (its draw
   * call is skipped when false, but physics still advances so it doesn't
   * jump when scrolled back into view). Return true while the book still
   * wants to animate (dragging, settling, idle breathing, or just visible
   * and auto-rotating) — the shared loop keeps running as long as any
   * registrant returns true, and pauses once they all settle, the same
   * demand-driven behavior each book used to implement on its own.
   */
  onFrame: (dt: number, elapsed: number, inViewport: boolean) => boolean
}

interface Registrant extends BookRegistration {
  id: number
  /** Last measured on-screen rect, refreshed only while layout can actually change (see `rectsDirtyUntil`). */
  rect: {
    left: number
    top: number
    right: number
    bottom: number
    width: number
    height: number
  }
}

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let canvasEl: HTMLCanvasElement | null = null

const registrants = new Map<number, Registrant>()
let nextId = 1
let rafId = 0
let lastFrameTime = 0
let visibleRegistrantId = -1

// ----------------------------------------------------------------------------
// Layout-read budget
//
// `getBoundingClientRect()` / `clientHeight` force a synchronous style+layout
// recalculation. Reading them once per registrant on every animation frame was
// by far the most expensive non-GPU cost in a profile of this page (~11% of a
// throttled core, sustained, for as long as any book is on screen) because the
// rest of the page keeps invalidating layout, so every frame paid for a full
// recalc of a ~13k-node document.
//
// A book's rect only actually moves when the page scrolls, the window resizes,
// or a CSS transform transition on its wrapper is mid-flight (the scripture
// section scales its book wrapper on hover over 500ms). All three are driven by
// input, so rects are re-measured for a short window after any pointer/scroll/
// resize activity and reused verbatim otherwise — the idle breathing loop, which
// is the state a book spends ~all of its time in, now does no layout at all.
// ----------------------------------------------------------------------------
const RECT_DIRTY_WINDOW_MS = 900
let rectsDirtyUntil = 0
let viewportHeight = 0

/**
 * Idle frame budget. While nothing is being hovered or dragged the only motion
 * is a 0.85Hz, 0.01-unit breathing sine — indistinguishable at 30fps from 60fps,
 * but half the draw calls and half the GPU work, sustained for the whole time a
 * book is on screen. Interaction (and the frames right after it) always runs at
 * the display's full rate; see `requestBookStageRender`.
 */
const IDLE_FRAME_INTERVAL_MS = 1000 / 30
let fullRateUntil = 0
let lastDrawTime = 0

/**
 * Anything that can move a book's on-screen box — scroll, resize, pointer
 * activity driving a hover transition — reopens both budgets together: the
 * scissor rect has to track the container exactly, and it can only do that if
 * it is both re-measured and redrawn at the display's full rate.
 */
function markInteractive(): void {
  const now = performance.now()
  rectsDirtyUntil = now + RECT_DIRTY_WINDOW_MS
  fullRateUntil = now + RECT_DIRTY_WINDOW_MS
  requestFrame()
}

function onVisibilityChange(): void {
  if (document.hidden) {
    cancelAnimationFrame(rafId)
    rafId = 0
  } else {
    markInteractive()
  }
}

function ensureStage(): void {
  if (renderer) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  // Every `linkProgram` is followed by a `getProgramParameter`/`getProgramInfoLog`
  // pair when this is on, and those are synchronous round-trips that stall the
  // main thread until the driver has finished compiling. The book materials are
  // MeshPhysicalMaterial variants (clearcoat + normal + roughness + env), so
  // there are a lot of programs to link; three.js documents turning this off in
  // production for exactly this reason. Shader errors still surface in dev.
  renderer.debug.checkShaderErrors = process.env.NODE_ENV !== 'production'
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.shadowMap.enabled = false
  renderer.setScissorTest(true)
  renderer.autoClear = false

  canvasEl = renderer.domElement
  canvasEl.style.position = 'fixed'
  canvasEl.style.top = '0'
  canvasEl.style.left = '0'
  canvasEl.style.width = '100vw'
  canvasEl.style.height = '100vh'
  canvasEl.style.pointerEvents = 'none'
  canvasEl.style.zIndex = '1'
  document.body.appendChild(canvasEl)

  // A lost GPU context now blanks every book on the page (one shared canvas),
  // not just one — recover instead of leaving it dead. `preventDefault()` is
  // required for the browser to attempt restoration at all (MDN: WebGL best
  // practices). three.js keeps object/texture references around, so a fresh
  // render after `webglcontextrestored` is enough to repaint.
  canvasEl.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
    cancelAnimationFrame(rafId)
    rafId = 0
  })
  canvasEl.addEventListener('webglcontextrestored', () => {
    requestFrame()
  })

  const ambient = new THREE.AmbientLight(0xffffff, 0.95)
  const hemi = new THREE.HemisphereLight(0xf8f2e8, 0x151821, 0.9)
  const key = new THREE.DirectionalLight(0xfff4e5, 2.4)
  key.position.set(4.6, 5.6, 5.6)
  const fill = new THREE.DirectionalLight(0xdde8f7, 0.7)
  fill.position.set(-4.5, 2.2, 3.9)
  const rim = new THREE.DirectionalLight(0xffffff, 0.6)
  rim.position.set(1.5, 3.6, -5)

  scene.add(ambient, hemi, key, fill, rim)

  void loadEnvironment()

  window.addEventListener('resize', resizeCanvas)
  // The canvas is a single viewport-fixed overlay: every registrant's
  // scissor/viewport rect is derived from its DOM container's on-screen
  // position, which changes on scroll even when nothing is "animating".
  // Demand-driven rendering only pauses the loop when settled — without
  // this, a settled book keeps the pixels from wherever it was last drawn
  // and visually detaches from its container as the page scrolls.
  window.addEventListener('scroll', markInteractive, {
    passive: true,
    capture: true,
  })
  // Pointer activity is what drives the hover scale transition on a book's
  // wrapper, so it also has to reopen the layout-read window.
  window.addEventListener('pointermove', markInteractive, {
    passive: true,
    capture: true,
  })
  window.addEventListener('pointerdown', markInteractive, {
    passive: true,
    capture: true,
  })
  document.addEventListener('visibilitychange', onVisibilityChange)
  resizeCanvas()
}

/**
 * Studio-style environment reflections. Without this, clearcoat/metalness on the
 * cover materials has nothing to reflect and reads as flat matte plastic no
 * matter how high clearcoat is set — this is most of what makes a glossy
 * hardcover look "real" instead of "blocky CG box".
 *
 * Built off the critical path: `RoomEnvironment` is a scene of its own that
 * PMREM renders and convolves across six faces and several mip levels, which is
 * ~150ms of unbroken main-thread work on a throttled device. It resolves long
 * before the cover artwork finishes downloading, so the book is never drawn
 * without it in practice; the dynamic import also keeps it out of the chunk that
 * has to be parsed before anything can be shown.
 */
async function loadEnvironment(): Promise<void> {
  if (!renderer || !scene) return
  try {
    const { RoomEnvironment } =
      await import('three/examples/jsm/environments/RoomEnvironment.js')
    if (!renderer || !scene) return
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.25
    pmrem.dispose()
    requestFrame()
  } catch (err) {
    // A book without reflections still renders; a thrown error here would
    // otherwise take the whole stage down.
    console.error('[book-stage] Environment map failed to build:', err)
  }
}

function resizeCanvas(): void {
  if (!renderer || !canvasEl) return
  const dpr = Math.min(window.devicePixelRatio || 1, 1.4)
  renderer.setPixelRatio(dpr)
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  viewportHeight = window.innerHeight
  markInteractive()
}

/** Re-measures every registrant's on-screen rect. Forces layout — call at most once per frame. */
function measureRects(): void {
  viewportHeight = window.innerHeight
  for (const registrant of registrants.values()) {
    const r = registrant.container.getBoundingClientRect()
    registrant.rect = {
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
    }
  }
}

function frame(now: number): void {
  rafId = 0
  if (!renderer || !scene || !camera) return

  const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000))
  lastFrameTime = now
  const elapsed = now / 1000

  const fullRate = now < fullRateUntil
  // Idle frames still advance physics (so the breathing sine stays continuous
  // and nothing jumps when interaction resumes) but skip the draw, halving GPU
  // work for the state a book is in almost all of the time.
  const shouldDraw = fullRate || now - lastDrawTime >= IDLE_FRAME_INTERVAL_MS

  if (shouldDraw && now < rectsDirtyUntil) measureRects()

  let anyActive = false

  if (shouldDraw) {
    lastDrawTime = now
    // Full clear first: a book that scrolls out of view is simply skipped
    // below (no draw call), but its previously-rendered pixels would
    // otherwise sit untouched at those fixed screen coordinates forever —
    // this is a full-viewport canvas, nothing else repaints over it.
    renderer.setScissorTest(false)
    renderer.setViewport(
      0,
      0,
      renderer.domElement.width,
      renderer.domElement.height
    )
    renderer.clear(true, true)
    renderer.setScissorTest(true)
  }

  for (const registrant of registrants.values()) {
    const rect = registrant.rect
    const inViewport =
      rect.bottom >= 0 &&
      rect.top <= viewportHeight &&
      rect.width > 0 &&
      rect.height > 0

    // Still advance physics for off-screen books so they don't jump when
    // they scroll back into view, but skip the (wasted) draw call.
    const stillAnimating = registrant.onFrame(dt, elapsed, inViewport)
    if (stillAnimating) anyActive = true
    if (!inViewport || !shouldDraw) continue

    // Only one registrant's root is visible at a time, so that each scissored
    // region draws its own book. Mutating `visible` on every root for every
    // registrant every frame is O(n²) of needless render-list invalidation —
    // flip just the two that actually change.
    if (visibleRegistrantId !== registrant.id) {
      const previous = registrants.get(visibleRegistrantId)
      if (previous) previous.root.visible = false
      registrant.root.visible = true
      visibleRegistrantId = registrant.id
    }

    const left = Math.round(rect.left)
    // WebGL viewport/scissor origin is bottom-left; DOM rects are top-left.
    const bottom = Math.round(viewportHeight - rect.bottom)
    const width = Math.round(rect.width)
    const height = Math.round(rect.height)

    camera.fov = registrant.camera.fov
    camera.near = registrant.camera.near ?? 0.05
    camera.far = registrant.camera.far ?? 100
    camera.aspect = width / height
    camera.position.set(...registrant.camera.position)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()

    renderer.setViewport(left, bottom, width, height)
    renderer.setScissor(left, bottom, width, height)
    renderer.render(scene, camera)
  }

  if (anyActive && !document.hidden) {
    rafId = requestAnimationFrame(frame)
  }
}

function requestFrame(): void {
  if (rafId || document.hidden) return
  lastFrameTime = performance.now()
  rafId = requestAnimationFrame(frame)
}

/** Register a book's group + DOM container with the shared stage. Returns an unregister function. */
export function registerBook(registration: BookRegistration): () => void {
  ensureStage()
  const id = nextId++
  registration.root.visible = false
  registrants.set(id, {
    ...registration,
    id,
    rect: { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 },
  })
  scene?.add(registration.root)
  markInteractive()

  return () => {
    registrants.delete(id)
    if (visibleRegistrantId === id) visibleRegistrantId = -1
    scene?.remove(registration.root)
    disposeObject3D(registration.root)

    if (registrants.size === 0) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }
}

/**
 * Frees the geometries and materials created for one book's group so
 * repeated mount/unmount (e.g. SPA navigation) doesn't leak GPU memory.
 *
 * Deliberately does NOT dispose the textures materials reference: several
 * are process-lifetime singletons shared across every book instance (the
 * page/edge/shadow textures from `getSharedBookTextures`, and the per-cover
 * baked detail maps cached by `getCoverDetailMaps`) — disposing those here
 * would corrupt other still-mounted or future book instances that reuse the
 * same cached texture. Geometries and materials are always created fresh
 * per registration, so those are always safe to dispose.
 */
function disposeObject3D(object: THREE.Object3D): void {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh
    mesh.geometry?.dispose()

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : []
    for (const material of materials) material.dispose()
  })
}

/**
 * Ask the stage to keep rendering (e.g. after a pointer/scroll event changes a
 * book's target state). Also opens the full-rate + layout-read window, since
 * every caller is reacting to something that can move the book or its container.
 */
export function requestBookStageRender(): void {
  const now = performance.now()
  fullRateUntil = now + RECT_DIRTY_WINDOW_MS
  rectsDirtyUntil = now + RECT_DIRTY_WINDOW_MS
  requestFrame()
}

/** Lazily creates the stage if needed and returns its shared renderer (for anisotropy lookups, etc). */
export function ensureBookStageRenderer(): THREE.WebGLRenderer {
  ensureStage()
  return renderer!
}

export function isBookStageActive(): boolean {
  return renderer !== null
}

/**
 * Hands control back to the browser so a long setup sequence is split across
 * several tasks instead of one multi-hundred-millisecond block. Building a book
 * (geometry, ~10 materials, the shared procedural textures, then the first draw
 * with its shader compiles) is unavoidably a lot of work; doing it in one task
 * blocks input and scrolling for the whole duration, which is what actually
 * reads as "the page froze".
 */
export function yieldToMain(): Promise<void> {
  const scheduler = (
    globalThis as { scheduler?: { yield?: () => Promise<void> } }
  ).scheduler
  if (typeof scheduler?.yield === 'function') return scheduler.yield()
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// ----------------------------------------------------------------------------
// Setup queue
//
// Every book on a page crosses the viewport threshold at the same moment, so
// without this their setups interleave into one long stretch of blocked main
// thread. Serializing them means the first book appears sooner and the browser
// gets a scheduling point between each one.
// ----------------------------------------------------------------------------
let setupChain: Promise<void> = Promise.resolve()

export function queueBookSetup(setup: () => Promise<void>): Promise<void> {
  setupChain = setupChain
    .then(() => yieldToMain())
    .then(setup)
    .catch((err: unknown) => {
      console.error('[book-stage] Book setup failed:', err)
    })
  return setupChain
}
