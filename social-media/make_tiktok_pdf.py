from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfgen import canvas as pdfcanvas

OUTPUT = r"C:\Users\SAMUEL\kdp-cover-ai\social-media\tiktok-30-day-plan.pdf"

# ── Colours ──────────────────────────────────────────────────────────────────
PURPLE      = colors.HexColor("#7c3aed")
PURPLE_DARK = colors.HexColor("#1e1040")
PURPLE_MID  = colors.HexColor("#4c1d95")
PURPLE_LIGHT= colors.HexColor("#ede9fe")
PURPLE_PALE = colors.HexColor("#f5f3ff")
GREEN       = colors.HexColor("#059669")
GREEN_LIGHT = colors.HexColor("#d1fae5")
WHITE       = colors.white
GRAY        = colors.HexColor("#6b7280")
DARK        = colors.HexColor("#111827")
ORANGE      = colors.HexColor("#d97706")
ORANGE_LIGHT= colors.HexColor("#fef3c7")

W, H = A4   # 595.27 x 841.89 pt

# ── Cover page canvas callback ────────────────────────────────────────────────
def cover_page(canvas, doc):
    canvas.saveState()
    # full-page dark background
    canvas.setFillColor(PURPLE_DARK)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    # top accent bar
    canvas.setFillColor(PURPLE)
    canvas.rect(0, H - 8, W, 8, fill=1, stroke=0)
    # bottom bar
    canvas.setFillColor(PURPLE_MID)
    canvas.rect(0, 0, W, 6, fill=1, stroke=0)
    # decorative circle
    canvas.setFillColor(colors.HexColor("#2d1b69"))
    canvas.circle(W - 60, H - 60, 120, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#3b1f8c"))
    canvas.circle(60, 60, 80, fill=1, stroke=0)
    canvas.restoreState()

def later_page(canvas, doc):
    canvas.saveState()
    # top rule
    canvas.setFillColor(PURPLE)
    canvas.rect(0, H - 5, W, 5, fill=1, stroke=0)
    # bottom footer
    canvas.setFillColor(PURPLE_DARK)
    canvas.rect(0, 0, W, 22, fill=1, stroke=0)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(WHITE)
    footer = "kdpcoverai.site  |  @kdpcoverai  |  KDP Cover AI — 30-Day TikTok Plan"
    canvas.drawCentredString(W / 2, 7, footer)
    # page number
    canvas.setFont("Helvetica-Bold", 7)
    canvas.setFillColor(colors.HexColor("#a78bfa"))
    canvas.drawRightString(W - 20, 7, f"Page {doc.page}")
    canvas.restoreState()

# ── Styles ────────────────────────────────────────────────────────────────────
base = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, **kw)

cover_title = S("cover_title",
    fontSize=38, leading=44, textColor=WHITE,
    fontName="Helvetica-Bold", alignment=TA_CENTER)

cover_sub = S("cover_sub",
    fontSize=18, leading=24, textColor=colors.HexColor("#c4b5fd"),
    fontName="Helvetica", alignment=TA_CENTER)

cover_tag = S("cover_tag",
    fontSize=13, leading=18, textColor=colors.HexColor("#a78bfa"),
    fontName="Helvetica", alignment=TA_CENTER)

cover_url = S("cover_url",
    fontSize=14, leading=20, textColor=WHITE,
    fontName="Helvetica-Bold", alignment=TA_CENTER)

h1 = S("h1",
    fontSize=20, leading=26, textColor=PURPLE,
    fontName="Helvetica-Bold", spaceAfter=6)

h2 = S("h2",
    fontSize=13, leading=17, textColor=PURPLE_DARK,
    fontName="Helvetica-Bold", spaceAfter=3)

body = S("body",
    fontSize=9.5, leading=14, textColor=DARK,
    fontName="Helvetica", spaceAfter=2)

caption_style = S("caption_style",
    fontSize=9, leading=13, textColor=colors.HexColor("#1e1b4b"),
    fontName="Helvetica-Oblique", spaceAfter=2)

hashtag_style = S("hashtag_style",
    fontSize=8.5, leading=12, textColor=PURPLE,
    fontName="Helvetica-Bold", spaceAfter=0)

intro_body = S("intro_body",
    fontSize=10, leading=15, textColor=DARK,
    fontName="Helvetica", spaceAfter=4)

day_num = S("day_num",
    fontSize=22, leading=26, textColor=WHITE,
    fontName="Helvetica-Bold", alignment=TA_CENTER)

section_label = S("section_label",
    fontSize=7.5, leading=10, textColor=GRAY,
    fontName="Helvetica-Bold", spaceAfter=1)

# ── Day data ──────────────────────────────────────────────────────────────────
DAYS = [
    (1, "Screen recording of generating a KDP book cover from start to finish — show the full process in 30 seconds, sped up with trending audio",
     "I built a tool that generates KDP book covers in 30 seconds \U0001f4da⚡ Try free at kdpcoverai.site",
     "#kdp #selfpublishing #bookcover #indieauthor #amazonkdp #booktok #authortok #writingtok"),

    (2, "Side-by-side comparison — show a $200 designer cover quote on one side, then generate the same style in 30 seconds on the other side",
     "POV: you just made a KDP book cover in 30 seconds \U0001f62e No designer. No Canva. Just AI. Link in bio!",
     "#kdp #selfpublishing #indieauthor #booktok #bookcover #amazonkdp #authortok #writingtok"),

    (3, "Talking head or text-on-screen video listing 5 KDP mistakes — cut to screen recording showing how the tool avoids each one",
     "5 reasons Amazon KDP keeps rejecting your cover \U0001f624 (and how to fix it)",
     "#kdp #amazonkdp #selfpublishing #bookcover #indieauthor #authortips #booktok #writingtok"),

    (4, "Screen recording — generate a Thriller cover, then immediately generate a Romance cover. Show genre switch. Add text overlay 'same tool'",
     "Thriller vs Romance book cover — same tool, 30 seconds each \U0001f440 Which one is your favourite?",
     "#bookcover #kdp #selfpublishing #thriller #romance #booktok #indieauthor #amazonkdp"),

    (5, "Text-on-screen explaining spine width formula — 300 pages x 0.002252 = 0.6756 inches — then show tool calculating it automatically",
     "How Amazon calculates your spine width (most authors get this wrong) \U0001f4d0",
     "#kdp #amazonkdp #selfpublishing #bookcover #authortips #indieauthor #booktok #selfpublishingtips"),

    (6, "Nigerian flag overlay — show the NGN payment screen, then show successful subscription activation. Caption in Pidgin/English mix",
     "Nigerian authors can now pay in Naira \U0001f1f3\U0001f1ec\U0001f389 No dollar card needed! Starter plan N13,700/month",
     "#nigerianauthor #kdp #selfpublishing #naija #bookcover #naijaauthor #amazonkdp #booktok"),

    (7, "Speed run — generate 5 different covers in 60 seconds. Fantasy, Horror, Romance, Thriller, Self-Help. Fast cuts, upbeat music",
     "5 book covers in 60 seconds \U0001f525 Which genre is your favourite?",
     "#bookcover #kdp #selfpublishing #indieauthor #booktok #amazonkdp #authortok #writingtok"),

    (8, "Screen recording showing the affiliate dashboard — show the link, the commission rates, explain how it works in 30 seconds",
     "Earn money recommending a tool authors actually need \U0001f4b0 KDP Cover AI affiliate program is open! Link in bio",
     "#affiliatemarketing #passiveincome #kdp #selfpublishing #indieauthor #makemoneyonline #booktok #authortok"),

    (9, "Text-on-screen checklist video — go through each KDP requirement one by one with a green checkmark animation",
     "The KDP cover checklist every author needs ✅ Save this!",
     "#kdp #amazonkdp #selfpublishing #bookcover #indieauthor #authortips #booktok #selfpublishingtips"),

    (10, "'What is bleed?' — draw on screen or use text animation to show what bleed area means and why it matters for printing",
     'What is "bleed" in KDP? (this gets so many authors rejected) \U0001f4c4',
     "#kdp #selfpublishing #amazonkdp #bookcover #authortips #indieauthor #booktok #selfpublishingtips"),

    (11, "Generate a Fantasy cover — show choosing trim size, entering title, watching cover generate. Add dramatic music",
     "Generating a Fantasy KDP cover in real time ✨ Would you publish this?",
     "#fantasy #bookcover #kdp #selfpublishing #fantasybooktok #indieauthor #booktok #amazonkdp"),

    (12, "Free plan vs Pro plan comparison — screen recording showing what's different. Show watermark on free, no watermark on pro",
     "Free vs Paid — what's the actual difference? \U0001f440",
     "#kdp #selfpublishing #bookcover #indieauthor #amazonkdp #booktok #authortok #writingtok"),

    (13, "Generate a Horror cover — dark theme, dramatic reveal. Use a horror sound effect in the audio",
     "Generating a Horror KDP cover at midnight \U0001f47b\U0001f5a4 Would you read this book?",
     "#horror #bookcover #kdp #selfpublishing #horrorbooktok #indieauthor #booktok #amazonkdp"),

    (14, "Show the Agency plan white-label export feature — generate a cover, export as PDF with no KDP Cover AI branding",
     "Agency plan — white label PDF export for publishers and book formatters \U0001f3e2",
     "#kdp #selfpublishing #bookcover #publishing #agency #indieauthor #booktok #amazonkdp"),

    (15, "Stitch or react to a video about struggling with book cover design — then show how KDP Cover AI solves the problem",
     "When someone says making a KDP cover is hard... \U0001f440 let me show you something",
     "#kdp #selfpublishing #bookcover #indieauthor #booktok #amazonkdp #authortok #stitch"),

    (16, "Romance cover generation — soft colours, romantic aesthetic. Ask viewers to suggest a book title in comments",
     "Generating a Romance KDP cover \U0001f495 Comment a book title and I'll generate a cover for it!",
     "#romance #bookcover #kdp #selfpublishing #romancebooktok #indieauthor #booktok #amazonkdp"),

    (17, "'I asked my followers what genre they write' — show poll results, then generate a cover for the winning genre",
     "You voted... so I generated it \U0001f3a8 Here's your KDP cover!",
     "#bookcover #kdp #selfpublishing #indieauthor #booktok #amazonkdp #authortok #writingtok"),

    (18, "Show the back cover AI writer feature — type a book description, watch the AI write the back cover blurb",
     "AI writes your back cover description in seconds \U0001f92f",
     "#kdp #selfpublishing #bookcover #ai #indieauthor #booktok #amazonkdp #authortok"),

    (19, "Series branding feature — generate 3 covers for books 1, 2, 3 in a series. Show how they match visually",
     "Book series cover branding — all 3 books, same style, 90 seconds total ⚡",
     "#bookcover #kdp #selfpublishing #bookseries #indieauthor #booktok #amazonkdp #authortok"),

    (20, "Self-Help cover generation — clean, modern design. Show the trim size selector and PDF export",
     "Generating a Self-Help KDP cover \U0001f4aa 30 seconds flat. Would you buy this book?",
     "#selfhelp #bookcover #kdp #selfpublishing #booktok #indieauthor #amazonkdp #authortok"),

    (21, "Before and after — show a badly designed cover (generic Canva one), then generate the same book with KDP Cover AI. Side by side",
     "Before vs After: same book, different cover tool \U0001f605 vs \U0001f525",
     "#bookcover #kdp #selfpublishing #beforeandafter #indieauthor #booktok #amazonkdp #authortok"),

    (22, "Founder story — why you built this tool. Can be text on screen with screen recordings in background. Personal and authentic",
     "Why I built KDP Cover AI (the real reason) \U0001f6e0",
     "#buildinpublic #kdp #selfpublishing #founder #indieauthor #booktok #startuplife #makersoftiktok"),

    (23, "Mystery cover generation — dark and moody. Add suspenseful music. Ask 'who did it?' in the caption",
     "Generating a Mystery KDP cover \U0001f50d The butler did it... probably.",
     "#mystery #bookcover #kdp #selfpublishing #mysterybooktok #indieauthor #booktok #amazonkdp"),

    (24, "'10 covers in 10 minutes' — speed run challenge. Generate 10 different covers rapidly, one every minute, fast cuts",
     "10 KDP covers in 10 minutes challenge \U0001f525 New personal record?",
     "#bookcover #kdp #selfpublishing #challenge #indieauthor #booktok #amazonkdp #speedrun"),

    (25, "Comment reply video — pick a comment asking 'does it really work?' and show the full process live as a response",
     "Replying to @[commenter]: yes it really works, let me show you \U0001f440",
     "#kdp #selfpublishing #bookcover #replytocomment #indieauthor #booktok #amazonkdp #authortok"),

    (26, "KDP royalty calculator — show how cover quality affects conversion and therefore royalties. Educational text-on-screen",
     "A better cover = more sales = more royalties \U0001f4b0 Here's the math",
     "#kdp #selfpublishing #bookroyalties #indieauthor #passiveincome #booktok #amazonkdp #authortok"),

    (27, "Children's book cover generation — bright, fun, colourful. Very different from other genres shown",
     "Generating a Children's Book KDP cover \U0001f308\U0001f4da Cute or what?",
     "#childrensbook #bookcover #kdp #selfpublishing #booktok #indieauthor #amazonkdp #authortok"),

    (28, "Show the full user journey — sign up, generate free cover, upgrade to pro, download PDF. All in 60 seconds",
     "From sign up to KDP-ready PDF in 60 seconds ⚡ This is the full journey",
     "#kdp #selfpublishing #bookcover #indieauthor #amazonkdp #booktok #authortok #writingtok"),

    (29, "Q&A — answer the top 5 questions from your comments. Text on screen format",
     "Answering your top 5 KDP Cover AI questions \U0001f4ec Drop more in the comments!",
     "#kdp #selfpublishing #bookcover #qanda #indieauthor #booktok #amazonkdp #authortok"),

    (30, "30-day milestone recap — show follower count growth, covers generated, testimonials, what's coming next",
     "30 days of KDP Cover AI \U0001f389 Here's what happened (the numbers surprised me)",
     "#buildinpublic #kdp #selfpublishing #milestone #indieauthor #booktok #amazonkdp #30days"),
]

# ── Build story ───────────────────────────────────────────────────────────────
story = []

# ── COVER PAGE ────────────────────────────────────────────────────────────────
story.append(Spacer(1, 90*mm))
story.append(Paragraph("KDP Cover AI", cover_title))
story.append(Spacer(1, 6*mm))
story.append(Paragraph("30-Day TikTok Content Plan", cover_sub))
story.append(Spacer(1, 5*mm))
story.append(HRFlowable(width="60%", thickness=1, color=PURPLE, spaceAfter=5*mm, spaceBefore=0))
story.append(Paragraph("Ready-to-post captions, hashtags &amp; video ideas", cover_tag))
story.append(Spacer(1, 12*mm))
story.append(Paragraph("kdpcoverai.site", cover_url))
story.append(PageBreak())

# ── HOW TO USE ────────────────────────────────────────────────────────────────
story.append(Paragraph("How to Use This Plan", h1))
story.append(HRFlowable(width="100%", thickness=1.5, color=PURPLE, spaceAfter=4*mm))

tips = [
    "‣  Post once daily at <b>7pm–9pm WAT</b> (Nigeria time) for maximum reach",
    "‣  Each day includes: <b>Video idea</b>, <b>Caption</b> (copy-paste ready), and <b>Hashtags</b>",
    "‣  <b>Screen recordings work great</b> — no face needed. Just record your screen",
    "‣  Use <b>CapCut</b> to add text captions and trending audio to your recordings",
    "‣  Always keep <b>kdpcoverai.site</b> in your TikTok bio link",
]
for tip in tips:
    story.append(Paragraph(tip, intro_body))

story.append(Spacer(1, 5*mm))

# Best practices box
bp_data = [[
    Paragraph("<b>Best Practices for Maximum Reach</b>", ParagraphStyle("bph",
        fontSize=10, leading=14, textColor=PURPLE_DARK, fontName="Helvetica-Bold")),
]]
bps = [
    "⚡  Hook in the <b>first 1–2 seconds</b> — show the result immediately, not the setup",
    "⏱  Keep videos <b>15–30 seconds</b> for maximum TikTok algorithm reach",
    "\U0001f4ac  Reply to <b>every comment</b> within the first hour after posting",
    "\U0001f4cc  <b>Pin your best-performing video</b> to the top of your profile",
    "\U0001f50a  Use <b>trending audio</b> from TikTok's sound library — it boosts distribution",
]
for bp in bps:
    bp_data.append([Paragraph(bp, ParagraphStyle("bpb",
        fontSize=9.5, leading=14, textColor=DARK, fontName="Helvetica", spaceAfter=2))])

bp_table = Table(bp_data, colWidths=[155*mm])
bp_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), PURPLE_LIGHT),
    ("BACKGROUND", (0, 1), (-1, -1), PURPLE_PALE),
    ("BOX",        (0, 0), (-1, -1), 1, PURPLE),
    ("LINEBELOW",  (0, 0), (-1, 0),  1, PURPLE),
    ("TOPPADDING",    (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("LEFTPADDING",   (0, 0), (-1, -1), 10),
    ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [PURPLE_PALE, colors.HexColor("#ede9fe")]),
]))
story.append(bp_table)
story.append(PageBreak())

# ── 30 DAYS ───────────────────────────────────────────────────────────────────
# Two days per page
for i, (day_no, video, caption, hashtags) in enumerate(DAYS):
    # Day header row
    header_data = [[
        Paragraph(f"DAY {day_no}", day_num),
        Paragraph(
            ["January", "February", "March", "April", "May", "June",
             "July", "August", "September", "October", "November", "December"][0] + "",
            ParagraphStyle("ph", fontSize=8, textColor=colors.HexColor("#c4b5fd"),
                           fontName="Helvetica", alignment=TA_CENTER)
        ),
    ]]
    header_table = Table([[
        Paragraph(f"DAY {day_no}", ParagraphStyle("dn",
            fontSize=20, leading=24, textColor=WHITE,
            fontName="Helvetica-Bold", alignment=TA_CENTER)),
    ]], colWidths=[155*mm])
    header_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), PURPLE),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
        ("ROUNDEDCORNERS", [4]),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 2*mm))

    # Content table
    content_data = [
        [Paragraph("VIDEO IDEA", section_label)],
        [Paragraph(video, body)],
        [Paragraph("CAPTION (copy-paste ready)", section_label)],
        [Paragraph(caption, caption_style)],
        [Paragraph("HASHTAGS", section_label)],
        [Paragraph(hashtags, hashtag_style)],
    ]
    content_table = Table(content_data, colWidths=[155*mm])
    content_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX",        (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("LINEBELOW",  (0, 2), (-1, 2), 0.5, colors.HexColor("#e5e7eb")),
        ("LINEBELOW",  (0, 4), (-1, 4), 0.5, colors.HexColor("#e5e7eb")),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f9fafb")),
        ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#f0fdf4")),
        ("BACKGROUND", (0, 4), (-1, 4), PURPLE_PALE),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
    ]))
    story.append(content_table)
    story.append(Spacer(1, 5*mm))

    # Page break every 3 days
    if (i + 1) % 3 == 0 and i < 29:
        story.append(PageBreak())

story.append(PageBreak())

# ── FINAL PAGE ────────────────────────────────────────────────────────────────
story.append(Paragraph("Quick Reference — Best Practices", h1))
story.append(HRFlowable(width="100%", thickness=1.5, color=PURPLE, spaceAfter=5*mm))

ref_data = [
    ["Post time", "7pm – 9pm WAT (Nigeria time) daily"],
    ["Video length", "15–30 seconds for best reach"],
    ["Bio link", "kdpcoverai.site"],
    ["Profile name", "@kdpcoverai"],
    ["Comments", "Reply to every comment within the first hour"],
    ["Profile", "Pin your best-performing video to your profile"],
    ["Audio", "Use trending audio from TikTok's sound library"],
    ["Hook", "Show the result in the first 1–2 seconds"],
    ["Consistency", "Post every day — the algorithm rewards consistency"],
    ["Hashtags", "Use all 8 hashtags on every post"],
]

for label, value in ref_data:
    row_table = Table([[
        Paragraph(label, ParagraphStyle("rl", fontSize=9, leading=13,
            textColor=PURPLE_DARK, fontName="Helvetica-Bold")),
        Paragraph(value, ParagraphStyle("rv", fontSize=9, leading=13,
            textColor=DARK, fontName="Helvetica")),
    ]], colWidths=[45*mm, 110*mm])
    row_table.setStyle(TableStyle([
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("BOX",           (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("BACKGROUND",    (0, 0), (0, 0), PURPLE_LIGHT),
        ("BACKGROUND",    (1, 0), (1, 0), WHITE),
    ]))
    story.append(row_table)
    story.append(Spacer(1, 2*mm))

story.append(Spacer(1, 8*mm))

# Final CTA box
cta_data = [[Paragraph(
    "Start posting today. Consistency beats perfection.<br/>"
    "<font color='#7c3aed'><b>kdpcoverai.site</b></font>  |  "
    "<font color='#7c3aed'><b>@kdpcoverai</b></font>",
    ParagraphStyle("cta", fontSize=11, leading=17, textColor=DARK,
                   fontName="Helvetica", alignment=TA_CENTER))
]]
cta_table = Table(cta_data, colWidths=[155*mm])
cta_table.setStyle(TableStyle([
    ("BACKGROUND",    (0, 0), (-1, -1), PURPLE_LIGHT),
    ("BOX",           (0, 0), (-1, -1), 1.5, PURPLE),
    ("TOPPADDING",    (0, 0), (-1, -1), 14),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
    ("LEFTPADDING",   (0, 0), (-1, -1), 16),
    ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
]))
story.append(cta_table)

# ── Build ──────────────────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    leftMargin=20*mm, rightMargin=20*mm,
    topMargin=18*mm, bottomMargin=18*mm,
    title="KDP Cover AI — 30-Day TikTok Content Plan",
    author="KDP Cover AI",
    subject="TikTok Content Strategy",
)

def on_page(canvas, doc):
    if doc.page == 1:
        cover_page(canvas, doc)
    else:
        later_page(canvas, doc)

doc.build(story, onFirstPage=cover_page, onLaterPages=later_page)
print(f"PDF saved to: {OUTPUT}")
