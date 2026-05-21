/**
 * Generates a real EAN-13 ISBN barcode PNG
 * ISBN-13: 978-1-234-56789-7
 * Run: node make-barcode.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const dir = dirname(fileURLToPath(import.meta.url))

// EAN-13 digit patterns
const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
const G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111']
const R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100']

// First-digit parity patterns
const PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']

function encodeEAN13(digits) {
  if (digits.length !== 13) throw new Error('Need 13 digits')
  const d = digits.split('').map(Number)
  const parity = PARITY[d[0]]
  let bits = '101' // start guard
  for (let i = 0; i < 6; i++) {
    bits += parity[i] === 'L' ? L[d[i+1]] : G[d[i+1]]
  }
  bits += '01010' // middle guard
  for (let i = 7; i < 13; i++) {
    bits += R[d[i]]
  }
  bits += '101' // end guard
  return bits
}

function calcCheckDigit(isbn12) {
  const d = isbn12.split('').map(Number)
  const sum = d.reduce((acc, v, i) => acc + v * (i % 2 === 0 ? 1 : 3), 0)
  return String((10 - (sum % 10)) % 10)
}

// Build the barcode SVG
const isbn12 = '978123456789'
const check  = calcCheckDigit(isbn12)
const isbn13 = isbn12 + check
const formatted = `${isbn13.slice(0,3)}-${isbn13.slice(3,4)}-${isbn13.slice(4,7)}-${isbn13.slice(7,12)}-${isbn13.slice(12)}`

const bits = encodeEAN13(isbn13)

const barW    = 2       // pixels per module
const quietW  = 9       // quiet zone width
const barH    = 60      // bar height
const textH   = 12      // text area below bars
const padTop  = 4
const totalW  = quietW * 2 + bits.length * barW
const totalH  = padTop + barH + textH + 4

let rects = ''
let x = quietW
for (const bit of bits) {
  if (bit === '1') {
    rects += `<rect x="${x}" y="${padTop}" width="${barW}" height="${barH}" fill="black"/>`
  }
  x += barW
}

// Number text below bars
const leftNum  = isbn13.slice(0, 7)
const rightNum = isbn13.slice(7)
const midX     = quietW + (bits.length * barW) / 2

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">
  <rect width="${totalW}" height="${totalH}" fill="white"/>
  ${rects}
  <text x="${quietW - 2}" y="${padTop + barH + 10}" font-family="monospace" font-size="8" text-anchor="middle" fill="black">${isbn13[0]}</text>
  <text x="${quietW + 24 * barW}" y="${padTop + barH + 10}" font-family="monospace" font-size="8" text-anchor="middle" fill="black">${leftNum.slice(1)}</text>
  <text x="${quietW + 70 * barW}" y="${padTop + barH + 10}" font-family="monospace" font-size="8" text-anchor="middle" fill="black">${rightNum}</text>
</svg>`

console.log(`ISBN-13: ${formatted}`)
console.log('Generating barcode...')

try {
  const sharp = (await import('sharp')).default
  const outPath = join(dir, 'public', 'test-barcode.png')
  mkdirSync(join(dir, 'public'), { recursive: true })
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  console.log(`✓ Saved to public/test-barcode.png`)
  console.log(`  ISBN to enter: ${formatted}`)
} catch {
  const outPath = join(dir, 'public', 'test-barcode.svg')
  writeFileSync(outPath, svg)
  console.log(`✓ Saved to public/test-barcode.svg (open in browser to view)`)
  console.log(`  ISBN to enter: ${formatted}`)
}
