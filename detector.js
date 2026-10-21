// ===== SCAM DETECTOR ENGINE =====
// Rule-based scoring for Indonesian (and some English) scam messages.
// Runs fully in the browser; nothing is sent to a server.
// To add a new scam pattern, append an entry to RULES and add a test in tests/detector.test.js.

(function (root) {
    'use strict';

    const OFFICIAL_BRANDS = [
        'bri', 'bca', 'bni', 'mandiri', 'bsi', 'btn', 'cimb', 'danamon', 'permata', 'jago', 'seabank',
        'dana', 'ovo', 'gopay', 'shopeepay', 'linkaja', 'shopee', 'tokopedia', 'lazada', 'bukalapak',
        'pln', 'bpjs', 'djp', 'pajak', 'jne', 'jnt', 'sicepat', 'anteraja', 'posindonesia', 'polri',
        'telkomsel', 'indosat', 'xl', 'whatsapp', 'instagram', 'facebook'
    ];

    const SHORTENERS = [
        'bit.ly', 's.id', 'tinyurl.com', 'cutt.ly', 'rb.gy', 't.ly', 'shorturl.at', 'is.gd',
        'ow.ly', 'lnk.bio', 'linktr.ee', 'shope.ee', 'tiny.cc', 'v.gd'
    ];

    const RISKY_TLDS = [
        'xyz', 'top', 'click', 'site', 'online', 'info', 'live', 'icu', 'buzz', 'vip', 'shop',
        'store', 'cfd', 'sbs', 'monster', 'rest', 'lol', 'cyou', 'fun', 'link', 'web.id'
    ];

    // weight: how much the rule adds to the 0-100 risk score
    const RULES = [
        {
            id: 'otp',
            weight: 40,
            label: 'Minta kode OTP',
            reason: 'Pesan meminta kode OTP/verifikasi. Bank, e-wallet, dan marketplace tidak pernah meminta kode ini lewat chat.',
            test: t => /\b(kode\s*)?(otp|verifikasi|verification code)\b/.test(t) &&
                /\b(kirim|kirimkan|berikan|sebutkan|bagikan|kasih|infokan|beritahu|masukkan|send|share)\b/.test(t)
        },
        {
            id: 'apk',
            weight: 45,
            label: 'File APK',
            reason: 'Ada file atau aplikasi .APK. Modus "surat tilang", "undangan nikah", dan "resi paket" memakai APK untuk mencuri SMS dan m-banking.',
            test: t => /\.apk\b|\bapk\b|\bfile aplikasi\b/.test(t)
        },
        {
            id: 'sensitive-data',
            weight: 35,
            label: 'Minta data rahasia',
            reason: 'Pesan meminta data rahasia (PIN, password, CVV, nomor kartu, atau foto KTP).',
            test: t => /\b(pin|password|kata sandi|sandi|cvv|cvc|nomor kartu|no\.? kartu|masa berlaku kartu|foto ktp|selfie (dengan|sama) ktp|nama ibu kandung|mother'?s maiden)\b/.test(t)
        },
        {
            id: 'family-impersonation',
            weight: 35,
            label: 'Mengaku keluarga',
            reason: 'Mengaku keluarga dan memakai nomor baru. Telepon dulu nomor lama orang tersebut sebelum menuruti permintaannya.',
            test: t => (/\b(ini|aku|saya)\s+(mama|mamah|mami|ibu|bunda|papa|papah|ayah|bapak|kakak|kak|adik|om|tante)\b/.test(t) ||
                /\b(ma|mah|mam|pa|pah|bu|bun|kak|dek|nak)\b,?\s+(ini )?(aku|saya)\b/.test(t)) &&
                /\b(ganti nomor|nomor baru|no baru|hp (rusak|hilang|mati)|pinjam hp|kecelakaan|rumah sakit|kantor polisi|ditangkap)\b/.test(t)
        },
        {
            id: 'new-number',
            weight: 15,
            label: 'Nomor baru',
            reason: 'Pengirim mengaku ganti nomor. Pastikan dulu lewat nomor lama.',
            test: t => /\b(ganti nomor|nomor baru|no baru|nomor (lama|aku|saya) (hilang|mati|rusak))\b/.test(t)
        },
        {
            id: 'money-request',
            weight: 20,
            label: 'Minta transfer',
            reason: 'Ada permintaan transfer uang, isi pulsa, atau bayar biaya di muka.',
            test: t => /\b(transfer|tf|kirim(kan)? (uang|dana|saldo)|pinjam (uang|dulu|duit)|(isi|isiin|isikan|beliin|kirimin) pulsa|top ?up|biaya admin|biaya (pengiriman|pencairan|aktivasi|pajak)|bayar (dulu|di ?muka)|uang muka|deposit)\b/.test(t)
        },
        {
            id: 'prize',
            weight: 25,
            label: 'Hadiah / undian',
            reason: 'Mengaku kamu menang hadiah atau undian. Undian resmi tidak meminta biaya atau data rahasia.',
            test: t => /\b(undian|pemenang|anda (terpilih|menang|mendapatkan)|selamat (anda|kamu|nomor)|hadiah (utama|langsung|uang)|cek tunai|mobil hadiah|giveaway|you('ve| have)? won|winner|claim your prize)\b/.test(t)
        },
        {
            id: 'bank-fee-change',
            weight: 30,
            label: 'Perubahan tarif bank',
            reason: 'Modus "perubahan tarif transfer bank". Bank mengumumkan tarif di aplikasi atau situs resmi, bukan lewat link di chat.',
            test: t => /\b(perubahan tarif|tarif (transfer )?baru|tarif (rp\.?\s?)?150|rp\.?\s?150\.?000.{0,20}(per ?bulan|\/bulan|bulan))\b/.test(t)
        },
        {
            id: 'job-task',
            weight: 30,
            label: 'Kerja paruh waktu / tugas like',
            reason: 'Tawaran kerja paruh waktu dengan tugas like, follow, atau review berbayar. Ujungnya diminta deposit.',
            test: t => /\b(kerja paruh waktu|part ?time|kerja (dari|di) rumah|freelance)\b/.test(t) &&
                /\b(like|follow|subscribe|review|rating|komisi|gaji|per (hari|tugas)|harian)\b/.test(t)
        },
        {
            id: 'investment',
            weight: 30,
            label: 'Investasi untung pasti',
            reason: 'Menjanjikan keuntungan pasti atau sangat besar. Investasi legal tidak menjamin untung.',
            test: t => /\b(investasi|trading|robot trading|profit|keuntungan|cuan|return)\b/.test(t) &&
                /\b(pasti|dijamin|garansi|tanpa risiko|per ?hari|harian|\d{2,3}\s?%)\b/.test(t)
        },
        {
            id: 'loan',
            weight: 20,
            label: 'Pinjaman instan',
            reason: 'Tawaran pinjaman cepat tanpa jaminan. Cek dulu izinnya di situs OJK.',
            test: t => /\b(pinjaman|pinjol|dana tunai|kredit)\b/.test(t) &&
                /\b(cair|tanpa jaminan|tanpa bi ?checking|langsung|cepat|limit)\b/.test(t)
        },
        {
            id: 'wrong-transfer',
            weight: 25,
            label: 'Salah transfer',
            reason: 'Mengaku salah transfer dan minta uang dikembalikan. Hubungi bank kamu, jangan kirim balik sendiri.',
            test: t => /\b(salah transfer|salah kirim|kembalikan (dana|uang|saldo))\b/.test(t)
        },
        {
            id: 'package',
            weight: 15,
            label: 'Modus paket / resi',
            reason: 'Pesan soal paket atau resi yang menyuruh membuka file atau link.',
            test: t => /\b(paket|resi|kiriman|kurir)\b/.test(t) && /\b(lihat|cek|buka|klik|foto|file|unduh|download)\b/.test(t)
        },
        {
            id: 'account-threat',
            weight: 20,
            label: 'Ancaman blokir akun',
            reason: 'Mengancam akun akan diblokir atau dinonaktifkan supaya kamu panik.',
            test: t => /\b(diblokir|terblokir|dinonaktifkan|ditangguhkan|dibekukan|hangus|kedaluwarsa|suspended|blocked|deactivated)\b/.test(t)
        },
        {
            id: 'urgency',
            weight: 10,
            label: 'Mendesak',
            reason: 'Memakai kata-kata mendesak supaya kamu tidak sempat berpikir.',
            test: t => /\b(segera|secepatnya|sekarang juga|hari ini juga|batas waktu|1 ?x ?24 jam|dalam \d+ jam|terakhir hari ini|urgent|immediately|asap)\b/.test(t)
        },
        {
            id: 'click-link',
            weight: 10,
            label: 'Suruh klik link',
            reason: 'Menyuruh klik link atau login untuk "verifikasi" atau "update data".',
            test: t => /\b(klik (link|tautan|di ?sini)|kunjungi link|login (di|ke|melalui)|verifikasi akun|update data|perbarui data|click (here|the link))\b/.test(t)
        }
    ];

    function normalize(text) {
        return String(text || '')
            .toLowerCase()
            .replace(/[‘’]/g, "'")
            .replace(/[“”]/g, '"')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function extractUrls(text) {
        const re = /\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/gi;
        const found = text.match(re) || [];
        // ignore things like "rp.150.000" or plain decimals that look like domains
        return found.filter(u => /[a-z]/i.test(u.split('/')[0].replace(/\./g, '')) && !/^rp\./i.test(u));
    }

    function hostOf(url) {
        return url.replace(/^https?:\/\//i, '').split(/[\/?#]/)[0].toLowerCase();
    }

    function checkUrls(urls) {
        const hits = [];
        const hosts = urls.map(hostOf);

        if (hosts.some(h => SHORTENERS.includes(h))) {
            hits.push({
                id: 'short-link', weight: 20, label: 'Link pendek',
                reason: 'Ada link pendek (bit.ly, s.id, dll) yang menyembunyikan alamat aslinya.'
            });
        }

        if (hosts.some(h => RISKY_TLDS.some(tld => h.endsWith('.' + tld)))) {
            hits.push({
                id: 'risky-domain', weight: 20, label: 'Domain mencurigakan',
                reason: 'Link memakai domain murah yang sering dipakai situs palsu (.xyz, .top, .online, dll).'
            });
        }

        // brand name inside a host that isn't the brand's own domain, e.g. bri-tarif.com, bca.verifikasi-id.site
        const lookalike = hosts.find(h => {
            const parts = h.split('.');
            const secondLevel = ['co.id', 'go.id', 'ac.id', 'or.id', 'web.id', 'my.id', 'co.uk'];
            const registrable = parts.slice(secondLevel.includes(parts.slice(-2).join('.')) ? -3 : -2).join('.');
            return OFFICIAL_BRANDS.some(b => h.includes(b) && registrable !== b + '.co.id' &&
                registrable !== b + '.com' && registrable !== b + '.id' && !registrable.startsWith(b + '.'));
        });
        if (lookalike) {
            hits.push({
                id: 'lookalike-domain', weight: 30, label: 'Domain tiruan',
                reason: `Link "${lookalike}" memakai nama brand terkenal tapi bukan domain resminya.`
            });
        }

        if (urls.length && !hits.length) {
            hits.push({
                id: 'has-link', weight: 5, label: 'Ada link',
                reason: 'Pesan berisi link. Pastikan alamatnya benar sebelum dibuka.'
            });
        }

        return hits;
    }

    function analyzeMessage(rawText) {
        const text = normalize(rawText);
        if (!text) {
            return { score: 0, level: 'UNKNOWN', hits: [], urls: [] };
        }

        const hits = RULES.filter(rule => rule.test(text))
            .map(({ id, weight, label, reason }) => ({ id, weight, label, reason }));

        // family impersonation already covers "new number"
        if (hits.some(h => h.id === 'family-impersonation')) {
            const i = hits.findIndex(h => h.id === 'new-number');
            if (i !== -1) hits.splice(i, 1);
        }

        const urls = extractUrls(text);
        hits.push(...checkUrls(urls));

        const brand = OFFICIAL_BRANDS.find(b => new RegExp('\\b' + b + '\\b').test(text));
        const baseScore = hits.reduce((sum, h) => sum + h.weight, 0);
        if (brand && baseScore >= 20) {
            hits.push({
                id: 'brand-mention', weight: 10, label: 'Mengatasnamakan brand',
                reason: `Menyebut "${brand.toUpperCase()}" sambil meminta sesuatu. Cek lewat aplikasi atau call center resmi.`
            });
        }

        hits.sort((a, b) => b.weight - a.weight);
        const score = Math.min(100, hits.reduce((sum, h) => sum + h.weight, 0));
        const level = score >= 50 ? 'DANGER' : score >= 25 ? 'WARNING' : 'SAFE';

        return { score, level, hits, urls };
    }

    const api = { analyzeMessage, normalize, extractUrls, RULES };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        root.ScamDetector = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
