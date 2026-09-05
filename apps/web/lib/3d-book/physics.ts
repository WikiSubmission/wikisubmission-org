/**
 * Interactive book physics.
 *
 * The important change from the original implementation is that the book now
 * has a clear hierarchy of motion:
 *
 *   scroll -> primary rotation
 *   drag   -> secondary inspection offset + inertia
 *   pointer -> tiny magnetic tilt
 *   idle   -> almost imperceptible breathing
 *
 * This keeps the experience editorial instead of making the book look like a
 * continuously rotating 3D demo.
 */

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export interface BookPhysicsState {
  // Rendered transforms
  rotationX: number
  rotationY: number
  rotationZ: number
  positionX: number
  positionY: number
  positionZ: number

  // Target transforms
  targetRotX: number
  targetRotY: number
  targetRotZ: number
  targetPosX: number
  targetPosY: number
  targetPosZ: number

  // Scroll / inspection
  scrollProgress: number
  targetScrollProgress: number
  dragRotationX: number
  dragRotationY: number

  // Drag momentum
  velRotX: number
  velRotY: number

  // Pointer state
  pointerX: number
  pointerY: number
  isDragging: boolean
  isHovered: boolean

  // Secondary animation
  ribbonSway: number
  ribbonVel: number
  hoverAmount: number
  shadowScale: number
  shadowOpacity: number

  // Accessibility / lifecycle
  reducedMotion: boolean
}

export function createInitialPhysicsState(
  initialRotX = 0.10,
  initialRotY = -0.42,
): BookPhysicsState {
  return {
    rotationX: initialRotX,
    rotationY: initialRotY,
    rotationZ: 0,
    positionX: 0,
    positionY: 0,
    positionZ: 0,

    targetRotX: initialRotX,
    targetRotY: initialRotY,
    targetRotZ: 0,
    targetPosX: 0,
    targetPosY: 0,
    targetPosZ: 0,

    scrollProgress: 0,
    targetScrollProgress: 0,
    dragRotationX: 0,
    dragRotationY: 0,

    velRotX: 0,
    velRotY: 0,

    pointerX: 0,
    pointerY: 0,
    isDragging: false,
    isHovered: false,

    ribbonSway: 0,
    ribbonVel: 0,
    hoverAmount: 0,
    shadowScale: 1,
    shadowOpacity: 0.72,

    reducedMotion: false,
  }
}

export interface PhysicsUpdateOptions {
  /** Primary scroll-driven yaw in radians from start to end of the section. */
  scrollRotationY?: number
  /** Small pitch contribution across scroll. */
  scrollRotationX?: number
  /** Base yaw before scroll is applied. */
  restRotationY?: number
  /** Small hover tilt range. */
  tiltRangeX?: number
  tiltRangeY?: number
  /** Very subtle breathing movement. */
  floatAmplitude?: number
  floatFrequency?: number
  /** Vertical lift while hovered. */
  hoverLift?: number
  /** Drag inertia decay. */
  friction?: number
  /** Legacy idle rotation; default is effectively off. */
  autoRotateSpeed?: number
  /** Current externally-computed scroll progress. */
  scrollProgress?: number
}

export function updateBookPhysics(
  state: BookPhysicsState,
  dt: number,
  time: number,
  options: PhysicsUpdateOptions = {},
): void {
  const {
    scrollRotationY = Math.PI * 0.90,
    scrollRotationX = -0.025,
    restRotationY = -0.42,
    tiltRangeX = 0.045,
    tiltRangeY = 0.065,
    floatAmplitude = 0.010,
    floatFrequency = 0.85,
    hoverLift = 0.025,
    friction = 0.91,
    autoRotateSpeed = 0,
    scrollProgress,
  } = options

  const safeDt = clamp(dt, 0.001, 0.05)

  if (typeof scrollProgress === 'number') {
    state.targetScrollProgress = clamp(scrollProgress, 0, 1)
  }

  state.scrollProgress = damp(
    state.scrollProgress,
    state.targetScrollProgress,
    state.reducedMotion ? 14 : 9,
    safeDt,
  )

  const targetHover = state.isHovered && !state.reducedMotion ? 1 : 0
  state.hoverAmount = damp(state.hoverAmount, targetHover, 8, safeDt)

  if (state.reducedMotion) {
    state.targetRotX = 0.08 - state.pointerY * 0.012
    state.targetRotY = restRotationY + state.dragRotationY + state.pointerX * 0.018
    state.targetPosX = damp(state.targetPosX, 0, 12, safeDt)
    state.targetPosY = 0

    state.rotationX = damp(state.rotationX, state.targetRotX, 12, safeDt)
    state.rotationY = damp(state.rotationY, state.targetRotY, 12, safeDt)
    state.positionX = damp(state.positionX, 0, 12, safeDt)
    state.positionY = damp(state.positionY, 0, 12, safeDt)

    state.shadowScale = damp(state.shadowScale, 1 - state.hoverAmount * 0.035, 10, safeDt)
    state.shadowOpacity = damp(state.shadowOpacity, 0.68, 10, safeDt)
    return
  }

  // 1. Drag inspection + inertia.
  if (!state.isDragging) {
    if (Math.abs(state.velRotY) > 0.00005 || Math.abs(state.velRotX) > 0.00005) {
      state.dragRotationY += state.velRotY
      state.dragRotationX += state.velRotX

      state.dragRotationX = clamp(state.dragRotationX, -0.52, 0.52)

      const decay = Math.pow(friction, safeDt * 60)
      state.velRotX *= decay
      state.velRotY *= decay

      if (Math.abs(state.velRotY) < 0.00005) state.velRotY = 0
      if (Math.abs(state.velRotX) < 0.00005) state.velRotX = 0
    }
  }

  // 2. Editorial scroll motion is the dominant pose.
  const scrollYaw = state.scrollProgress * scrollRotationY
  const scrollPitch = state.scrollProgress * scrollRotationX
  const pointerTiltX = state.pointerY * -tiltRangeX
  const pointerTiltY = state.pointerX * tiltRangeY
  const idleBreath = Math.sin(time * floatFrequency) * 0.006

  state.targetRotX = 0.09 + scrollPitch + state.dragRotationX + pointerTiltX + idleBreath
  state.targetRotY = restRotationY + scrollYaw + state.dragRotationY + pointerTiltY + autoRotateSpeed * time

  // Very small lateral movement makes the object feel suspended without
  // turning the showcase into a parallax toy.
  const targetX = state.isHovered ? state.pointerX * 0.020 : 0
  state.targetPosX = damp(state.targetPosX, targetX, 7, safeDt)
  state.targetPosY = Math.sin(time * floatFrequency) * floatAmplitude + state.hoverAmount * hoverLift

  // 3. Smooth main transforms.
  const transformLambda = state.isDragging ? 24 : 10
  const prevRotY = state.rotationY

  state.rotationX = damp(state.rotationX, state.targetRotX, transformLambda, safeDt)
  state.rotationY = damp(state.rotationY, state.targetRotY, transformLambda, safeDt)
  state.positionX = damp(state.positionX, state.targetPosX, 8, safeDt)
  state.positionY = damp(state.positionY, state.targetPosY, 7, safeDt)

  // 4. Bookmark ribbon follows angular motion with its own inertia.
  const angularVelocityY = (state.rotationY - prevRotY) / Math.max(safeDt, 0.001)
  const targetRibbonSway = clamp(-angularVelocityY * 0.045, -0.13, 0.13)
  state.ribbonVel += (targetRibbonSway - state.ribbonSway) * 12 * safeDt
  state.ribbonVel *= Math.pow(0.90, safeDt * 60)
  state.ribbonSway += state.ribbonVel

  // 5. Shadow becomes slightly softer/smaller when the book lifts.
  const breathingShadow = Math.sin(time * floatFrequency) * -0.012
  const targetShadowScale = 1 - state.hoverAmount * 0.055 + breathingShadow
  const targetShadowOpacity = 0.72 - state.hoverAmount * 0.12
  state.shadowScale = damp(state.shadowScale, targetShadowScale, 8, safeDt)
  state.shadowOpacity = damp(state.shadowOpacity, targetShadowOpacity, 8, safeDt)
}
