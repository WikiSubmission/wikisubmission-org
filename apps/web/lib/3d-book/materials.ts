import * as THREE from 'three'

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  return [canvas, ctx]
}

export function finishTexture(
  texture: THREE.Texture,
  renderer?: THREE.WebGLRenderer,
  colorSpace: THREE.ColorSpace = THREE.NoColorSpace,
): THREE.Texture {
  texture.colorSpace = colorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter

  if (renderer) {
    // Oblique surfaces (spine artwork, the fore-edge page texture, narrow
    // cover print detail) blur into mush under a low cap; 8 is still a
    // conservative fraction of what desktop/mobile GPUs report (commonly
    // 16), not the "blindly maximize" the shared texture library warns
    // against.
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  }

  texture.needsUpdate = true
  return texture
}

export function canvasTexture(
  canvas: HTMLCanvasElement,
  renderer?: THREE.WebGLRenderer,
  colorSpace: THREE.ColorSpace = THREE.SRGBColorSpace,
): THREE.CanvasTexture {
  return finishTexture(
    new THREE.CanvasTexture(canvas),
    renderer,
    colorSpace,
  ) as THREE.CanvasTexture
}

export function imageTexture(
  image: HTMLImageElement,
  renderer: THREE.WebGLRenderer,
  colorSpace: THREE.ColorSpace = THREE.SRGBColorSpace,
): THREE.Texture {
  return finishTexture(
    new THREE.Texture(image),
    renderer,
    colorSpace,
  )
}

export function luminance(r: number, g: number, b: number): number {
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255
}

function hash01(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

// ----------------------------------------------------------------------------
// Global Asynchronous Image Cache with Hardware-Accelerated Decoding
// ----------------------------------------------------------------------------
const globalImageCache = new Map<string, Promise<HTMLImageElement>>()

export function loadCachedImage(src: string): Promise<HTMLImageElement> {
  if (!src) return Promise.reject(new Error('Invalid image src'))
  if (!globalImageCache.has(src)) {
    const promise = (async () => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.decoding = 'async'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load book image: ${src}`))
        img.src = src
      })
      if ('decode' in img) {
        try {
          await img.decode()
        } catch {
          // ignore decode errors if already decoded
        }
      }
      return img
    })()
    // A rejected load must not stay cached as a dead promise — otherwise a
    // transient failure (e.g. a slow CDN hiccup) permanently blanks that
    // asset for the rest of the page's lifetime with no way to retry.
    promise.catch(() => {
      if (globalImageCache.get(src) === promise) {
        globalImageCache.delete(src)
      }
    })
    globalImageCache.set(src, promise)
  }
  return globalImageCache.get(src)!
}

export function preloadBookImages(sources: (string | undefined)[]): void {
  for (const src of sources) {
    if (src && !globalImageCache.has(src)) {
      void loadCachedImage(src).catch(() => {})
    }
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return loadCachedImage(src)
}

/** Shared, pre-baked cloth-grain texture (see scripts/bake-book-textures.ts) — used
 *  as a `createPattern` fill so callers avoid drawing per-pixel grain by hand. */
export const CLOTH_GRAIN_TEXTURE_SRC = '/images/books/shared/cloth-grain-normal.webp'

// ----------------------------------------------------------------------------
// Shared cloth-grain as a tiled Three.js texture — a second, fine micro-detail
// layer for cover materials (via `clearcoatNormalMap`). The per-cover detail
// map derived from the artwork (below) only has bump where the artwork has
// contrast; a large flat-color cover area (common on these plain, minimal
// covers) would otherwise get almost no surface texture and read as flat
// plastic. This gives every cover believable cloth/paper grain regardless
// of what's printed on it — the same role Stripe's `shared_bump_*` textures
// play in their asset set.
// ----------------------------------------------------------------------------
let cachedClothGrainTexture: THREE.Texture | null = null

export async function getClothGrainTexture(renderer: THREE.WebGLRenderer): Promise<THREE.Texture> {
  if (cachedClothGrainTexture) return cachedClothGrainTexture
  const image = await loadCachedImage(CLOTH_GRAIN_TEXTURE_SRC)
  const tex = imageTexture(image, renderer, THREE.NoColorSpace)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(5, 7)
  cachedClothGrainTexture = tex
  return tex
}

// ----------------------------------------------------------------------------
// Cover Detail Maps — loaded from pre-baked files, not computed at runtime.
// Run `pnpm bake:books` (scripts/bake-book-textures.ts) whenever a cover
// image changes; it writes `<name>-normal.webp`, `<name>-roughness.webp`,
// and `<name>-foil.png` next to the source cover.
// ----------------------------------------------------------------------------
export interface CoverDetailMaps {
  normal: THREE.Texture
  roughness: THREE.Texture
  printAlpha: THREE.Texture
  edgeColor: THREE.Color
}

function detailMapPaths(coverSrc: string): { normal: string; roughness: string; foil: string } {
  const dot = coverSrc.lastIndexOf('.')
  const base = dot === -1 ? coverSrc : coverSrc.slice(0, dot)
  return {
    normal: `${base}-normal.webp`,
    roughness: `${base}-roughness.webp`,
    foil: `${base}-foil.png`,
  }
}

async function sampleEdgeColor(coverSrc: string): Promise<THREE.Color> {
  const image = await loadCachedImage(coverSrc)
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 8
  // Reading pixels back immediately after drawing — tell the browser
  // upfront so it doesn't pick a backing store optimized for GPU compositing.
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(image, 0, 0, 8, 8)
  const corners = [
    ctx.getImageData(0, 0, 1, 1).data,
    ctx.getImageData(7, 0, 1, 1).data,
    ctx.getImageData(0, 7, 1, 1).data,
    ctx.getImageData(7, 7, 1, 1).data,
  ]
  const avg = (channel: number) =>
    corners.reduce((sum, c) => sum + c[channel], 0) / corners.length / 255
  return new THREE.Color(avg(0), avg(1), avg(2))
}

const detailMapCache = new Map<string, Promise<CoverDetailMaps>>()

export function getCoverDetailMaps(
  coverSrc: string,
  renderer: THREE.WebGLRenderer,
): Promise<CoverDetailMaps> {
  const cached = detailMapCache.get(coverSrc)
  if (cached) return cached

  const promise = (async (): Promise<CoverDetailMaps> => {
    const paths = detailMapPaths(coverSrc)
    const [normalImg, roughnessImg, foilImg, edgeColor] = await Promise.all([
      loadCachedImage(paths.normal),
      loadCachedImage(paths.roughness),
      loadCachedImage(paths.foil),
      sampleEdgeColor(coverSrc),
    ])

    return {
      normal: imageTexture(normalImg, renderer, THREE.NoColorSpace),
      roughness: imageTexture(roughnessImg, renderer, THREE.NoColorSpace),
      printAlpha: imageTexture(foilImg, renderer, THREE.NoColorSpace),
      edgeColor,
    }
  })()

  detailMapCache.set(coverSrc, promise)
  return promise
}

// ----------------------------------------------------------------------------
// Shared Page Block, Edge & Floor Shadow Textures (Cached Singleton)
// ----------------------------------------------------------------------------
export interface SharedBookTextures {
  pagesTexture: THREE.CanvasTexture
  pageNormalTexture: THREE.CanvasTexture
  pageEdgeTexture: THREE.CanvasTexture
  pageEdgeNormalTexture: THREE.CanvasTexture
  pageEdgeRoughnessTexture: THREE.CanvasTexture
  contactShadowTexture: THREE.CanvasTexture
  coverHighlightTexture: THREE.CanvasTexture
  hingeGrooveTexture: THREE.CanvasTexture
}

let sharedTextures: SharedBookTextures | null = null

export function getSharedBookTextures(renderer: THREE.WebGLRenderer): SharedBookTextures {
  if (!sharedTextures) {
    const pagesTexture = createRealisticPagesTexture(renderer)
    const pageNormalTexture = createPageNormalTexture(pagesTexture, renderer)
    const pageEdgeTexture = createPageEdgeTexture(renderer)
    const pageEdgeNormalTexture = createPageNormalTexture(pageEdgeTexture, renderer)
    const pageEdgeRoughnessTexture = createPageEdgeRoughnessTexture(renderer)
    const contactShadowTexture = createContactShadowTexture(renderer)
    const coverHighlightTexture = createCoverHighlightTexture(renderer)
    const hingeGrooveTexture = createHingeGrooveTexture(renderer)

    sharedTextures = {
      pagesTexture,
      pageNormalTexture,
      pageEdgeTexture,
      pageEdgeNormalTexture,
      pageEdgeRoughnessTexture,
      contactShadowTexture,
      coverHighlightTexture,
      hingeGrooveTexture,
    }
  }
  return sharedTextures
}

export function createPageEdgeTexture(
  renderer: THREE.WebGLRenderer,
  width = 512,
  height = 512,
): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(width, height)
  const base = ctx.createLinearGradient(0, 0, width, 0)
  base.addColorStop(0, '#bfae98')
  base.addColorStop(0.035, '#eadfce')
  base.addColorStop(0.20, '#f4ecdf')
  base.addColorStop(0.82, '#eee4d5')
  base.addColorStop(0.98, '#d7c6ae')
  base.addColorStop(1, '#b8a58d')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, width, height)

  // Thousands-of-sheets illusion: thin horizontal lines with irregular
  // spacing/darkness plus an occasional stronger line (a sheet cluster
  // boundary), and a faint warm/cool tint per line so it never reads as
  // perfectly uniform paper.
  for (let y = 3; y < height; y += 6 + Math.round(hash01(y, 3) * 2)) {
    const jitter = Math.sin(y * 0.21) * 1.3
    const isCluster = hash01(y, 41) > 0.92
    const alpha = (isCluster ? 0.09 : 0.045) + ((y % 19) / 19) * 0.025
    const warmCool = hash01(y, 61) > 0.5 ? '96,74,50' : '86,80,66'
    ctx.fillStyle = `rgba(${warmCool},${alpha})`
    ctx.fillRect(0, y + jitter, width, isCluster ? 1.4 : 1)
  }

  ctx.globalAlpha = 0.08
  for (let i = 0; i < 1600; i++) {
    const x = hash01(i, 7) * width
    const y = hash01(i, 13) * height
    ctx.fillRect(x, y, 1 + hash01(i, 17) * 3, 1)
  }
  ctx.globalAlpha = 1

  // Vertical vignette: canvas y=0 sits at the top edge of the page block
  // (CanvasTexture's default flipY), y=height at the bottom — a real closed
  // book is slightly more exposed/lighter along the top and shaded/darker
  // along the bottom where dust and binding pressure settle.
  const vignette = ctx.createLinearGradient(0, 0, 0, height)
  vignette.addColorStop(0, 'rgba(255,252,244,0.05)')
  vignette.addColorStop(0.12, 'rgba(255,252,244,0)')
  vignette.addColorStop(0.85, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(40,32,20,0.07)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)

  return canvasTexture(canvas, renderer, THREE.SRGBColorSpace)
}

/** Subtle roughness variation for the fore-edge — sheet-to-sheet breaks in
 *  how light scatters, kept low-contrast per the reference's restrained
 *  material response. Companion to {@link createPageEdgeTexture}. */
export function createPageEdgeRoughnessTexture(
  renderer: THREE.WebGLRenderer,
  width = 512,
  height = 512,
): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(width, height)
  ctx.fillStyle = '#c9c9c9'
  ctx.fillRect(0, 0, width, height)

  for (let y = 0; y < height; y += 3) {
    const v = 190 + Math.round(hash01(y, 5) * 40)
    ctx.fillStyle = `rgba(${v},${v},${v},0.5)`
    ctx.fillRect(0, y, width, 1)
  }

  ctx.globalAlpha = 0.10
  for (let i = 0; i < 900; i++) {
    const x = hash01(i, 29) * width
    const y = hash01(i, 37) * height
    ctx.fillStyle = hash01(i, 43) > 0.5 ? '#f2f2f2' : '#8f8f8f'
    ctx.fillRect(x, y, 2, 1)
  }
  ctx.globalAlpha = 1

  return canvasTexture(canvas, renderer, THREE.NoColorSpace)
}

/** A mostly-neutral-gray decal multiplied onto the front/back cover near the
 *  spine edge — the soft occlusion line where a real casebound hardcover's
 *  board caliper steps down to the thinner spine cloth. Gray (not white)
 *  everywhere so `THREE.MultiplyBlending` always darkens slightly, with the
 *  darkest point at one edge (positioned against the spine seam) fading to
 *  neutral by about a third of the way across — see geometry.ts's
 *  `hingeGrooveGeometry` for placement. */
export function createHingeGrooveTexture(
  renderer: THREE.WebGLRenderer,
  width = 128,
  height = 512,
): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(width, height)
  const grad = ctx.createLinearGradient(0, 0, width, 0)
  grad.addColorStop(0, '#6e6e6e')
  grad.addColorStop(0.16, '#a8a8a8')
  grad.addColorStop(0.32, '#e6e6e6')
  grad.addColorStop(1, '#e6e6e6')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  return canvasTexture(canvas, renderer, THREE.NoColorSpace)
}

export function createPrintMaterial(alphaMap?: THREE.Texture): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    alphaMap: alphaMap || null,
    alphaTest: 0.06,
    // Hard ceiling on how opaque this overlay can ever get, independent of
    // whatever the alphaMap contains. The baked foil mask's legitimate
    // max is well under this (~0.43), so it doesn't visibly clip the
    // intended foil/emboss sheen — but it means a future bad bake (or any
    // texture that accidentally evaluates to full green-channel opacity)
    // degrades to a faint wash instead of a solid white plane hiding the
    // cover underneath.
    opacity: 0.55,
    depthWrite: false,
    roughness: 0.28,
    metalness: 0.03,
    clearcoat: 0.18,
    clearcoatRoughness: 0.24,
    side: THREE.DoubleSide,
    visible: !!alphaMap,
  })
}

export function createRealisticPagesTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512)
  const w = canvas.width
  const h = canvas.height

  const grad = ctx.createLinearGradient(0, 0, w, 0)
  grad.addColorStop(0, '#faf7ef')
  grad.addColorStop(0.08, '#f3eadc')
  grad.addColorStop(0.52, '#ebe0d0')
  grad.addColorStop(0.92, '#f3eadc')
  grad.addColorStop(1, '#faf7ef')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  for (let y = 0; y < h; y += 2) {
    const wave = (Math.sin(y * 0.19) + Math.sin(y * 0.057)) * 0.018
    ctx.fillStyle = `rgba(98,79,59,${Math.max(0.018, 0.055 + wave)})`
    ctx.fillRect(0, y, w, 1)
  }

  ctx.fillStyle = 'rgba(95,74,51,0.028)'
  for (let i = 0; i < 6000; i++) {
    const x = hash01(i, 31) * w
    const y = hash01(i, 53) * h
    const len = 1 + hash01(i, 73) * 3
    ctx.fillRect(x, y, len, 0.7)
  }

  const leftShade = ctx.createLinearGradient(0, 0, 48, 0)
  leftShade.addColorStop(0, 'rgba(50,38,24,0.24)')
  leftShade.addColorStop(1, 'transparent')
  ctx.fillStyle = leftShade
  ctx.fillRect(0, 0, 48, h)

  const rightShade = ctx.createLinearGradient(w - 36, 0, w, 0)
  rightShade.addColorStop(0, 'transparent')
  rightShade.addColorStop(1, 'rgba(85,64,44,0.14)')
  ctx.fillStyle = rightShade
  ctx.fillRect(w - 36, 0, 36, h)

  return canvasTexture(canvas, renderer, THREE.SRGBColorSpace)
}

export function createPageNormalTexture(
  source: THREE.CanvasTexture,
  renderer: THREE.WebGLRenderer,
): THREE.CanvasTexture {
  const image = source.image as HTMLCanvasElement
  const w = image.width
  const h = image.height
  const [, srcCtx] = makeCanvas(w, h)
  srcCtx.drawImage(image, 0, 0)
  const src = srcCtx.getImageData(0, 0, w, h)

  const [normalC, nctx] = makeCanvas(w, h)
  const normalData = nctx.createImageData(w, h)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const lx = (y * w + Math.max(0, x - 2)) * 4
      const rx = (y * w + Math.min(w - 1, x + 2)) * 4
      const uy = (Math.max(0, y - 2) * w + x) * 4
      const dy = (Math.min(h - 1, y + 2) * w + x) * 4

      const left = src.data[lx] / 255
      const right = src.data[rx] / 255
      const up = src.data[uy] / 255
      const down = src.data[dy] / 255

      const dx = (right - left) * 0.85
      const dyv = (down - up) * 0.50
      const dz = 1 / Math.sqrt(dx * dx + dyv * dyv + 1)

      normalData.data[i] = Math.round((dx * 0.5 + 0.5) * 255)
      normalData.data[i + 1] = Math.round((dyv * 0.5 + 0.5) * 255)
      normalData.data[i + 2] = Math.round(dz * 255)
      normalData.data[i + 3] = 255
    }
  }

  nctx.putImageData(normalData, 0, 0)
  return canvasTexture(normalC, renderer, THREE.NoColorSpace)
}

export function createContactShadowTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const [shadowC, shadowCtx] = makeCanvas(256, 256)
  const shadowGrad = shadowCtx.createRadialGradient(128, 128, 6, 128, 128, 124)
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.44)')
  shadowGrad.addColorStop(0.28, 'rgba(0,0,0,0.26)')
  shadowGrad.addColorStop(0.56, 'rgba(0,0,0,0.10)')
  shadowGrad.addColorStop(0.84, 'rgba(0,0,0,0.02)')
  shadowGrad.addColorStop(1, 'transparent')
  shadowCtx.fillStyle = shadowGrad
  shadowCtx.fillRect(0, 0, 256, 256)

  return canvasTexture(shadowC, renderer, THREE.SRGBColorSpace)
}

export function createCoverHighlightTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256)
  const gradient = ctx.createRadialGradient(128, 128, 4, 128, 128, 120)
  gradient.addColorStop(0, 'rgba(255,255,255,0.22)')
  gradient.addColorStop(0.22, 'rgba(255,255,255,0.08)')
  gradient.addColorStop(0.52, 'rgba(255,255,255,0.018)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)

  const tex = canvasTexture(canvas, renderer, THREE.SRGBColorSpace)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}
