# aiselxnursel

Bu depo iki şeyi barındırır:

- **Web sitesi** (GitHub Pages, `main` dalından yayınlanır): `index.html`, `egitim.html`, `story/` (Instagram story kısa linki).
- **İçerik üretim kuralları**: `icerik-rehberi.md` (dil, yöntemler, story/reels/caption kuralları) ve `story_tasarim.py` (story görsel aracı).

## Story / içerik istekleri

Kullanıcı story, caption, carousel veya reels istediğinde (nasıl ifade ederse etsin: "story yap", "bugünün kanıtları", sadece ekran görüntüsü atmak vb.):

1. Önce `icerik-rehberi.md` dosyasını baştan sona oku ve kurallarına uy.
2. Yazmadan önce rehberdeki yöntem sorusu kuralını uygula (kullanıcı yöntemin adını söylediyse sorma).
3. Story görsellerini `story_tasarim.py` ile üret (`from story_tasarim import *`). Arka plan için kullanıcının fotoğrafı gerekir; yoksa iste.
4. Kişisel bilgileri rehberin 10. maddesine göre kapat.
5. Fotoğraflar, sosyal kanıtlar ve üretilen story görselleri depoya kaydedilmez; çalışma klasöründe üretilip kullanıcıya gönderilir.

Kullanıcı yeni bir genel kural söylerse (ör. "bundan sonra hep böyle olsun") hem `icerik-rehberi.md`'ye hem gerekiyorsa `story_tasarim.py` varsayılanlarına işle ve commit et.
