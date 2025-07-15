// Smooth scroll functionality
// Remove the default smooth scroll functionality since we're using custom navigation
// document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function (e) {
//         e.preventDefault();
//         const target = document.querySelector(this.getAttribute('href'));
//         if (target) {
//             target.scrollIntoView({
//                 behavior: 'smooth'
//             });
//         }
//     });
// });

// Security notice toggle
const securityNotice = document.querySelector('.security-notice');
if (securityNotice) {
    securityNotice.addEventListener('click', function() {
        this.style.opacity = this.style.opacity === '0.5' ? '1' : '0.5';
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in animation to feature cards and sections
document.querySelectorAll('.feature-card, .section-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// Header scroll behavior
let lastScroll = 0;
const header = document.querySelector('header');
const scrollThreshold = 50;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Show/hide header based on scroll direction
    if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
        header.classList.add('header-hidden');
    } else {
        header.classList.remove('header-hidden');
    }
    
    lastScroll = currentScroll;
});

// Horizontal Scroll Handler
const main = document.querySelector('main');
const sections = Array.from(document.querySelectorAll('.fullscreen-section'));
const navDots = Array.from(document.querySelectorAll('.nav-dot'));
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
let currentSection = 0;
let touchStartY = 0;
let touchStartX = 0;

// Create a map of section IDs to their indices
const sectionIndices = {};
sections.forEach((section, index) => {
    sectionIndices[section.id] = index;
});

// Update section and navigation
function updateSection(index) {
    if (index < 0 || index >= sections.length) return;
    
    currentSection = index;
    
    // Update transform
    main.style.transform = `translateX(-${currentSection * 100}%)`;
    
    // Update active states for sections
    sections.forEach((section, i) => {
        section.classList.toggle('active', i === currentSection);
    });
    
    // Update active states for nav dots
    navDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSection);
    });
    
    // Update active states for nav links
    navLinks.forEach((link, i) => {
        link.classList.toggle('active', i === currentSection);
    });
    
    // Update URL hash without scrolling
    const sectionId = sections[currentSection].id;
    history.replaceState(null, null, `#${sectionId}`);
}

// Find section index by ID
function getSectionIndexById(id) {
    return sectionIndices[id] ?? -1;
}

// Navigation click handlers
let isNavigating = false;
let navigationTimeout;

function handleNavClick(e) {
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling
    
    if (isNavigating) return; // Prevent multiple clicks while navigating
    
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;
    
    const targetId = href.substring(1);
    const targetIndex = getSectionIndexById(targetId);
    
    if (targetIndex !== -1) {
        isNavigating = true;
        updateSection(targetIndex);
        
        // Clear any existing timeout
        if (navigationTimeout) {
            clearTimeout(navigationTimeout);
        }
        
        // Lock scrolling for a short period after navigation
        navigationTimeout = setTimeout(() => {
            isNavigating = false;
        }, 800); // Adjust this value if needed
    }
}

// Add click listeners
navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick, { passive: false });
});

navDots.forEach(dot => {
    dot.addEventListener('click', handleNavClick, { passive: false });
});

// Scroll handler with debounce
let scrollTimeout;
function handleScroll(event) {
    event.preventDefault();
    
    if (scrollTimeout || isNavigating) return; // Don't scroll while navigating
    
    scrollTimeout = setTimeout(() => {
        const delta = event.deltaY || event.detail || (-event.wheelDelta);
        
        if (Math.abs(delta) < 40) return; // Threshold for scroll sensitivity
        
        if (delta > 0 && currentSection < sections.length - 1) {
            updateSection(currentSection + 1);
        } else if (delta < 0 && currentSection > 0) {
            updateSection(currentSection - 1);
        }
        
        scrollTimeout = null;
    }, 50);
}

// Touch handlers
function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
}

function handleTouchMove(event) {
    const touchEndY = event.touches[0].clientY;
    const touchEndX = event.touches[0].clientX;
    
    const deltaY = touchStartY - touchEndY;
    const deltaX = touchStartX - touchEndX;
    
    // Check if scroll is more horizontal than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY)) return;
    
    if (Math.abs(deltaY) < 40) return; // Threshold for touch sensitivity
    
    if (deltaY > 0 && currentSection < sections.length - 1) {
        updateSection(currentSection + 1);
    } else if (deltaY < 0 && currentSection > 0) {
        updateSection(currentSection - 1);
    }
}

// Key handler
function handleKeydown(event) {
    if (event.key === 'ArrowDown' && currentSection < sections.length - 1) {
        updateSection(currentSection + 1);
    } else if (event.key === 'ArrowUp' && currentSection > 0) {
        updateSection(currentSection - 1);
    }
}

// Initialize section based on hash
function initializeSection() {
    const hash = window.location.hash;
    if (hash) {
        const targetIndex = getSectionIndexById(hash.substring(1));
        if (targetIndex !== -1) {
            updateSection(targetIndex);
        } else {
            updateSection(0);
        }
    } else {
        updateSection(0);
    }
}

// Event listeners
window.addEventListener('wheel', handleScroll, { passive: false });
window.addEventListener('touchstart', handleTouchStart, { passive: true });
window.addEventListener('touchmove', handleTouchMove, { passive: false });
window.addEventListener('keydown', handleKeydown);
window.addEventListener('load', initializeSection);

// Prevent default scroll behavior
window.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) >= 40) {
        e.preventDefault();
    }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    const deltaY = touchStartY - e.touches[0].clientY;
    if (Math.abs(deltaY) >= 40) {
        e.preventDefault();
    }
}, { passive: false });

// Bluetooth Mesh Animation
const canvas = document.getElementById('bluetoothCanvas');
const ctx = canvas.getContext('2d');

// Animation settings
let nodes = [];
const nodeCount = 35; // Increased number of nodes
const nodeSize = 4; // Increased dot size
const connectionDistance = 180; // Increased connection distance
const baseSpeed = 0.5;

// Initialize nodes
function initNodes() {
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speedX: (Math.random() - 0.5) * baseSpeed,
            speedY: (Math.random() - 0.5) * baseSpeed,
            connections: [],
            index: i,
            hue: Math.random() * 360
        });
    }
}

// Animation loop
function animate() {
    // Clear canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update node positions
    nodes.forEach(node => {
        node.x += node.speedX;
        node.y += node.speedY;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.speedX *= -1;
        if (node.y < 0 || node.y > canvas.height) node.speedY *= -1;

        // Keep within bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Clear previous connections
        node.connections = [];
    });

    // Find connections
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                nodes[i].connections.push(nodes[j]);
                nodes[j].connections.push(nodes[i]);
            }
        }
    }

    // Draw connections
    ctx.strokeStyle = '#00D100';
    ctx.lineWidth = 0.8; // Slightly thicker lines
    nodes.forEach(node => {
        node.connections.forEach(connectedNode => {
            const distance = Math.sqrt(
                Math.pow(node.x - connectedNode.x, 2) + 
                Math.pow(node.y - connectedNode.y, 2)
            );
            const opacity = 1 - (distance / connectionDistance);
            
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connectedNode.x, connectedNode.y);
            ctx.strokeStyle = `rgba(0, 206, 209, ${opacity * 0.4})`; // Slightly increased opacity
            ctx.stroke();
        });
    });

    // Draw nodes
    nodes.forEach(node => {
        // Draw glow effect
        const gradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, nodeSize * 2
        );
        gradient.addColorStop(0, 'rgba(0, 206, 209, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 206, 209, 0)');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = node.index % 2 === 0 ? '#00D100' : '#FF1493';
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

// Handle canvas resize
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    initNodes(); // Reinitialize nodes when canvas is resized
}

// Initialize canvas and start animation
window.addEventListener('load', () => {
    resizeCanvas();
    animate();
});

window.addEventListener('resize', () => {
    resizeCanvas();
}); 