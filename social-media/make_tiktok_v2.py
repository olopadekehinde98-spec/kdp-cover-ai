"""
TikTok Day 1 Video v2
- Real website screenshots via Playwright
- Ken Burns pan/zoom effect on each screenshot
- Text overlays & captions
- TTS voiceover via gTTS
- ffmpeg final encode
"""

import os, math, textwrap, subprocess, time
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from playwright.sync_api import sync_playwright
from gtts import gTTS

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE      = Path(r"C:\Users\SAMUEL\kdp-cover-ai\social-media")
FRAMES    = BASE / "v2_frames"
SHOTS     = BASE / "v2_shots"
VIDEO_RAW = BASE / "v2_raw.mp4"
AUDIO_OUT = BASE / "v2_voice.mp3"
VIDEO_OUT = BASE / "kdpcoverai-tiktok-day1-v2.mp4"
FRAMES.mkdir(exist_ok=True)
SHOTS.mkdir(exist_ok=True)

W, H  = 1080, 1920   # TikTok 9:16
FPS   = 30

# ── Colours ───────────────────────────────────────────────────────────────────
PURPLE     = (124, 58, 237)
PURPLE_L   = (167, 139, 250)
PURPLE_D   = (15, 12, 41)
GREEN      = (52, 211, 153)
WHITE      = (255, 255, 255)
BLACK      = (0,   0,   0)
GRAY       = (100, 116, 139)
DARK_CARD  = (17,  24,  39)
AMBER      = (245, 158, 11)

# ── Font helper ───────────────────────────────────────────────────────────────
def font(size, bold=False):
    for p in ([r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\arialbd.ttf"]
              if bold else
              [r"C:\Windows\Fonts\segoeui.ttf",  r"C:\Windows\Fonts\arial.ttf"]):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def tw(d, text, fnt):
    bb = d.textbbox((0,0), text, font=fnt)
    return bb[2]-bb[0], bb[3]-bb[1]

def ctext(d, text, y, fnt, color=WHITE, shadow=True):
    w2, h2 = tw(d, text, fnt)
    x = (W - w2) // 2
    if shadow:
        d.text((x+2, y+2), text, font=fnt, fill=(0,0,0,160))
    d.text((x, y), text, font=fnt, fill=color)
    return y + h2

def pill(d, text, cx, y, fnt, bg=PURPLE, fg=WHITE):
    w2, h2 = tw(d, text, fnt)
    pad = 20
    x1, y1 = cx - w2//2 - pad, y
    x2, y2 = cx + w2//2 + pad, y + h2 + 12
    d.rounded_rectangle([x1,y1,x2,y2], radius=(y2-y1)//2, fill=bg)
    d.text((x1+pad, y+6), text, font=fnt, fill=fg)
    return y2

# ── 1. Capture real website screenshots ───────────────────────────────────────
PAGES = [
    ("home",      "https://kdpcoverai.site",          4000),
    ("signup",    "https://kdpcoverai.site/sign-up",  3000),
    ("pricing",   "https://kdpcoverai.site/pricing",  3000),
    ("features",  "https://kdpcoverai.site/#features",2000),
]

print("Capturing real website screenshots...")
# Use a wide desktop viewport so we get full page detail, then crop to portrait
SHOT_W, SHOT_H = 1440, 900

with sync_playwright() as p:
    browser = p.chromium.launch(args=["--force-dark-mode"])
    ctx = browser.new_context(
        viewport={"width": SHOT_W, "height": SHOT_H},
        color_scheme="dark",
        device_scale_factor=2,   # retina quality
    )
    page = ctx.new_page()
    for name, url, wait in PAGES:
        out = SHOTS / f"{name}.png"
        if out.exists():
            print(f"  {name}: cached")
            continue
        print(f"  Capturing {name}...")
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(wait)
        # dismiss any popups
        page.keyboard.press("Escape")
        page.screenshot(path=str(out), full_page=False)
        print(f"  Saved {out}")
    browser.close()
print("Screenshots done.")

# ── 2. Prepare screenshot images ─────────────────────────────────────────────
def load_shot(name, crop_top=0, crop_bottom=None):
    """Load screenshot, crop, scale to fill 1080×1920 portrait. Cap at 2x output size."""
    img = Image.open(SHOTS / f"{name}.png")
    iw, ih = img.size
    if crop_bottom is None:
        crop_bottom = ih
    img = img.crop((0, crop_top, iw, crop_bottom))
    # Scale to fill W width
    ratio = W / img.width
    new_h = int(img.height * ratio)
    img = img.resize((W, max(new_h, H)), Image.LANCZOS)
    # Cap height to 2x output to prevent MemoryError
    if img.height > H * 2:
        img = img.crop((0, 0, W, H * 2))
    return img

shots = {
    "home":     load_shot("home",    crop_top=0,   crop_bottom=1400),
    "signup":   load_shot("signup",  crop_top=0,   crop_bottom=1400),
    "pricing":  load_shot("pricing", crop_top=0,   crop_bottom=1600),
    "features": load_shot("home",    crop_top=600, crop_bottom=2000),
}
print("Screenshots loaded.")

# ── Ken Burns: pan + zoom a screenshot into FPS*duration frames ───────────────
def ken_burns(img, n_frames, zoom_start=1.0, zoom_end=1.12,
              pan_x=0.0, pan_y=-0.04):
    """
    Yield n_frames PIL Images of img with smooth zoom+pan.
    pan_x/pan_y: fraction of image to shift (negative = move up)
    """
    iw, ih = img.size
    for i in range(n_frames):
        t = i / max(n_frames-1, 1)
        # eased interpolation
        ease = t*t*(3-2*t)
        zoom  = zoom_start + (zoom_end - zoom_start) * ease
        cx    = iw/2 + pan_x*iw*ease
        cy    = ih/2 + pan_y*ih*ease
        crop_w = W / zoom
        crop_h = H / zoom
        x1 = max(0, cx - crop_w/2)
        y1 = max(0, cy - crop_h/2)
        x2 = min(iw, x1 + crop_w)
        y2 = min(ih, y1 + crop_h)
        # adjust if hitting edges
        if x2 > iw: x1 = max(0, iw - crop_w); x2 = iw
        if y2 > ih: y1 = max(0, ih - crop_h); y2 = ih
        cropped = img.crop((int(x1), int(y1), int(x2), int(y2)))
        frame   = cropped.resize((W, H), Image.LANCZOS)
        yield frame

# ── Overlay helpers ───────────────────────────────────────────────────────────
def dark_overlay(img, alpha=160):
    overlay = Image.new("RGBA", (W,H), (0,0,0,alpha))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

def bottom_bar(img, lines, fade=1.0):
    """Add a frosted caption bar at the bottom."""
    img = img.copy()
    bar_h = 220
    bar   = Image.new("RGBA", (W, bar_h), (15,12,41,int(220*fade)))
    # top gradient fade
    for row in range(60):
        alpha = int(220*fade * row/60)
        ImageDraw.Draw(bar).line([(0,row),(W,row)], fill=(15,12,41,alpha))
    img.paste(Image.alpha_composite(
        Image.new("RGBA",(W,H),(0,0,0,0)).paste(bar,(0,H-bar_h)) or
        img.convert("RGBA"), bar
    ).convert("RGB"))
    # Re-paste properly
    img = img.convert("RGBA")
    bar2 = Image.new("RGBA", (W,H), (0,0,0,0))
    bar2.paste(bar, (0, H-bar_h))
    img = Image.alpha_composite(img, bar2).convert("RGB")

    d = ImageDraw.Draw(img)
    y = H - bar_h + 24
    for text, fnt, color in lines:
        alpha_color = tuple(int(c*fade) for c in color) if fade < 1 else color
        ctext(d, text, y, fnt, alpha_color, shadow=True)
        _, th = tw(d, text, fnt)
        y += th + 10
    return img

def top_badge(img, text, fade=1.0):
    img = img.copy()
    d   = ImageDraw.Draw(img)
    fnt = font(26, bold=True)
    w2,h2 = tw(d, text, fnt)
    pad = 16
    alpha = int(fade*255)
    bar_color = (*PURPLE, alpha)
    d.rounded_rectangle([30,40, 30+w2+pad*2, 40+h2+12], radius=20, fill=bar_color)
    d.text((30+pad, 46), text, font=fnt, fill=WHITE)
    return img

def handle_badge(img):
    d = ImageDraw.Draw(img)
    fnt = font(24, bold=True)
    text = "@kdpcoveraiofficial"
    w2,_ = tw(d, text, fnt)
    d.rounded_rectangle([W-w2-60, 40, W-20, 86], radius=20, fill=(0,0,0,160))
    d.text((W-w2-40, 46), text, font=fnt, fill=PURPLE_L)
    return img

# ── 3. Generate voiceover ────────────────────────────────────────────────────
SCRIPT = (
    "Watch me generate a professional K D P book cover in 30 seconds. "
    "This is K D P Cover A I — the fastest way to create Amazon book covers. "
    "Head to K D P Cover A I dot site and create your free account. "
    "Enter your book title, author name, and trim size. "
    "Choose your genre, then hit generate. "
    "Your A I-powered cover is ready in seconds — "
    "three hundred D P I, correct dimensions, and bleed built in. "
    "Download your K D P-ready PDF and upload directly to Amazon. "
    "Try it free today. Three covers, no credit card needed. "
    "K D P Cover A I dot site."
)

if not AUDIO_OUT.exists():
    print("Generating voiceover...")
    tts = gTTS(SCRIPT, lang="en", tld="co.uk", slow=False)
    tts.save(str(AUDIO_OUT))
    print(f"Audio saved: {AUDIO_OUT}")
else:
    print("Voiceover cached.")

# ── 4. Render frames ──────────────────────────────────────────────────────────
print("Rendering frames...")
frame_idx = 0

def save(img):
    global frame_idx
    img.save(FRAMES / f"frame_{frame_idx:05d}.png")
    frame_idx += 1

# ── SCENE 0: Hook card (0–2s, 60 frames) ────────────────────────────────────
print(" Scene 0: Hook...")
for i in range(60):
    img = Image.new("RGB", (W,H), PURPLE_D)
    d   = ImageDraw.Draw(img)
    # subtle grid
    for x in range(0,W,80): d.line([(x,0),(x,H)], fill=(80,40,180,25), width=1)
    for y in range(0,H,80): d.line([(0,y),(W,y)], fill=(80,40,180,25), width=1)
    # fade in
    fade = min(1.0, i/15)
    # glowing circle
    glow = Image.new("RGBA",(W,H),(0,0,0,0))
    gd   = ImageDraw.Draw(glow)
    gd.ellipse([W//2-350,H//2-450,W//2+350,H//2+50], fill=(124,58,237,int(55*fade)))
    img  = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    d    = ImageDraw.Draw(img)
    # badge
    pill(d, "✦  AI-POWERED BOOK COVERS  ✦", W//2, 680, font(24,True),
         bg=(80,40,200), fg=PURPLE_L)
    # title
    t_fnt = font(88, bold=True)
    ctext(d, "KDP Cover AI", 780, t_fnt, WHITE)
    ctext(d, "Generate in", 890, font(42), GRAY)
    ctext(d, "30 SECONDS", 945, font(62, bold=True), GREEN)
    # url
    ctext(d, "kdpcoverai.site", 1080, font(34), PURPLE_L)
    save(img)

def _bar_overlay(w, h, y, bar_h, alpha=200):
    ovl = Image.new("RGBA",(w,h),(0,0,0,0))
    od  = ImageDraw.Draw(ovl)
    for row in range(60):
        a = int(alpha * row/60)
        od.line([(0,y+row),(w,y+row)], fill=(15,12,41,a))
    od.rectangle([0,y+60,w,y+bar_h], fill=(15,12,41,alpha))
    return ovl

# ── SCENE 1: Real homepage (2–8s, 180 frames) ─────────────────────────────────
print(" Scene 1: Homepage...")
kb1 = ken_burns(shots["home"], 180, zoom_start=1.0, zoom_end=1.15, pan_y=-0.03)
for i, base in enumerate(kb1):
    fade = min(1.0, i/20)
    # light darkening only at top and bottom
    img = base.copy()
    ovl = Image.new("RGBA",(W,H),(0,0,0,0))
    od  = ImageDraw.Draw(ovl)
    # top gradient
    for y in range(200):
        od.line([(0,y),(W,y)], fill=(0,0,0,int(140*(1-y/200))))
    # bottom gradient
    for y in range(300):
        od.line([(0,H-300+y),(W,H-300+y)], fill=(0,0,0,int(180*y/300)))
    img = Image.alpha_composite(img.convert("RGBA"), ovl).convert("RGB")
    img  = top_badge(img, "kdpcoverai.site", fade=fade)
    img  = handle_badge(img)
    img  = Image.alpha_composite(img.convert("RGBA"), _bar_overlay(W,H,H-220,220)).convert("RGB")
    d    = ImageDraw.Draw(img)
    ctext(d, "Step 1", H-195, font(26, True), PURPLE_L)
    ctext(d, "Go to kdpcoverai.site", H-158, font(38, True), WHITE)
    ctext(d, "Create your FREE account", H-108, font(30), GREEN)
    save(img)

# ── SCENE 2: Sign up page (8–13s, 150 frames) ─────────────────────────────────
print(" Scene 2: Sign up...")
kb2 = ken_burns(shots["signup"], 150, zoom_start=1.05, zoom_end=1.0, pan_y=0.02)
for i, base in enumerate(kb2):
    fade = min(1.0, i/15)
    img  = base.copy()
    ovl  = Image.new("RGBA",(W,H),(0,0,0,0))
    od   = ImageDraw.Draw(ovl)
    for y in range(200): od.line([(0,y),(W,y)], fill=(0,0,0,int(120*(1-y/200))))
    for y in range(300): od.line([(0,H-300+y),(W,H-300+y)], fill=(0,0,0,int(180*y/300)))
    img  = Image.alpha_composite(img.convert("RGBA"), ovl).convert("RGB")
    img  = top_badge(img, "Free Account", fade=fade)
    img  = handle_badge(img)
    img2 = Image.alpha_composite(img.convert("RGBA"), _bar_overlay(W,H,H-220,220))
    img  = img2.convert("RGB")
    d    = ImageDraw.Draw(img)
    ctext(d, "Step 2", H-195, font(26, True), PURPLE_L)
    ctext(d, "Sign up — it's FREE", H-158, font(38, True), WHITE)
    ctext(d, "3 covers included · No card needed", H-108, font(30), GREEN)
    save(img)

# ── SCENE 3: Pricing / features (13–18s, 150 frames) ─────────────────────────
print(" Scene 3: Pricing...")
kb3 = ken_burns(shots["pricing"], 150, zoom_start=1.0, zoom_end=1.12, pan_y=-0.05)
for i, base in enumerate(kb3):
    fade = min(1.0, i/15)
    img  = base.copy()
    ovl  = Image.new("RGBA",(W,H),(0,0,0,0))
    od   = ImageDraw.Draw(ovl)
    for y in range(200): od.line([(0,y),(W,y)], fill=(0,0,0,int(120*(1-y/200))))
    for y in range(300): od.line([(0,H-300+y),(W,H-300+y)], fill=(0,0,0,int(180*y/300)))
    img  = Image.alpha_composite(img.convert("RGBA"), ovl).convert("RGB")
    img  = top_badge(img, "Simple Pricing", fade=fade)
    img  = handle_badge(img)
    img2 = Image.alpha_composite(img.convert("RGBA"), _bar_overlay(W,H,H-220,220))
    img  = img2.convert("RGB")
    d    = ImageDraw.Draw(img)
    ctext(d, "Step 3", H-195, font(26, True), PURPLE_L)
    ctext(d, "Enter your book details", H-158, font(38, True), WHITE)
    ctext(d, "Title · Author · Trim size · Genre", H-108, font(30), GREEN)
    save(img)

# ── SCENE 4: Generating animation overlay on features shot (18–22s, 120 frames)
print(" Scene 4: Generating...")
kb4 = ken_burns(shots["features"], 120, zoom_start=1.1, zoom_end=1.0, pan_y=0.04)
for i, base in enumerate(kb4):
    img  = dark_overlay(base, alpha=180)
    d    = ImageDraw.Draw(img)
    img  = handle_badge(img)

    # spinner
    cx, cy = W//2, H//2 - 200
    angle  = (i * 5) % 360
    for dot in range(8):
        a   = math.radians(angle + dot*45)
        r   = 110
        dx  = cx + int(r*math.cos(a))
        dy  = cy + int(r*math.sin(a))
        sz  = int(8 + 10*(dot/8))
        alpha_dot = int(255 * dot/8)
        d.ellipse([dx-sz,dy-sz,dx+sz,dy+sz], fill=(*PURPLE,alpha_dot))

    d.ellipse([cx-70,cy-70,cx+70,cy+70], fill=(*PURPLE,30), outline=PURPLE, width=3)

    ctext(d, "Generating your cover...", cy+140, font(40, True), WHITE)

    # progress bar
    pct = min(1.0, i/90)
    bx, by = 100, cy+220
    bw = W-200
    d.rounded_rectangle([bx,by,bx+bw,by+30], radius=15, fill=DARK_CARD)
    if pct > 0:
        d.rounded_rectangle([bx,by,bx+int(bw*pct),by+30], radius=15, fill=PURPLE)
    ctext(d, f"{int(pct*100)}%", by+42, font(28, True), PURPLE_L)

    img2 = Image.alpha_composite(img.convert("RGBA"), _bar_overlay(W,H,H-180,180))
    img  = img2.convert("RGB")
    d    = ImageDraw.Draw(img)
    ctext(d, "AI cover generation", H-155, font(26, True), PURPLE_L)
    ctext(d, "300 DPI · Correct KDP dimensions", H-115, font(32, True), WHITE)
    ctext(d, "Bleed & safe zones built in", H-73, font(28), GREEN)
    save(img)

# ── SCENE 5: Cover reveal on home bg (22–26s, 120 frames) ────────────────────
print(" Scene 5: Cover reveal...")
kb5 = ken_burns(shots["home"], 120, zoom_start=1.15, zoom_end=1.0, pan_y=0.05)
for i, base in enumerate(kb5):
    img = dark_overlay(base, alpha=170)
    d   = ImageDraw.Draw(img)
    img = handle_badge(img)

    # cover card
    scale = min(1.0, 0.5 + (i/40)*0.5) if i < 40 else 1.0
    cw, ch = int(400*scale), int(580*scale)
    cx2 = (W-cw)//2
    cy2 = H//2 - ch//2 - 100

    # shadow
    d.rounded_rectangle([cx2+6,cy2+6,cx2+cw+6,cy2+ch+6], radius=18, fill=(0,0,0,120))

    # cover gradient (dark purple → dark blue)
    cvr = Image.new("RGB",(cw,ch), (20,10,50))
    cd  = ImageDraw.Draw(cvr)
    for row in range(ch):
        t = row/ch
        r2 = int(20+t*10); g2 = int(10+t*20); b2 = int(50+t*60)
        cd.line([(0,row),(cw,row)], fill=(r2,g2,b2))
    # cover lines
    cd.line([(15,15),(cw-15,15)], fill=PURPLE_L, width=2)
    cd.line([(15,ch-15),(cw-15,ch-15)], fill=PURPLE_L, width=2)
    cd.rectangle([12,ch//2-50,cw-12,ch//2+50], fill=(0,0,0,100))
    title_fnt = font(34 if cw>350 else 24, bold=True)
    t_w,_ = tw(cd,"The Last Horizon",title_fnt)
    cd.text(((cw-t_w)//2, ch//2-35), "The Last Horizon", font=title_fnt, fill=WHITE)
    a_fnt = font(22 if cw>350 else 16)
    a_w,_ = tw(cd,"Samuel Kehinde",a_fnt)
    cd.text(((cw-a_w)//2, ch-44), "Samuel Kehinde", font=a_fnt, fill=PURPLE_L)
    # KDP badge
    cd.rounded_rectangle([8,8,90,36], radius=8, fill=GREEN)
    cd.text((12,10),"KDP ✓", font=font(18,True), fill=WHITE)

    img.paste(cvr, (cx2, cy2))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([cx2,cy2,cx2+cw,cy2+ch], radius=18,
                         outline=(*PURPLE,180), width=3)

    # sparkles after scale-in
    if i > 35:
        for sp in range(6):
            ang = math.radians(i*4 + sp*60)
            dst = 260 + 20*math.sin(math.radians(i*6+sp*40))
            sx  = W//2 + int(dst*math.cos(ang))
            sy  = H//2 - 100 + int(dst*math.sin(ang))
            ss  = int(5+4*abs(math.sin(math.radians(i*5+sp*50))))
            d.ellipse([sx-ss,sy-ss,sx+ss,sy+ss], fill=PURPLE_L)

    img2 = Image.alpha_composite(img.convert("RGBA"), _bar_overlay(W,H,H-200,200))
    img  = img2.convert("RGB")
    d    = ImageDraw.Draw(img)
    ctext(d, "Your cover is READY!", H-175, font(38,True), WHITE)
    ctext(d, "Download KDP-ready PDF", H-128, font(32,True), GREEN)
    ctext(d, "Upload directly to Amazon KDP", H-82, font(26), GRAY)
    save(img)

# ── SCENE 6: CTA (26–30s, 120 frames) ────────────────────────────────────────
print(" Scene 6: CTA...")
kb6 = ken_burns(shots["pricing"], 120, zoom_start=1.0, zoom_end=1.08, pan_y=-0.04)
for i, base in enumerate(kb6):
    fade = min(1.0, i/20)
    img  = dark_overlay(base, alpha=200)
    d    = ImageDraw.Draw(img)
    img  = handle_badge(img)

    pulse = abs(math.sin(math.radians(i*5)))

    # glow
    glow = Image.new("RGBA",(W,H),(0,0,0,0))
    gd   = ImageDraw.Draw(glow)
    gd.ellipse([W//2-280,H//2-300,W//2+280,H//2+300],
               fill=(124,58,237,int(35*pulse*fade)))
    img  = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    d    = ImageDraw.Draw(img)

    ctext(d, "Try it FREE today", H//2-220, font(52,True), WHITE)
    ctext(d, "3 covers · No credit card", H//2-148, font(32), GRAY)

    # URL button
    btn_y = H//2-60
    d.rounded_rectangle([80,btn_y,W-80,btn_y+90], radius=30,
                         fill=(*PURPLE, int(255*fade)))
    ctext(d, "kdpcoverai.site", btn_y+22, font(46,True), WHITE)

    # stats row
    stats = [("30s","to generate"),("300 DPI","PDF export"),("Free","to start")]
    for si,(val,lbl) in enumerate(stats):
        sx = 80 + si*320
        d.rounded_rectangle([sx,btn_y+110,sx+290,btn_y+200], radius=18,
                             fill=(15,12,41,int(200*fade)))
        vf = font(34,True); lf = font(20)
        vw,_ = tw(d,val,vf); lw,_ = tw(d,lbl,lf)
        d.text((sx+(290-vw)//2, btn_y+118), val, font=vf, fill=PURPLE_L)
        d.text((sx+(290-lw)//2, btn_y+162), lbl, font=lf, fill=GRAY)

    ctext(d, "@kdpcoveraiofficial", H//2+220, font(32,True), PURPLE_L)
    ctext(d, "Follow for daily KDP tips", H//2+268, font(26), GRAY)
    save(img)

print(f"Total frames: {frame_idx}")

# ── 5. Encode raw video ───────────────────────────────────────────────────────
print("Encoding raw video...")
subprocess.run([
    "ffmpeg", "-y",
    "-framerate", str(FPS),
    "-i", str(FRAMES / "frame_%05d.png"),
    "-c:v", "libx264", "-preset", "fast", "-crf", "18",
    "-pix_fmt", "yuv420p",
    str(VIDEO_RAW),
], check=True)
print("Raw video done.")

# ── 6. Mix in voiceover ───────────────────────────────────────────────────────
print("Mixing voiceover...")
subprocess.run([
    "ffmpeg", "-y",
    "-i", str(VIDEO_RAW),
    "-i", str(AUDIO_OUT),
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "128k",
    "-shortest",
    str(VIDEO_OUT),
], check=True)

size_mb = VIDEO_OUT.stat().st_size / 1024/1024
print(f"\nDone! Video: {VIDEO_OUT} ({size_mb:.1f} MB)")
