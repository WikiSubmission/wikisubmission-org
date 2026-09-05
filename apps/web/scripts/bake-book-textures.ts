/**
 * One-time asset bake for the 3D book covers.
 *
 * Ports the per-pixel detail-map derivation that used to run in the browser
 * (lib/3d-book/materials.ts: createCoverDetailMaps) into a build-time script,
 * and re-encodes each source cover as a compressed WebP. Run with:
 *
 *   pnpm bake:books
 *
 * Re-run whenever a book cover image changes.
 */
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const BOOKS_DIR = path.resolve(__dirname, '../public/images/books')
const SHARED_DIR = path.join(BOOKS_DIR, 'shared')

const DETAIL_MAX_WIDTH = 512
const DETAIL_MAX_HEIGHT = 768
const COVER_MAX_DIMENSION = 1400

function hash01(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

function luminance(r: number, g: number, b: number): number {
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

interface RawImage {
  data: Buffer
  width: number
  height: number
}

/** Same math as the old browser-side createCoverDetailMaps, run once here instead. */
function deriveDetailMaps(source: RawImage): {
  normal: RawImage
  roughness: RawImage
  foil: RawImage
} {
  const { data: p, width, height } = source

  const normal = Buffer.alloc(width * height * 4)
  const roughness = Buffer.alloc(width * height * 4)
  const foil = Buffer.alloc(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const prevX = Math.max(0, x - 1)
      const nextX = Math.min(width - 1, x + 1)
      const prevY = Math.max(0, y - 1)
      const nextY = Math.min(height - 1, y + 1)

      const li = (y * width + prevX) * 4
      const ri = (y * width + nextX) * 4
      const ui = (prevY * width + x) * 4
      const di = (nextY * width + x) * 4

      const here = luminance(p[i], p[i + 1], p[i + 2])
      const left = luminance(p[li], p[li + 1], p[li + 2])
      const right = luminance(p[ri], p[ri + 1], p[ri + 2])
      const up = luminance(p[ui], p[ui + 1], p[ui + 2])
      const down = luminance(p[di], p[di + 1], p[di + 2])
      const noise = hash01(x, y) - 0.5

      const print = clamp((here - 0.72) / 0.2, 0, 1)
      const hx = (right - left) * 0.7 + noise * 0.01 + (print - 0.5) * 0.022
      const hy = (down - up) * 0.7 + noise * 0.01 + (print - 0.5) * 0.022
      const z = 1 / Math.sqrt(hx * hx + hy * hy + 1)

      normal[i] = Math.round((hx * 0.5 + 0.5) * 255)
      normal[i + 1] = Math.round((hy * 0.5 + 0.5) * 255)
      normal[i + 2] = Math.round(z * 255)
      normal[i + 3] = 255

      const rough = print > 0.22 ? 88 + noise * 7 : 190 + noise * 9
      roughness[i] = rough
      roughness[i + 1] = rough
      roughness[i + 2] = rough
      roughness[i + 3] = 255

      // IMPORTANT: three.js's `alphaMap` samples the texture's GREEN
      // channel (see alphamap_fragment.glsl.js: `texture2D(alphaMap,
      // uv).g`) — it does NOT read the PNG's real alpha channel. The mask
      // must live in RGB (all three, so it's channel-order-proof), with the
      // real alpha channel left fully opaque. Encoding it into the real
      // alpha channel instead (the previous bug here) makes every pixel
      // sample green=255 regardless of the intended mask, so the print
      // material renders fully opaque white over the whole cover the
      // moment it's made visible.
      const mask = Math.round(clamp(print * 78, 0, 110))
      foil[i] = mask
      foil[i + 1] = mask
      foil[i + 2] = mask
      foil[i + 3] = 255
    }
  }

  return {
    normal: { data: normal, width, height },
    roughness: { data: roughness, width, height },
    foil: { data: foil, width, height },
  }
}

async function loadRaw(filePath: string, maxWidth: number, maxHeight: number): Promise<RawImage> {
  const resized = sharp(filePath).resize(maxWidth, maxHeight, {
    fit: 'inside',
    withoutEnlargement: true,
  })
  const { data, info } = await resized
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

async function writeRawImage(image: RawImage, outPath: string, format: 'webp' | 'png'): Promise<void> {
  const pipeline = sharp(image.data, {
    raw: { width: image.width, height: image.height, channels: 4 },
  })
  if (format === 'webp') {
    await pipeline.webp({ quality: 85 }).toFile(outPath)
  } else {
    await pipeline.png({ compressionLevel: 9 }).toFile(outPath)
  }
}

async function bakeCover(sourcePath: string): Promise<void> {
  const dir = path.dirname(sourcePath)
  const base = path.basename(sourcePath, path.extname(sourcePath))

  const coverOut = path.join(dir, `${base}.webp`)
  const normalOut = path.join(dir, `${base}-normal.webp`)
  const roughnessOut = path.join(dir, `${base}-roughness.webp`)
  const foilOut = path.join(dir, `${base}-foil.png`)

  await sharp(sourcePath)
    .resize(COVER_MAX_DIMENSION, COVER_MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(coverOut)

  const detailSource = await loadRaw(sourcePath, DETAIL_MAX_WIDTH, DETAIL_MAX_HEIGHT)
  const { normal, roughness, foil } = deriveDetailMaps(detailSource)

  await Promise.all([
    writeRawImage(normal, normalOut, 'webp'),
    writeRawImage(roughness, roughnessOut, 'webp'),
    writeRawImage(foil, foilOut, 'png'),
  ])

  console.log(`baked ${path.relative(BOOKS_DIR, sourcePath)}`)
}

/** Small tileable cloth-grain normal map shared by every board/spine and the Bible's buckram cover. */
async function bakeSharedClothGrain(): Promise<void> {
  const size = 256
  const data = Buffer.alloc(size * size * 4)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      const threadH = Math.sin(y * 0.85) * Math.cos(x * 0.42)
      const threadV = Math.sin(x * 0.85) * Math.cos(y * 0.42)
      const noise = hash01(x, y) - 0.5

      const hx = threadV * 0.3 + noise * 0.055
      const hy = threadH * 0.3 + noise * 0.055
      const hz = 1 / Math.sqrt(hx * hx + hy * hy + 1)

      data[idx] = Math.round((hx * 0.5 + 0.5) * 255)
      data[idx + 1] = Math.round((hy * 0.5 + 0.5) * 255)
      data[idx + 2] = Math.round(hz * 255)
      data[idx + 3] = 255
    }
  }

  await mkdir(SHARED_DIR, { recursive: true })
  await writeRawImage({ data, width: size, height: size }, path.join(SHARED_DIR, 'cloth-grain-normal.webp'), 'webp')
  console.log('baked shared/cloth-grain-normal.webp')
}

async function findBookSubfolders(): Promise<string[]> {
  const entries = await readdir(BOOKS_DIR, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory() && entry.name !== 'shared' && entry.name !== 'covers')
    .map((entry) => path.join(BOOKS_DIR, entry.name))
}

async function main(): Promise<void> {
  const bookDirs = await findBookSubfolders()

  const sourceFiles: string[] = []
  for (const dir of bookDirs) {
    const files = await readdir(dir)
    for (const file of files) {
      if (
        file.toLowerCase().endsWith('.png') &&
        !file.includes('-foil') &&
        !file.includes('-normal') &&
        !file.includes('-roughness')
      ) {
        sourceFiles.push(path.join(dir, file))
      }
    }
  }

  if (sourceFiles.length === 0) {
    console.log('No book cover PNGs found under public/images/books/*/')
    return
  }

  for (const file of sourceFiles) {
    await bakeCover(file)
  }

  await bakeSharedClothGrain()

  console.log(`\nDone. Baked ${sourceFiles.length} cover(s) + shared textures.`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
