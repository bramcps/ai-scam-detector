// ===== CYBERSHIELD NEXUS - REVOLUTIONARY JAVASCRIPT =====

// Global variables
let particles = [];
let neuralNetwork = null;
let isAnalyzing = false;
let currentFile = null;

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
    
    // Initialize analytics charts
    initAnalyticsCharts();
    
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
            setTimeout(updateLoading, 800);
        } else {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    mainContainer.classList.add('loaded');
                    initHeroAnimations();
                }, 500);
            }, 1000);
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
        showNotification('Please select an image file', 'error');
        return;
    }
    
    currentFile = file;
    startAnalysis();
}

// ===== ANALYSIS PROCESS =====
function startAnalysis() {
    if (isAnalyzing) return;
    
    isAnalyzing = true;
    
    // Show analysis container
    analysisContainer.style.display = 'block';
    resultsContainer.style.display = 'none';
    
    // Reset progress
    progressFill.style.width = '0%';
    progressText.textContent = 'Initializing...';
    
    // Start neural network animation
    activateNeuralNetwork();
    
    // Enhanced analysis steps with detailed descriptions
    const analysisSteps = [
        { progress: 15, text: 'Initializing AI Engine...', phase: 'startup' },
        { progress: 30, text: 'Processing Image Data...', phase: 'input' },
        { progress: 45, text: 'Extracting Text Content...', phase: 'ocr' },
        { progress: 60, text: 'Analyzing Language Patterns...', phase: 'nlp' },
        { progress: 75, text: 'Running Neural Networks...', phase: 'ai' },
        { progress: 90, text: 'Cross-referencing Threat Database...', phase: 'threat' },
        { progress: 100, text: 'Generating Security Report...', phase: 'final' }
    ];
    
    let currentStep = 0;
    
    const updateProgress = () => {
        if (currentStep < analysisSteps.length) {
            const step = analysisSteps[currentStep];
            progressFill.style.width = step.progress + '%';
            progressText.textContent = step.text;
            currentStep++;
            setTimeout(updateProgress, 1000);
        } else {
            setTimeout(() => {
                completeAnalysis();
            }, 500);
        }
    };
    
    updateProgress();
}

function completeAnalysis() {
    isAnalyzing = false;
    
    // Hide analysis container
    analysisContainer.style.display = 'none';
    
    // Generate mock results
    const results = generateMockResults();
    
    // Display results
    displayResults(results);
    
    // Show results container
    resultsContainer.style.display = 'block';
    setTimeout(() => {
        resultsContainer.classList.add('show');
    }, 100);
}

function generateMockResults() {
    const isScam = Math.random() > 0.6;
    const confidence = Math.random() * 0.4 + 0.6; // 60-100%
    
    return {
        threatLevel: isScam ? 'SCAM' : 'SAFE',
        confidence: confidence,
        extractedText: generateMockText(),
        details: generateMockDetails(isScam)
    };
}

function generateMockText() {
    const texts = [
        "URGENT: Your account has been suspended. Click here to verify: bit.ly/suspicious-link",
        "Congratulations! You've won $1,000,000! Claim your prize now!",
        "Hi, this is your bank. We detected suspicious activity. Please call 1-800-FAKE-NUMBER",
        "Your package is ready for delivery. Track at: fake-tracking.com",
        "Free iPhone 15! Limited time offer. Click to claim your prize!"
    ];
    
    return texts[Math.floor(Math.random() * texts.length)];
}

function generateMockDetails(isScam) {
    const details = [
        { label: 'Suspicious Keywords', value: isScam ? 'High' : 'Low' },
        { label: 'URL Analysis', value: isScam ? 'Malicious' : 'Safe' },
        { label: 'Language Patterns', value: isScam ? 'Suspicious' : 'Normal' },
        { label: 'Sender Reputation', value: isScam ? 'Unknown' : 'Verified' },
        { label: 'Threat Score', value: isScam ? '85/100' : '12/100' }
    ];
    
    return details;
}

function displayResults(results) {
    // Update threat level
    threatText.textContent = results.threatLevel;
    threatIndicator.className = 'threat-indicator';
    
    if (results.threatLevel === 'SAFE') {
        threatIndicator.classList.add('safe');
    } else if (results.threatLevel === 'WARNING') {
        threatIndicator.classList.add('warning');
    } else {
        threatIndicator.classList.add('danger');
    }
    
    // Update confidence
    const confidencePercent = Math.round(results.confidence * 100);
    confidenceFill.style.width = confidencePercent + '%';
    confidenceText.textContent = confidencePercent + '%';
    
    // Update extracted text
    extractedTextContent.textContent = results.extractedText;
    
    // Update analysis details
    analysisDetails.innerHTML = '';
    results.details.forEach(detail => {
        const detailItem = document.createElement('div');
        detailItem.className = 'detail-item';
        detailItem.innerHTML = `
            <span class="detail-label">${detail.label}</span>
            <span class="detail-value">${detail.value}</span>
        `;
        analysisDetails.appendChild(detailItem);
    });
    
    // Update timestamp
    resultsTimestamp.textContent = new Date().toLocaleString();
}

// ===== UTILITY FUNCTIONS =====
function resetAnalysis() {
    resultsContainer.classList.remove('show');
    setTimeout(() => {
        resultsContainer.style.display = 'none';
        analysisContainer.style.display = 'none';
        currentFile = null;
        fileInput.value = '';
    }, 500);
}

function exportResults() {
    const results = {
        timestamp: new Date().toISOString(),
        threatLevel: threatText.textContent,
        confidence: confidenceText.textContent,
        extractedText: extractedTextContent.textContent
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cybershield-analysis.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Results exported successfully!', 'success');
}

function shareResults() {
    if (navigator.share) {
        navigator.share({
            title: 'CyberShield Analysis Results',
            text: `Threat Level: ${threatText.textContent} | Confidence: ${confidenceText.textContent}`,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        const text = `Threat Level: ${threatText.textContent}\nConfidence: ${confidenceText.textContent}\nExtracted Text: ${extractedTextContent.textContent}`;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Results copied to clipboard!', 'success');
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

// ===== ANALYTICS CHARTS =====
function initAnalyticsCharts() {
    // Threat Distribution Chart
    const threatCtx = document.getElementById('threat-chart').getContext('2d');
    new Chart(threatCtx, {
        type: 'doughnut',
        data: {
            labels: ['Safe', 'Suspicious', 'Scam'],
            datasets: [{
                data: [65, 20, 15],
                backgroundColor: [
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(255, 71, 87, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 255, 136, 1)',
                    'rgba(255, 215, 0, 1)',
                    'rgba(255, 71, 87, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            family: 'Rajdhani'
                        }
                    }
                }
            }
        }
    });
    
    // Response Time Chart
    const responseCtx = document.getElementById('response-chart').getContext('2d');
    new Chart(responseCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Average Response Time (s)',
                data: [2.1, 1.8, 2.3, 1.9, 2.0, 2.2, 1.7],
                borderColor: 'rgba(0, 212, 255, 1)',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            family: 'Rajdhani'
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    }
                }
            }
        }
    });
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
    const sections = ['#scanner', '#analytics', '#about'];
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