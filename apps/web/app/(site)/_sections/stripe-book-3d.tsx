'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

function checkWebglSupported(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export interface StripeBook3DProps {
  type: 'quran' | 'bible'
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function StripeBook3D({
  type,
  width = 270,
  height = 340,
  className = '',
}: StripeBook3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [webglSupported] = useState<boolean>(checkWebglSupported)

  useEffect(() => {
    const container = mountRef.current
    if (!container || !webglSupported) return

    let cancelled = false
    let unregisterBook: (() => void) | null = null
    let removePointerListeners: (() => void) | null = null
    let intersectionObserver: IntersectionObserver | null = null

    async function setup(): Promise<void> {
      const [
        THREE,
        { createBookAnatomyGeometries },
        {
          imageTexture,
          getCoverDetailMaps,
          createPrintMaterial,
          getSharedBookTextures,
          loadCachedImage,
          canvasTexture,
          getClothGrainTexture,
        },
        { createInitialPhysicsState, updateBookPhysics },
        { createBibleCanvases },
        { registerBook, requestBookStageRender, ensureBookStageRenderer },
      ] = await Promise.all([
        import('three'),
        import('@/lib/3d-book/geometry'),
        import('@/lib/3d-book/materials'),
        import('@/lib/3d-book/physics'),
        import('@/lib/3d-book/bible-canvases'),
        import('@/lib/3d-book/book-stage'),
      ])

      if (cancelled || !container) return

      const renderer = ensureBookStageRenderer()

      const root = new THREE.Group()
      const bookGroup = new THREE.Group()
      root.add(bookGroup)

      const bW = 1.72
      const bH = 2.6
      const bookDepth = 0.38
      const boardThick = 0.031
      const overhang = 0.045

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
        depth: bookDepth,
        boardThickness: boardThick,
        overhang,
      })

      const shared = getSharedBookTextures(renderer)

      // Page block: a single material for most faces, but the top/bottom
      // edges and the spine-side gutter get their own tinted clones of the
      // same material (same map/normal/roughness) so the block doesn't read
      // as one uniformly-lit slab — a real page block is slightly more
      // exposed at the top and shadowed/occluded toward the binding.
      const pagePaperMat = new THREE.MeshPhysicalMaterial({
        map: shared.pagesTexture,
        normalMap: shared.pageNormalTexture,
        normalScale: new THREE.Vector2(0.35, 0.35),
        roughness: 0.72,
        metalness: 0,
        clearcoat: 0.02,
        clearcoatRoughness: 0.8,
      })
      const pageTopMat = pagePaperMat.clone()
      const pageBottomMat = pagePaperMat.clone()
      pageBottomMat.color.set(0xdccdb4)
      const pageGutterMat = pagePaperMat.clone()
      pageGutterMat.color.set(0xb9ac8f)
      const pageMesh = new THREE.Mesh(pageGeometry, [
        pagePaperMat,
        pageGutterMat,
        pageTopMat,
        pageBottomMat,
        pagePaperMat,
        pagePaperMat,
      ])
      pageMesh.position.set(-bW / 2 + boardThick + dims.pageWidth / 2 + 0.006, 0, 0)
      bookGroup.add(pageMesh)

      // Fore-edge: a physical material (not MeshBasicMaterial) so it
      // actually responds to the lighting rig — an unlit plane here is a
      // large part of why the edge previously read as a flat pasted-on
      // texture instead of compressed sheets catching light.
      const edgeMat = new THREE.MeshPhysicalMaterial({
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
      const foreEdge = new THREE.Mesh(edgeGeom, edgeMat)
      foreEdge.rotation.y = Math.PI / 2
      foreEdge.position.set(pageMesh.position.x + dims.pageWidth / 2 + 0.0015, 0, 0)
      bookGroup.add(foreEdge)

      const ribbonMat = new THREE.MeshPhysicalMaterial({
        color: type === 'quran' ? 0xfbf7ed : 0x8e1a26,
        roughness: 0.32,
        metalness: 0.04,
        clearcoat: 0.12,
        clearcoatRoughness: 0.3,
        side: THREE.DoubleSide,
      })
      const ribbon = new THREE.Mesh(ribbonGeom, ribbonMat)
      ribbon.position.set(0.18, -bH / 2 - 0.24, 0.05)
      ribbon.rotation.set(0.1, 0, -0.05)
      bookGroup.add(ribbon)

      const shadowMat = new THREE.MeshBasicMaterial({
        map: shared.contactShadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.8,
      })
      const shadow = new THREE.Mesh(shadowGeometry, shadowMat)
      shadow.position.set(0, -bH / 2 - 0.31, 0)
      shadow.rotation.x = -Math.PI / 2
      root.add(shadow)

      const clothGrain = await getClothGrainTexture(renderer)

      const boardEdgeMat = new THREE.MeshPhysicalMaterial({
        color: 0x141a24,
        roughness: 0.7,
        metalness: 0.0,
        clearcoat: 0.08,
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
        roughness: 0.58,
        metalness: 0.04,
        clearcoat: 0.12,
        clearcoatRoughness: 0.48,
        clearcoatNormalMap: clothGrain,
        clearcoatNormalScale: new THREE.Vector2(0.45, 0.45),
      })
      const backMat = new THREE.MeshPhysicalMaterial({
        roughness: 0.58,
        metalness: 0.04,
        clearcoat: 0.12,
        clearcoatRoughness: 0.48,
        clearcoatNormalMap: clothGrain,
        clearcoatNormalScale: new THREE.Vector2(0.45, 0.45),
      })
      const spineMat = new THREE.MeshPhysicalMaterial({
        roughness: 0.56,
        metalness: 0.04,
        clearcoat: 0.12,
        clearcoatRoughness: 0.48,
        clearcoatNormalMap: clothGrain,
        clearcoatNormalScale: new THREE.Vector2(0.45, 0.45),
      })

      const frontBoard = new THREE.Mesh(boardGeometry, [
        boardEdgeMat,
        boardEdgeMat,
        boardEdgeMat,
        boardEdgeMat,
        frontMat,
        boardEdgeMat,
      ])
      frontBoard.position.set(boardThick / 2, 0, bookDepth / 2 - boardThick / 2)
      bookGroup.add(frontBoard)

      const backBoard = new THREE.Mesh(boardGeometry, [
        boardEdgeMat,
        boardEdgeMat,
        boardEdgeMat,
        boardEdgeMat,
        boardEdgeMat,
        backMat,
      ])
      backBoard.position.set(boardThick / 2, 0, -bookDepth / 2 + boardThick / 2)
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
      // (see geometry.ts) and fading toward the fore-edge.
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
      // Board outward faces sit at z = ±bookDepth/2; the print artwork layer
      // sits just past that (±0.0014, see frontPrintMesh/backPrintMesh
      // below), so the hinge decal needs a third, further-out layer to
      // avoid z-fighting with it across their overlapping area.
      const hingeSeamX = boardThick - bW / 2
      const frontHinge = new THREE.Mesh(hingeGrooveGeometry, hingeGrooveMat)
      frontHinge.position.set(hingeSeamX + hingeGrooveSpan / 2, 0, bookDepth / 2 + 0.0026)
      bookGroup.add(frontHinge)
      // Rotating 180° about Y (to face outward -Z) also flips the plane's
      // local X axis, so the texture's dark edge (at local x = -span/2)
      // lands on the +X side of this mesh's position instead of -X —
      // shift the center the other way so the dark edge still falls
      // exactly on the seam, matching the front hinge.
      const backHinge = new THREE.Mesh(hingeGrooveGeometry, hingeGrooveMat)
      backHinge.position.set(hingeSeamX - hingeGrooveSpan / 2, 0, -bookDepth / 2 - 0.0026)
      backHinge.rotation.y = Math.PI
      bookGroup.add(backHinge)

      const frontPrintMat = createPrintMaterial()
      const frontPrintMesh = new THREE.Mesh(printGeometry, frontPrintMat)
      frontPrintMesh.position.set(boardThick / 2, 0, bookDepth / 2 + 0.0014)
      bookGroup.add(frontPrintMesh)

      const backPrintMat = createPrintMaterial()
      const backPrintMesh = new THREE.Mesh(printGeometry, backPrintMat)
      backPrintMesh.position.set(boardThick / 2, 0, -bookDepth / 2 - 0.0014)
      backPrintMesh.rotation.y = Math.PI
      bookGroup.add(backPrintMesh)

      const spinePrintMat = createPrintMaterial()
      const spinePrintMesh = new THREE.Mesh(spinePrintGeometry, spinePrintMat)
      spinePrintMesh.rotation.y = -Math.PI / 2
      spinePrintMesh.position.set(-bW / 2 - 0.0014, 0, 0)
      bookGroup.add(spinePrintMesh)

      const physics = createInitialPhysicsState(0.12, type === 'quran' ? -0.42 : -0.38)

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

      removePointerListeners = () => {
        motionQuery.removeEventListener('change', onMotionChange)
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
        camera: { fov: 34, position: [0, 0.02, 5.55] },
        onFrame: (dt, elapsed, inViewport) => {
          updateBookPhysics(physics, dt, elapsed, {
            restRotationY: type === 'quran' ? -0.42 : -0.38,
            tiltRangeX: 0.04,
            tiltRangeY: 0.055,
            floatAmplitude: 0.01,
            floatFrequency: 0.85,
            hoverLift: 0.02,
            friction: 0.9,
            autoRotateSpeed: 0.38,
          })

          bookGroup.rotation.set(physics.rotationX, physics.rotationY, physics.rotationZ)
          bookGroup.position.set(physics.positionX, physics.positionY, physics.positionZ)
          ribbon.rotation.z = -0.05 + physics.ribbonSway
          shadow.scale.set(physics.shadowScale, physics.shadowScale, 1)
          shadowMat.opacity = physics.shadowOpacity

          return inViewport
        },
      })

      // Load textures progressively: show the base cover instantly, upgrade
      // with the pre-baked normal/roughness/foil detail maps once loaded.
      // The front cover load is independent of spine/back/detail maps —
      // each is caught on its own — so a single failed asset only drops
      // that one enhancement instead of leaving the whole book untextured
      // (previously a failed `Promise.all` left the book on its default
      // white material with no visible error).
      if (type === 'quran') {
        const frontSrc = '/images/books/quran-the-final-testament/quran-front.webp'
        const spineSrc = '/images/books/quran-the-final-testament/quran-spine.webp'
        const backSrc = '/images/books/quran-the-final-testament/quran-back.webp'

        const frontImg = await loadCachedImage(frontSrc).catch((err) => {
          console.error('[StripeBook3D] Front cover failed to load:', frontSrc, err)
          return null
        })
        if (cancelled) return

        if (frontImg) {
          frontMat.map = imageTexture(frontImg, renderer)
        } else {
          // Visible, intentional fallback instead of a mysterious white book.
          frontMat.map = null
          frontMat.color.set(0x1c2430)
        }
        frontMat.needsUpdate = true
        requestBookStageRender()

        const [spineImg, backImg] = await Promise.all([
          loadCachedImage(spineSrc).catch((err) => {
            console.error('[StripeBook3D] Spine cover failed to load:', spineSrc, err)
            return null
          }),
          loadCachedImage(backSrc).catch((err) => {
            console.error('[StripeBook3D] Back cover failed to load:', backSrc, err)
            return null
          }),
        ])
        if (cancelled) return
        if (spineImg) {
          spineMat.map = imageTexture(spineImg, renderer)
          spineMat.needsUpdate = true
        }
        if (backImg) {
          backMat.map = imageTexture(backImg, renderer)
          backMat.needsUpdate = true
        }
        requestBookStageRender()

        if (frontImg) {
          try {
            const detail = await getCoverDetailMaps(frontSrc, renderer)
            if (cancelled) return
            frontMat.normalMap = detail.normal
            frontMat.roughnessMap = detail.roughness
            boardEdgeMat.color.copy(detail.edgeColor)
            frontMat.needsUpdate = true

            frontPrintMat.alphaMap = detail.printAlpha
            frontPrintMat.visible = true
            frontPrintMat.needsUpdate = true
            requestBookStageRender()
          } catch (err) {
            console.error('[StripeBook3D] Front detail maps failed to load:', frontSrc, err)
          }
        }

        if (spineImg) {
          try {
            const spineDetail = await getCoverDetailMaps(spineSrc, renderer)
            if (cancelled) return
            spineMat.normalMap = spineDetail.normal
            spineMat.roughnessMap = spineDetail.roughness
            spineEdgeMat.color.copy(spineDetail.edgeColor)
            spineMat.needsUpdate = true

            spinePrintMat.alphaMap = spineDetail.printAlpha
            spinePrintMat.visible = true
            spinePrintMat.needsUpdate = true
            requestBookStageRender()
          } catch (err) {
            console.error('[StripeBook3D] Spine detail maps failed to load:', spineSrc, err)
          }
        }
      } else {
        try {
          const { front, spine, back } = await createBibleCanvases()
          if (cancelled) return
          frontMat.map = canvasTexture(front, renderer)
          frontMat.needsUpdate = true
          spineMat.map = canvasTexture(spine, renderer)
          spineMat.needsUpdate = true
          backMat.map = canvasTexture(back, renderer)
          backMat.needsUpdate = true
          // Matches the generated spine gradient's midtone (see
          // bible-canvases.ts) rather than the front cover's — there's no
          // photo to sample here, but the same principle applies: the
          // spine's structural faces should match the spine, not the front.
          spineEdgeMat.color.set(0x18202c)
          requestBookStageRender()
        } catch (err) {
          console.error('[StripeBook3D] Bible cover canvases failed to build:', err)
          frontMat.map = null
          frontMat.color.set(0x141e2b)
          frontMat.needsUpdate = true
          requestBookStageRender()
        }
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
      intersectionObserver.observe(container)
    } else {
      void setup()
    }

    return () => {
      cancelled = true
      intersectionObserver?.disconnect()
      removePointerListeners?.()
      unregisterBook?.()
    }
  }, [type, width, height, webglSupported])

  if (!webglSupported) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div
          className="relative rounded-lg shadow-xl overflow-hidden bg-muted"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <Image
            src="/images/books/quran-the-final-testament/quran-front.webp"
            alt={type === 'quran' ? 'Quran: The Final Testament' : 'The Holy Bible'}
            fill
            className="object-cover"
            sizes="300px"
            priority
          />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mountRef}
      className={`relative select-none ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        cursor: 'grab',
      }}
      role="img"
      aria-label={
        type === 'quran'
          ? 'Quran: The Final Testament 3D Book model. Drag to rotate and inspect.'
          : 'The Holy Bible 3D Book model. Drag to rotate and inspect.'
      }
    />
  )
}
