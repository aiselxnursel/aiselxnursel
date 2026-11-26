"""Story tasarım aracı (1080x1920).

Rehberdeki görsel kurallar burada sabit:
- En fazla 2 renk: beyaz kutu (normal metin) + bordo kutu (vurgu).
- Tırnaklı (serif) yazı, emojiler cümle sonunda.
- Yüz açık kalır: metin yüzün üstünde, kartlar yüzün altında.
- Sosyal kanıt kartları köşesi yuvarlatılmış, gölgeli; kişisel bilgiler `card(..., whites=, blurs=)` ile kapatılır.
- Her story'de sağ altta #reklam.

Kullanım (örnek):

    from story_tasarim import *
    yuz_kontrol("foto.jpg", "grid.jpg")          # yüzün hangi y aralığında olduğunu gör
    k = card("kanit.jpg", crop=(150, 0, 1040, 835), whites=[(180, 195, 340, 240)])
    img = bg("foto.jpg")
    stack(img, ["Beyaz kutu", ("Bordo vurgu", "bordo")], y=60)
    place(img, k, x=270, y=1100, w=540, angle=-3)
    save(img, "story_1.jpg")
"""
import re
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

W, H = 1080, 1920
SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
SERIFB = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
CHECK_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
EMOJI = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", 109)

STYLES = {
    "w": dict(font=SERIF, bg=(255, 255, 255, 245), fg=(25, 25, 25)),
    "bordo": dict(font=SERIFB, bg=(104, 14, 52, 245), fg=(255, 255, 255)),
}
CHECK = "✓"


def _is_emoji(ch):
    o = ord(ch)
    return (o >= 0x1F000 or 0x2600 <= o <= 0x27BF) and ch != CHECK


def _clusters(word):
    out, i = [], 0
    while i < len(word):
        if _is_emoji(word[i]):
            j = i + 1
            while j < len(word) and (0x1F3FB <= ord(word[j]) <= 0x1F3FF or word[j] in "️‍"
                                     or word[j - 1] == "‍"):
                j += 1
            out.append(("e", word[i:j])); i = j
        else:
            j = i
            while j < len(word) and not _is_emoji(word[j]):
                j += 1
            out.append(("t", word[i:j])); i = j
    res = []
    for k, t in out:
        if k == "t" and CHECK in t:
            for n, part in enumerate(t.split(CHECK)):
                if n:
                    res.append(("c", CHECK))
                if part:
                    res.append(("t", part))
        else:
            res.append((k, t))
    return res


def _emoji_img(seq, size):
    im = Image.new("RGBA", (200, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((0, 0), seq, font=EMOJI, embedded_color=True)
    im = im.crop(im.getbbox() or (0, 0, 1, 1))
    r = size / im.height
    return im.resize((max(1, int(im.width * r)), size), Image.LANCZOS)


def _ww(s, font, es):
    return sum(font.getlength(t) if k == "t" else (es * 0.9 if k == "c" else es + 4) for k, t in _clusters(s))


def _wrap(text, font, maxw, es):
    lines, cur = [], ""
    for wd in text.split(" "):
        cand = (cur + " " + wd).strip()
        if _ww(cand, font, es) <= maxw or not cur:
            cur = cand
        else:
            lines.append(cur); cur = wd
    lines.append(cur)
    return lines


def box(img, text, y, style="w", size=42, maxw=900):
    """Ortalanmış tek kutu çizer, kutunun alt y'sini döndürür."""
    st = STYLES[style]
    text = re.sub(r" (?=[\U0001F000-\U0001FFFF☀-➿])", " ", text)  # emoji satır başına düşmesin
    font = ImageFont.truetype(st["font"], size)
    es = int(size * 0.95)
    padx, pady = 22, 12
    lines = _wrap(text, font, maxw - 2 * padx, es)
    lh = int(size * 1.18)
    bw = int(max(_ww(l, font, es) for l in lines) + 2 * padx)
    bh = lh * len(lines) + 2 * pady
    x0 = (W - bw) // 2
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(ov).rectangle([x0, y, x0 + bw, y + bh], fill=st["bg"])
    img.alpha_composite(ov)
    d = ImageDraw.Draw(img)
    asc = font.getmetrics()[0]
    for i, l in enumerate(lines):
        x = (W - _ww(l, font, es)) / 2
        ty = y + pady + i * lh
        for k, s in _clusters(l):
            if k == "t":
                d.text((x, ty), s, font=font, fill=st["fg"]); x += font.getlength(s)
            elif k == "c":
                d.text((x, ty), s, font=ImageFont.truetype(CHECK_FONT, int(size * 0.85)), fill=st["fg"]); x += es * 0.9
            else:
                img.alpha_composite(_emoji_img(s, es), (int(x + 2), int(ty + asc - es + es * 0.12))); x += es + 4
    return y + bh


def stack(img, items, y, gap=6, size=42):
    """Alt alta kutular. item: "metin" (beyaz) ya da ("metin", "bordo"[, boyut])."""
    for it in items:
        if isinstance(it, str):
            it = (it, "w", size)
        elif len(it) == 2:
            it = (it[0], it[1], size)
        y = box(img, it[0], y, it[1], it[2]) + gap
    return y


def reklam(img):
    font = ImageFont.truetype(SERIF, 30)
    t = "#reklam"
    w = font.getlength(t)
    x, y = W - w - 90, 1780
    d = ImageDraw.Draw(img)
    d.rectangle([x - 10, y - 6, x + w + 10, y + 40], fill=(255, 255, 255))
    d.text((x, y), t, font=font, fill=(20, 20, 20))
    d.line([(x, y + 33), (x + w, y + 33)], fill=(20, 20, 20), width=2)


def bg(path, fx=0.5, fy=0.5):
    """Fotoğrafı 1080x1920'ye doldurup kırpar (fx/fy: kırpma odağı 0-1)."""
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    r = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    l, t = int((im.width - W) * fx), int((im.height - H) * fy)
    return im.crop((l, t, l + W, t + H)).convert("RGBA")


def yuz_kontrol(path, out, fx=0.5, fy=0.5):
    """Arka planı 100 px'lik çizgilerle kaydeder; yüz aralığını bulup metni ona göre yerleştirmek için."""
    im = bg(path, fx, fy)
    d = ImageDraw.Draw(im)
    for y in range(0, H, 100):
        d.line([(0, y), (W, y)], fill=(255, 0, 0), width=2)
        d.text((6, y + 4), str(y), fill=(255, 0, 0))
    im.convert("RGB").resize((540, 960)).save(out)


def card(path, crop, whites=(), blurs=()):
    """Sosyal kanıt kartı: önce kişisel bilgileri kapatır (whites: beyaz kutu, blurs: bulanık),
    sonra kırpar. Koordinatlar orijinal ekran görüntüsüne göre (x0, y0, x1, y1).
    Profil fotoğrafları kırpma ile dışarıda bırakılır."""
    im = Image.open(path).convert("RGB")
    d = ImageDraw.Draw(im)
    for r in whites:
        d.rounded_rectangle(r, 8, fill=(255, 255, 255))
    for r in blurs:
        reg = im.crop(r).resize((8, 8)).resize((r[2] - r[0], r[3] - r[1]), Image.NEAREST).filter(ImageFilter.GaussianBlur(6))
        im.paste(reg, r[:2])
    return im.crop(crop)


def place(img, c, x, y, w, angle=0):
    """Kartı yuvarlatılmış köşe + gölge ile yerleştirir; kartın alt y'sini döndürür."""
    r = w / c.width
    c = c.resize((int(c.width * r), int(c.height * r)), Image.LANCZOS).convert("RGBA")
    m = Image.new("L", c.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, c.width - 1, c.height - 1], 26, fill=255)
    c.putalpha(m)
    sh = Image.new("RGBA", (c.width + 60, c.height + 60), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([30, 36, c.width + 30, c.height + 36], 26, fill=(0, 0, 0, 90))
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    sh.alpha_composite(c, (30, 30))
    if angle:
        sh = sh.rotate(angle, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(sh, (int(x - 30), int(y - 30)))
    return y + c.height


def save(img, out):
    reklam(img)
    img.convert("RGB").save(out, quality=93)


def onizleme(paths, out, h=640):
    """Seriyi yan yana tek görselde gösterir."""
    ims = [Image.open(p) for p in paths]
    ims = [i.resize((int(i.width * h / i.height), h)) for i in ims]
    c = Image.new("RGB", (sum(i.width + 8 for i in ims), h), "white")
    x = 0
    for i in ims:
        c.paste(i, (x, 0)); x += i.width + 8
    c.save(out)
