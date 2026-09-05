import { makeCanvas, loadCachedImage, CLOTH_GRAIN_TEXTURE_SRC } from './materials'

function paintClothGrain(
  ctx: CanvasRenderingContext2D,
  grainImage: HTMLImageElement,
  w: number,
  h: number,
): void {
  const pattern = ctx.createPattern(grainImage, 'repeat')
  if (!pattern) return
  ctx.save()
  ctx.globalAlpha = 0.12
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

export async function createBibleCanvases() {
  const W = 1800
  const H = 2700
  const S_W = 512
  const S_H = 2700

  const grainImage = await loadCachedImage(CLOTH_GRAIN_TEXTURE_SRC)

  // 1. FRONT COVER
  const [fCanvas, fCtx] = makeCanvas(W, H)

  const bgGrad = fCtx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, '#141e2b')
  bgGrad.addColorStop(0.4, '#0d151f')
  bgGrad.addColorStop(0.8, '#080d14')
  bgGrad.addColorStop(1, '#05080c')
  fCtx.fillStyle = bgGrad
  fCtx.fillRect(0, 0, W, H)

  // Buckram / cloth grain micro-detail (single pattern fill instead of 45,000 draw calls)
  paintClothGrain(fCtx, grainImage, W, H)

  // Metallic gold gradient
  const goldGrad = fCtx.createLinearGradient(0, 0, W, H)
  goldGrad.addColorStop(0, '#ffffff')
  goldGrad.addColorStop(0.2, '#fbeece')
  goldGrad.addColorStop(0.5, '#deb874')
  goldGrad.addColorStop(0.8, '#f7e3bf')
  goldGrad.addColorStop(1, '#ffffff')

  // Gilt Frames
  fCtx.strokeStyle = goldGrad
  fCtx.lineWidth = 14
  fCtx.strokeRect(64, 64, W - 128, H - 128)
  fCtx.lineWidth = 4
  fCtx.strokeRect(92, 92, W - 184, H - 184)

  // Corner fleurons
  const drawFleuron = (x: number, y: number, angle: number) => {
    fCtx.save()
    fCtx.translate(x, y)
    fCtx.rotate(angle)
    fCtx.strokeStyle = goldGrad
    fCtx.lineWidth = 7
    fCtx.beginPath()
    fCtx.moveTo(0, 50)
    fCtx.lineTo(0, 0)
    fCtx.lineTo(50, 0)
    fCtx.stroke()
    fCtx.beginPath()
    fCtx.arc(22, 22, 8, 0, Math.PI * 2)
    fCtx.fillStyle = goldGrad
    fCtx.fill()
    fCtx.restore()
  }
  drawFleuron(64, 64, 0)
  drawFleuron(W - 64, 64, Math.PI / 2)
  drawFleuron(W - 64, H - 64, Math.PI)
  drawFleuron(64, H - 64, -Math.PI / 2)

  // Top Inscription
  fCtx.textAlign = 'center'
  fCtx.textBaseline = 'middle'
  fCtx.font = 'bold 50px "Cormorant Garamond", Georgia, serif'
  fCtx.fillStyle = goldGrad
  fCtx.fillText('OLD & NEW TESTAMENTS', W / 2, 260)

  fCtx.lineWidth = 3
  fCtx.beginPath()
  fCtx.moveTo(W / 2 - 180, 305)
  fCtx.lineTo(W / 2 + 180, 305)
  fCtx.stroke()

  // Central Monotheistic Geometric Star Medallion (Submitter-friendly, no crosses)
  const cx = W / 2
  const cy = H / 2 - 70

  const drawDiamond = (size: number, width: number) => {
    fCtx.lineWidth = width
    fCtx.beginPath()
    fCtx.moveTo(cx, cy - size)
    fCtx.lineTo(cx + size * 0.78, cy)
    fCtx.lineTo(cx, cy + size)
    fCtx.lineTo(cx - size * 0.78, cy)
    fCtx.closePath()
    fCtx.stroke()
  }

  fCtx.strokeStyle = goldGrad
  drawDiamond(250, 10)
  drawDiamond(190, 4)
  drawDiamond(130, 6)

  // 8-point geometric star rays
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    fCtx.lineWidth = 4
    fCtx.beginPath()
    fCtx.moveTo(cx, cy)
    fCtx.lineTo(cx + Math.cos(a) * 155, cy + Math.sin(a) * 155)
    fCtx.stroke()
  }
  fCtx.beginPath()
  fCtx.arc(cx, cy, 24, 0, Math.PI * 2)
  fCtx.fillStyle = goldGrad
  fCtx.fill()

  // Title: THE BIBLE
  fCtx.font = 'bold 130px "Cormorant Garamond", Georgia, serif'
  fCtx.fillStyle = goldGrad
  fCtx.shadowColor = 'rgba(0,0,0,0.9)'
  fCtx.shadowBlur = 18
  fCtx.fillText('THE BIBLE', W / 2, H - 520)
  fCtx.shadowBlur = 0

  fCtx.font = 'italic 56px Georgia, serif'
  fCtx.fillStyle = '#f0e6d6'
  fCtx.fillText('Old & New Testaments', W / 2, H - 420)

  fCtx.font = '38px sans-serif'
  fCtx.fillStyle = '#b8aba0'
  fCtx.fillText('Authorized Scriptures of God', W / 2, H - 330)

  // 2. SPINE
  const [sCanvas, sCtx] = makeCanvas(S_W, S_H)

  const sGrad = sCtx.createLinearGradient(0, 0, S_W, 0)
  sGrad.addColorStop(0, '#090e14')
  sGrad.addColorStop(0.35, '#1e2b3b')
  sGrad.addColorStop(0.7, '#121a24')
  sGrad.addColorStop(1, '#06090d')
  sCtx.fillStyle = sGrad
  sCtx.fillRect(0, 0, S_W, S_H)

  sCtx.save()
  sCtx.translate(S_W / 2, S_H / 2)
  sCtx.rotate(Math.PI / 2)
  sCtx.textAlign = 'center'
  sCtx.textBaseline = 'middle'
  sCtx.font = 'bold 78px "Cormorant Garamond", Georgia, serif'
  sCtx.fillStyle = goldGrad
  sCtx.fillText('THE BIBLE · OLD & NEW TESTAMENTS', 0, 0)
  sCtx.restore()

  // 3. BACK COVER
  const [bCanvas, bCtx] = makeCanvas(W, H)
  bCtx.fillStyle = bgGrad
  bCtx.fillRect(0, 0, W, H)
  bCtx.strokeStyle = goldGrad
  bCtx.lineWidth = 14
  bCtx.strokeRect(64, 64, W - 128, H - 128)
  bCtx.lineWidth = 4
  bCtx.strokeRect(92, 92, W - 184, H - 184)

  bCtx.textAlign = 'center'
  bCtx.textBaseline = 'middle'

  // Header Citation
  bCtx.font = 'bold 56px "Cormorant Garamond", Georgia, serif'
  bCtx.fillStyle = goldGrad
  bCtx.fillText('ISAIAH 42:8', W / 2, H / 2 - 180)

  bCtx.lineWidth = 3
  bCtx.beginPath()
  bCtx.moveTo(W / 2 - 130, H / 2 - 135)
  bCtx.lineTo(W / 2 + 130, H / 2 - 135)
  bCtx.stroke()

  // Quote
  bCtx.font = 'italic 52px Georgia, serif'
  bCtx.fillStyle = '#f5ede0'
  bCtx.fillText('“I am the LORD.', W / 2, H / 2 - 45)
  bCtx.fillText('That is my name.', W / 2, H / 2 + 30)
  bCtx.fillText('I will not give my glory to another,', W / 2, H / 2 + 105)
  bCtx.fillText('nor my praise to engraved images.”', W / 2, H / 2 + 180)

  bCtx.font = '36px "Cormorant Garamond", serif'
  bCtx.fillStyle = 'rgba(222, 184, 116, 0.7)'
  bCtx.fillText('◆', W / 2, H / 2 + 280)

  return { front: fCanvas, spine: sCanvas, back: bCanvas }
}
