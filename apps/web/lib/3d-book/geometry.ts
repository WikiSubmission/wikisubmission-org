import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export interface BookGeometryOptions {
  width: number
  height: number
  depth: number
  boardThickness?: number
  overhang?: number
}

export function createBookAnatomyGeometries(options: BookGeometryOptions) {
  const {
    width: bW,
    height: bH,
    depth: bDepth,
    boardThickness = 0.033,
    overhang = 0.045,
  } = options

  const pageWidth = bW - boardThickness - overhang - 0.015
  const pageHeight = bH - overhang * 2
  const pageDepth = bDepth - boardThickness * 2

  // 1. Page block mesh geometry
  const pageGeometry = new THREE.BoxGeometry(pageWidth, pageHeight, pageDepth)

  // Edge bevel so the boards read as a photographed hardcover instead of a
  // flat CG box. RoundedBoxGeometry clamps radius to half the thinnest
  // dimension internally (the board's own thin depth here), so push close
  // to that natural cap rather than leaving an imperceptibly small bevel —
  // combined with the studio environment map (see book-stage.ts), the
  // highlight along the curve is what actually sells "rounded" at this
  // scale, more than the raw geometry.
  const boardRadius = boardThickness * 0.48
  const bevelSegments = 5

  // 2. Cover boards (front & back)
  const boardGeometry = new RoundedBoxGeometry(
    bW - boardThickness,
    bH,
    boardThickness,
    bevelSegments,
    boardRadius,
  )
  const printGeometry = new THREE.PlaneGeometry(bW - boardThickness, bH)

  // 3. Spine
  const spineGeometry = new RoundedBoxGeometry(
    boardThickness,
    bH,
    bDepth,
    bevelSegments,
    boardRadius,
  )
  const spinePrintGeometry = new THREE.PlaneGeometry(bDepth, bH)

  // 4. Board/spine hinge groove — a soft shadow line on the front and back
  // covers near where the board's caliper steps down to the thinner spine
  // cloth (the "French groove" on a real casebound hardcover). Implemented
  // as a multiply-blended decal plane rather than carved geometry — see
  // materials.ts createHingeGrooveTexture — so it stays subtle and only
  // reads under raking light/rotation instead of looking like a seam.
  const hingeGrooveSpan = boardThickness * 3.2
  const hingeGrooveGeometry = new THREE.PlaneGeometry(hingeGrooveSpan, bH * 0.97)

  // 5. Bookmark Ribbon (multi-segment curved spline)
  const ribbonGeom = new THREE.PlaneGeometry(0.12, 1.45, 6, 24)
  const ribbonPos = ribbonGeom.attributes.position
  for (let i = 0; i < ribbonPos.count; i++) {
    const py = ribbonPos.getY(i)
    ribbonPos.setZ(i, Math.sin(py * 2.6) * 0.08 + Math.sin(py * 5.2) * 0.018)
    ribbonPos.setX(i, ribbonPos.getX(i) + Math.cos(py * 2.0) * 0.02)
  }
  ribbonGeom.computeVertexNormals()

  // 6. Contact floor shadow plane
  const shadowGeometry = new THREE.PlaneGeometry(3.6, 1.6)

  return {
    pageGeometry,
    boardGeometry,
    printGeometry,
    spineGeometry,
    spinePrintGeometry,
    hingeGrooveGeometry,
    hingeGrooveSpan,
    ribbonGeom,
    shadowGeometry,
    dimensions: {
      bW,
      bH,
      bDepth,
      boardThickness,
      overhang,
      pageWidth,
      pageHeight,
      pageDepth,
    },
  }
}
