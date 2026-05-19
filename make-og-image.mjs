/**
 * Generates public/og-image.png (1200x630) for social media sharing.
 * Run: node make-og-image.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const dir = dirname(fileURLToPath(import.meta.url))

// Build SVG — 1200 × 630
const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Dark gradient background -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#0a0a12"/>
      <stop offset="60%"  stop-color="#0f0f1e"/>
      <stop offset="100%" stop-color="#16082e"/>
    </linearGradient>

    <!-- Violet glow behind logo -->
    <radialGradient id="glow" cx="50%" cy="45%" r="45%">
      <stop offset="0%"   stop-color="#7c3aed" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>

    <!-- Gold gradient for book spine accent -->
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#f0c040"/>
      <stop offset="100%" stop-color="#b8850a"/>
    </linearGradient>

    <!-- Book cover gradient -->
    <linearGradient id="cover1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#1e3a5f"/>
      <stop offset="100%" stop-color="#0a1a30"/>
    </linearGradient>
    <linearGradient id="cover2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#3b1a5e"/>
      <stop offset="100%" stop-color="#1a0a30"/>
    </linearGradient>
    <linearGradient id="cover3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#1a3e2a"/>
      <stop offset="100%" stop-color="#0a1e12"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Subtle grid lines -->
  <g opacity="0.04" stroke="#ffffff" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105"/>
    <line x1="0" y1="210" x2="1200" y2="210"/>
    <line x1="0" y1="315" x2="1200" y2="315"/>
    <line x1="0" y1="420" x2="1200" y2="420"/>
    <line x1="0" y1="525" x2="1200" y2="525"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
  </g>

  <!-- ── 3 BOOK COVER MOCKUPS (right side) ─────────────────────── -->

  <!-- Book 3 (back) -->
  <g transform="translate(810, 110) rotate(-8)">
    <rect width="160" height="220" rx="4" fill="url(#cover3)" opacity="0.7"/>
    <rect x="0" y="0" width="12" height="220" rx="2" fill="url(#gold)" opacity="0.6"/>
    <rect x="20" y="30" width="120" height="8" rx="2" fill="#ffffff" opacity="0.5"/>
    <rect x="20" y="46" width="80" height="5" rx="2" fill="#ffffff" opacity="0.3"/>
    <rect x="20" y="170" width="100" height="5" rx="2" fill="#ffffff" opacity="0.4"/>
  </g>

  <!-- Book 2 (middle) -->
  <g transform="translate(870, 90) rotate(-2)">
    <rect width="165" height="230" rx="4" fill="url(#cover2)" opacity="0.85"/>
    <rect x="0" y="0" width="13" height="230" rx="2" fill="url(#gold)" opacity="0.7"/>
    <rect x="22" y="28" width="125" height="10" rx="2" fill="#ffffff" opacity="0.6"/>
    <rect x="22" y="46" width="90" height="6" rx="2" fill="#ffffff" opacity="0.35"/>
    <circle cx="82" cy="130" r="35" fill="#ffffff" opacity="0.06"/>
    <circle cx="82" cy="130" r="22" fill="#ffffff" opacity="0.06"/>
    <rect x="22" y="180" width="110" height="6" rx="2" fill="#ffffff" opacity="0.45"/>
  </g>

  <!-- Book 1 (front, largest) -->
  <g transform="translate(940, 70) rotate(5)">
    <rect width="175" height="245" rx="5" fill="url(#cover1)"/>
    <rect x="0" y="0" width="14" height="245" rx="3" fill="url(#gold)"/>
    <!-- Lightning bolt decoration -->
    <polygon points="80,55 95,100 75,100 90,145" fill="#f0c040" opacity="0.4"/>
    <!-- Title lines -->
    <rect x="24" y="26" width="132" height="12" rx="3" fill="#ffffff" opacity="0.85"/>
    <rect x="24" y="46" width="100" height="7" rx="2" fill="#ffffff" opacity="0.55"/>
    <!-- Author line -->
    <rect x="24" y="195" width="5" height="32" rx="1" fill="url(#gold)" opacity="0.7"/>
    <rect x="36" y="202" width="110" height="8" rx="2" fill="#ffffff" opacity="0.7"/>
    <!-- KDP stamp -->
    <rect x="24" y="218" width="132" height="1" fill="url(#gold)" opacity="0.4"/>
  </g>

  <!-- ── LEFT SIDE — TEXT CONTENT ──────────────────────────────── -->

  <!-- "K" logo mark -->
  <rect x="60" y="80" width="52" height="52" rx="12" fill="#7c3aed"/>
  <text x="86" y="118" font-family="Georgia, serif" font-size="34" font-weight="bold"
    fill="white" text-anchor="middle">K</text>

  <!-- App name -->
  <text x="60" y="190" font-family="Arial, Helvetica, sans-serif" font-size="62"
    font-weight="800" fill="#ffffff" letter-spacing="-1">KDP Cover AI</text>

  <!-- Tagline -->
  <text x="60" y="248" font-family="Arial, Helvetica, sans-serif" font-size="26"
    fill="#a78bfa" letter-spacing="0.5">Generate Amazon-ready book covers in seconds</text>

  <!-- Divider line -->
  <rect x="60" y="282" width="440" height="2" rx="1" fill="#7c3aed" opacity="0.6"/>

  <!-- Feature bullets -->
  <g font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#d1d5db">
    <!-- Bullet 1 -->
    <circle cx="72" cy="322" r="5" fill="#7c3aed"/>
    <text x="90" y="329">Full-wrap cover — front, spine &amp; back</text>

    <!-- Bullet 2 -->
    <circle cx="72" cy="368" r="5" fill="#7c3aed"/>
    <text x="90" y="375">Exact KDP dimensions, 300 DPI, print-ready PDF</text>

    <!-- Bullet 3 -->
    <circle cx="72" cy="414" r="5" fill="#7c3aed"/>
    <text x="90" y="421">AI-generated or upload your own image</text>

    <!-- Bullet 4 -->
    <circle cx="72" cy="460" r="5" fill="#10b981"/>
    <text x="90" y="467" fill="#6ee7b7">Free to start — no credit card needed</text>
  </g>

  <!-- Bottom bar -->
  <rect x="0" y="570" width="1200" height="60" fill="#7c3aed" opacity="0.15"/>
  <rect x="0" y="570" width="1200" height="2" fill="#7c3aed" opacity="0.5"/>

  <!-- URL in bottom bar -->
  <text x="60" y="607" font-family="Arial, Helvetica, sans-serif" font-size="18"
    fill="#a78bfa" letter-spacing="0.5">kdp-cover-ai.vercel.app</text>

  <!-- Stars / social proof -->
  <text x="1080" y="607" font-family="Arial, Helvetica, sans-serif" font-size="18"
    fill="#f0c040" text-anchor="end">★★★★★  Loved by self-publishers</text>
</svg>
`.trim()

// Convert SVG to PNG using sharp
console.log('Generating OG image...')
try {
  const sharp = (await import('sharp')).default
  mkdirSync(join(dir, 'public'), { recursive: true })
  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(dir, 'public', 'og-image.png'))
  console.log('✓ Saved to public/og-image.png (1200×630)')
} catch (e) {
  // sharp not available — save as SVG fallback and rename
  console.warn('sharp not available, saving SVG instead (rename to .svg for preview)')
  mkdirSync(join(dir, 'public'), { recursive: true })
  writeFileSync(join(dir, 'public', 'og-image.svg'), svg)
  console.log('✓ Saved to public/og-image.svg — open in browser to preview')
  console.log('  To convert: install sharp (npm i sharp) then run again, or export from browser as PNG')
}
