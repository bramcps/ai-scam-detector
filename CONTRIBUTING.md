# Cara Berkontribusi

Terima kasih sudah mau bantu. Setiap pola baru berarti satu modus penipuan lagi yang bisa dikenali.

## Melaporkan pesan penipuan yang lolos

1. Buka [issue baru](https://github.com/bramcps/ai-scam-detector/issues/new).
2. Judul: `Modus: <nama singkat>`, misalnya `Modus: arisan online`.
3. Tempel isi pesannya. **Hapus nama, nomor HP, dan nomor rekening asli** terlebih dahulu.
4. Ceritakan singkat modusnya kalau tahu (pesan ini minta apa, ujungnya ke mana).

## Menambah pola sendiri

1. Fork repo ini, lalu buat branch baru.
2. Di `detector.js`, tambahkan objek baru ke array `RULES`:

   ```js
   {
       id: 'arisan-online',
       weight: 25,
       label: 'Arisan online',
       reason: 'Penjelasan singkat untuk pengguna, kenapa ini berbahaya.',
       test: t => /\b(arisan)\b/.test(t) && /\b(get|slot|bunga)\b/.test(t)
   }
   ```

   - `t` sudah dalam huruf kecil dan spasinya dirapikan.
   - `weight` adalah tambahan skor risiko. Skor ≥ 50 berarti **BAHAYA**, 25–49 **WASPADA**.
   - Usahakan pola butuh dua sinyal (misalnya topik + permintaan uang) supaya chat normal tidak ikut ditandai.

3. Tambahkan contoh pesan ke `tests/detector.test.js`: satu yang harus ketahuan, dan kalau bisa satu chat normal yang **tidak** boleh ketahuan.
4. Jalankan `node --test` dan pastikan semuanya lolos.
5. Kirim pull request.
