/**
 * Generates app icons: icon-192.png, icon-512.png, apple-touch-icon.png
 * Run: node make-icons.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const dir = dirname(fileURLToPath(import.meta.url))

function makeIconSvg(size) {
  const radius = Math.round(size * 0.22)
  const fontSize = Math.round(size * 0.58)
  const textY = Math.round(size * 0.72)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#7c3aed"/>
  <text x="${size/2}" y="${textY}" font-family="Georgia, serif" font-size="${fontSize}" font-weight="bold"
    fill="white" text-anchor="middle">K</text>
</svg>`.trim()
}

console.log('Generating app icons...')
try {
  const sharp = (await import('sharp')).default
  mkdirSync(join(dir, 'public'), { recursive: true })

  for (const [name, size] of [
    ['icon-192.png', 192],
    ['icon-512.png', 512],
    ['apple-touch-icon.png', 180],
    ['favicon-32.png', 32],
  ]) {
    await sharp(Buffer.from(makeIconSvg(size))).png().toFile(join(dir, 'public', name))
    console.log(`✓ public/${name}`)
  }
  console.log('Done!')
} catch (e) {
  console.warn('sharp not available, saving SVGs instead')
  mkdirSync(join(dir, 'public'), { recursive: true })
  for (const [name, size] of [['icon-192.svg', 192], ['icon-512.svg', 512]]) {
    writeFileSync(join(dir, 'public', name), makeIconSvg(size))
    console.log(`✓ public/${name}`)
  }
}
