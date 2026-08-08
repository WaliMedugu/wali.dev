/* ==========================================================================
   WALI.DEV - Premium Interactive Scripts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initD3Graph();
    initBookingForm();
    initFooterWidgets();
    initComparisonSliders();
    initCustomCursor();
    initChipToggles();
});

/* ==========================================================================
   Three.js Particle Background — initialised immediately (not DOMContentLoaded)
   ========================================================================== */
(function initThreeBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // Warm palette matching Arguuu
    const colours = [0xC4724A, 0xC9B99E, 0xE8DDD0, 0xA85535, 0x5C3D2E];
    const particleCount = 110;
    const particles = [];

    const geo = new THREE.SphereGeometry(0.045, 6, 6);

    for (let i = 0; i < particleCount; i++) {
        const mat = new THREE.MeshBasicMaterial({
            color: colours[Math.floor(Math.random() * colours.length)],
            transparent: true,
            opacity: 0.25 + Math.random() * 0.35
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 14,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 4
        );
        mesh.userData.speed = 0.0008 + Math.random() * 0.0016;
        mesh.userData.sway = Math.random() * Math.PI * 2;
        mesh.userData.swayAmp = 0.001 + Math.random() * 0.002;
        scene.add(mesh);
        particles.push(mesh);
    }

    // Mouse parallax state
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    const isTouchDevice = window.matchMedia('(hover: none)').matches;

    // Mouse move (desktop)
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.8;
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 0.5;
    });

    // Touch reactivity (mobile/tablet)
    document.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        const tx = (t.clientX / window.innerWidth - 0.5);
        const ty = (t.clientY / window.innerHeight - 0.5);
        // Ripple: push particles near touch point
        particles.forEach(p => {
            const dx = p.position.x - tx * 14;
            const dy = p.position.y + ty * 10;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 2.5) {
                p.position.x += (dx / dist) * 0.04;
                p.position.y += (dy / dist) * 0.04;
            }
        });
    }, { passive: true });

    // Scroll parallax (mobile)
    let lastScrollY = window.scrollY;
    document.addEventListener('scroll', () => {
        const delta = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        targetY -= delta * 0.0008;
    }, { passive: true });

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.01;

        particles.forEach(p => {
            p.position.y += p.userData.speed;
            p.userData.sway += p.userData.swayAmp;
            p.position.x += Math.sin(p.userData.sway) * 0.001;

            // Wrap top to bottom
            if (p.position.y > 5.5) p.position.y = -5.5;
        });

        // Smooth camera parallax
        targetX += (mouseX - targetX) * 0.04;
        camera.position.x += (targetX - camera.position.x) * 0.06;
        camera.position.y += (targetY - camera.position.y) * 0.06;

        renderer.render(scene, camera);
    }
    animate();
})();

/* ==========================================================================
   Mobile Menu Toggle
   ========================================================================== */
function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }
}

/* ==========================================================================
   Custom Cursor (pointer devices only — CSS handles hiding on touch)
   ========================================================================== */
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursor-dot');
    if (!cursor || !dot) return;

    // Only activate on pointer/mouse devices
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let cx = -100, cy = -100, dx = -100, dy = -100;

    document.addEventListener('mousemove', (e) => {
        cx = e.clientX;
        cy = e.clientY;
        dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    });

    // Smooth ring follow
    function animateCursor() {
        dx += (cx - dx) * 0.12;
        dy += (cy - dy) * 0.12;
        cursor.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover state on interactive elements
    const interactives = document.querySelectorAll('a, button, label, input, textarea, select, [role="button"]');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        dot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        dot.style.opacity = '1';
    });
}

/* ==========================================================================
   Chip Toggle Form (book.html — multi-select What do you want)
   ========================================================================== */
function initChipToggles() {
    const chips = document.querySelectorAll('.chip-toggle');
    chips.forEach(chip => {
        const cb = chip.querySelector('input[type="checkbox"]');
        if (cb) {
            cb.addEventListener('change', () => {
                chip.classList.toggle('selected', cb.checked);
            });
        }
    });

    // Pre-fill from URL param ?type=pilot
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type === 'pilot') {
        const auditChip = document.querySelector('[data-chip="audit"]');
        if (auditChip) {
            auditChip.classList.add('selected');
            const cb = auditChip.querySelector('input');
            if (cb) cb.checked = true;
        }
    }
    if (type === 'full') {
        document.querySelectorAll('[data-chip="app"], [data-chip="website"]').forEach(c => {
            c.classList.add('selected');
            const cb = c.querySelector('input');
            if (cb) cb.checked = true;
        });
    }
}

/* ==========================================================================
   Interactive D3.js Directed Graph
   ========================================================================== */
function initD3Graph() {
    const container = document.getElementById('d3-graph-container');
    if (!container) return;

    container.innerHTML = '';

    const nodes = [
        { id: 'SAP ERP Sync', group: 'input' },
        { id: 'Oracle Inventory', group: 'input' },
        { id: 'IoT Telemetry Stream', group: 'input' },
        { id: 'Kafka Messaging Bus', group: 'core' },
        { id: 'Node.js Parser Worker', group: 'core' },
        { id: 'GraphQL API Router', group: 'api' },
        { id: 'REST Gateway Endpoints', group: 'api' },
        { id: 'Supabase Postgres DB', group: 'db' },
        { id: 'Redis Route Cache', group: 'db' },
        { id: 'S3 Document Vault', group: 'db' },
        { id: 'JWT Cognito Auth', group: 'db' },
        { id: 'D3.js Network Solver', group: 'visual' },
        { id: 'Interactive Map Overlay', group: 'visual' },
        { id: 'Operator Web Portal', group: 'client' },
        { id: 'Flutter Delivery App', group: 'client' },
        { id: 'Anomaly Log System', group: 'outcome' },
        { id: 'Dynamic Route Sync', group: 'outcome' },
        { id: 'Sentry Incident Tracker', group: 'outcome' }
    ];

    const links = [
        { source: 'SAP ERP Sync', target: 'Kafka Messaging Bus' },
        { source: 'Oracle Inventory', target: 'Kafka Messaging Bus' },
        { source: 'IoT Telemetry Stream', target: 'Kafka Messaging Bus' },
        { source: 'Kafka Messaging Bus', target: 'Node.js Parser Worker' },
        { source: 'Node.js Parser Worker', target: 'Supabase Postgres DB' },
        { source: 'Supabase Postgres DB', target: 'JWT Cognito Auth' },
        { source: 'Supabase Postgres DB', target: 'S3 Document Vault' },
        { source: 'Supabase Postgres DB', target: 'Redis Route Cache' },
        { source: 'Redis Route Cache', target: 'GraphQL API Router' },
        { source: 'Supabase Postgres DB', target: 'REST Gateway Endpoints' },
        { source: 'JWT Cognito Auth', target: 'Operator Web Portal' },
        { source: 'JWT Cognito Auth', target: 'Flutter Delivery App' },
        { source: 'GraphQL API Router', target: 'Operator Web Portal' },
        { source: 'REST Gateway Endpoints', target: 'Flutter Delivery App' },
        { source: 'Supabase Postgres DB', target: 'D3.js Network Solver' },
        { source: 'D3.js Network Solver', target: 'Interactive Map Overlay' },
        { source: 'Interactive Map Overlay', target: 'Operator Web Portal' },
        { source: 'Operator Web Portal', target: 'Anomaly Log System' },
        { source: 'Flutter Delivery App', target: 'Dynamic Route Sync' },
        { source: 'Anomaly Log System', target: 'Sentry Incident Tracker' },
        { source: 'Dynamic Route Sync', target: 'Sentry Incident Tracker' }
    ];

    // Updated to warm Arguuu palette
    const colors = {
        input: '#A85535',
        core: '#C4724A',
        client: '#7C5C8A',
        api: '#5C3D2E',
        db: '#3A7D44',
        visual: '#C9B99E',
        outcome: '#E8DDD0'
    };

    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select('#d3-graph-container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('style', 'cursor: grab;');

    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 80)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#C9B99E')
        .style('stroke', 'none');

    const g = svg.append('g');

    svg.call(d3.zoom()
        .scaleExtent([0.5, 2])
        .on('zoom', (event) => { g.attr('transform', event.transform); }));

    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(180))
        .force('charge', d3.forceManyBody().strength(-1200))
        .force('collision', d3.forceCollide().radius(80))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('x', d3.forceX(width / 2).strength(0.1))
        .force('y', d3.forceY(height / 2).strength(0.1));

    const link = g.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'graph-link')
        .attr('marker-end', 'url(#arrowhead)');

    const node = g.append('g')
        .selectAll('.node-group')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node-group')
        .style('cursor', 'pointer')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    node.append('rect')
        .attr('rx', 8).attr('ry', 8)
        .attr('x', -70).attr('y', -18)
        .attr('width', 140).attr('height', 36)
        .attr('fill', '#FDF9F4')
        .attr('stroke', d => colors[d.group] || '#C9B99E')
        .attr('stroke-width', 2)
        .attr('filter', 'drop-shadow(0 2px 4px rgba(42,31,23,0.06))');

    node.append('text')
        .attr('dy', 4)
        .attr('text-anchor', 'middle')
        .text(d => d.id)
        .attr('font-size', '9px')
        .attr('font-weight', '700')
        .attr('fill', '#3D2B1F');

    node.on('mouseover', function(event, d) {
        link.classed('active', l => l.source.id === d.id || l.target.id === d.id);
        link.style('stroke', l => (l.source.id === d.id || l.target.id === d.id) ? colors[d.group] : 'rgba(201,185,158,0.4)');
        link.style('stroke-width', l => (l.source.id === d.id || l.target.id === d.id) ? '2.5px' : '1px');
        d3.select(this).select('rect')
            .transition().duration(200)
            .attr('x', -75).attr('width', 150).attr('stroke-width', 3).attr('fill', '#FAF6F0');
    });

    node.on('mouseout', function() {
        link.classed('active', false);
        link.style('stroke', 'rgba(201,185,158,0.4)');
        link.style('stroke-width', '1.5px');
        d3.select(this).select('rect')
            .transition().duration(200)
            .attr('x', -70).attr('width', 140).attr('stroke-width', 2).attr('fill', '#FDF9F4');
    });

    simulation.on('tick', () => {
        link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
        svg.attr('style', 'cursor: grabbing;');
    }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
        svg.attr('style', 'cursor: grab;');
    }
}

/* ==========================================================================
   Booking Form Submission Handler (Multi-select chip version)
   ========================================================================== */
function initBookingForm() {
    const form = document.getElementById('booking-form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };

        // Read chip selections
        const selectedChips = [];
        document.querySelectorAll('.chip-toggle.selected').forEach(chip => {
            selectedChips.push(chip.dataset.chip || chip.textContent.trim());
        });
        const engagementType = selectedChips.length > 0
            ? selectedChips.join(', ')
            : getVal('form-engagement');

        const name = getVal('form-name');
        const email = getVal('form-email');
        const website = getVal('form-website');
        const details = getVal('form-details');

        if (!name || !email || !engagementType) {
            alert('Please fill out your name, email, and what you want.');
            return;
        }

        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        const payload = {
            access_key: "5a7950e4-2a36-43be-af49-0ea281ac81d2",
            name: name,
            email: email,
            website: website,
            subject: `New Lead from Wali.Dev - ${name}`,
            engagement_type: engagementType,
            message: details
        };

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(async (response) => {
            const json = await response.json();
            if (response.status === 200 && json.success) {
                // Cache locally as mock CRM backup
                const formData = { name, email, website, engagementType, details, timestamp: new Date().toISOString() };
                const currentSubmissions = JSON.parse(localStorage.getItem('wali_dev_leads') || '[]');
                currentSubmissions.push(formData);
                localStorage.setItem('wali_dev_leads', JSON.stringify(currentSubmissions));

                console.log('CRM API Success: Lead processed', json);
                window.location.href = 'thank-you.html';
            } else {
                console.error('Submission failed', json);
                alert(json.message || 'Something went wrong. Please try again.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Application';
                }
            }
        })
        .catch(error => {
            console.error('Error submitting form', error);
            alert('Form submission failed. Please check your network connection and try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Application';
            }
        });
    });
}

/* ==========================================================================
   Dynamic Footer Widgets Populator
   ========================================================================== */
function initFooterWidgets() {
    const widgetsArea = document.querySelector('.footer-widgets-area');
    if (!widgetsArea) return;

    widgetsArea.innerHTML = '';

    const technologies = [
        { name: 'Flutter App', color: '#0066FF' },
        { name: 'Supabase DB', color: '#10b981' },
        { name: 'Node.js Router', color: '#339933' },
        { name: 'GraphQL API', color: '#e10098' },
        { name: 'REST Gateway', color: '#3b82f6' },
        { name: 'D3.js Visuals', color: '#f59e0b' },
        { name: 'Firebase Auth', color: '#ffca28' },
        { name: 'S3 Asset Vault', color: '#C9B99E' },
        { name: 'CI/CD Pipeline', color: '#06b6d4' },
        { name: 'Docker Cluster', color: '#2496ed' },
        { name: 'Redis Cache', color: '#d82c20' },
        { name: 'Linear Tracker', color: '#5e6ad2' },
        { name: 'Git Repositories', color: '#f1502f' },
        { name: 'State Management', color: '#8b5cf6' },
        { name: 'Security Audit', color: '#10b981' },
        { name: 'Cloud Deployment', color: '#3D2B1F' },
        { name: 'JWT Auth Tokens', color: '#f43f5e' },
        { name: 'Sentry Monitoring', color: '#3b82f6' },
        { name: 'Incident Tracker', color: '#ef4444' },
        { name: 'Figma System Spec', color: '#a259ff' },
        { name: 'Stripe Checkout', color: '#635bff' },
        { name: 'Unit Testing OK', color: '#10b981' },
        { name: 'Kafka Queue Hub', color: '#3D2B1F' },
        { name: 'SAP Integration', color: '#0a6ed1' },
        { name: 'Oracle Connector', color: '#ea1c24' },
        { name: 'Telemetry Streams', color: '#f97316' },
        { name: 'Postgres SQL DB', color: '#336791' },
        { name: 'OAuth 2.0 Provider', color: '#475569' },
        { name: 'SSL Certificate', color: '#10b981' },
        { name: 'Webhook Gateway', color: '#8b5cf6' },
        { name: 'JSON Schema Sync', color: '#ec4899' },
        { name: 'Analytics Tracker', color: '#06b6d4' }
    ];

    const cols = 8, rows = 4;
    let index = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (index >= technologies.length) break;
            const tech = technologies[index];
            const badge = document.createElement('div');
            badge.className = 'floating-badge';

            const colWidth = 90 / cols;
            const rowHeight = 70 / rows;
            const left = 5 + (c * colWidth) + (Math.random() * 4 - 2);
            const top = 10 + (r * rowHeight) + (Math.random() * 6 - 3);

            badge.style.left = `${left}%`;
            badge.style.top = `${top}%`;
            badge.style.animationDelay = `-${Math.random() * 4}s`;

            badge.innerHTML = `
                <svg viewBox="0 0 8 8" width="8" height="8" fill="none" style="flex-shrink:0;">
                    <circle cx="4" cy="4" r="3" fill="${tech.color}"/>
                </svg>
                <span>${tech.name}</span>
            `;
            widgetsArea.appendChild(badge);
            index++;
        }
    }
}

/* ==========================================================================
   Before/After Slider Component
   ========================================================================== */
function initComparisonSliders() {
    const sliders = document.querySelectorAll('.comparison-container');
    sliders.forEach(slider => {
        const input = slider.querySelector('.slider-input');
        if (input) {
            const updateSlider = (value) => slider.style.setProperty('--clip-pos', `${value}%`);
            input.addEventListener('input', (e) => updateSlider(e.target.value));
            updateSlider(input.value);
        }
    });
}


/* ==========================================================================
   Mobile Menu Toggle
   ========================================================================== */
function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        // Close menu when clicking links
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }
}

/* ==========================================================================
   Interactive D3.js Directed Graph
   ========================================================================== */
function initD3Graph() {
    const container = document.getElementById('d3-graph-container');
    if (!container) return;

    // Clear loading text
    container.innerHTML = '';

    // Graph Data - Real Supply Chain Intelligence Client System
    const nodes = [
        // Inputs
        { id: 'SAP ERP Sync', group: 'input' },
        { id: 'Oracle Inventory', group: 'input' },
        { id: 'IoT Telemetry Stream', group: 'input' },
        
        // Processing Core
        { id: 'Kafka Messaging Bus', group: 'core' },
        { id: 'Node.js Parser Worker', group: 'core' },
        
        // API layer
        { id: 'GraphQL API Router', group: 'api' },
        { id: 'REST Gateway Endpoints', group: 'api' },
        
        // Databases / Storage
        { id: 'Supabase Postgres DB', group: 'db' },
        { id: 'Redis Route Cache', group: 'db' },
        { id: 'S3 Document Vault', group: 'db' },
        { id: 'JWT Cognito Auth', group: 'db' },
        
        // Visualization & Routing Engines
        { id: 'D3.js Network Solver', group: 'visual' },
        { id: 'Interactive Map Overlay', group: 'visual' },
        
        // Clients
        { id: 'Operator Web Portal', group: 'client' },
        { id: 'Flutter Delivery App', group: 'client' },
        
        // Outcomes
        { id: 'Anomaly Log System', group: 'outcome' },
        { id: 'Dynamic Route Sync', group: 'outcome' },
        { id: 'Sentry Incident Tracker', group: 'outcome' }
    ];

    const links = [
        { source: 'SAP ERP Sync', target: 'Kafka Messaging Bus' },
        { source: 'Oracle Inventory', target: 'Kafka Messaging Bus' },
        { source: 'IoT Telemetry Stream', target: 'Kafka Messaging Bus' },
        
        { source: 'Kafka Messaging Bus', target: 'Node.js Parser Worker' },
        { source: 'Node.js Parser Worker', target: 'Supabase Postgres DB' },
        
        { source: 'Supabase Postgres DB', target: 'JWT Cognito Auth' },
        { source: 'Supabase Postgres DB', target: 'S3 Document Vault' },
        { source: 'Supabase Postgres DB', target: 'Redis Route Cache' },
        
        { source: 'Redis Route Cache', target: 'GraphQL API Router' },
        { source: 'Supabase Postgres DB', target: 'REST Gateway Endpoints' },
        
        { source: 'JWT Cognito Auth', target: 'Operator Web Portal' },
        { source: 'JWT Cognito Auth', target: 'Flutter Delivery App' },
        
        { source: 'GraphQL API Router', target: 'Operator Web Portal' },
        { source: 'REST Gateway Endpoints', target: 'Flutter Delivery App' },
        
        { source: 'Supabase Postgres DB', target: 'D3.js Network Solver' },
        { source: 'D3.js Network Solver', target: 'Interactive Map Overlay' },
        { source: 'Interactive Map Overlay', target: 'Operator Web Portal' },
        
        { source: 'Operator Web Portal', target: 'Anomaly Log System' },
        { source: 'Flutter Delivery App', target: 'Dynamic Route Sync' },
        { source: 'Anomaly Log System', target: 'Sentry Incident Tracker' },
        { source: 'Dynamic Route Sync', target: 'Sentry Incident Tracker' }
    ];

    // Colors mapping to ChronoTask aesthetic
    const colors = {
        input: '#ef4444',     // Red
        core: '#0066FF',      // Blue (Accent)
        client: '#8b5cf6',    // Purple
        api: '#3b82f6',       // Light Blue
        db: '#10b981',        // Green
        visual: '#f59e0b',    // Orange/Yellow
        outcome: '#06b6d4'    // Cyan
    };

    // Container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create SVG
    const svg = d3.select('#d3-graph-container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('style', 'cursor: grab;');

    // Add marker for arrowheads
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 80) // positioning offset outside of rectangular node bounds (140px width / 2 = 70px)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#94a3b8')
        .style('stroke', 'none');

    // Create a group for all graph elements (supports zooming/panning)
    const g = svg.append('g');

    // Add Zoom behavior
    svg.call(d3.zoom()
        .scaleExtent([0.5, 2])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        }));

    // Setup force simulation with increased repulsion and explicit collision margins
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(180))
        .force('charge', d3.forceManyBody().strength(-1200))
        .force('collision', d3.forceCollide().radius(80))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('x', d3.forceX(width / 2).strength(0.1))
        .force('y', d3.forceY(height / 2).strength(0.1));

    // Render links
    const link = g.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'graph-link')
        .attr('marker-end', 'url(#arrowhead)');

    // Render nodes
    const node = g.append('g')
        .selectAll('.node-group')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node-group')
        .style('cursor', 'pointer')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    // Draw cards for nodes
    node.append('rect')
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('x', -70)
        .attr('y', -18)
        .attr('width', 140)
        .attr('height', 36)
        .attr('fill', '#ffffff')
        .attr('stroke', d => colors[d.group] || '#cbd5e1')
        .attr('stroke-width', 2)
        .attr('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.04))');

    // Text labels
    node.append('text')
        .attr('dy', 4)
        .attr('text-anchor', 'middle')
        .text(d => d.id)
        .attr('font-size', '9px')
        .attr('font-weight', '700')
        .attr('fill', '#1e293b');

    // Add interactivity: highlight paths on hover
    node.on('mouseover', function(event, d) {
        link.classed('active', l => l.source.id === d.id || l.target.id === d.id);
        link.style('stroke', l => (l.source.id === d.id || l.target.id === d.id) ? colors[d.group] : '#e2e8f0');
        link.style('stroke-width', l => (l.source.id === d.id || l.target.id === d.id) ? '2.5px' : '1px');
        
        d3.select(this).select('rect')
            .transition()
            .duration(200)
            .attr('x', -75)
            .attr('width', 150)
            .attr('stroke-width', 3)
            .attr('fill', '#f8fafc');
    });

    node.on('mouseout', function(event, d) {
        link.classed('active', false);
        link.style('stroke', '#e2e8f0');
        link.style('stroke-width', '1.5px');
        
        d3.select(this).select('rect')
            .transition()
            .duration(200)
            .attr('x', -70)
            .attr('width', 140)
            .attr('stroke-width', 2)
            .attr('fill', '#ffffff');
    });

    // Update positions on tick
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        svg.attr('style', 'cursor: grabbing;');
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        svg.attr('style', 'cursor: grab;');
    }
}



/* ==========================================================================
   Dynamic Footer Widgets Populator (Exactly 32 elements)
   ========================================================================== */
function initFooterWidgets() {
    const widgetsArea = document.querySelector('.footer-widgets-area');
    if (!widgetsArea) return;

    // Clear static widgets
    widgetsArea.innerHTML = '';

    const technologies = [
        { name: 'Flutter App', color: '#0066FF' },
        { name: 'Supabase DB', color: '#10b981' },
        { name: 'Node.js Router', color: '#339933' },
        { name: 'GraphQL API', color: '#e10098' },
        { name: 'REST Gateway', color: '#3b82f6' },
        { name: 'D3.js Visuals', color: '#f59e0b' },
        { name: 'Firebase Auth', color: '#ffca28' },
        { name: 'S3 Asset Vault', color: '#e2e8f0' },
        { name: 'CI/CD Pipeline', color: '#06b6d4' },
        { name: 'Docker Cluster', color: '#2496ed' },
        { name: 'Redis Cache', color: '#d82c20' },
        { name: 'Linear Tracker', color: '#5e6ad2' },
        { name: 'Git Repositories', color: '#f1502f' },
        { name: 'State Management', color: '#8b5cf6' },
        { name: 'Security Audit', color: '#10b981' },
        { name: 'Cloud Deployment', color: '#0f172a' },
        { name: 'JWT Auth Tokens', color: '#f43f5e' },
        { name: 'Sentry Monitoring', color: '#3b82f6' },
        { name: 'Incident Tracker', color: '#ef4444' },
        { name: 'Figma System Spec', color: '#a259ff' },
        { name: 'Stripe Checkout', color: '#635bff' },
        { name: 'Unit Testing OK', color: '#10b981' },
        { name: 'Kafka Queue Hub', color: '#0f172a' },
        { name: 'SAP Integration', color: '#0a6ed1' },
        { name: 'Oracle Connector', color: '#ea1c24' },
        { name: 'Telemetry Streams', color: '#f97316' },
        { name: 'Postgres SQL DB', color: '#336791' },
        { name: 'OAuth 2.0 Provider', color: '#475569' },
        { name: 'SSL Certificate', color: '#10b981' },
        { name: 'Webhook Gateway', color: '#8b5cf6' },
        { name: 'JSON Schema Sync', color: '#ec4899' },
        { name: 'Analytics Tracker', color: '#06b6d4' }
    ];

    const cols = 8;
    const rows = 4;
    let index = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (index >= technologies.length) break;

            const tech = technologies[index];
            const badge = document.createElement('div');
            badge.className = 'floating-badge';

            const colWidth = 90 / cols;
            const rowHeight = 70 / rows;

            const left = 5 + (c * colWidth) + (Math.random() * 4 - 2);
            const top = 10 + (r * rowHeight) + (Math.random() * 6 - 3);

            badge.style.left = `${left}%`;
            badge.style.top = `${top}%`;

            const delay = Math.random() * 4;
            badge.style.animationDelay = `-${delay}s`;

            badge.innerHTML = `
                <svg viewBox="0 0 8 8" width="8" height="8" fill="none" style="flex-shrink:0;">
                    <circle cx="4" cy="4" r="3" fill="${tech.color}"/>
                </svg>
                <span>${tech.name}</span>
            `;

            widgetsArea.appendChild(badge);
            index++;
        }
    }
}

/* ==========================================================================
   Before/After Slider Component Controller
   ========================================================================== */
function initComparisonSliders() {
    const sliders = document.querySelectorAll('.comparison-container');
    sliders.forEach(slider => {
        const input = slider.querySelector('.slider-input');
        const sideAfter = slider.querySelector('.side-after');

        if (input && sideAfter) {
            const updateSlider = (value) => {
                slider.style.setProperty('--clip-pos', `${value}%`);
            };

            input.addEventListener('input', (e) => {
                updateSlider(e.target.value);
            });

            // Set initial state
            updateSlider(input.value);
        }
    });
}
