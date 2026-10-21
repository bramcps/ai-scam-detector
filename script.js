// ===== CYBERSHIELD NEXUS - SCAM DETECTOR UI =====

// Global variables
let particles = [];
let neuralNetwork = null;
let isAnalyzing = false;
let currentFile = null;
let lastResult = null;

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const mainContainer = document.querySelector('.main-container');
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const analysisContainer = document.getElementById('analysis-container');
const resultsContainer = document.getElementById('results-container');
const neuralNetworkContainer = document.getElementById('neural-network');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const threatText = document.getElementById('threat-text');
const threatIndicator = document.getElementById('threat-indicator');
const confidenceFill = document.getElementById('confidence-fill');
const confidenceText = document.getElementById('confidence-text');
const extractedTextContent = document.getElementById('extracted-text-content');
const analysisDetails = document.getElementById('analysis-details');
const resultsTimestamp = document.getElementById('results-timestamp');
const threatCircle = document.querySelector('.threat-circle');
const messageInput = document.getElementById('message-input');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize loading screen
    simulateLoading();
    
    // Initialize particle system
    initParticleSystem();
    
    // Initialize neural network visualization
    initNeuralNetwork();
    
    // Initialize event listeners
    initEventListeners();
    
    // List the scam patterns the detector knows
    renderScamTypes();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize cursor effects
    initCursorEffects();
    
    // Navigation will be updated based on scroll position
}

// ===== LOADING SCREEN =====
function simulateLoading() {
    const loadingSteps = [
        'Initializing Security Protocols...',
        'Loading AI Neural Networks...',
        'Establishing Secure Connections...',
        'Calibrating Threat Detection...',
        'System Ready'
    ];
    
    let currentStep = 0;
    const statusElement = document.querySelector('.loading-status');
    
    const updateLoading = () => {
        if (currentStep < loadingSteps.length) {
            statusElement.textContent = loadingSteps[currentStep];
            currentStep++;
            setTimeout(updateLoading, 250);
        } else {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    mainContainer.classList.add('loaded');
                    initHeroAnimations();
                }, 500);
            }, 300);
        }
    };
    
    updateLoading();
}

// ===== PARTICLE SYSTEM =====
function initParticleSystem() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const particlesBg = document.getElementById('particles-bg');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesBg.appendChild(canvas);
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = `rgba(0, 212, 255, ${this.opacity})`;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        particles.forEach((particle, i) => {
            particles.slice(i + 1).forEach(otherParticle => {
                const distance = Math.sqrt(
                    Math.pow(particle.x - otherParticle.x, 2) +
                    Math.pow(particle.y - otherParticle.y, 2)
                );
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 * (1 - distance / 100)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ===== NEURAL NETWORK VISUALIZATION =====
function initNeuralNetwork() {
    const layers = [4, 6, 6, 3]; // Input, hidden, hidden, output
    const nodeRadius = 8;
    const layerSpacing = 120;
    const nodeSpacing = 40;
    
    neuralNetwork = {
        layers: [],
        connections: [],
        activeNodes: new Set(),
        activeConnections: new Set()
    };
    
    // Create nodes
    layers.forEach((nodeCount, layerIndex) => {
        const layer = [];
        const layerX = layerIndex * layerSpacing + 50;
        const totalHeight = (nodeCount - 1) * nodeSpacing;
        const startY = (200 - totalHeight) / 2;
        
        for (let i = 0; i < nodeCount; i++) {
            const node = {
                x: layerX,
                y: startY + i * nodeSpacing,
                layer: layerIndex,
                index: i,
                active: false,
                pulse: 0
            };
            layer.push(node);
        }
        neuralNetwork.layers.push(layer);
    });
    
    // Create connections
    for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
        const currentLayer = neuralNetwork.layers[layerIndex];
        const nextLayer = neuralNetwork.layers[layerIndex + 1];
        
        currentLayer.forEach(fromNode => {
            nextLayer.forEach(toNode => {
                neuralNetwork.connections.push({
                    from: fromNode,
                    to: toNode,
                    active: false,
                    strength: Math.random()
                });
            });
        });
    }
    
    drawNeuralNetwork();
}

function drawNeuralNetwork() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 500;
    canvas.height = 200;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    neuralNetworkContainer.innerHTML = '';
    neuralNetworkContainer.appendChild(canvas);
    
    // Store animation function for external access
    neuralNetwork.animate = animate;
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections with enhanced effects
        neuralNetwork.connections.forEach(connection => {
            ctx.beginPath();
            ctx.moveTo(connection.from.x, connection.from.y);
            ctx.lineTo(connection.to.x, connection.to.y);
            
            if (connection.active) {
                const strength = connection.strength || 0.8;
                ctx.strokeStyle = `rgba(0, 212, 255, ${strength})`;
                ctx.lineWidth = 2 + strength;
                ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';
                ctx.shadowBlur = 5;
            } else {
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.1})`;
                ctx.lineWidth = 1;
                ctx.shadowBlur = 0;
            }
            
            ctx.stroke();
            ctx.shadowBlur = 0;
        });
        
        // Draw data particles
        if (window.dataParticles) {
            window.dataParticles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        }
        
        // Draw nodes with enhanced effects
        neuralNetwork.layers.forEach(layer => {
            layer.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
                
                if (node.active) {
                    const intensity = node.intensity || 0.8;
                    const pulseEffect = Math.sin(node.pulse || 0) * 0.2;
                    ctx.fillStyle = `rgba(0, 212, 255, ${intensity + pulseEffect})`;
                    ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
                    ctx.shadowBlur = 15;
                    
                    // Add outer glow
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${0.3 + pulseEffect})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.shadowBlur = 0;
                }
                
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

function activateNeuralNetwork() {
    // Enhanced neural network activation with data flow visualization
    const activationSequence = [
        { layer: 0, nodes: [0, 1, 2, 3], phase: 'input-processing' },
        { layer: 1, nodes: [0, 1, 2, 3, 4, 5], phase: 'feature-extraction' },
        { layer: 2, nodes: [0, 1, 2, 3, 4, 5], phase: 'pattern-recognition' },
        { layer: 3, nodes: [0, 1, 2], phase: 'classification' }
    ];
    
    // Add data particles for visualization
    const dataParticles = [];
    
    activationSequence.forEach((step, index) => {
        setTimeout(() => {
            // Update progress text with phase description
            const progressText = document.getElementById('progress-text');
            progressText.textContent = `${step.phase.charAt(0).toUpperCase() + step.phase.slice(1)}...`;
            
            // Create data flow particles
            if (index > 0) {
                const prevLayer = neuralNetwork.layers[index - 1];
                const currentLayer = neuralNetwork.layers[index];
                
                prevLayer.forEach((fromNode, i) => {
                    currentLayer.forEach((toNode, j) => {
                        // Create particle for each connection
                        for (let k = 0; k < 3; k++) {
                            setTimeout(() => {
                                const particle = {
                                    x: fromNode.x,
                                    y: fromNode.y,
                                    targetX: toNode.x,
                                    targetY: toNode.y,
                                    progress: 0,
                                    speed: 0.02 + Math.random() * 0.03,
                                    size: 2 + Math.random() * 3,
                                    color: `hsl(${180 + Math.random() * 60}, 100%, 70%)`
                                };
                                dataParticles.push(particle);
                            }, k * 100);
                        }
                    });
                });
            }
            
            // Activate nodes with enhanced effects
            step.nodes.forEach((nodeIndex, nodeOffset) => {
                setTimeout(() => {
                    const node = neuralNetwork.layers[step.layer][nodeIndex];
                    node.active = true;
                    node.pulse = 0;
                    node.intensity = 1;
                    
                    // Enhanced pulse animation
                    const pulseInterval = setInterval(() => {
                        node.pulse += 0.3;
                        node.intensity = 0.8 + Math.sin(node.pulse) * 0.4;
                        if (node.pulse > Math.PI * 2) {
                            node.pulse = 0;
                        }
                    }, 30);
                    
                    // Add ripple effect
                    createRippleEffect(node.x, node.y);
                    
                    setTimeout(() => {
                        clearInterval(pulseInterval);
                        node.active = false;
                        node.intensity = 0.3;
                    }, 3000);
                }, nodeOffset * 150);
            });
            
            // Activate connections with data flow
            neuralNetwork.connections.forEach(connection => {
                if (connection.from.layer === step.layer) {
                    connection.active = true;
                    connection.strength = 0.8 + Math.random() * 0.2;
                    setTimeout(() => {
                        connection.active = false;
                        connection.strength = 0.1;
                    }, 1500);
                }
            });
        }, index * 1200);
    });
    
    // Animate data particles
    function animateDataParticles() {
        dataParticles.forEach((particle, index) => {
            particle.progress += particle.speed;
            
            if (particle.progress >= 1) {
                dataParticles.splice(index, 1);
            } else {
                particle.x = particle.x + (particle.targetX - particle.x) * particle.speed;
                particle.y = particle.y + (particle.targetY - particle.y) * particle.speed;
            }
        });
    }
    
    // Store data particles globally for animation
    window.dataParticles = dataParticles;
    
    // Add particle animation to the main loop
    const originalAnimate = neuralNetwork.animate;
    neuralNetwork.animate = function() {
        originalAnimate();
        animateDataParticles();
    };
}

function createRippleEffect(x, y) {
    const canvas = neuralNetworkContainer.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    const ripple = {
        x: x,
        y: y,
        radius: 0,
        maxRadius: 30,
        opacity: 1,
        speed: 2
    };
    
    function animateRipple() {
        ripple.radius += ripple.speed;
        ripple.opacity = 1 - (ripple.radius / ripple.maxRadius);
        
        if (ripple.opacity > 0) {
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 212, 255, ${ripple.opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            requestAnimationFrame(animateRipple);
        }
    }
    
    animateRipple();
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // File upload
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // Pasted text
    document.getElementById('analyze-text-btn').addEventListener('click', handleTextSubmit);
    messageInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleTextSubmit();
    });
    
    // Action buttons
    document.getElementById('analyze-again').addEventListener('click', resetAnalysis);
    document.getElementById('export-results').addEventListener('click', exportResults);
    document.getElementById('share-results').addEventListener('click', shareResults);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Dropdown functionality
    document.querySelectorAll('.dropdown-link').forEach(link => {
        link.addEventListener('click', handleDropdownNavigation);
    });
    
    // Scroll animations
    window.addEventListener('scroll', handleScroll);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadZone.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Pilih file gambar (PNG/JPG)', 'error');
        return;
    }
    
    currentFile = file;
    startAnalysis({ file });
}

function handleTextSubmit() {
    const text = messageInput.value.trim();
    if (!text) {
        showNotification('Tempel dulu isi pesannya', 'error');
        return;
    }
    startAnalysis({ text });
}

// ===== ANALYSIS PROCESS =====
async function startAnalysis({ file, text }) {
    if (isAnalyzing) return;
    
    isAnalyzing = true;
    
    analysisContainer.style.display = 'block';
    resultsContainer.style.display = 'none';
    resultsContainer.classList.remove('show');
    analysisContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setProgress(5, 'Menyiapkan...');
    activateNeuralNetwork();
    
    try {
        if (file) {
            text = await readTextFromImage(file);
        }
        setProgress(90, 'Mencocokkan dengan pola penipuan...');
        const result = ScamDetector.analyzeMessage(text);
        setProgress(100, 'Selesai');
        setTimeout(() => completeAnalysis(text, result), 400);
    } catch (err) {
        console.error(err);
        isAnalyzing = false;
        analysisContainer.style.display = 'none';
        showNotification('Gagal membaca gambar. Coba tempel teksnya saja.', 'error');
    }
}

function setProgress(percent, label) {
    progressFill.style.width = percent + '%';
    progressText.textContent = label;
}

async function readTextFromImage(file) {
    if (typeof Tesseract === 'undefined') {
        throw new Error('Tesseract.js failed to load');
    }
    setProgress(10, 'Memuat mesin OCR...');
    const { data } = await Tesseract.recognize(file, 'ind+eng', {
        logger: m => {
            if (m.status === 'recognizing text') {
                setProgress(20 + Math.round(m.progress * 65), `Membaca teks dari gambar... ${Math.round(m.progress * 100)}%`);
            } else if (m.status && m.status.startsWith('loading')) {
                setProgress(15, 'Mengunduh data bahasa (sekali saja)...');
            }
        }
    });
    return data.text;
}

function completeAnalysis(text, result) {
    isAnalyzing = false;
    lastResult = { text, ...result };
    
    analysisContainer.style.display = 'none';
    displayResults(lastResult);
    
    resultsContainer.style.display = 'block';
    setTimeout(() => {
        resultsContainer.classList.add('show');
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

const LEVEL_LABELS = {
    DANGER: { text: 'BAHAYA', css: 'danger' },
    WARNING: { text: 'WASPADA', css: 'warning' },
    SAFE: { text: 'AMAN', css: 'safe' },
    UNKNOWN: { text: 'KOSONG', css: 'warning' }
};

function displayResults(results) {
    const level = LEVEL_LABELS[results.level];
    threatText.textContent = level.text;
    threatCircle.className = 'threat-circle ' + level.css;
    
    confidenceFill.style.width = results.score + '%';
    confidenceText.textContent = results.score + '/100';
    
    extractedTextContent.textContent = results.text.trim() || '(Tidak ada teks yang terbaca)';
    
    analysisDetails.innerHTML = '';
    if (results.level === 'UNKNOWN') {
        addDetail('Tidak ada teks', 'Gambar tidak berisi teks yang bisa dibaca. Coba screenshot yang lebih jelas, atau tempel teksnya.');
    } else if (!results.hits.length) {
        addDetail('Tidak ada pola penipuan', 'Pesan ini tidak cocok dengan pola penipuan yang dikenal. Tetap hati-hati kalau ada permintaan uang atau data.');
    } else {
        results.hits.forEach(hit => addDetail(hit.label, hit.reason));
    }
    
    resultsTimestamp.textContent = new Date().toLocaleString('id-ID');
}

function addDetail(label, reason) {
    const item = document.createElement('div');
    item.className = 'detail-item reason-item';
    const labelEl = document.createElement('span');
    labelEl.className = 'detail-value';
    labelEl.textContent = label;
    const reasonEl = document.createElement('span');
    reasonEl.className = 'detail-label';
    reasonEl.textContent = reason;
    item.append(labelEl, reasonEl);
    analysisDetails.appendChild(item);
}

function renderScamTypes() {
    const container = document.getElementById('scam-types');
    if (!container || typeof ScamDetector === 'undefined') return;
    ScamDetector.RULES.forEach(rule => {
        const card = document.createElement('div');
        card.className = 'scam-type-card';
        const title = document.createElement('h5');
        title.textContent = rule.label;
        const desc = document.createElement('p');
        desc.textContent = rule.reason;
        card.append(title, desc);
        container.appendChild(card);
    });
}

// ===== UTILITY FUNCTIONS =====
function resetAnalysis() {
    resultsContainer.classList.remove('show');
    setTimeout(() => {
        resultsContainer.style.display = 'none';
        analysisContainer.style.display = 'none';
        currentFile = null;
        fileInput.value = '';
        messageInput.value = '';
        document.getElementById('scanner').scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

function buildReportText() {
    const r = lastResult;
    const reasons = r.hits.map(h => `- ${h.label}: ${h.reason}`).join('\n') || '- Tidak ada pola penipuan yang dikenal';
    return `Hasil CyberShield Nexus: ${LEVEL_LABELS[r.level].text} (skor risiko ${r.score}/100)\n${reasons}\n\nCek pesanmu sendiri: ${window.location.href}`;
}

function exportResults() {
    if (!lastResult) return;
    const report = {
        timestamp: new Date().toISOString(),
        level: lastResult.level,
        riskScore: lastResult.score,
        reasons: lastResult.hits.map(h => ({ id: h.id, label: h.label, reason: h.reason })),
        urls: lastResult.urls,
        text: lastResult.text
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hasil-cek-penipuan.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Laporan diunduh', 'success');
}

function shareResults() {
    if (!lastResult) return;
    const text = buildReportText();
    if (navigator.share) {
        navigator.share({ title: 'Hasil cek pesan penipuan', text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Hasil disalin, tinggal tempel ke WA', 'success');
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'success' ? 'var(--cyber-green)' : type === 'error' ? 'var(--cyber-red)' : 'var(--cyber-blue)'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===== HERO ANIMATIONS =====
function initHeroAnimations() {
    // Animate stats
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const finalValue = stat.textContent;
        const isPercentage = finalValue.includes('%');
        const isTime = finalValue.includes('s');
        const isNumber = finalValue.includes('+') || finalValue.includes('M');
        
        let startValue = 0;
        let endValue = parseFloat(finalValue.replace(/[^\d.]/g, ''));
        
        if (isPercentage) {
            startValue = 0;
        } else if (isTime) {
            startValue = 0;
        } else if (isNumber) {
            startValue = 0;
        }
        
        animateNumber(stat, startValue, endValue, finalValue, 2000);
    });
}

function animateNumber(element, start, end, finalText, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * easeOutQuart(progress);
        
        if (finalText.includes('%')) {
            element.textContent = Math.round(current) + '%';
        } else if (finalText.includes('s')) {
            element.textContent = current.toFixed(1) + 's';
        } else if (finalText.includes('+')) {
            element.textContent = Math.round(current) + '+';
        } else if (finalText.includes('M')) {
            element.textContent = Math.round(current) + 'M+';
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

// ===== SMOOTH SCROLLING =====
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== CURSOR EFFECTS =====
function initCursorEffects() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: rgba(0, 212, 255, 0.5);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease;
        mix-blend-mode: difference;
    `;
    document.body.appendChild(cursor);
    
    const cursorTrail = document.createElement('div');
    cursorTrail.className = 'cursor-trail';
    cursorTrail.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: rgba(0, 212, 255, 0.3);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transition: all 0.3s ease;
    `;
    document.body.appendChild(cursorTrail);
    
    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX - 10 + 'px';
        cursor.style.top = mouseY - 10 + 'px';
    });
    
    function animateTrail() {
        trailX += (mouseX - trailX) * 0.1;
        trailY += (mouseY - trailY) * 0.1;
        
        cursorTrail.style.left = trailX - 5 + 'px';
        cursorTrail.style.top = trailY - 5 + 'px';
        
        requestAnimationFrame(animateTrail);
    }
    animateTrail();
    
    // Hide cursor on interactive elements
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        cursorTrail.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorTrail.style.opacity = '0';
    });
}

// ===== SCROLL ANIMATIONS =====
function handleScroll() {
    const scrolled = window.pageYOffset;
    const parallax = scrolled * 0.5;
    
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.transform = `translateY(${parallax}px)`;
    }
    
    // Animate elements on scroll
    const animatedElements = document.querySelectorAll('.result-card, .analytics-card, .feature-item');
    animatedElements.forEach(element => {
        const elementTop = element.offsetTop;
        const elementHeight = element.offsetHeight;
        const elementVisible = 150;
        
        if (scrolled > elementTop - window.innerHeight + elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
    
    // Update active navigation
    updateActiveNavigation();
}

// ===== NAVIGATION =====
function handleNavigation(e) {
    e.preventDefault();
    
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    e.target.classList.add('active');
    
    // Smooth scroll to section
    const targetId = e.target.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function handleDropdownNavigation(e) {
    e.preventDefault();
    
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to parent nav link
    const dropdownLink = e.target;
    const parentDropdown = dropdownLink.closest('.nav-dropdown');
    const parentNavLink = parentDropdown.querySelector('.nav-link');
    parentNavLink.classList.add('active');
    
    // Smooth scroll to section
    const targetId = parentNavLink.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Add click effect to dropdown item
    dropdownLink.style.transform = 'translateX(10px) scale(1.05)';
    setTimeout(() => {
        dropdownLink.style.transform = '';
    }, 200);
}

// Update active navigation based on scroll position
function updateActiveNavigation() {
    const sections = ['#scanner', '#patterns', '#about'];
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    const scrollPosition = window.scrollY + 100; // Offset for header
    
    sections.forEach(sectionId => {
        const section = document.querySelector(sectionId);
        if (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = sectionId;
            }
        }
    });
    
    // Update active state - only set active if we're actually in a section
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentSection && currentSection !== '') {
            link.classList.add('active');
        }
    });
    
    // Remove default behavior - no active state when at top of page
}

// ===== PERFORMANCE OPTIMIZATION =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll handler
const optimizedScrollHandler = debounce(handleScroll, 10);
window.addEventListener('scroll', optimizedScrollHandler);

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    showNotification('An error occurred. Please refresh the page.', 'error');
});

// ===== SERVICE WORKER REGISTRATION (FOR PWA) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ===== EXPORT FOR GLOBAL ACCESS =====
window.CyberShieldNexus = {
    resetAnalysis,
    exportResults,
    shareResults,
    showNotification
}; 