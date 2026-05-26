"""
YouTube Day 1 Video — "How to Generate a KDP Book Cover in 30 Seconds"
- 1920x1080 landscape (YouTube standard)
- ~2 minutes (3600 frames @ 30fps)
- Real website screenshots with Ken Burns
- Google TTS voiceover
- Proper intro / section cards / outro
"""

import os, math, textwrap, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
from gtts import gTTS

BASE      = Path(r"C:\Users\SAMUEL\kdp-cover-ai\social-media")
FRAMES    = BASE / "yt_frames";   FRAMES.mkdir(exist_ok=True)
SHOTS     = BASE / "yt_shots";    SHOTS.mkdir(exist_ok=True)
VIDEO_RAW = BASE / "yt_raw.mp4"
AUDIO_OUT = BASE / "yt_voice.mp3"
VIDEO_OUT = BASE / "kdpcoverai-youtube-day1.mp4"

W, H = 1920, 1080
FPS  = 30

# ── Colours ───────────────────────────────────────────────────────────────────
PURPLE   = (124, 58, 237)
PURPLE_L = (167, 139, 250)
PURPLE_D = (15,  12,  41)
PURPLE_M = (76,  29, 149)
GREEN    = (52, 211, 153)
WHITE    = (255,255,255)
GRAY     = (100,116,139)
DARK     = (17,  24,  39)
AMBER    = (245,158, 11)
RED      = (239, 68, 68)

def font(size, bold=False):
    for p in ([r"C:\Windows\Fonts\segoeuib.ttf",r"C:\Windows\Fonts\arialbd.ttf"] if bold
              else [r"C:\Windows\Fonts\segoeui.ttf",r"C:\Windows\Fonts\arial.ttf"]):
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def tw(d, text, fnt):
    bb = d.textbbox((0,0), text, font=fnt); return bb[2]-bb[0], bb[3]-bb[1]

def ctext(d, text, y, fnt, color=WHITE, shadow=True, x=None):
    w2,h2 = tw(d,text,fnt)
    px = x if x is not None else (W-w2)//2
    if shadow: d.text((px+2,y+2), text, font=fnt, fill=(0,0,0,140))
    d.text((px,y), text, font=fnt, fill=color)
    return y+h2

def pill(d, text, cx, y, fnt, bg=PURPLE, fg=WHITE, pad=16):
    w2,h2 = tw(d,text,fnt)
    x1,y1 = cx-w2//2-pad, y
    x2,y2 = cx+w2//2+pad, y+h2+10
    d.rounded_rectangle([x1,y1,x2,y2], radius=(y2-y1)//2, fill=bg)
    d.text((x1+pad,y+5), text, font=fnt, fill=fg)
    return y2+8

def _bar(w,h,y,bh,alpha=210):
    o = Image.new("RGBA",(w,h),(0,0,0,0)); d=ImageDraw.Draw(o)
    for row in range(50): d.line([(0,y+row),(w,y+row)],fill=(15,12,41,int(alpha*row/50)))
    d.rectangle([0,y+50,w,y+bh],fill=(15,12,41,alpha)); return o

def overlay(img, o): return Image.alpha_composite(img.convert("RGBA"),o).convert("RGB")

def ken_burns(img, n, zs=1.0, ze=1.08, px=0.0, py=0.0):
    iw,ih = img.size
    for i in range(n):
        t = i/max(n-1,1); e=t*t*(3-2*t)
        z  = zs+(ze-zs)*e
        cx = iw/2+px*iw*e; cy = ih/2+py*ih*e
        cw = W/z; ch = H/z
        x1 = max(0,cx-cw/2); y1 = max(0,cy-ch/2)
        x2 = min(iw,x1+cw);  y2 = min(ih,y1+ch)
        if x2>iw: x1=max(0,iw-cw); x2=iw
        if y2>ih: y1=max(0,ih-ch); y2=ih
        yield img.crop((int(x1),int(y1),int(x2),int(y2))).resize((W,H),Image.LANCZOS)

frame_idx = 0
def save(img):
    global frame_idx
    img.save(FRAMES/f"frame_{frame_idx:05d}.png"); frame_idx+=1

# ── 1. Voiceover ──────────────────────────────────────────────────────────────
SCRIPT = (
    "Welcome to KDP Cover AI — the fastest way to create professional Amazon KDP book covers. "
    "In this video, I'll show you how to generate a K D P ready cover in just 30 seconds, "
    "with all the correct dimensions, bleed, and 300 D P I resolution built in automatically. "
    "No Canva. No Photoshop. No designer needed. "

    "First, head to K D P Cover A I dot site. "
    "You'll see our A I powered book cover generator built specifically for Amazon K D P authors. "
    "Click Create Free Account — you get 3 free covers, no credit card needed. "

    "Once you're signed in, you'll see the cover generator. "
    "Enter your book title and author name. "
    "Then choose your trim size — K D P Cover A I supports all Amazon K D P trim sizes, "
    "from 6 by 9, to 5 by 8, 8 by 10, and more. "

    "Now enter your page count. This is critical. "
    "K D P Cover A I automatically calculates your spine width "
    "based on your exact page count and paper type. "
    "Wrong spine width is the number one reason authors get rejected on Amazon. "
    "Our tool handles it automatically — every single time. "

    "Choose your genre and style, then click Generate. "
    "In less than 30 seconds — your full-wrap A I cover is ready. "
    "Front cover, spine, and back panel — all in one file. "

    "Download your K D P ready P D F at 300 D P I "
    "with 0.125 inch bleed on all sides, exactly as Amazon requires. "
    "Upload it directly to K D P — zero rejections. "

    "Start free today at K D P Cover A I dot site. "
    "3 covers, no credit card needed. "
    "If this helped you, please subscribe for weekly K D P tips and tutorials. "
    "See you in the next video."
)

if not AUDIO_OUT.exists():
    print("Generating voiceover...")
    gTTS(SCRIPT, lang="en", tld="co.uk", slow=False).save(str(AUDIO_OUT))
    print("Audio saved.")
else:
    print("Voiceover cached.")

# ── 2. Capture screenshots ────────────────────────────────────────────────────
PAGES = [
    ("home",    "https://kdpcoverai.site",         4000),
    ("signup",  "https://kdpcoverai.site/sign-up", 3000),
    ("pricing", "https://kdpcoverai.site/pricing", 3000),
    ("hero",    "https://kdpcoverai.site",         2000),
]
print("Capturing screenshots...")
with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width":1920,"height":1080}, color_scheme="dark")
    pg  = ctx.new_page()
    for name,url,wait in PAGES:
        out = SHOTS/f"{name}.png"
        if out.exists(): print(f"  {name}: cached"); continue
        print(f"  {name}...")
        pg.goto(url, wait_until="networkidle", timeout=30000)
        pg.wait_for_timeout(wait)
        pg.keyboard.press("Escape")
        pg.screenshot(path=str(out))
        print(f"  saved.")
    browser.close()

def load(name, top=0, bot=None):
    img = Image.open(SHOTS/f"{name}.png")
    iw,ih = img.size
    if bot is None: bot=ih
    img = img.crop((0,top,iw,bot))
    ratio = W/img.width
    nh = int(img.height*ratio)
    img = img.resize((W,max(nh,H)), Image.LANCZOS)
    if img.height > H*2: img=img.crop((0,0,W,H*2))
    return img

shots = {
    "home":    load("home"),
    "signup":  load("signup"),
    "pricing": load("pricing"),
    "hero":    load("hero", top=0, bot=900),
}
print("Screenshots loaded.")

# ═══════════════════════════════════════════════════════════════════════════
# SCENES
# ═══════════════════════════════════════════════════════════════════════════

# ── SCENE 0: YouTube Intro card (0–4s, 120 frames) ──────────────────────────
print("Scene 0: Intro card...")
for i in range(120):
    img = Image.new("RGB",(W,H), PURPLE_D)
    d   = ImageDraw.Draw(img)
    # grid
    for x in range(0,W,80): d.line([(x,0),(x,H)],fill=(80,40,180,15),width=1)
    for y in range(0,H,80): d.line([(0,y),(W,y)],fill=(80,40,180,15),width=1)
    # glow
    glow=Image.new("RGBA",(W,H),(0,0,0,0)); gd=ImageDraw.Draw(glow)
    gd.ellipse([W//2-400,H//2-300,W//2+400,H//2+300],fill=(124,58,237,int(60*min(1,i/20))))
    img=overlay(img,glow); d=ImageDraw.Draw(img)

    fade = min(1.0, i/20)
    # top bar
    d.rectangle([0,0,W,6],fill=PURPLE)
    # channel tag
    pill(d,"KDP Cover AI",180,30,font(22,True),bg=PURPLE,fg=WHITE,pad=14)
    # title
    ctext(d,"How to Generate a KDP Book Cover",H//2-120,font(64,True),WHITE)
    ctext(d,"in 30 Seconds",H//2-40,font(82,True),PURPLE_L)
    ctext(d,"AI-Powered · 300 DPI · All Trim Sizes · No Design Skills",H//2+60,font(28),GRAY)
    # url badge
    pill(d,"kdpcoverai.site",W//2,H//2+120,font(30,True),bg=GREEN,fg=DARK,pad=20)
    # bottom bar
    d.rectangle([0,H-6,W,H],fill=PURPLE)
    save(img)

# ── SCENE 1: Homepage (4–14s, 300 frames) ─────────────────────────────────────
print("Scene 1: Homepage...")
for i,base in enumerate(ken_burns(shots["home"],300,zs=1.0,ze=1.1,py=-0.05)):
    img=base.copy()
    # top+bottom gradient
    ovl=Image.new("RGBA",(W,H),(0,0,0,0)); od=ImageDraw.Draw(ovl)
    for y in range(160): od.line([(0,y),(W,y)],fill=(0,0,0,int(160*(1-y/160))))
    for y in range(220): od.line([(0,H-220+y),(W,H-220+y)],fill=(0,0,0,int(200*y/220)))
    img=overlay(img,ovl)
    # top bar + badge
    d=ImageDraw.Draw(img); d.rectangle([0,0,W,5],fill=PURPLE)
    pill(d,"kdpcoverai.site",150,18,font(20,True),bg=PURPLE)
    pill(d,"@kdpcoveraiofficial",W-160,18,font(18,True),bg=(0,0,0,160),fg=PURPLE_L)
    # bottom caption
    img=overlay(img,_bar(W,H,H-180,180))
    d=ImageDraw.Draw(img)
    pill(d,"STEP 1",80,H-165,font(20,True),bg=PURPLE,fg=WHITE,pad=12)
    ctext(d,"Head to kdpcoverai.site",H-130,font(36,True),WHITE)
    ctext(d,"Create your FREE account — 3 covers, no credit card needed",H-82,font(26),GREEN)
    save(img)

# ── SCENE 2: Sign Up page (14–22s, 240 frames) ────────────────────────────────
print("Scene 2: Sign up...")
for i,base in enumerate(ken_burns(shots["signup"],240,zs=1.05,ze=1.0,py=0.03)):
    img=base.copy()
    ovl=Image.new("RGBA",(W,H),(0,0,0,0)); od=ImageDraw.Draw(ovl)
    for y in range(160): od.line([(0,y),(W,y)],fill=(0,0,0,int(160*(1-y/160))))
    for y in range(220): od.line([(0,H-220+y),(W,H-220+y)],fill=(0,0,0,int(200*y/220)))
    img=overlay(img,ovl)
    d=ImageDraw.Draw(img); d.rectangle([0,0,W,5],fill=PURPLE)
    pill(d,"Free Sign Up",150,18,font(20,True),bg=PURPLE)
    pill(d,"@kdpcoveraiofficial",W-160,18,font(18,True),bg=(0,0,0,160),fg=PURPLE_L)
    img=overlay(img,_bar(W,H,H-180,180)); d=ImageDraw.Draw(img)
    pill(d,"STEP 2",80,H-165,font(20,True),bg=GREEN,fg=DARK,pad=12)
    ctext(d,"Sign up with email or Google",H-130,font(36,True),WHITE)
    ctext(d,"Takes 30 seconds · Instant access to the cover generator",H-82,font(26),GRAY)
    save(img)

# ── SCENE 3: Cover Generator explanation — split screen (22–34s, 360 frames) ──
print("Scene 3: Cover generator...")
for i,base in enumerate(ken_burns(shots["pricing"],360,zs=1.0,ze=1.08,py=-0.04)):
    img=base.copy()
    ovl=Image.new("RGBA",(W,H),(0,0,0,0)); od=ImageDraw.Draw(ovl)
    for y in range(160): od.line([(0,y),(W,y)],fill=(0,0,0,int(140*(1-y/160))))
    for y in range(220): od.line([(0,H-220+y),(W,H-220+y)],fill=(0,0,0,int(200*y/220)))
    img=overlay(img,ovl)
    d=ImageDraw.Draw(img); d.rectangle([0,0,W,5],fill=PURPLE)
    pill(d,"Cover Generator",150,18,font(20,True),bg=PURPLE)
    pill(d,"@kdpcoveraiofficial",W-160,18,font(18,True),bg=(0,0,0,160),fg=PURPLE_L)
    img=overlay(img,_bar(W,H,H-200,200)); d=ImageDraw.Draw(img)
    pill(d,"STEP 3",80,H-185,font(20,True),bg=PURPLE,fg=WHITE,pad=12)
    ctext(d,"Enter your book details",H-148,font(36,True),WHITE)
    # features inline
    feats=[("📖 Title & Author",""),("📐 Trim Size","All KDP sizes"),
           ("📄 Page Count","Auto spine calc"),("🎨 Genre & Style","AI-matched")]
    col_w = W//4
    for fi,(label,sub) in enumerate(feats):
        fx = fi*col_w + col_w//2
        d.rounded_rectangle([fi*col_w+10,H-105,fi*col_w+col_w-10,H-10],
                             radius=12,fill=(20,15,50,180))
        ctext(d,label,H-100,font(20,True),PURPLE_L,x=fi*col_w+10)
        if sub: ctext(d,sub,H-68,font(18),GREEN,x=fi*col_w+10)
    save(img)

# ── SCENE 4: Spine width explainer card (34–40s, 180 frames) ─────────────────
print("Scene 4: Spine width...")
for i,base in enumerate(ken_burns(shots["home"],180,zs=1.08,ze=1.0,py=0.04)):
    img=base.copy()
    img=overlay(img,Image.new("RGBA",(W,H),(15,12,41,200)))
    d=ImageDraw.Draw(img); d.rectangle([0,0,W,5],fill=PURPLE)
    pill(d,"@kdpcoveraiofficial",W-160,18,font(18,True),bg=(0,0,0,160),fg=PURPLE_L)

    # info card centre
    cx,cy = W//2, H//2
    d.rounded_rectangle([cx-500,cy-200,cx+500,cy+200],radius=24,fill=(20,15,50,230),
                          outline=PURPLE,width=2)
    ctext(d,"⚠️  The #1 KDP Rejection Reason",cy-185,font(28,True),AMBER)
    ctext(d,"Wrong Spine Width",cy-140,font(52,True),WHITE)
    # formula
    d.rounded_rectangle([cx-440,cy-70,cx+440,cy+20],radius=12,fill=(PURPLE_D))
    ctext(d,"300 pages × 0.002252\" = 0.6756\" spine",cy-60,font(28,True),GREEN)
    ctext(d,"KDP Cover AI calculates this AUTOMATICALLY",cy+35,font(26,True),WHITE)
    ctext(d,"Enter your page count → spine is always correct",cy+75,font(22),GRAY)

    # pulsing check
    pulse=abs(math.sin(math.radians(i*4)))
    sz=int(30+8*pulse)
    d.ellipse([cx-sz+380,cy-sz-120,cx+sz+380,cy+sz-120],fill=GREEN)
    d.text((cx+380-10,cy-120-14),"✓",font=font(36,True),fill=WHITE)
    save(img)

# ── SCENE 5: Generate animation (40–50s, 300 frames) ─────────────────────────
print("Scene 5: Generating...")
for i,base in enumerate(ken_burns(shots["hero"],300,zs=1.0,ze=1.05)):
    img=overlay(base,Image.new("RGBA",(W,H),(15,12,41,185)))
    d=ImageDraw.Draw(img); d.rectangle([0,0,W,5],fill=PURPLE)
    pill(d,"@kdpcoveraiofficial",W-160,18,font(18,True),bg=(0,0,0,160),fg=PURPLE_L)

    pct=min(1.0,i/240)
    cx,cy=W//2,H//2-60

    # spinner ring
    angle=(i*4)%360
    for dot in range(12):
        a=math.radians(angle+dot*30); r=100
        dx=cx+int(r*math.cos(a)); dy=cy+int(r*math.sin(a))
        sz=int(6+8*(dot/12))
        d.ellipse([dx-sz,dy-sz,dx+sz,dy+sz],fill=(*PURPLE,int(255*dot/12)))
    d.ellipse([cx-80,cy-80,cx+80,cy+80],outline=PURPLE,width=3)
    d.ellipse([cx-55,cy-55,cx+55,cy+55],fill=(*PURPLE,40))

    ctext(d,"Generating your KDP cover...",cy+115,font(40,True),WHITE)

    # progress bar
    bx,by=W//2-350,cy+175; bw=700
    d.rounded_rectangle([bx,by,bx+bw,by+24],radius=12,fill=DARK)
    if pct>0: d.rounded_rectangle([bx,by,bx+int(bw*pct),by+24],radius=12,fill=PURPLE)
    ctext(d,f"{int(pct*100)}%  complete",by+34,font(26,True),PURPLE_L)

    img=overlay(img,_bar(W,H,H-160,160)); d=ImageDraw.Draw(img)
    ctext(d,"AI is building: front cover · spine · back panel",H-135,font(28,True),WHITE)
    ctext(d,"300 DPI · 0.125\" bleed · correct KDP dimensions",H-90,font(24),GREEN)
    save(img)

# ── SCENE 6: Cover reveal (50–62s, 360 frames) ────────────────────────────────
print("Scene 6: Cover reveal...")
for i,base in enumerate(ken_burns(shots["home"],360,zs=1.05,ze=1.0,py=-0.03)):
    img=overlay(base,Image.new("RGBA",(W,H),(15,12,41,175)))
    d=ImageDraw.Draw(img); d.rectangle([0,0,W,5],fill=PURPLE)
    pill(d,"@kdpcoveraiofficial",W-160,18,font(18,True),bg=(0,0,0,160),fg=PURPLE_L)

    # book cover card — left side
    scale=min(1.0,0.4+(i/60)*0.6) if i<60 else 1.0
    cw,ch=int(280*scale),int(420*scale)
    cvx,cvy=320-cw//2,H//2-ch//2

    # shadow
    d.rounded_rectangle([cvx+5,cvy+5,cvx+cw+5,cvy+ch+5],radius=14,fill=(0,0,0,100))
    # gradient cover
    cvr=Image.new("RGB",(cw,ch),(20,10,50))
    cd=ImageDraw.Draw(cvr)
    for row in range(ch):
        t=row/ch; cd.line([(0,row),(cw,row)],fill=(int(20+t*10),int(10+t*20),int(50+t*70)))
    cd.line([(10,10),(cw-10,10)],fill=PURPLE_L,width=2)
    cd.line([(10,ch-10),(cw-10,ch-10)],fill=PURPLE_L,width=2)
    cd.rectangle([8,ch//2-35,cw-8,ch//2+35],fill=(0,0,0,110))
    tf=font(int(24*scale),True)
    tw2,_=tw(cd,"The Last Horizon",tf)
    cd.text(((cw-tw2)//2,ch//2-25),"The Last Horizon",font=tf,fill=WHITE)
    af=font(int(16*scale))
    aw,_=tw(cd,"Samuel Kehinde",af)
    cd.text(((cw-aw)//2,ch-32),"Samuel Kehinde",font=af,fill=PURPLE_L)
    cd.rounded_rectangle([6,6,60,28],radius=6,fill=GREEN)
    cd.text((9,8),"KDP ✓",font=font(int(13*scale),True),fill=WHITE)
    img.paste(cvr,(cvx,cvy))
    d=ImageDraw.Draw(img)
    d.rounded_rectangle([cvx,cvy,cvx+cw,cvy+ch],radius=14,outline=(*PURPLE,200),width=2)

    # sparkles after reveal
    if i>50:
        for sp in range(6):
            ang=math.radians(i*3+sp*60); dst=240+15*math.sin(math.radians(i*5+sp*40))
            sx=cvx+cw//2+int(dst*math.cos(ang)); sy=cvy+ch//2+int(dst*math.sin(ang))
            ss=int(4+3*abs(math.sin(math.radians(i*4+sp*50))))
            d.ellipse([sx-ss,sy-ss,sx+ss,sy+ss],fill=PURPLE_L)

    # right side — spec list
    rx=700
    ctext(d,"✅  Cover is READY!",H//2-170,font(42,True),GREEN,x=rx)
    specs=[
        ("📄","300 DPI resolution"),("✂️","0.125\" bleed all sides"),
        ("📐","Exact KDP dimensions"),("🖨️","Upload-ready PDF"),
        ("⚡","Generated in 30 seconds"),
    ]
    for si,(icon,spec) in enumerate(specs):
        sy2=H//2-100+si*58
        d.rounded_rectangle([rx,sy2,rx+530,sy2+46],radius=10,fill=(20,15,50,180))
        d.text((rx+12,sy2+8),icon,font=font(24),fill=WHITE)
        d.text((rx+52,sy2+11),spec,font=font(26,True),fill=WHITE)

    img=overlay(img,_bar(W,H,H-160,160)); d=ImageDraw.Draw(img)
    ctext(d,"Download your KDP-ready PDF — upload directly to Amazon",H-130,font(30,True),WHITE)
    ctext(d,"No rejection. No resizing. No guesswork.",H-86,font(24),GREEN)
    save(img)

# ── SCENE 7: Pricing / plans (62–72s, 300 frames) ─────────────────────────────
print("Scene 7: Pricing...")
for i,base in enumerate(ken_burns(shots["pricing"],300,zs=1.0,ze=1.06,py=-0.03)):
    img=base.copy()
    ovl=Image.new("RGBA",(W,H),(0,0,0,0)); od=ImageDraw.Draw(ovl)
    for y in range(160): od.line([(0,y),(W,y)],fill=(0,0,0,int(140*(1-y/160))))
    for y in range(220): od.line([(0,H-220+y),(W,H-220+y)],fill=(0,0,0,int(200*y/220)))
    img=overlay(img,ovl)
    d=ImageDraw.Draw(img); d.rectangle([0,0,W,5],fill=PURPLE)
    pill(d,"Simple Pricing",150,18,font(20,True),bg=PURPLE)
    pill(d,"@kdpcoveraiofficial",W-160,18,font(18,True),bg=(0,0,0,160),fg=PURPLE_L)
    img=overlay(img,_bar(W,H,H-200,200)); d=ImageDraw.Draw(img)
    ctext(d,"Start FREE — 3 covers, no credit card needed",H-170,font(34,True),WHITE)
    plans=[("Free","0",GREEN),("Starter","$10",PURPLE_L),("Pro","$30",AMBER),("Agency","$80",RED)]
    pw=(W-80)//4
    for pi,(name,price,col) in enumerate(plans):
        px=40+pi*pw
        d.rounded_rectangle([px,H-128,px+pw-16,H-10],radius=12,fill=(20,15,50,190))
        ctext(d,price,H-118,font(30,True),col,x=px)
        ctext(d,name,H-78,font(22),WHITE,x=px)
    save(img)

# ── SCENE 8: Outro CTA (72–80s, 240 frames) ────────────────────────────────────
print("Scene 8: Outro...")
for i in range(240):
    img=Image.new("RGB",(W,H),PURPLE_D)
    d=ImageDraw.Draw(img)
    for x in range(0,W,80): d.line([(x,0),(x,H)],fill=(80,40,180,15),width=1)
    for y in range(0,H,80): d.line([(0,y),(W,y)],fill=(80,40,180,15),width=1)
    glow=Image.new("RGBA",(W,H),(0,0,0,0)); gd=ImageDraw.Draw(glow)
    pulse=abs(math.sin(math.radians(i*3)))
    gd.ellipse([W//2-450,H//2-280,W//2+450,H//2+280],fill=(124,58,237,int(50*pulse)))
    img=overlay(img,glow); d=ImageDraw.Draw(img)
    d.rectangle([0,0,W,6],fill=PURPLE)
    d.rectangle([0,H-6,W,H],fill=PURPLE)

    fade=min(1.0,i/30)
    ctext(d,"Try KDP Cover AI FREE Today",H//2-200,font(58,True),WHITE)
    ctext(d,"3 covers included · No credit card needed · Instant access",H//2-120,font(28),GRAY)

    # big URL button
    by=H//2-50; bh=80
    d.rounded_rectangle([W//2-350,by,W//2+350,by+bh],radius=40,fill=PURPLE)
    ctext(d,"kdpcoverai.site",by+18,font(42,True),WHITE)

    # subscribe box
    d.rounded_rectangle([W//2-300,H//2+70,W//2+300,H//2+150],radius=20,
                          fill=(239,68,68,int(220*fade)),outline=WHITE,width=2)
    ctext(d,"🔔  Subscribe for weekly KDP tips",H//2+83,font(28,True),WHITE)

    # stats row
    stats=[("30 sec","to generate"),("300 DPI","PDF export"),("0","KDP rejections"),("Free","to start")]
    sw=(W-80)//4
    for si,(val,lbl) in enumerate(stats):
        sx=40+si*sw
        d.rounded_rectangle([sx,H//2+175,sx+sw-20,H//2+265],radius=14,fill=(20,15,50))
        ctext(d,val,H//2+185,font(34,True),PURPLE_L,x=sx)
        ctext(d,lbl,H//2+228,font(20),GRAY,x=sx)
    save(img)

print(f"Total frames: {frame_idx}")

# ── Encode ────────────────────────────────────────────────────────────────────
print("Encoding video...")
subprocess.run([
    "ffmpeg","-y","-framerate",str(FPS),
    "-i",str(FRAMES/"frame_%05d.png"),
    "-c:v","libx264","-preset","fast","-crf","18",
    "-pix_fmt","yuv420p", str(VIDEO_RAW)
], check=True)
print("Mixing audio...")
subprocess.run([
    "ffmpeg","-y",
    "-i",str(VIDEO_RAW),"-i",str(AUDIO_OUT),
    "-c:v","copy","-c:a","aac","-b:a","128k","-shortest",
    str(VIDEO_OUT)
], check=True)
print(f"\nDone! {VIDEO_OUT} ({VIDEO_OUT.stat().st_size/1024/1024:.1f} MB)")
