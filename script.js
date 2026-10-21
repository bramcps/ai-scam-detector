// ===== CYBERSHIELD - UI =====
// Handles input (screenshot / pasted text), OCR, and rendering the detector result.

const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
const OCR_TIMEOUT_MS = 90000;

const EXAMPLES = [
    {
        label: 'Mama minta pulsa',
        icon: 'fa-user-group',
        text: 'Ma, ini aku. Ganti nomor, hp lama rusak. Tolong isiin pulsa 100rb dulu ya, nanti aku ganti. Penting banget.'
    },
    {
        label: 'Paket APK',
        icon: 'fa-box',
        text: 'Selamat siang, paket anda tertahan di gudang kami. Silakan cek foto paket di file berikut: Lihat_Foto_Paket.apk'
    },
    {
        label: 'Tarif bank',
        icon: 'fa-building-columns',
        text: 'Nasabah BRI yth, mulai besok tarif transfer baru Rp 150.000/bulan. Jika tidak setuju segera isi form di bri-tarif-baru.xyz'
    },
    {
        label: 'Chat biasa',
        icon: 'fa-comment',
        text: 'Bro nanti malam jadi main futsal jam 8? Aku bawa bola, kamu bawa rompi ya.'
    }
];

const RULE_ICONS = {
    'otp': 'fa-key',
    'apk': 'fa-mobile-screen-button',
    'sensitive-data': 'fa-id-card',
    'family-impersonation': 'fa-user-group',
    'new-number': 'fa-sim-card',
    'money-request': 'fa-money-bill-transfer',
    'prize': 'fa-gift',
    'bank-fee-change': 'fa-building-columns',
    'job-task': 'fa-briefcase',
    'investment': 'fa-chart-line',
    'loan': 'fa-hand-holding-dollar',
    'wrong-transfer': 'fa-right-left',
    'package': 'fa-box',
    'account-threat': 'fa-ban',
    'urgency': 'fa-stopwatch',
    'click-link': 'fa-arrow-pointer',
    'short-link': 'fa-link',
    'risky-domain': 'fa-globe',
    'lookalike-domain': 'fa-masks-theater',
    'has-link': 'fa-link',
    'brand-mention': 'fa-copyright'
};

const LEVELS = {
    DANGER: {
        label: 'BAHAYA',
        css: 'is-danger',
        icon: 'fa-triangle-exclamation',
        sub: 'Sangat mirip modus penipuan. Jangan transfer atau kirim data apa pun.',
        advice: ['Jangan klik link, jangan buka file, dan jangan balas dengan data pribadi.',
            'Kalau mengaku keluarga atau teman, telepon nomor lama mereka.',
            'Blokir dan laporkan nomornya di WhatsApp.']
    },
    WARNING: {
        label: 'WASPADA',
        css: 'is-warning',
        icon: 'fa-circle-exclamation',
        sub: 'Ada tanda-tanda mencurigakan. Pastikan dulu sebelum menuruti.',
        advice: ['Cek kebenarannya lewat aplikasi atau call center resmi, bukan dari nomor di pesan ini.',
            'Jangan terburu-buru, penipu sengaja membuat kamu panik.']
    },
    SAFE: {
        label: 'AMAN',
        css: 'is-safe',
        icon: 'fa-shield-halved',
        sub: 'Tidak ditemukan pola penipuan yang dikenal.',
        advice: ['Tetap hati-hati kalau nanti ada permintaan uang, kode OTP, atau data pribadi.']
    },
    UNKNOWN: {
        label: 'KOSONG',
        css: 'is-warning',
        icon: 'fa-question',
        sub: 'Tidak ada teks yang bisa dibaca.',
        advice: ['Coba screenshot yang lebih jelas dan tidak terpotong, atau tempel teksnya langsung.']
    }
};

const $ = id => document.getElementById(id);
const iconSvg = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name.replace('fa-', '')}"></use></svg>`;

const views = { input: $('input-view'), progress: $('progress-view'), result: $('result-view') };
const fileInput = $('file-input');
const dropzone = $('dropzone');
const messageInput = $('message-input');
const progressText = $('progress-text');
const progressFill = $('progress-fill');

let isAnalyzing = false;
let lastResult = null;
let tesseractLoading = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initDropzone();
    renderExamples();
    renderScamTypes();

    $('analyze-text-btn').addEventListener('click', handleTextSubmit);
    messageInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleTextSubmit();
    });
    $('analyze-again').addEventListener('click', resetChecker);
    $('copy-result').addEventListener('click', copyResult);

    // paste a screenshot straight from the clipboard
    document.addEventListener('paste', e => {
        if (isAnalyzing || !views.input.offsetParent) return;
        const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
        if (item) {
            e.preventDefault();
            handleFile(item.getAsFile());
        }
    });
});

// ===== TABS =====
function initTabs() {
    const tabs = [$('tab-image'), $('tab-text')];
    const select = tab => {
        tabs.forEach(t => {
            const active = t === tab;
            t.classList.toggle('is-active', active);
            t.setAttribute('aria-selected', active);
            t.tabIndex = active ? 0 : -1;
            $(t.getAttribute('aria-controls')).hidden = !active;
        });
    };
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', e => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
            select(next);
            next.focus();
        });
    });
    initTabs.select = select;
}

// ===== FILE INPUT =====
function initDropzone() {
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });
    ['dragenter', 'dragover'].forEach(type => dropzone.addEventListener(type, e => {
        e.preventDefault();
        dropzone.classList.add('is-dragover');
    }));
    ['dragleave', 'drop'].forEach(type => dropzone.addEventListener(type, () => {
        dropzone.classList.remove('is-dragover');
    }));
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });
}

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('Pilih file gambar (PNG atau JPG)', true);
        return;
    }
    startAnalysis({ file });
}

function handleTextSubmit() {
    const text = messageInput.value.trim();
    if (!text) {
        showToast('Tempel dulu isi pesannya', true);
        messageInput.focus();
        return;
    }
    startAnalysis({ text });
}

// ===== ANALYSIS =====
async function startAnalysis({ file, text }) {
    if (isAnalyzing) return;
    isAnalyzing = true;

    const preview = $('scan-preview');
    preview.hidden = !file;
    $('spinner').hidden = Boolean(file);
    if (file) $('preview-img').src = URL.createObjectURL(file);

    showView('progress');
    setProgress(5, 'Menyiapkan...');

    try {
        if (file) text = await readTextFromImage(file);
        setProgress(95, 'Mencocokkan dengan pola penipuan...');
        const result = ScamDetector.analyzeMessage(text);
        // short pause so the result doesn't flash in for pasted text
        await new Promise(r => setTimeout(r, file ? 150 : 450));
        lastResult = { text: text || '', ...result };
        renderResult(lastResult);
        showView('result');
    } catch (err) {
        console.error(err);
        showView('input');
        initTabs.select($('tab-text'));
        showToast('Gagal membaca gambar. Cek koneksi, atau tempel teksnya saja.', true);
    } finally {
        isAnalyzing = false;
        if (file) URL.revokeObjectURL($('preview-img').src);
    }
}

function loadTesseract() {
    if (window.Tesseract) return Promise.resolve();
    tesseractLoading = tesseractLoading || new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = TESSERACT_URL;
        s.onload = resolve;
        s.onerror = () => {
            tesseractLoading = null;
            reject(new Error('Tesseract.js failed to load'));
        };
        document.head.appendChild(s);
    });
    return tesseractLoading;
}

async function readTextFromImage(file) {
    setProgress(10, 'Memuat pembaca teks...');
    await loadTesseract();
    // Tesseract never rejects when the language data can't be downloaded, so give up after a while
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('OCR timed out')), OCR_TIMEOUT_MS));
    const { data } = await Promise.race([timeout, Tesseract.recognize(file, 'ind+eng', {
        logger: m => {
            if (m.status === 'recognizing text') {
                setProgress(25 + Math.round(m.progress * 65), `Membaca teks... ${Math.round(m.progress * 100)}%`);
            } else if (m.status && m.status.startsWith('loading')) {
                setProgress(18, 'Mengunduh data bahasa (sekali saja)...');
            }
        }
    })]);
    return data.text;
}

function setProgress(percent, label) {
    progressFill.style.width = percent + '%';
    progressText.textContent = label;
}

// ===== RENDER =====
function showView(name) {
    Object.entries(views).forEach(([key, el]) => { el.hidden = key !== name; });
    const checker = $('checker');
    if (checker.getBoundingClientRect().top < 0 || name === 'result') {
        checker.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderResult(result) {
    const level = LEVELS[result.level];

    const verdict = $('verdict');
    verdict.className = 'verdict ' + level.css;
    $('verdict-icon').setAttribute('href', '#i-' + level.icon.replace('fa-', ''));
    $('verdict-label').textContent = level.label;
    $('verdict-sub').textContent = level.sub;

    $('gauge-number').textContent = result.score;
    $('gauge').setAttribute('aria-label', `Skor risiko ${result.score} dari 100`);
    const gaugeValue = $('gauge-value');
    gaugeValue.style.strokeDasharray = '0 100';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        gaugeValue.style.strokeDasharray = `${result.score} 100`;
    }));

    const reasons = $('reasons');
    reasons.replaceChildren();
    if (result.hits.length) {
        result.hits.forEach(hit => reasons.appendChild(
            reasonItem(RULE_ICONS[hit.id] || 'fa-flag', hit.label, hit.reason, hit.weight >= 25 ? '' : 'is-mid')
        ));
    } else if (result.level === 'UNKNOWN') {
        reasons.appendChild(reasonItem('fa-image', 'Teks tidak terbaca', 'Gambar terlalu buram, terlalu kecil, atau tidak berisi tulisan.', 'is-mid'));
    } else {
        reasons.appendChild(reasonItem('fa-check', 'Tidak ada pola penipuan', 'Pesan ini tidak cocok dengan modus yang dikenali.', 'is-ok'));
    }

    const advice = $('advice');
    advice.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = 'Yang sebaiknya kamu lakukan';
    const list = document.createElement('ul');
    level.advice.forEach(a => {
        const li = document.createElement('li');
        li.textContent = a;
        list.appendChild(li);
    });
    advice.append(title, list);

    $('extracted-text').textContent = result.text.trim() || '(Tidak ada teks yang terbaca)';
    $('share-wa').href = 'https://wa.me/?text=' + encodeURIComponent(buildShareText());
}

function reasonItem(icon, title, desc, modifier) {
    const li = document.createElement('li');
    li.className = 'reason ' + modifier;
    const iconEl = document.createElement('span');
    iconEl.className = 'reason-icon';
    iconEl.innerHTML = iconSvg(icon);
    const body = document.createElement('div');
    const t = document.createElement('div');
    t.className = 'reason-title';
    t.textContent = title;
    const d = document.createElement('div');
    d.className = 'reason-desc';
    d.textContent = desc;
    body.append(t, d);
    li.append(iconEl, body);
    return li;
}

function renderExamples() {
    const container = $('example-chips');
    EXAMPLES.forEach(ex => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.innerHTML = iconSvg(ex.icon);
        chip.append(ex.label);
        chip.addEventListener('click', () => {
            initTabs.select($('tab-text'));
            messageInput.value = ex.text;
            startAnalysis({ text: ex.text });
        });
        container.appendChild(chip);
    });
}

function renderScamTypes() {
    const container = $('scam-types');
    ScamDetector.RULES.forEach(rule => {
        const card = document.createElement('article');
        card.className = 'modus-card card';
        const icon = document.createElement('span');
        icon.className = 'modus-icon';
        icon.innerHTML = iconSvg(RULE_ICONS[rule.id] || 'fa-flag');
        const body = document.createElement('div');
        const h = document.createElement('h3');
        h.textContent = rule.label;
        const p = document.createElement('p');
        p.textContent = rule.reason;
        body.append(h, p);
        card.append(icon, body);
        container.appendChild(card);
    });
}

// ===== ACTIONS =====
function resetChecker() {
    fileInput.value = '';
    messageInput.value = '';
    lastResult = null;
    showView('input');
}

function buildShareText() {
    const r = lastResult;
    const level = LEVELS[r.level];
    const reasons = r.hits.slice(0, 4).map(h => `- ${h.label}`).join('\n');
    return `Hasil cek pesan: ${level.label} (skor risiko ${r.score}/100)\n${reasons ? reasons + '\n' : ''}\nCek pesan mencurigakan di sini: ${location.origin}${location.pathname}`;
}

function copyResult() {
    if (!lastResult) return;
    navigator.clipboard.writeText(buildShareText())
        .then(() => showToast('Hasil disalin'))
        .catch(() => showToast('Gagal menyalin', true));
}

let toastTimer;
function showToast(message, isError = false) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.toggle('is-error', isError);
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}
