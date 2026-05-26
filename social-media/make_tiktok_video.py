"""
Creates a 30-second TikTok-style MP4 video demonstrating KDP Cover AI.
Steps shown:
  0. Hook title card
  1. Homepage screenshot
  2. Cover generator form
  3. AI generating animation (progress bar)
  4. Cover reveal
  5. PDF export / download
  6. CTA card
"""

import os, time, math, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from playwright.sync_api import sync_playwright
import subprocess

OUT_DIR   = Path(r"C:\Users\SAMUEL\kdp-cover-ai\social-media\video_frames")
VIDEO_OUT = Path(r"C:\Users\SAMUEL\kdp-cover-ai\social-media\kdpcoverai-tiktok-day1.mp4")
OUT_DIR.mkdir(exist_ok=True)

# TikTok 9:16 portrait
W, H = 1080, 1920
FPS  = 30

# ── Colours ───────────────────────────────────────────────────────────────────
BG_DARK    = (15, 12, 41)
BG_PURPLE  = (28, 16, 64)
PURPLE     = (124, 58, 237)
PURPLE_L   = (167, 139, 250)
WHITE      = (255, 255, 255)
GREEN      = (52, 211, 153)
GRAY       = (100, 116, 139)
DARK_CARD  = (17, 24, 39)
AMBER      = (245, 158, 11)

def font(size, bold=False):
    """Try to load a system font, fallback to default."""
    candidates = [
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibri.ttf",
    ]
    bold_candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\calibrib.ttf",
    ]
    for path in (bold_candidates if bold else candidates):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def new_frame(bg=BG_DARK):
    img = Image.new("RGB", (W, H), bg)
    d   = ImageDraw.Draw(img)
    return img, d

def draw_gradient(img):
    """Draw a subtle top→bottom gradient overlay."""
    overlay = Image.new("RGBA", (W, H), (0,0,0,0))
    od = ImageDraw.Draw(overlay)
    for y in range(H):
        alpha = int(80 * y / H)
        od.line([(0,y),(W,y)], fill=(0,0,0,alpha))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    return img

def grid_bg(img):
    """Draw subtle purple grid lines."""
    d = ImageDraw.Draw(img)
    for x in range(0, W, 60):
        d.line([(x,0),(x,H)], fill=(139,92,246,20), width=1)
    for y in range(0, H, 60):
        d.line([(0,y),(W,y)], fill=(139,92,246,20), width=1)
    return img

def rounded_rect(d, x1, y1, x2, y2, r, fill, outline=None, width=0):
    d.rounded_rectangle([x1,y1,x2,y2], radius=r, fill=fill,
                         outline=outline, width=width)

def center_text(d, text, y, fnt, color=WHITE, max_width=None):
    if max_width:
        # word wrap
        lines = textwrap.wrap(text, width=int(max_width / (fnt.size * 0.6)))
        for line in lines:
            bbox = d.textbbox((0,0), line, font=fnt)
            tw = bbox[2]-bbox[0]
            d.text(((W-tw)//2, y), line, font=fnt, fill=color)
            y += bbox[3]-bbox[1] + 8
        return y
    bbox = d.textbbox((0,0), text, font=fnt)
    tw = bbox[2]-bbox[0]
    d.text(((W-tw)//2, y), text, font=fnt, fill=color)
    return y + bbox[3]-bbox[1]

def save_frame(img, idx):
    img.save(OUT_DIR / f"frame_{idx:05d}.png")

# ─────────────────────────────────────────────────────────────────────────────
# Step 1:  HOOK title card  (0-2s = 60 frames)
# ─────────────────────────────────────────────────────────────────────────────
print("Rendering hook card...")
for i in range(60):
    img, d = new_frame(BG_DARK)
    grid_bg(img)
    d = ImageDraw.Draw(img)
    # glowing orb
    orb = Image.new("RGBA", (W,H), (0,0,0,0))
    od  = ImageDraw.Draw(orb)
    od.ellipse([W//2-300, H//2-500, W//2+300, H//2-100], fill=(124,58,237,50))
    img = Image.alpha_composite(img.convert("RGBA"), orb).convert("RGB")
    d   = ImageDraw.Draw(img)

    fade = min(1.0, i/20)
    alpha_col = tuple(int(c*fade) for c in PURPLE_L)

    # badge
    rounded_rect(d, 290,520,790,570, 30, (124,58,237,60))
    center_text(d, "✦  AI-POWERED  ✦", 530, font(22, bold=True), PURPLE_L)

    # big title
    center_text(d, "KDP Cover AI", 620, font(90, bold=True), WHITE)

    # tagline
    center_text(d, "Generate a book cover", 760, font(36), GRAY)
    center_text(d, "in 30 SECONDS", 810, font(44, bold=True), GREEN)

    save_frame(img, i)

# ─────────────────────────────────────────────────────────────────────────────
# Step 2:  Capture real homepage screenshot & show it  (2-6s = 120 frames)
# ─────────────────────────────────────────────────────────────────────────────
print("Capturing homepage screenshot...")
hp_path = OUT_DIR / "homepage.png"
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1080, "height": 1920})
    page.goto("https://kdpcoverai.site", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    page.screenshot(path=str(hp_path))
    browser.close()

hp_img = Image.open(hp_path).resize((W, H), Image.LANCZOS)
# Add purple overlay tint
tint = Image.new("RGBA", (W,H), (15,12,41,120))
hp_blended = Image.alpha_composite(hp_img.convert("RGBA"), tint).convert("RGB")

print("Rendering homepage frames...")
for i in range(120):
    frame_i = 60 + i
    # slide-up animation for first 20 frames
    if i < 20:
        offset = int(200 * (1 - i/20))
        base   = Image.new("RGB", (W,H), BG_DARK)
        base.paste(hp_blended, (0, offset))
        img = base
    else:
        img = hp_blended.copy()

    d = ImageDraw.Draw(img)
    # top label
    rounded_rect(d, 30,50,350,100, 20, PURPLE)
    d.text((50,60), "kdpcoverai.site", font=font(26, bold=True), fill=WHITE)

    # step label
    rounded_rect(d, W-200, 50, W-30, 100, 20, (0,0,0,160))
    d.text((W-190, 62), "STEP 1 of 4", font=font(26, bold=True), fill=PURPLE_L)

    # bottom instruction
    rounded_rect(d, 60, H-160, W-60, H-60, 24, (0,0,0,200))
    center_text(d, "Open kdpcoverai.site & sign up free", H-135, font(30, bold=True), WHITE)

    save_frame(img, frame_i)

# ─────────────────────────────────────────────────────────────────────────────
# Step 3:  Cover Generator Form UI  (6-12s = 180 frames)
# ─────────────────────────────────────────────────────────────────────────────
print("Rendering form UI frames...")
FIELDS = [
    ("Book Title",   "The Last Horizon",        0),
    ("Author Name",  "Samuel Kehinde",           40),
    ("Trim Size",    "6 x 9 in  (Most popular)", 80),
    ("Genre",        "Thriller",                120),
]

for i in range(180):
    frame_i = 180 + i
    img, d = new_frame(BG_DARK)
    grid_bg(img)
    d = ImageDraw.Draw(img)

    # header
    center_text(d, "Cover Generator", 120, font(54, bold=True), WHITE)
    center_text(d, "Fill in your book details", 195, font(28), GRAY)

    # step badge
    rounded_rect(d, W//2-100, 240, W//2+100, 285, 20, PURPLE)
    center_text(d, "STEP 2 of 4", 249, font(24, bold=True), WHITE)

    # form fields — reveal one by one
    for fi, (label, value, reveal_at) in enumerate(FIELDS):
        fy = 340 + fi * 140
        revealed = i >= reveal_at

        # field bg
        rounded_rect(d, 60, fy, W-60, fy+110, 18,
                     DARK_CARD if revealed else (25,30,50))
        d.text((82, fy+14), label, font=font(22, bold=True), fill=PURPLE_L)

        if revealed:
            # typing animation
            chars_shown = min(len(value), int((i-reveal_at)/3)+1)
            display_val = value[:chars_shown]
            if chars_shown < len(value):
                display_val += "|"   # cursor
            d.text((82, fy+52), display_val, font=font(32, bold=True), fill=WHITE)
            # green tick
            d.ellipse([W-100, fy+35, W-65, fy+70], fill=GREEN)
            d.text([W-96, fy+38], "✓", font=font(26, bold=True), fill=WHITE)
        else:
            d.text((82, fy+52), "...", font=font(32), fill=GRAY)

    save_frame(img, frame_i)

# ─────────────────────────────────────────────────────────────────────────────
# Step 4:  AI Generating animation  (12-18s = 180 frames)
# ─────────────────────────────────────────────────────────────────────────────
print("Rendering AI generation frames...")
for i in range(180):
    frame_i = 360 + i
    img, d = new_frame(BG_DARK)
    grid_bg(img)
    d = ImageDraw.Draw(img)

    pct = min(1.0, i / 150)   # reaches 100% at frame 150/180

    # spinning orb
    angle = (i * 4) % 360
    cx, cy = W//2, H//2 - 160
    orb_r  = 180
    for ring in range(3):
        a = math.radians(angle + ring*120)
        rx = cx + int(orb_r * 0.6 * math.cos(a))
        ry = cy + int(orb_r * 0.4 * math.sin(a))
        r_size = 18 - ring*4
        d.ellipse([rx-r_size, ry-r_size, rx+r_size, ry+r_size], fill=PURPLE)

    d.ellipse([cx-orb_r, cy-orb_r, cx+orb_r, cy+orb_r],
              outline=(*PURPLE, 80), width=3)

    center_text(d, "AI is generating", cy+orb_r+40, font(38, bold=True), WHITE)
    center_text(d, "your KDP cover...", cy+orb_r+90, font(38, bold=True), WHITE)

    # step badge
    rounded_rect(d, W//2-100, cy+orb_r+150, W//2+100, cy+orb_r+195, 20, PURPLE)
    center_text(d, "STEP 3 of 4", cy+orb_r+160, font(24, bold=True), WHITE)

    # progress bar
    bar_x, bar_y = 80, H//2 + 320
    bar_w = W - 160
    bar_h = 28
    rounded_rect(d, bar_x, bar_y, bar_x+bar_w, bar_y+bar_h, 14, DARK_CARD)
    if pct > 0:
        rounded_rect(d, bar_x, bar_y,
                     bar_x+int(bar_w*pct), bar_y+bar_h, 14, PURPLE)

    pct_text = f"{int(pct*100)}%"
    center_text(d, pct_text, bar_y+38, font(28, bold=True), PURPLE_L)

    # pulsing dots
    for dot in range(3):
        pulse = abs(math.sin(math.radians(i*6 + dot*60)))
        size  = int(10 + 6*pulse)
        dx = W//2 - 40 + dot*40
        dy = bar_y + 90
        d.ellipse([dx-size, dy-size, dx+size, dy+size], fill=PURPLE_L)

    save_frame(img, frame_i)

# ─────────────────────────────────────────────────────────────────────────────
# Step 5:  Cover Reveal  (18-24s = 180 frames)
# ─────────────────────────────────────────────────────────────────────────────
print("Rendering cover reveal frames...")

def draw_book_cover(d, x, y, w, h, title="The Last Horizon", author="Samuel Kehinde"):
    """Draw a stylised book cover card."""
    # background gradient (simulated with rectangles)
    for row in range(h):
        t   = row / h
        r   = int(30 + t*10)
        g2  = int(0 + t*10)
        b   = int(60 + t*40)
        d.line([(x, y+row), (x+w, y+row)], fill=(r,g2,b))

    # decorative lines
    d.line([(x+20, y+20), (x+w-20, y+20)], fill=PURPLE_L, width=2)
    d.line([(x+20, y+h-20), (x+w-20, y+h-20)], fill=PURPLE_L, width=2)

    # title box
    d.rectangle([x+15, y+h//2-60, x+w-15, y+h//2+60], fill=(0,0,0,120))
    # title text — centred inside cover
    tf = font(36, bold=True)
    lines = textwrap.wrap(title, width=14)
    ty = y + h//2 - 40
    for line in lines:
        bbox = d.textbbox((0,0), line, font=tf)
        lw   = bbox[2]-bbox[0]
        d.text((x + (w-lw)//2, ty), line, font=tf, fill=WHITE)
        ty  += bbox[3]-bbox[1]+6

    # author
    af = font(22)
    bbox = d.textbbox((0,0), author, font=af)
    aw = bbox[2]-bbox[0]
    d.text((x + (w-aw)//2, y+h-50), author, font=af, fill=PURPLE_L)

    # KDP badge
    d.rounded_rectangle([x+10, y+10, x+90, y+38], radius=8, fill=GREEN)
    d.text((x+14, y+14), "KDP ✓", font=font(18, bold=True), fill=WHITE)

for i in range(180):
    frame_i = 540 + i
    img, d = new_frame(BG_DARK)
    grid_bg(img)
    d = ImageDraw.Draw(img)

    # scale-in animation
    scale = min(1.0, 0.4 + (i/60)*0.6) if i < 60 else 1.0
    cw    = int(480 * scale)
    ch    = int(720 * scale)
    cx    = (W - cw)//2
    cy    = (H - ch)//2 - 80

    # glow behind cover
    if scale > 0.5:
        glow = Image.new("RGBA", (W,H), (0,0,0,0))
        gd   = ImageDraw.Draw(glow)
        gd.ellipse([cx-30, cy-30, cx+cw+30, cy+ch+30],
                   fill=(124,58,237,40))
        img  = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
        d    = ImageDraw.Draw(img)

    # shadow
    d.rounded_rectangle([cx+8, cy+8, cx+cw+8, cy+ch+8],
                         radius=16, fill=(0,0,0,100))
    # cover
    draw_book_cover(d, cx, cy, cw, ch)

    # sparkles after reveal
    if i > 30:
        for sp in range(8):
            angle  = math.radians(i*3 + sp*45)
            dist   = 260 + 20*math.sin(math.radians(i*5+sp*30))
            sx     = W//2 + int(dist*math.cos(angle))
            sy     = H//2 - 80 + int(dist*math.sin(angle))
            ss     = int(6 + 4*abs(math.sin(math.radians(i*4+sp*40))))
            d.ellipse([sx-ss,sy-ss,sx+ss,sy+ss], fill=PURPLE_L)

    # labels
    center_text(d, "Your cover is ready!", cy+ch+40, font(40, bold=True), WHITE)
    center_text(d, "KDP-ready PDF — 300 DPI — Exact dimensions", cy+ch+92, font(24), GREEN)

    # step badge
    rounded_rect(d, W//2-100, cy+ch+140, W//2+100, cy+ch+185, 20, PURPLE)
    center_text(d, "STEP 4 of 4", cy+ch+150, font(24, bold=True), WHITE)

    save_frame(img, frame_i)

# ─────────────────────────────────────────────────────────────────────────────
# Step 6:  PDF Download  (24-27s = 90 frames)
# ─────────────────────────────────────────────────────────────────────────────
print("Rendering download frames...")
for i in range(90):
    frame_i = 720 + i
    img, d = new_frame(BG_DARK)
    grid_bg(img)
    d = ImageDraw.Draw(img)

    center_text(d, "Download your", 300, font(44, bold=True), WHITE)
    center_text(d, "KDP-Ready PDF", 365, font(60, bold=True), PURPLE_L)

    # PDF icon
    px, py = W//2-80, 500
    rounded_rect(d, px, py, px+160, py+200, 16, (239,68,68))
    center_text(d, "PDF", py+75, font(52, bold=True), WHITE)
    center_text(d, "300 DPI", py+140, font(24, bold=True), WHITE)

    # download arrow animation
    arrow_y = 750 + int(15*math.sin(math.radians(i*8)))
    center_text(d, "⬇", arrow_y, font(60), GREEN)

    # features
    feats = ["✓  Correct KDP dimensions", "✓  0.125\" bleed on all sides",
             "✓  Embedded fonts", "✓  Upload directly to Amazon KDP"]
    for fi, feat in enumerate(feats):
        fy = 860 + fi*64
        rounded_rect(d, 80, fy, W-80, fy+50, 12, DARK_CARD)
        d.text((110, fy+12), feat, font=font(26, bold=True), fill=GREEN if fi<2 else WHITE)

    save_frame(img, frame_i)

# ─────────────────────────────────────────────────────────────────────────────
# Step 7:  CTA card  (27-30s = 90 frames)
# ─────────────────────────────────────────────────────────────────────────────
print("Rendering CTA frames...")
for i in range(90):
    frame_i = 810 + i
    img, d = new_frame(BG_PURPLE)
    grid_bg(img)
    d = ImageDraw.Draw(img)

    # pulsing glow
    pulse = abs(math.sin(math.radians(i*4)))
    glow  = Image.new("RGBA", (W,H),(0,0,0,0))
    gd    = ImageDraw.Draw(glow)
    gd.ellipse([W//2-300, H//2-300, W//2+300, H//2+300],
               fill=(124,58,237, int(40+30*pulse)))
    img   = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    d     = ImageDraw.Draw(img)

    center_text(d, "Try it FREE", 560, font(70, bold=True), WHITE)
    center_text(d, "3 free covers", 650, font(36), GRAY)
    center_text(d, "No credit card needed", 700, font(32), GRAY)

    # URL button
    btn_y = 800
    rounded_rect(d, 100, btn_y, W-100, btn_y+100, 28, PURPLE)
    center_text(d, "kdpcoverai.site", btn_y+28, font(44, bold=True), WHITE)

    # stats
    stats = [("30 sec", "to generate"), ("300 DPI", "PDF export"), ("0", "KDP rejections")]
    for si, (val, lbl) in enumerate(stats):
        sx = 90 + si*310
        rounded_rect(d, sx, btn_y+140, sx+280, btn_y+250, 18, DARK_CARD)
        center_text(d, val, btn_y+155, font(36, bold=True), PURPLE_L)
        center_text(d, lbl, btn_y+205, font(20), GRAY)
        # recalc x for centering within box
        tf = font(36, bold=True)
        bbox = d.textbbox((0,0), val, font=tf)
        vw = bbox[2]-bbox[0]
        d.text((sx + (280-vw)//2, btn_y+155), val, font=tf, fill=PURPLE_L)
        sf = font(20)
        bbox2 = d.textbbox((0,0), lbl, font=sf)
        lw2 = bbox2[2]-bbox2[0]
        d.text((sx + (280-lw2)//2, btn_y+205), lbl, font=sf, fill=GRAY)

    # TikTok handle
    center_text(d, "@kdpcoveraiofficial", H-120, font(32, bold=True), PURPLE_L)
    center_text(d, "Follow for daily KDP tips", H-75, font(24), GRAY)

    save_frame(img, frame_i)

total_frames = 900
print(f"Total frames rendered: {total_frames}")

# ─────────────────────────────────────────────────────────────────────────────
# Encode with ffmpeg
# ─────────────────────────────────────────────────────────────────────────────
print("Encoding video with ffmpeg...")
cmd = [
    "ffmpeg", "-y",
    "-framerate", str(FPS),
    "-i", str(OUT_DIR / "frame_%05d.png"),
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-vf", "scale=1080:1920",
    str(VIDEO_OUT),
]
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode == 0:
    size_mb = VIDEO_OUT.stat().st_size / 1024 / 1024
    print(f"Video saved: {VIDEO_OUT} ({size_mb:.1f} MB)")
else:
    print("ffmpeg error:", result.stderr[-500:])
