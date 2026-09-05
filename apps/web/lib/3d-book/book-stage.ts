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
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

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
}

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let canvasEl: HTMLCanvasElement | null = null

const registrants = new Map<number, Registrant>()
let nextId = 1
let rafId = 0
let lastFrameTime = 0

function ensureStage(): void {
  if (renderer) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.shadowMap.enabled = false
  renderer.setScissorTest(true)
  renderer.autoClear = false

  // Studio-style environment reflections. Without this, clearcoat/metalness
  // on the cover materials has nothing to reflect and reads as flat matte
  // plastic no matter how high clearcoat is set — this is most of what
  // makes a glossy hardcover look "real" instead of "blocky CG box".
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.25
  pmrem.dispose()

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

  window.addEventListener('resize', resizeCanvas)
  // The canvas is a single viewport-fixed overlay: every registrant's
  // scissor/viewport rect is derived from its DOM container's on-screen
  // position, which changes on scroll even when nothing is "animating".
  // Demand-driven rendering only pauses the loop when settled — without
  // this, a settled book keeps the pixels from wherever it was last drawn
  // and visually detaches from its container as the page scrolls.
  window.addEventListener('scroll', requestFrame, { passive: true, capture: true })
  resizeCanvas()
}

function resizeCanvas(): void {
  if (!renderer || !canvasEl) return
  const dpr = Math.min(window.devicePixelRatio || 1, 1.4)
  renderer.setPixelRatio(dpr)
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  requestFrame()
}

function frame(now: number): void {
  rafId = 0
  if (!renderer || !scene || !camera) return

  const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000))
  lastFrameTime = now
  const elapsed = now / 1000

  const canvasHeight = renderer.domElement.clientHeight
  let anyActive = false

  // Full clear first: a book that scrolls out of view is simply skipped
  // below (no draw call), but its previously-rendered pixels would
  // otherwise sit untouched at those fixed screen coordinates forever —
  // this is a full-viewport canvas, nothing else repaints over it.
  renderer.setScissorTest(false)
  renderer.setViewport(0, 0, renderer.domElement.width, renderer.domElement.height)
  renderer.clear(true, true)
  renderer.setScissorTest(true)

  for (const registrant of registrants.values()) {
    const rect = registrant.container.getBoundingClientRect()
    const inViewport = rect.bottom >= 0 && rect.top <= window.innerHeight && rect.width > 0 && rect.height > 0

    // Still advance physics for off-screen books so they don't jump when
    // they scroll back into view, but skip the (wasted) draw call.
    const stillAnimating = registrant.onFrame(dt, elapsed, inViewport)
    if (stillAnimating) anyActive = true
    if (!inViewport) continue

    for (const other of registrants.values()) {
      other.root.visible = other.id === registrant.id
    }

    const left = Math.round(rect.left)
    // WebGL viewport/scissor origin is bottom-left; DOM rects are top-left.
    const bottom = Math.round(canvasHeight - rect.bottom)
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

  if (anyActive) {
    rafId = requestAnimationFrame(frame)
  }
}

function requestFrame(): void {
  if (rafId) return
  lastFrameTime = performance.now()
  rafId = requestAnimationFrame(frame)
}

/** Register a book's group + DOM container with the shared stage. Returns an unregister function. */
export function registerBook(registration: BookRegistration): () => void {
  ensureStage()
  const id = nextId++
  registration.root.visible = false
  registrants.set(id, { ...registration, id })
  scene?.add(registration.root)
  requestFrame()

  return () => {
    registrants.delete(id)
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

    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
    for (const material of materials) material.dispose()
  })
}

/** Ask the stage to keep rendering (e.g. after a pointer/scroll event changes a book's target state). */
export function requestBookStageRender(): void {
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
