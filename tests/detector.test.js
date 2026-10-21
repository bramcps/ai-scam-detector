// Run with: node --test
const test = require('node:test');
const assert = require('node:assert');
const { analyzeMessage } = require('../detector.js');

const dangerous = {
    'mama minta pulsa': 'Ma, ini aku. Ganti nomor, hp lama rusak. Tolong isiin pulsa 100rb dulu ya, nanti aku ganti.',
    'kurir apk': 'Selamat siang, paket anda tertahan. Silakan cek foto paket di file ini: Lihat_Foto_Paket.apk',
    'otp': 'Kami dari Shopee. Akun anda akan diblokir. Mohon kirimkan kode OTP yang masuk ke SMS anda segera.',
    'tarif bri': 'Nasabah BRI yth, mulai besok tarif transfer baru Rp 150.000/bulan. Jika tidak setuju isi form di bri-tarif-baru.xyz',
    'undian': 'SELAMAT! Nomor anda terpilih sebagai pemenang undian Rp 175 juta dari Telkomsel. Hubungi kami & transfer biaya admin Rp 500rb.',
    'kerja like': 'Halo kak, kami buka kerja paruh waktu dari rumah. Cukup like dan follow akun Instagram, gaji Rp 50rb per tugas. Daftar di bit.ly/kerjaharian',
    'investasi': 'Gabung robot trading kami, profit dijamin 30% per bulan tanpa risiko!',
    'salah transfer': 'Maaf kak tadi saya salah transfer 2jt ke rekening kakak, tolong kembalikan dana ke rekening ini ya.',
    'english phishing': 'URGENT: Your account has been suspended. Click here to verify your password: bit.ly/acc-verify'
};

const safe = {
    'chat biasa': 'Bro nanti malam jadi main futsal jam 8? Aku bawa bola.',
    'pengingat rapat': 'Besok rapat jam 9 di ruang 3 ya, jangan lupa bawa laptop.',
    'link resmi': 'Ini dokumentasi yang aku maksud: https://developer.mozilla.org/en-US/docs/Web',
    'harga': 'Harga nasi goreng Rp.15.000, es teh Rp.5.000'
};

for (const [name, msg] of Object.entries(dangerous)) {
    test(`flags as risky: ${name}`, () => {
        const r = analyzeMessage(msg);
        assert.ok(r.level === 'DANGER' || r.level === 'WARNING',
            `expected risky, got ${r.level} (${r.score}): ${r.hits.map(h => h.id).join(', ')}`);
        assert.ok(r.hits.length > 0);
    });
}

for (const [name, msg] of Object.entries(safe)) {
    test(`does not flag: ${name}`, () => {
        const r = analyzeMessage(msg);
        assert.strictEqual(r.level, 'SAFE', `got ${r.level} (${r.score}): ${r.hits.map(h => h.id).join(', ')}`);
    });
}

test('family impersonation with new number is DANGER', () => {
    const r = analyzeMessage('Ini mama nak, ganti nomor. Mama lagi di rumah sakit, tolong transfer 2jt sekarang juga.');
    assert.strictEqual(r.level, 'DANGER');
    assert.ok(r.hits.some(h => h.id === 'family-impersonation'));
    assert.ok(!r.hits.some(h => h.id === 'new-number'));
});

test('lookalike bank domain is detected', () => {
    const r = analyzeMessage('cek di bca-verifikasi.com');
    assert.ok(r.hits.some(h => h.id === 'lookalike-domain'));
});

test('official bank domain is not a lookalike', () => {
    const r = analyzeMessage('info lengkap di https://www.bca.co.id/id/informasi');
    assert.ok(!r.hits.some(h => h.id === 'lookalike-domain'));
});

test('empty text returns UNKNOWN', () => {
    assert.strictEqual(analyzeMessage('   ').level, 'UNKNOWN');
});
