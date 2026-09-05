'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type * as THREE from 'three'
import { ExternalLink } from 'lucide-react'
import { makeCanvas, preloadBookImages } from '@/lib/3d-book/materials'
import type { CoverDetailMaps } from '@/lib/3d-book/materials'

export interface BookItem {
  id: string
  title: string
  label: string
  caption: string
  author: string
  meta: string
  description: string
  coverThumb: string
  themeColor: string
  bookWidth: number
  bookHeight: number
  bookThickness: number
  frontSrc: string
  spineSrc: string
  backSrc: string
  spineTitle: string
  quote: string
  hasTabs: boolean
  tabs?: {
    id: string
    label: string
    panelLabel: string
    links: { name: string; url: string }[]
  }[]
  links?: { label: string; url: string }[]
  authorLink?: { label: string; url: string }
}

const BOOKS_DATA: Record<string, BookItem> = {
  quran: {
    id: 'quran',
    title: 'Quran: The Final Testament',
    label: '01 / FEATURED TEXT',
    caption: 'QURAN · THE FINAL TESTAMENT',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    meta: 'BOOK · DR. RASHAD KHALIFA, PH.D.',
    description:
      'Original English translation with additional editions available for readers in multiple languages.',
    coverThumb: '/images/books/quran-the-final-testament/quran-front.webp',
    themeColor: '#0a1e3f',
    bookWidth: 1.80,
    bookHeight: 2.65,
    bookThickness: 0.40,
    frontSrc: '/images/books/quran-the-final-testament/quran-front.webp',
    spineSrc: '/images/books/quran-the-final-testament/quran-spine.webp',
    backSrc: '/images/books/quran-the-final-testament/quran-back.webp',
    spineTitle: 'QURAN: THE FINAL TESTAMENT',
    quote: '“Proclaim: He is the One and only GOD.”',
    hasTabs: true,
    tabs: [
      {
        id: 'full',
        label: 'Full PDF',
        panelLabel: 'ORIGINAL ENGLISH EDITION',
        links: [
          { name: 'English', url: 'https://library.wikisubmission.org/file/quran-the-final-testament' },
          { name: 'Turkish', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-turkish' },
          { name: 'French', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-french' },
          { name: 'Spanish', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-spanish' },
          { name: 'Persian', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-persian' },
          { name: 'Tamil', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-tamil' },
          { name: 'Hindi', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-hindi' },
          { name: 'Arabic (with English)', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-with-arabic' },
        ],
      },
      {
        id: 'appendices',
        label: 'Appendices',
        panelLabel: 'ALL 38 APPENDICES',
        links: [
          { name: 'English', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-appendices' },
          { name: 'Turkish', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-appendices-turkish' },
          { name: 'French', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-appendices-french' },
          { name: 'Persian', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-appendices-persian' },
          { name: 'Tamil', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-appendices-tamil' },
          { name: 'Hindi', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-appendices-hindi' },
        ],
      },
      {
        id: 'physical',
        label: 'Physical Copies',
        panelLabel: 'ORDER PHYSICAL COPIES',
        links: [
          { name: 'Masjid Tucson Catalog', url: 'https://www.masjidtucson.org/publications/catalog/index.html' },
          { name: 'Barnes & Noble', url: 'https://www.barnesandnoble.com/w/quran-the-final-testament-authorized-english-version-dr-rashad-khalifa/1008697516' },
        ],
      },
    ],
  },
  'visual-presentation': {
    id: 'visual-presentation',
    title: 'Visual Presentation of the Miracle',
    label: '02 / MATHEMATICAL RESEARCH',
    caption: 'VISUAL PRESENTATION OF THE MIRACLE',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    meta: 'BOOK · DR. RASHAD KHALIFA, PH.D.',
    description:
      'A landmark publication presenting the physical and mathematical proof of Quranic preservation through the Miracle of 19 with extensive charts and visual evidence.',
    coverThumb: '/images/books/quran-visual-presentation/qvp-front.webp',
    themeColor: '#0a235c',
    bookWidth: 1.80,
    bookHeight: 2.65,
    bookThickness: 0.36,
    frontSrc: '/images/books/quran-visual-presentation/qvp-front.webp',
    spineSrc: '/images/books/quran-visual-presentation/qvp-spine.webp',
    backSrc: '/images/books/quran-visual-presentation/qvp-back.webp',
    spineTitle: 'VISUAL PRESENTATION OF THE MIRACLE',
    quote: '“Physical, verifiable, mathematical evidence proving the divine authorship of the Quran.”',
    hasTabs: false,
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/visual-presentation-of-the-miracle' },
    ],
  },
  'quran-hadith-islam': {
    id: 'quran-hadith-islam',
    title: 'Quran, Hadith, and Islam',
    label: '03 / FOUNDATIONAL ESSAY',
    caption: 'QURAN, HADITH, AND ISLAM',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    meta: 'BOOK · DR. RASHAD KHALIFA, PH.D.',
    description:
      'A comprehensive theological treatise analyzing the Quran’s self-sufficient authority and clarifying the distinction between divine scripture and invented traditions.',
    coverThumb: '/images/books/quran-hadith-and-islam/qhi-front.webp',
    themeColor: '#3c1216',
    bookWidth: 1.80,
    bookHeight: 2.65,
    bookThickness: 0.32,
    frontSrc: '/images/books/quran-hadith-and-islam/qhi-front.webp',
    spineSrc: '/images/books/quran-hadith-and-islam/qhi-spine.webp',
    backSrc: '/images/books/quran-hadith-and-islam/qhi-back.webp',
    spineTitle: 'QURAN, HADITH, AND ISLAM',
    quote: '“Shall I seek other than God as a source of law, when He has revealed this book fully detailed?”',
    hasTabs: false,
    links: [
      { label: 'Original PDF', url: 'https://library.wikisubmission.org/file/quran-hadith-and-islam-original' },
      { label: 'Alternative Format', url: 'https://library.wikisubmission.org/file/quran-hadith-and-islam' },
    ],
  },
  'computer-speaks': {
    id: 'computer-speaks',
    title: "The Computer Speaks: God's Message to The World",
    label: '04 / COMPUTER RESEARCH',
    caption: 'THE COMPUTER SPEAKS',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    meta: 'BOOK · DR. RASHAD KHALIFA, PH.D.',
    description:
      'Dr. Khalifa’s historic computer study detailing the discovery of the interlocking mathematical code embedded in the Quran.',
    coverThumb: '/images/books/the-computer-speaks/tcs-front.webp',
    themeColor: '#122543',
    bookWidth: 1.80,
    bookHeight: 2.65,
    bookThickness: 0.34,
    frontSrc: '/images/books/the-computer-speaks/tcs-front.webp',
    spineSrc: '/images/books/the-computer-speaks/tcs-spine.webp',
    backSrc: '/images/books/the-computer-speaks/tcs-back.webp',
    spineTitle: "THE COMPUTER SPEAKS · GOD'S MESSAGE",
    quote: '“The Quran is the only book in existence with a built-in mathematical preservation system.”',
    hasTabs: false,
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/the-computer-speaks' },
    ],
  },
}

function createCleanBackCanvas(book: BookItem): HTMLCanvasElement {
  const W = 512
  const H = 768
  const [c, ctx] = makeCanvas(W, H)

  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, book.themeColor)
  grad.addColorStop(1, '#060a12')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  const gold = ctx.createLinearGradient(0, 0, W, H)
  gold.addColorStop(0, '#fbeece')
  gold.addColorStop(0.5, '#deb874')
  gold.addColorStop(1, '#fbeece')

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#f0e6d6'
  ctx.font = 'italic 24px Georgia, serif'
  ctx.fillText(book.quote, W / 2, H / 2 - 25)

  ctx.font = 'bold 18px "Cormorant Garamond", Georgia, serif'
  ctx.fillStyle = gold
  ctx.fillText('WIKISUBMISSION DOWNLOADS', W / 2, H / 2 + 35)

  return c
}

function checkWebglSupported(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function DownloadsBookShowcase() {
  const [featuredId, setFeaturedId] = useState<string>('quran')
  const [gridIds, setGridIds] = useState<string[]>([
    'visual-presentation',
    'quran-hadith-islam',
    'computer-speaks',
  ])
  const [activeTab, setActiveTab] = useState<string>('full')
  const [isSwapping, setIsSwapping] = useState<boolean>(false)
  const [webglSupported] = useState<boolean>(checkWebglSupported)

  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  // Latest updateBookTextures, readable from the scene-setup effect without
  // making it a dependency (setup only needs to run once per mount).
  const updateBookTexturesRef = useRef<((book: BookItem) => Promise<void>) | null>(null)

  // Guards against a stale async texture load (from a previously-featured
  // book) overwriting the materials after the user has already switched to
  // a different book — each call to updateBookTextures claims a new id and
  // checks it still holds the latest one before every mutation.
  const textureRequestIdRef = useRef(0)

  // Stable references into the shared book-stage scene for instant texture updates.
  const sceneElementsRef = useRef<{
    renderer: THREE.WebGLRenderer
    getCoverDetailMaps: (src: string, renderer: THREE.WebGLRenderer) => Promise<CoverDetailMaps>
    imageTexture: (image: HTMLImageElement, renderer: THREE.WebGLRenderer) => THREE.Texture
    canvasTexture: (canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer) => THREE.Texture
    loadCachedImage: (src: string) => Promise<HTMLImageElement>
    frontMat: THREE.MeshPhysicalMaterial
    backMat: THREE.MeshPhysicalMaterial
    spineMat: THREE.MeshPhysicalMaterial
    edgeMat: THREE.MeshPhysicalMaterial
    spineEdgeMat: THREE.MeshPhysicalMaterial
    frontPrintMat: THREE.MeshPhysicalMaterial
    backPrintMat: THREE.MeshPhysicalMaterial
    spinePrintMat: THREE.MeshPhysicalMaterial
    requestRender: () => void
  } | null>(null)

  const book = BOOKS_DATA[featuredId]

  // Preload next books in idle time
  useEffect(() => {
    const toPreload = gridIds.map((id) => BOOKS_DATA[id]?.frontSrc).filter(Boolean)
    preloadBookImages(toPreload)
  }, [gridIds])

  // --------------------------------------------------------------------------
  // Register this book with the shared book-stage (one WebGL canvas for the
  // whole page — see lib/3d-book/book-stage.ts). Lazily loads three.js and
  // builds geometry/materials only once this section is near the viewport.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const container = stageRef.current
    const section = sectionRef.current
    if (!container || !section || !webglSupported) return

    let cancelled = false
    let unregisterBook: (() => void) | null = null
    let removeListeners: (() => void) | null = null
    let intersectionObserver: IntersectionObserver | null = null

    async function setup(): Promise<void> {
      const [
        THREE,
        { createBookAnatomyGeometries },
        {
          imageTexture,
          canvasTexture,
          getCoverDetailMaps,
          createPrintMaterial,
          getSharedBookTextures,
          loadCachedImage,
          getClothGrainTexture,
        },
        { createInitialPhysicsState, updateBookPhysics },
        { registerBook, requestBookStageRender, ensureBookStageRenderer },
      ] = await Promise.all([
        import('three'),
        import('@/lib/3d-book/geometry'),
        import('@/lib/3d-book/materials'),
        import('@/lib/3d-book/physics'),
        import('@/lib/3d-book/book-stage'),
      ])

      if (cancelled || !container || !section) return

      const renderer = ensureBookStageRenderer()

      const root = new THREE.Group()
      const bookGroup = new THREE.Group()
      root.add(bookGroup)

      const bW = 1.8
      const bH = 2.65
      const bThick = 0.4
      const boardThick = Math.min(0.033, bThick * 0.095)
      const overhang = Math.min(0.048, bW * 0.028)

      const {
        pageGeometry,
        boardGeometry,
        printGeometry,
        spineGeometry,
        spinePrintGeometry,
        hingeGrooveGeometry,
        hingeGrooveSpan,
        ribbonGeom,
        shadowGeometry,
        dimensions: dims,
      } = createBookAnatomyGeometries({
        width: bW,
        height: bH,
        depth: bThick,
        boardThickness: boardThick,
        overhang,
      })

      const shared = getSharedBookTextures(renderer)

      // Page block: top/bottom edges and the spine-side gutter get their
      // own tinted clones of the same material (same map/normal/roughness)
      // so the block doesn't read as one uniformly-lit slab — a real page
      // block is slightly more exposed at the top and shadowed toward the
      // binding.
      const pageMat = new THREE.MeshPhysicalMaterial({
        map: shared.pagesTexture,
        normalMap: shared.pageNormalTexture,
        normalScale: new THREE.Vector2(0.24, 0.24),
        roughness: 0.84,
        metalness: 0,
        clearcoat: 0.01,
      })
      const pageTopMat = pageMat.clone()
      const pageBottomMat = pageMat.clone()
      pageBottomMat.color.set(0xdccdb4)
      const pageGutterMat = pageMat.clone()
      pageGutterMat.color.set(0xb9ac8f)
      const pageMesh = new THREE.Mesh(pageGeometry, [
        pageMat,
        pageGutterMat,
        pageTopMat,
        pageBottomMat,
        pageMat,
        pageMat,
      ])
      pageMesh.position.set(-bW / 2 + boardThick + dims.pageWidth / 2 + 0.006, 0, 0)
      bookGroup.add(pageMesh)

      // Fore-edge: a physical material (not MeshBasicMaterial) so it
      // actually responds to the lighting rig — an unlit plane here is a
      // large part of why the edge previously read as a flat pasted-on
      // texture instead of compressed sheets catching light.
      const edgeTexMat = new THREE.MeshPhysicalMaterial({
        map: shared.pageEdgeTexture,
        normalMap: shared.pageEdgeNormalTexture,
        normalScale: new THREE.Vector2(0.55, 0.55),
        roughnessMap: shared.pageEdgeRoughnessTexture,
        roughness: 0.8,
        metalness: 0,
        clearcoat: 0.02,
        transparent: true,
        opacity: 0.94,
        depthWrite: false,
      })
      const edgeGeom = new THREE.PlaneGeometry(dims.pageDepth * 0.96, dims.pageHeight * 0.96)
      const foreEdge = new THREE.Mesh(edgeGeom, edgeTexMat)
      foreEdge.rotation.y = Math.PI / 2
      foreEdge.position.set(pageMesh.position.x + dims.pageWidth / 2 + 0.0015, 0, 0)
      bookGroup.add(foreEdge)

      const ribbonMat = new THREE.MeshPhysicalMaterial({
        color: 0x8e1a26,
        roughness: 0.48,
        metalness: 0,
        clearcoat: 0.06,
        side: THREE.DoubleSide,
      })
      const ribbon = new THREE.Mesh(ribbonGeom, ribbonMat)
      ribbon.position.set(0.14, -bH / 2 - 0.23, 0.05)
      ribbon.rotation.set(0.08, 0, -0.04)
      bookGroup.add(ribbon)

      const shadowMat = new THREE.MeshBasicMaterial({
        map: shared.contactShadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.64,
      })
      const shadow = new THREE.Mesh(shadowGeometry, shadowMat)
      shadow.position.set(0, -bH / 2 - 0.3, 0)
      shadow.rotation.x = -Math.PI / 2
      root.add(shadow)

      const clothGrain = await getClothGrainTexture(renderer)

      const boardEdgeMat = new THREE.MeshPhysicalMaterial({
        color: 0x141a24,
        roughness: 0.7,
        metalness: 0.0,
        clearcoat: 0.06,
        clearcoatRoughness: 0.6,
        clearcoatNormalMap: clothGrain,
        clearcoatNormalScale: new THREE.Vector2(0.35, 0.35),
      })
      // Separate from boardEdgeMat: the spine's own non-artwork faces (its
      // top/bottom caps and the thin strips where it curves into the front
      // and back boards) need to match the SPINE cover's color, not the
      // front cover's — sharing one material colored from the front cover
      // showed up as a mismatched line right on the spine.
      const spineEdgeMat = boardEdgeMat.clone()
      const frontMat = new THREE.MeshPhysicalMaterial({
        roughness: 0.64,
        metalness: 0.015,
        clearcoat: 0.07,
        clearcoatRoughness: 0.56,
        clearcoatNormalMap: clothGrain,
        clearcoatNormalScale: new THREE.Vector2(0.4, 0.4),
      })
      const backMat = new THREE.MeshPhysicalMaterial({
        roughness: 0.64,
        metalness: 0.015,
        clearcoat: 0.07,
        clearcoatRoughness: 0.56,
        clearcoatNormalMap: clothGrain,
        clearcoatNormalScale: new THREE.Vector2(0.4, 0.4),
      })
      const spineMat = new THREE.MeshPhysicalMaterial({
        roughness: 0.64,
        metalness: 0.015,
        clearcoat: 0.07,
        clearcoatRoughness: 0.56,
        clearcoatNormalMap: clothGrain,
        clearcoatNormalScale: new THREE.Vector2(0.4, 0.4),
      })

      const frontBoard = new THREE.Mesh(boardGeometry, [
        boardEdgeMat,
        boardEdgeMat,
        boardEdgeMat,
        boardEdgeMat,
        frontMat,
        boardEdgeMat,
      ])
      frontBoard.position.set(boardThick / 2, 0, bThick / 2 - boardThick / 2)
      bookGroup.add(frontBoard)

      const backBoard = new THREE.Mesh(boardGeometry, [
        boardEdgeMat,
        boardEdgeMat,
        boardEdgeMat,
        boardEdgeMat,
        boardEdgeMat,
        backMat,
      ])
      backBoard.position.set(boardThick / 2, 0, -bThick / 2 + boardThick / 2)
      bookGroup.add(backBoard)

      const spineMesh = new THREE.Mesh(spineGeometry, [
        spineEdgeMat,
        spineMat,
        spineEdgeMat,
        spineEdgeMat,
        spineEdgeMat,
        spineEdgeMat,
      ])
      spineMesh.position.set(-bW / 2 + boardThick / 2, 0, 0)
      bookGroup.add(spineMesh)

      // Hinge groove decal: a soft shadow line on the front/back cover near
      // the spine, positioned with its darkest edge flush against the seam
      // (see geometry.ts) and fading toward the fore-edge. Board outward
      // faces sit at z = ±bThick/2; the print artwork layer sits just past
      // that (±0.0016, see frontPrintMesh/backPrintMesh below), so this
      // needs a third, further-out layer to avoid z-fighting with it across
      // their overlapping area.
      const hingeGrooveMat = new THREE.MeshBasicMaterial({
        map: shared.hingeGrooveTexture,
        blending: THREE.MultiplyBlending,
        // Three.js requires premultipliedAlpha when MultiplyBlending is set
        // (WebGLState throws otherwise). The hinge texture is an opaque
        // canvas (alpha is 1 everywhere), so premultiplying is a numeric
        // no-op here — it doesn't change the rendered result, it just
        // satisfies the renderer's precondition for this blend mode.
        premultipliedAlpha: true,
        depthWrite: false,
      })
      const hingeSeamX = boardThick - bW / 2
      const frontHinge = new THREE.Mesh(hingeGrooveGeometry, hingeGrooveMat)
      frontHinge.position.set(hingeSeamX + hingeGrooveSpan / 2, 0, bThick / 2 + 0.0028)
      bookGroup.add(frontHinge)
      // Rotating 180° about Y (to face outward -Z) also flips the plane's
      // local X axis, so the texture's dark edge (at local x = -span/2)
      // lands on the +X side of this mesh's position instead of -X — shift
      // the center the other way so the dark edge still falls on the seam.
      const backHinge = new THREE.Mesh(hingeGrooveGeometry, hingeGrooveMat)
      backHinge.position.set(hingeSeamX - hingeGrooveSpan / 2, 0, -bThick / 2 - 0.0028)
      backHinge.rotation.y = Math.PI
      bookGroup.add(backHinge)

      const frontPrintMat = createPrintMaterial()
      const frontPrintMesh = new THREE.Mesh(printGeometry, frontPrintMat)
      frontPrintMesh.position.set(boardThick / 2, 0, bThick / 2 + 0.0016)
      bookGroup.add(frontPrintMesh)

      const backPrintMat = createPrintMaterial()
      const backPrintMesh = new THREE.Mesh(printGeometry, backPrintMat)
      backPrintMesh.position.set(boardThick / 2, 0, -bThick / 2 - 0.0016)
      backPrintMesh.rotation.y = Math.PI
      bookGroup.add(backPrintMesh)

      const spinePrintMat = createPrintMaterial()
      const spinePrintMesh = new THREE.Mesh(spinePrintGeometry, spinePrintMat)
      spinePrintMesh.rotation.y = -Math.PI / 2
      spinePrintMesh.position.set(-bW / 2 - 0.0016, 0, 0)
      bookGroup.add(spinePrintMesh)

      const physics = createInitialPhysicsState(0.09, -0.45)

      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      physics.reducedMotion = motionQuery.matches
      const onMotionChange = (event: MediaQueryListEvent): void => {
        physics.reducedMotion = event.matches
        requestBookStageRender()
      }
      motionQuery.addEventListener('change', onMotionChange)

      let pointerInside = false
      const updatePointerCoordinates = (event: PointerEvent): void => {
        const rect = container.getBoundingClientRect()
        physics.pointerX = Math.max(
          -1,
          Math.min(1, ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1),
        )
        physics.pointerY = Math.max(
          -1,
          Math.min(1, ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1),
        )
      }
      const onPointerEnter = (event: PointerEvent): void => {
        pointerInside = true
        physics.isHovered = true
        updatePointerCoordinates(event)
        requestBookStageRender()
      }
      let lastPointerX = 0
      let lastPointerY = 0
      const onPointerMove = (event: PointerEvent): void => {
        updatePointerCoordinates(event)
        if (physics.isDragging) {
          const dx = event.clientX - lastPointerX
          const dy = event.clientY - lastPointerY
          const deltaRotY = dx * 0.01
          const deltaRotX = dy * 0.007
          physics.dragRotationY += deltaRotY
          physics.dragRotationX = Math.max(-0.5, Math.min(0.5, physics.dragRotationX + deltaRotX))
          physics.velRotY = deltaRotY * 0.42
          physics.velRotX = deltaRotX * 0.42
          lastPointerX = event.clientX
          lastPointerY = event.clientY
        }
        requestBookStageRender()
      }
      const onPointerDown = (event: PointerEvent): void => {
        if (event.button !== 0 || physics.reducedMotion) return
        physics.isDragging = true
        physics.velRotX = 0
        physics.velRotY = 0
        lastPointerX = event.clientX
        lastPointerY = event.clientY
        updatePointerCoordinates(event)
        try {
          container.setPointerCapture(event.pointerId)
        } catch {
          // ignore
        }
        requestBookStageRender()
      }
      const onPointerUp = (event: PointerEvent): void => {
        physics.isDragging = false
        try {
          container.releasePointerCapture(event.pointerId)
        } catch {
          // ignore
        }
        if (!pointerInside) physics.isHovered = false
        requestBookStageRender()
      }
      const onPointerCancel = (event: PointerEvent): void => {
        physics.isDragging = false
        physics.velRotX = 0
        physics.velRotY = 0
        try {
          container.releasePointerCapture(event.pointerId)
        } catch {
          // ignore
        }
        requestBookStageRender()
      }
      const onPointerLeave = (): void => {
        pointerInside = false
        if (!physics.isDragging) {
          physics.isHovered = false
          physics.pointerX = 0
          physics.pointerY = 0
        }
        requestBookStageRender()
      }

      container.addEventListener('pointerenter', onPointerEnter)
      container.addEventListener('pointermove', onPointerMove)
      container.addEventListener('pointerdown', onPointerDown)
      container.addEventListener('pointerup', onPointerUp)
      container.addEventListener('pointercancel', onPointerCancel)
      container.addEventListener('pointerleave', onPointerLeave)

      let scrollRafId = 0
      const readScrollProgress = (): void => {
        const rect = section.getBoundingClientRect()
        const viewportHeight = window.innerHeight || 1
        physics.targetScrollProgress = Math.max(
          0,
          Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)),
        )
        requestBookStageRender()
      }
      const onScroll = (): void => {
        cancelAnimationFrame(scrollRafId)
        scrollRafId = requestAnimationFrame(readScrollProgress)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      readScrollProgress()

      removeListeners = () => {
        motionQuery.removeEventListener('change', onMotionChange)
        window.removeEventListener('scroll', onScroll)
        cancelAnimationFrame(scrollRafId)
        container.removeEventListener('pointerenter', onPointerEnter)
        container.removeEventListener('pointermove', onPointerMove)
        container.removeEventListener('pointerdown', onPointerDown)
        container.removeEventListener('pointerup', onPointerUp)
        container.removeEventListener('pointercancel', onPointerCancel)
        container.removeEventListener('pointerleave', onPointerLeave)
      }

      unregisterBook = registerBook({
        root,
        container,
        camera: { fov: 30, position: [0, 0.02, 5.95] },
        onFrame: (dt, elapsed, inViewport) => {
          updateBookPhysics(physics, dt, elapsed, {
            scrollProgress: physics.targetScrollProgress,
            // Progress is measured against the whole (tall, text-heavy)
            // section, so by the time it's comfortably centered in the
            // viewport, progress is already well past 0 — a full ~166°
            // sweep (the original range) had already rotated past the
            // cover into a near edge-on pose by then. A narrower sweep
            // keeps the cover the dominant view across the natural
            // reading position, saving the fuller turn for continued
            // scrolling rather than spending it before the book is even
            // comfortably in frame.
            scrollRotationY: Math.PI * 0.42,
            scrollRotationX: -0.018,
            restRotationY: -0.28,
            tiltRangeX: 0.04,
            tiltRangeY: 0.055,
            floatAmplitude: 0.007,
            floatFrequency: 0.72,
            hoverLift: 0.02,
            friction: 0.9,
            autoRotateSpeed: 0,
          })

          bookGroup.rotation.set(physics.rotationX, physics.rotationY, physics.rotationZ)
          bookGroup.position.set(physics.positionX, physics.positionY, physics.positionZ)
          ribbon.rotation.z = -0.04 + physics.ribbonSway
          shadow.scale.set(physics.shadowScale, physics.shadowScale, 1)
          shadowMat.opacity = physics.shadowOpacity

          const isMoving =
            physics.isDragging ||
            physics.isHovered ||
            Math.abs(physics.velRotX) > 0.0001 ||
            Math.abs(physics.velRotY) > 0.0001 ||
            Math.abs(physics.targetScrollProgress - physics.scrollProgress) > 0.001 ||
            Math.abs(physics.targetRotY - physics.rotationY) > 0.001

          return inViewport && isMoving
        },
      })

      sceneElementsRef.current = {
        renderer,
        getCoverDetailMaps,
        imageTexture,
        canvasTexture,
        loadCachedImage,
        frontMat,
        backMat,
        spineMat,
        edgeMat: boardEdgeMat,
        spineEdgeMat,
        frontPrintMat,
        backPrintMat,
        spinePrintMat,
        requestRender: requestBookStageRender,
      }

      if (book) {
        await updateBookTexturesRef.current?.(book)
      }
    }

    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            intersectionObserver?.disconnect()
            intersectionObserver = null
            void setup()
          }
        },
        { rootMargin: '200px 0px', threshold: 0.01 },
      )
      intersectionObserver.observe(section)
    } else {
      void setup()
    }

    return () => {
      cancelled = true
      intersectionObserver?.disconnect()
      removeListeners?.()
      unregisterBook?.()
      sceneElementsRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webglSupported])

  // --------------------------------------------------------------------------
  // Progressive Texture Update on Book Change (Instant Base -> Baked Detail)
  // Detail maps (normal/roughness/foil) are pre-baked static files — see
  // scripts/bake-book-textures.ts — so this is just image loads, no runtime
  // per-pixel derivation.
  // --------------------------------------------------------------------------
  const updateBookTextures = useCallback(async (currentBook: BookItem) => {
    const sceneRefs = sceneElementsRef.current
    if (!sceneRefs) return

    // Claim this load. If the user switches books again before it finishes,
    // `requestId` stops matching the ref and every later mutation below is
    // skipped — otherwise a slow load for the book the user just left could
    // land after (and overwrite) the fast load for the book they switched
    // to.
    const requestId = ++textureRequestIdRef.current
    const isStale = () => sceneElementsRef.current !== sceneRefs || textureRequestIdRef.current !== requestId

    const {
      renderer,
      getCoverDetailMaps,
      imageTexture,
      canvasTexture,
      loadCachedImage,
      frontMat,
      backMat,
      spineMat,
      edgeMat,
      spineEdgeMat,
      frontPrintMat,
      backPrintMat,
      spinePrintMat,
      requestRender,
    } = sceneRefs

    // 1. Base front cover — independent of back/spine/detail maps, so one
    // failed asset never leaves the physically modeled book on its default
    // untextured white material with no indication why.
    const frontImg = await loadCachedImage(currentBook.frontSrc).catch((err) => {
      console.error('[DownloadsBookShowcase] Front cover failed to load:', currentBook.frontSrc, err)
      return null
    })
    if (isStale()) return

    if (frontImg) {
      frontMat.map = imageTexture(frontImg, renderer)
    } else {
      frontMat.map = null
      frontMat.color.set(currentBook.themeColor || '#222222')
    }
    frontMat.needsUpdate = true
    if (currentBook.themeColor) {
      edgeMat.color.set(currentBook.themeColor)
    }
    requestRender()

    // 2. Back/spine covers, independently caught — a missing spine image
    // falls back to the front artwork, a missing back cover to a clean
    // generated back panel.
    const [backImg, spineImg] = await Promise.all([
      currentBook.backSrc
        ? loadCachedImage(currentBook.backSrc).catch((err) => {
            console.error('[DownloadsBookShowcase] Back cover failed to load:', currentBook.backSrc, err)
            return null
          })
        : Promise.resolve(null),
      currentBook.spineSrc
        ? loadCachedImage(currentBook.spineSrc).catch((err) => {
            console.error('[DownloadsBookShowcase] Spine cover failed to load:', currentBook.spineSrc, err)
            return null
          })
        : Promise.resolve(null),
    ])
    if (isStale()) return

    const hasBakedBack = Boolean(backImg && currentBook.backSrc)
    if (backImg) {
      backMat.map = imageTexture(backImg, renderer)
    } else {
      backMat.map = canvasTexture(createCleanBackCanvas(currentBook), renderer)
    }
    backMat.needsUpdate = true

    const hasBakedSpine = Boolean(spineImg && currentBook.spineSrc)
    if (spineImg || frontImg) {
      spineMat.map = imageTexture(spineImg || (frontImg as HTMLImageElement), renderer)
    } else {
      spineMat.map = null
      spineMat.color.set(currentBook.themeColor || '#222222')
    }
    spineMat.needsUpdate = true
    // Immediate approximation for the spine's structural faces — refined
    // below once the spine's own detail maps resolve with its actual
    // sampled color. These faces must match the spine, not the front
    // cover, or they show up as a mismatched line on the spine itself.
    if (currentBook.themeColor) {
      spineEdgeMat?.color.set(currentBook.themeColor)
    }

    requestRender()

    // 3. Pre-baked normal/roughness/foil maps — a refinement stage, only
    // attempted for covers whose base image actually loaded.
    const [frontDetail, backDetail, spineDetail] = await Promise.all([
      frontImg
        ? getCoverDetailMaps(currentBook.frontSrc, renderer).catch((err) => {
            console.error('[DownloadsBookShowcase] Front detail maps failed to load:', currentBook.frontSrc, err)
            return null
          })
        : Promise.resolve(null),
      hasBakedBack && currentBook.backSrc
        ? getCoverDetailMaps(currentBook.backSrc, renderer).catch((err) => {
            console.error('[DownloadsBookShowcase] Back detail maps failed to load:', currentBook.backSrc, err)
            return null
          })
        : Promise.resolve(null),
      hasBakedSpine && currentBook.spineSrc
        ? getCoverDetailMaps(currentBook.spineSrc, renderer).catch((err) => {
            console.error('[DownloadsBookShowcase] Spine detail maps failed to load:', currentBook.spineSrc, err)
            return null
          })
        : Promise.resolve(null),
    ])

    if (isStale()) return

    if (frontDetail) {
      frontMat.normalMap = frontDetail.normal
      frontMat.normalScale.set(0.24, 0.24)
      frontMat.roughnessMap = frontDetail.roughness
      edgeMat.color.copy(frontDetail.edgeColor)
      frontMat.needsUpdate = true
      frontPrintMat.alphaMap = frontDetail.printAlpha
      frontPrintMat.visible = true
      frontPrintMat.needsUpdate = true
    }

    if (backDetail) {
      backMat.normalMap = backDetail.normal
      backMat.normalScale.set(0.24, 0.24)
      backMat.roughnessMap = backDetail.roughness
      backMat.needsUpdate = true
      backPrintMat.alphaMap = backDetail.printAlpha
      backPrintMat.visible = true
      backPrintMat.needsUpdate = true
    }

    if (spineDetail) {
      spineMat.normalMap = spineDetail.normal
      spineMat.normalScale.set(0.24, 0.24)
      spineMat.roughnessMap = spineDetail.roughness
      spineMat.needsUpdate = true
      spineEdgeMat?.color.copy(spineDetail.edgeColor)
      spinePrintMat.alphaMap = spineDetail.printAlpha
      spinePrintMat.visible = true
      spinePrintMat.needsUpdate = true
    }

    requestRender()
  }, [])

  useEffect(() => {
    updateBookTexturesRef.current = updateBookTextures
  }, [updateBookTextures])

  useEffect(() => {
    if (sceneElementsRef.current && book) {
      void updateBookTextures(book)
    }
  }, [featuredId, book, updateBookTextures])

  const handleSwap = (selectedId: string) => {
    if (selectedId === featuredId || !BOOKS_DATA[selectedId]) return

    setIsSwapping(true)
    const oldFeatured = featuredId

    setGridIds((previous) =>
      previous.map((id) => (id === selectedId ? oldFeatured : id)),
    )
    setFeaturedId(selectedId)

    const firstTab = BOOKS_DATA[selectedId]?.tabs?.[0]?.id
    setActiveTab(firstTab || '')

    window.setTimeout(() => setIsSwapping(false), 180)
  }

  return (
    <section
      ref={sectionRef}
      className="download-section py-16 scroll-mt-16"
      id="books-publications"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">02</div>
        <div>
          <p className="text-[11px] font-mono tracking-widest text-primary uppercase">PRIMARY COLLECTION</p>
          <h2 className="font-headline text-2xl md:text-3xl font-bold">Books &amp; Publications</h2>
        </div>
        <div className="h-px flex-1 bg-border/60 ml-4" />
      </div>

      <article
        aria-label={`${book.title} interactive book showcase`}
        className={`grid grid-cols-1 lg:grid-cols-[minmax(350px,0.96fr)_minmax(0,1.04fr)] lg:min-h-[700px] border border-border/40 bg-card rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
          isSwapping ? 'opacity-70 scale-[0.995]' : 'opacity-100 scale-100'
        }`}
      >
        <div className="relative border-b lg:border-b-0 lg:border-r border-border/40 bg-gradient-to-b from-muted/30 via-muted/10 to-background">
          <div className="lg:sticky lg:top-6 h-full lg:min-h-[700px] p-6 sm:p-8 flex flex-col">
            <div className="flex items-center justify-between gap-4 font-mono text-[9px] tracking-[0.18em] uppercase text-muted-foreground">
              <span>{book.label}</span>
              <span className="text-primary/80">03D / OBJECT</span>
            </div>

            <div className="relative flex-1 min-h-[480px] sm:min-h-[560px] flex items-center justify-center overflow-visible">
              {webglSupported ? (
                <div
                  ref={stageRef}
                  tabIndex={0}
                  aria-label={`${book.title} 3D book. Scroll to turn the book and drag to inspect.`}
                  className="w-full h-[500px] sm:h-[590px] max-w-[510px] outline-none touch-none"
                />
              ) : (
                <div className="relative w-52 h-80 rounded-xl shadow-2xl overflow-hidden bg-muted">
                  <Image
                    src={book.coverThumb}
                    alt={`${book.title} cover`}
                    fill
                    className="object-cover"
                    sizes="300px"
                    priority
                  />
                </div>
              )}

              <div className="absolute bottom-7 left-1/2 -translate-x-1/2 pointer-events-none font-mono text-[8px] sm:text-[9px] tracking-[0.16em] text-muted-foreground/70 uppercase whitespace-nowrap">
                SCROLL TO TURN · DRAG TO INSPECT
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-3 border-t border-border/30">
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground truncate">
                {book.caption}
              </span>
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/60 shrink-0">
                {gridIds.length + 1} TITLES
              </span>
            </div>
          </div>
        </div>

        <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-between min-w-0">
          <div className="w-full">
            <div className="text-[10px] font-mono tracking-[0.16em] uppercase text-primary mb-3">
              {book.meta}
            </div>
            <h3 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight leading-[1.05] mb-4">
              {book.title}
            </h3>
            <p className="font-serif text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-8">
              {book.description}
            </p>

            {book.hasTabs && book.tabs ? (
              <div className="w-full">
                <div role="tablist" aria-label={`${book.title} resources`} className="flex border-b border-border/40 mb-6 overflow-x-auto">
                  {book.tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`shrink-0 px-1 mr-7 pb-3 font-mono text-[10px] tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                        activeTab === tab.id
                          ? 'border-primary text-foreground font-bold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {book.tabs.map((tab) =>
                  activeTab === tab.id ? (
                    <div key={tab.id} role="tabpanel" className="w-full">
                      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
                        {tab.panelLabel}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {tab.links.map((link) => (
                          <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border/40 hover:border-primary hover:bg-primary/5 transition-all text-sm"
                          >
                            <span className="min-w-0 truncate">{link.name}</span>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            ) : (
              <div className="w-full">
                <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
                  AVAILABLE DOWNLOADS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {book.links?.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border/40 hover:border-primary hover:bg-primary/5 transition-all text-sm"
                    >
                      <span className="min-w-0 truncate">{link.label}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-10 mt-10 border-t border-border/40 flex items-end justify-between gap-6">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">AUTHOR</div>
              <div className="font-headline font-semibold text-sm">{book.author}</div>
            </div>
            {book.authorLink && (
              <Link
                href={book.authorLink.url}
                className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                About author <span>↗</span>
              </Link>
            )}
          </div>
        </div>
      </article>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5" aria-label="Other books">
        {gridIds.map((id, index) => {
          const item = BOOKS_DATA[id]
          if (!item) return null

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSwap(item.id)}
              aria-label={`Open ${item.title}`}
              className="group text-left relative flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/20 hover:border-primary/60 hover:shadow-md transition-all"
            >
              <div className="relative shrink-0 w-14 h-[84px] rounded-md overflow-hidden shadow-sm bg-muted">
                <Image
                  src={item.coverThumb}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="96px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground truncate">
                    {item.author}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground/50 shrink-0">
                    0{index + 1}
                  </span>
                </div>
                <h4 className="font-headline font-bold text-sm leading-snug line-clamp-2">
                  {item.title}
                </h4>
                <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-mono tracking-wide uppercase text-primary">
                  Open book <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
