/**
 * KDP Cover AI — TikTok Day 1 Video Generator
 * Produces: tiktok-day1.mp4  (1080×1920, 30fps, ~30 seconds)
 *
 * Run:  node generate-video.mjs
 * Deps: npm install canvas
 */

import { createCanvas, registerFont } from 'canvas'
import { spawn }                       from 'child_process'
import path                            from 'path'
import { fileURLToPath }               from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const W = 1080, H = 1920, FPS = 30

// ─── helpers ─────────────────────────────────────────────────────────────────

function hex(h) {
  const r = parseInt(h.slice(1,3),16)/255
  const g = parseInt(h.slice(3,5),16)/255
  const b = parseInt(h.slice(5,7),16)/255
  return [r,g,b]
}

function rgba(r,g,b,a=1){ return `rgba(${r},${g},${b},${a})` }

function drawRoundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath()
  ctx.moveTo(x+r, y)
  ctx.lineTo(x+w-r, y)
  ctx.quadraticCurveTo(x+w, y,   x+w,   y+r)
  ctx.lineTo(x+w, y+h-r)
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h)
  ctx.lineTo(x+r, y+h)
  ctx.quadraticCurveTo(x, y+h,   x,     y+h-r)
  ctx.lineTo(x, y+r)
  ctx.quadraticCurveTo(x, y,     x+r,   y)
  ctx.closePath()
  if (fill) { ctx.fillStyle = fill; ctx.fill() }
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ')
  let line = ''
  let cy = y
  for (const w of words) {
    const test = line + w + ' '
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, cy)
      line = w + ' '
      cy += lineH
    } else { line = test }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, cy)
  return cy
}

// ─── background helpers ───────────────────────────────────────────────────────

function gradBg(ctx, c1, c2, vertical=true) {
  const g = vertical
    ? ctx.createLinearGradient(0,0,0,H)
    : ctx.createLinearGradient(0,0,W,H)
  g.addColorStop(0, c1)
  g.addColorStop(1, c2)
  ctx.fillStyle = g
  ctx.fillRect(0,0,W,H)
}

function progressBar(ctx, scene, total) {
  const pw = (scene/total)*W
  const pg = ctx.createLinearGradient(0,0,pw,0)
  pg.addColorStop(0,'#7c3aed')
  pg.addColorStop(1,'#c084fc')
  ctx.fillStyle = pg
  ctx.fillRect(0,0,pw,14)
}

function captionBar(ctx, text) {
  ctx.fillStyle='rgba(0,0,0,0.85)'
  drawRoundRect(ctx, 60, H-340, W-120, 120, 20, 'rgba(0,0,0,0.85)')
  ctx.fillStyle='white'
  ctx.font='bold 38px Arial'
  ctx.textAlign='center'
  ctx.textBaseline='middle'
  wrapText(ctx, text, W/2, H-300, W-160, 46)
}

// ─── SCENE RENDERERS ─────────────────────────────────────────────────────────

function scene1_hook(ctx, t) {           // t = 0..1 within scene
  gradBg(ctx,'#1a0a0a','#0d0d0d')

  // emoji bounce
  const bounce = Math.sin(t*Math.PI*4)*20
  ctx.font=`160px Arial`
  ctx.textAlign='center'
  ctx.textBaseline='middle'
  ctx.fillText('😤', W/2, 680+bounce)

  // headline — fade in
  const alpha = Math.min(1, t*3)
  ctx.globalAlpha = alpha
  ctx.fillStyle='white'
  ctx.font='bold 88px Arial'
  ctx.textAlign='center'
  const lines = ['KDP keeps rejecting','your book cover?']
  lines.forEach((l,i)=>{ ctx.fillText(l, W/2, 920+i*110) })

  // sub
  ctx.fillStyle='#ff4444'
  ctx.font='bold 64px Arial'
  ctx.fillText('I fixed this. Watch.', W/2, 1200)
  ctx.globalAlpha=1

  captionBar(ctx,'KDP keeps rejecting your cover? I fixed this. Watch.')
}

function scene2_rejection(ctx, t) {
  ctx.fillStyle='#f0f0f0'; ctx.fillRect(0,0,W,H)

  // email card
  const cy = 200
  drawRoundRect(ctx, 90, cy, W-180, 1200, 24, 'white')

  // shadow
  ctx.shadowColor='rgba(0,0,0,0.18)'
  ctx.shadowBlur=60
  ctx.shadowOffsetY=20
  drawRoundRect(ctx, 90, cy, W-180, 1200, 24, 'white')
  ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetY=0

  // header band
  drawRoundRect(ctx, 90, cy, W-180, 200, 24, '#cc0000')
  ctx.fillStyle='#cc0000'
  ctx.fillRect(90, cy+100, W-180, 100)

  ctx.fillStyle='rgba(255,255,255,0.8)'
  ctx.font='30px Arial'
  ctx.textAlign='left'
  ctx.textBaseline='top'
  ctx.fillText('From: Amazon KDP <no-reply@amazon.com>', 140, cy+30)

  ctx.fillStyle='white'
  ctx.font='bold 44px Arial'
  ctx.fillText('❌ Cover File Review — Action Required', 140, cy+85)

  // body
  let by = cy+240
  ctx.fillStyle='#333'
  ctx.font='36px Arial'
  ctx.fillText('Hello,', 140, by); by+=60
  ctx.fillText('We could not approve your cover for', 140, by); by+=50
  ctx.font='bold 36px Arial'; ctx.fillStyle='#111'
  ctx.fillText('"The Last Signal".', 140, by); by+=80

  // error box
  drawRoundRect(ctx, 130, by, W-260, 260, 16, '#fff0f0')
  ctx.strokeStyle='#ff4444'; ctx.lineWidth=3
  drawRoundRect(ctx, 130, by, W-260, 260, 16)
  ctx.strokeStyle='transparent'

  ctx.fillStyle='#cc0000'
  ctx.font='bold 34px Arial'
  ctx.fillText('ERROR: Spine width mismatch.', 165, by+30)
  ctx.font='32px Arial'; ctx.fillStyle='#aa0000'
  ctx.fillText('Expected: 0.702"  —  Submitted: 0.680"', 165, by+90)
  ctx.fillText('Please resubmit with correct dimensions.', 165, by+140)
  by+=290

  ctx.fillStyle='#333'; ctx.font='34px Arial'
  ctx.fillText('Your book has not been published.', 140, by)

  // overlay label
  ctx.fillStyle='rgba(0,0,0,0.72)'
  ctx.fillRect(0, H-500, W, 140)
  ctx.fillStyle='white'; ctx.font='bold 58px Arial'; ctx.textAlign='center'
  ctx.fillText('Sound familiar? 👆', W/2, H-410)

  captionBar(ctx, 'Rejected — spine width off by 0.02 inches. Again.')
}

function scene3_brand(ctx, t) {
  gradBg(ctx,'#1a0030','#0d0020')

  // glow ring
  const glow = 0.4 + Math.sin(t*Math.PI*2)*0.3
  const gr = ctx.createRadialGradient(W/2,760,40,W/2,760,300)
  gr.addColorStop(0,`rgba(124,58,237,${glow})`)
  gr.addColorStop(1,'rgba(124,58,237,0)')
  ctx.fillStyle=gr; ctx.fillRect(0,500,W,520)

  // logo box
  drawRoundRect(ctx, W/2-120, 600, 240, 240, 48, '#7c3aed')
  ctx.fillStyle='white'; ctx.font='bold 140px Arial'
  ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.fillText('K', W/2, 724)

  // brand name
  const a = Math.min(1, t*2)
  ctx.globalAlpha=a
  ctx.fillStyle='white'; ctx.font='bold 96px Arial'
  ctx.textBaseline='top'
  ctx.fillText('KDP Cover AI', W/2, 880)

  ctx.fillStyle='#a78bfa'; ctx.font='48px Arial'
  const sub = 'AI book covers with exact KDP\ndimensions — ready in 60 seconds'
  sub.split('\n').forEach((l,i)=>ctx.fillText(l, W/2, 1010+i*64))
  ctx.globalAlpha=1

  captionBar(ctx,'This is KDP Cover AI — built for self-publishers.')
}

function scene4_features(ctx, t) {
  gradBg(ctx,'#0d0d1a','#0a0a0f')

  ctx.fillStyle='white'; ctx.font='bold 68px Arial'
  ctx.textAlign='center'; ctx.textBaseline='top'
  ctx.fillText('What it does automatically:', W/2, 120)

  const features = [
    { icon:'📐', title:'Exact spine width',  sub:'Amazon\'s formula, every time' },
    { icon:'🎨', title:'Full-wrap AI design', sub:'Front + Spine + Back' },
    { icon:'📄', title:'Print-ready PDF',     sub:'300 DPI · 0.125" bleed' },
    { icon:'🚀', title:'Under 60 seconds',    sub:'From details to download' },
  ]

  features.forEach((f, i) => {
    const delay = i / features.length
    const progress = Math.max(0, Math.min(1, (t - delay*0.5) * 4))
    const x = -200 + 290*progress   // slide in from left
    const fy = 320 + i*280

    ctx.globalAlpha = progress
    ctx.save(); ctx.translate(x, 0)

    drawRoundRect(ctx, 80, fy, W-160, 230, 28, 'rgba(124,58,237,0.18)')
    ctx.strokeStyle='rgba(124,58,237,0.5)'; ctx.lineWidth=2
    drawRoundRect(ctx, 80, fy, W-160, 230, 28)
    ctx.strokeStyle='transparent'

    ctx.font='80px Arial'; ctx.textAlign='left'; ctx.textBaseline='middle'
    ctx.fillText(f.icon, 140, fy+115)

    ctx.fillStyle='white'; ctx.font='bold 46px Arial'
    ctx.fillText(f.title, 270, fy+80)
    ctx.fillStyle='#a78bfa'; ctx.font='38px Arial'
    ctx.fillText(f.sub, 270, fy+145)

    ctx.restore()
    ctx.globalAlpha=1
  })

  captionBar(ctx,'Spine width, full-wrap design, print-ready PDF — all automatic.')
}

function scene5_steps(ctx, t) {
  gradBg(ctx,'#0f0f1a','#0a0a0f')

  ctx.fillStyle='white'; ctx.font='bold 76px Arial'
  ctx.textAlign='center'; ctx.textBaseline='top'
  ctx.fillText('3 steps. That\'s it.', W/2, 100)

  const steps = [
    'Enter title, genre & page count',
    'Hit Generate — AI builds the full cover',
    'Download PDF → Upload to KDP → ✅ Done',
  ]

  steps.forEach((s, i) => {
    const progress = Math.max(0, Math.min(1, (t - i*0.25) * 4))
    const fy = 320 + i*340
    ctx.globalAlpha = progress

    drawRoundRect(ctx, 80, fy, W-160, 280, 24, 'rgba(255,255,255,0.05)')
    ctx.strokeStyle='#7c3aed'; ctx.lineWidth=6
    ctx.beginPath(); ctx.moveTo(80,fy+28); ctx.lineTo(80,fy+252)
    ctx.stroke(); ctx.strokeStyle='transparent'

    // number circle
    ctx.fillStyle='#7c3aed'
    ctx.beginPath(); ctx.arc(180, fy+140, 55, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle='white'; ctx.font='bold 56px Arial'
    ctx.textAlign='center'; ctx.textBaseline='middle'
    ctx.fillText(i+1, 180, fy+140)

    ctx.fillStyle='white'; ctx.font='bold 44px Arial'
    ctx.textAlign='left'; ctx.textBaseline='middle'
    wrapText(ctx, s, 270, fy+120, W-370, 56)

    ctx.globalAlpha=1
  })

  captionBar(ctx,'Enter details. Generate. Download PDF. Upload to KDP.')
}

function scene6_result(ctx, t) {
  gradBg(ctx,'#0a1a0a','#0d0d0d')

  // green badge
  const bg = ctx.createLinearGradient(0,160,0,320)
  bg.addColorStop(0,'#16a34a'); bg.addColorStop(1,'#15803d')
  drawRoundRect(ctx, 100, 160, W-200, 160, 32, 'none')
  ctx.fillStyle=bg; ctx.fill()
  ctx.fillStyle='white'; ctx.font='bold 54px Arial'
  ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.fillText('✅ Approved by KDP — First Try', W/2, 242)

  const stats = [
    ['Spine width', 'Calculated exactly ✓'],
    ['Resolution',  '300 DPI ✓'],
    ['Bleed',       '0.125" ✓'],
    ['Format',      'Full-wrap PDF ✓'],
    ['Time taken',  '47 seconds ✓'],
  ]

  stats.forEach(([label, val], i) => {
    const progress = Math.max(0, Math.min(1, (t - i*0.12)*5))
    const fy = 400 + i*230
    ctx.globalAlpha = progress

    drawRoundRect(ctx, 80, fy, W-160, 190, 20, 'rgba(255,255,255,0.06)')

    ctx.fillStyle='#aaa'; ctx.font='40px Arial'
    ctx.textAlign='left'; ctx.textBaseline='middle'
    ctx.fillText(label, 140, fy+95)

    ctx.fillStyle='#4ade80'; ctx.font='bold 44px Arial'
    ctx.textAlign='right'
    ctx.fillText(val, W-140, fy+95)

    ctx.globalAlpha=1
  })

  captionBar(ctx,'Every spec correct. First try approval. 47 seconds.')
}

function scene7_cta(ctx, t) {
  const g = ctx.createLinearGradient(0,0,W,H)
  g.addColorStop(0,'#2e1065'); g.addColorStop(1,'#1e0a3c')
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H)

  // big headline
  ctx.fillStyle='white'; ctx.font='bold 116px Arial'
  ctx.textAlign='center'; ctx.textBaseline='top'
  ctx.fillText('3 free covers.', W/2, 260)
  ctx.fillStyle='#c084fc'
  ctx.fillText('No card.', W/2, 400)

  // pill button — pulse
  const scale = 1 + Math.sin(t*Math.PI*3)*0.04
  ctx.save(); ctx.translate(W/2, 900); ctx.scale(scale,scale)
  const pg = ctx.createLinearGradient(-400,-70,400,70)
  pg.addColorStop(0,'#7c3aed'); pg.addColorStop(1,'#6d28d9')
  drawRoundRect(ctx,-380,-70,760,140,70,pg)

  ctx.shadowColor='rgba(124,58,237,0.7)'; ctx.shadowBlur=50
  drawRoundRect(ctx,-380,-70,760,140,70)
  ctx.shadowBlur=0

  ctx.fillStyle='white'; ctx.font='bold 58px Arial'
  ctx.textBaseline='middle'; ctx.textAlign='center'
  ctx.fillText('🚀 Try it free now', 0, 0)
  ctx.restore()

  // url
  ctx.fillStyle='#c084fc'; ctx.font='bold 58px Arial'
  ctx.textAlign='center'; ctx.textBaseline='top'
  ctx.fillText('kdpcoverai.com', W/2, 1060)

  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='48px Arial'
  ctx.fillText('Link in bio 👆', W/2, 1160)

  // hashtags
  ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='32px Arial'
  ctx.fillText('#kdppublishing  #selfpublishing  #indieauthor  #amazonkdp', W/2, 1340)

  captionBar(ctx,'3 free covers. No card needed. kdpcoverai.com — link in bio.')
}

// ─── TRANSITION ───────────────────────────────────────────────────────────────

function applyTransition(ctx, progress) {
  // crossfade via global alpha handled per-frame by blending two canvases
  // here we do a simple fade to black between scenes
  if (progress < 0.5) {
    const a = progress * 2   // 0→1
    ctx.fillStyle = `rgba(0,0,0,${a})`
    ctx.fillRect(0,0,W,H)
  } else {
    const a = (1-progress)*2  // 1→0
    ctx.fillStyle = `rgba(0,0,0,${a})`
    ctx.fillRect(0,0,W,H)
  }
}

// ─── SCENE SCHEDULE ──────────────────────────────────────────────────────────
// Each scene: [renderFn, durationSeconds]

const SCENE_DURATION = 4      // seconds per scene
const TRANS_DURATION = 0.4    // seconds for fade between scenes
const TOTAL_SCENES   = 7

const sceneFns = [
  scene1_hook,
  scene2_rejection,
  scene3_brand,
  scene4_features,
  scene5_steps,
  scene6_result,
  scene7_cta,
]

const TOTAL_DURATION = TOTAL_SCENES * SCENE_DURATION
const TOTAL_FRAMES   = Math.round(TOTAL_DURATION * FPS)

// ─── FRAME RENDERER ──────────────────────────────────────────────────────────

function renderFrame(frameIndex) {
  const canvas = createCanvas(W, H)
  const ctx    = canvas.getContext('2d')

  const globalT  = frameIndex / FPS
  const sceneF   = globalT / SCENE_DURATION
  const sceneIdx = Math.min(Math.floor(sceneF), TOTAL_SCENES-1)
  const sceneT   = (sceneF - sceneIdx)            // 0..1 within scene

  // How far into the transition (0 = not in transition, >0 = transitioning)
  const transF   = sceneT > (1 - TRANS_DURATION/SCENE_DURATION)
    ? (sceneT - (1 - TRANS_DURATION/SCENE_DURATION)) / (TRANS_DURATION/SCENE_DURATION)
    : 0

  // Draw current scene
  sceneFns[sceneIdx](ctx, sceneT)

  // Draw next scene underneath transition
  if (transF > 0 && sceneIdx < TOTAL_SCENES-1) {
    const nextCanvas = createCanvas(W, H)
    const nCtx = nextCanvas.getContext('2d')
    sceneFns[sceneIdx+1](nCtx, 0)

    // Composite next scene on top with increasing alpha
    ctx.globalAlpha = transF
    ctx.drawImage(nextCanvas, 0, 0)
    ctx.globalAlpha = 1
  }

  // Progress bar always on top
  progressBar(ctx, sceneIdx+1, TOTAL_SCENES)

  // Scene counter
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font      = 'bold 32px Arial'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText(`${sceneIdx+1} / ${TOTAL_SCENES}`, W-40, 24)

  return canvas.toBuffer('raw')
}

// ─── FFMPEG PIPE ─────────────────────────────────────────────────────────────

const OUTPUT = path.join(__dirname, 'tiktok-day1.mp4')

const ffmpeg = spawn('ffmpeg', [
  '-y',
  '-f',         'rawvideo',
  '-pix_fmt',   'rgba',
  '-s',         `${W}x${H}`,
  '-r',         String(FPS),
  '-i',         'pipe:0',
  '-vf',        'format=yuv420p',
  '-c:v',       'libx264',
  '-preset',    'fast',
  '-crf',       '18',
  '-movflags',  '+faststart',
  OUTPUT,
], { stdio: ['pipe', 'pipe', 'pipe'] })

ffmpeg.stderr.on('data', d => {
  const msg = d.toString()
  if (msg.includes('frame=') || msg.includes('fps=')) {
    process.stdout.write('\r' + msg.split('\n')[0].trim())
  }
})

ffmpeg.on('close', code => {
  console.log('\n')
  if (code === 0) {
    console.log('✅ Video saved to: tiktok-day1.mp4')
    console.log(`   Duration : ${TOTAL_DURATION}s`)
    console.log(`   Frames   : ${TOTAL_FRAMES}`)
    console.log(`   Size     : 1080 × 1920 (TikTok vertical)`)
    console.log(`   FPS      : ${FPS}`)
  } else {
    console.error('❌ FFmpeg exited with code', code)
  }
})

// ─── RENDER LOOP ─────────────────────────────────────────────────────────────

console.log(`🎬 Rendering ${TOTAL_FRAMES} frames at ${FPS}fps...`)
console.log(`   ${TOTAL_SCENES} scenes × ${SCENE_DURATION}s = ${TOTAL_DURATION}s total\n`)

let frame = 0

function writeNext() {
  if (frame >= TOTAL_FRAMES) {
    ffmpeg.stdin.end()
    return
  }

  const buf = renderFrame(frame)

  const canWrite = ffmpeg.stdin.write(buf)
  frame++

  if (frame % FPS === 0) {
    process.stdout.write(`\r⏳ ${frame}/${TOTAL_FRAMES} frames (${Math.round(frame/TOTAL_FRAMES*100)}%)  `)
  }

  if (canWrite) {
    setImmediate(writeNext)
  } else {
    ffmpeg.stdin.once('drain', writeNext)
  }
}

writeNext()
