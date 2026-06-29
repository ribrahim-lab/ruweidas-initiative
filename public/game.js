(function() {
    // 1. Inject Styles
    const styles = `
        #voyager-wrapper {
            position: relative;
            width: 800px;
            height: 600px;
            background-color: #050811;
            border: 2px solid #C5A059;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(197, 160, 89, 0.15);
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
            user-select: none;
            margin: 0 auto;
        }

        #voyager-canvas {
            display: block;
            width: 100%;
            height: 100%;
        }

        .voyager-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(8, 12, 26, 0.95);
            backdrop-filter: blur(6px);
            padding: 30px 40px;
            text-align: center;
            color: #E2E8F0;
            z-index: 10;
            box-sizing: border-box;
            transition: opacity 0.3s ease;
        }

        .voyager-overlay.hidden {
            display: none !important;
            opacity: 0;
            pointer-events: none;
        }

        .voyager-title {
            font-size: 2.2rem;
            font-weight: 800;
            color: #C5A059;
            margin-bottom: 15px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            text-shadow: 0 0 15px rgba(197, 160, 89, 0.4);
        }

        .voyager-text {
            font-size: 0.95rem;
            line-height: 1.6;
            color: #CBD5E1;
            max-width: 680px;
            margin-bottom: 25px;
            white-space: pre-line;
            text-align: center;
        }

        .voyager-btn {
            font-family: inherit;
            padding: 12px 28px;
            font-size: 1.05rem;
            font-weight: 700;
            border: 2px solid #C5A059;
            border-radius: 8px;
            background-color: transparent;
            color: #C5A059;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(197, 160, 89, 0.1);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .voyager-btn:hover {
            background-color: #C5A059;
            color: #050811;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(197, 160, 89, 0.35);
        }

        .voyager-btn:active {
            transform: translateY(0);
        }

        .alien-container {
            margin: 15px 0;
            display: flex;
            justify-content: center;
            align-items: center;
            filter: drop-shadow(0 0 10px rgba(46, 204, 113, 0.3));
            animation: alienFloat 3s ease-in-out infinite;
        }

        @keyframes alienFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(2deg); }
        }
    `;

    // Inject CSS
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // 2. Constants & Star Coordinates (Scaled and Centered for 800x600 Viewport)
    const CONSTELLATIONS = [
        {
            name: "Aries",
            stars: [
                { x: 220, y: 350 },
                { x: 340, y: 250 },
                { x: 480, y: 280 },
                { x: 580, y: 340 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 3]
            ]
        },
        {
            name: "Taurus",
            stars: [
                { x: 420, y: 280 }, // Aldebaran
                { x: 480, y: 240 },
                { x: 510, y: 190 },
                { x: 450, y: 170 },
                { x: 400, y: 210 },
                { x: 620, y: 110 }, // Horn 1
                { x: 570, y: 90 },  // Horn 2
                { x: 280, y: 260 }, // Body
                { x: 310, y: 330 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
                [2, 5], [3, 6], [4, 7], [0, 8], [7, 8]
            ]
        },
        {
            name: "Gemini",
            stars: [
                { x: 250, y: 200 }, // Castor head
                { x: 300, y: 270 },
                { x: 350, y: 350 },
                { x: 370, y: 450 }, // Castor feet
                { x: 230, y: 290 }, // Castor hand
                { x: 400, y: 170 }, // Pollux head
                { x: 450, y: 240 },
                { x: 500, y: 320 },
                { x: 520, y: 420 }, // Pollux feet
                { x: 550, y: 260 }  // Pollux hand
            ],
            edges: [
                [0, 1], [1, 2], [2, 3], [1, 4],
                [5, 6], [6, 7], [7, 8], [6, 9],
                [0, 5], [2, 7]
            ]
        },
        {
            name: "Cancer",
            stars: [
                { x: 400, y: 300 }, // Center
                { x: 400, y: 220 }, // Fork split
                { x: 320, y: 150 }, // Left tip
                { x: 480, y: 150 }, // Right tip
                { x: 400, y: 420 }  // Bottom tail
            ],
            edges: [
                [0, 1], [1, 2], [1, 3], [0, 4]
            ]
        },
        {
            name: "Leo",
            stars: [
                { x: 580, y: 380 }, // Denebola
                { x: 480, y: 410 },
                { x: 420, y: 330 }, // Regulus
                { x: 440, y: 230 },
                { x: 500, y: 190 },
                { x: 540, y: 230 },
                { x: 520, y: 280 },
                { x: 520, y: 350 },
                { x: 620, y: 310 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 2], [1, 7], [7, 8], [8, 0]
            ]
        },
        {
            name: "Virgo",
            stars: [
                { x: 420, y: 320 }, // Spica
                { x: 320, y: 300 },
                { x: 270, y: 240 },
                { x: 220, y: 260 },
                { x: 370, y: 400 },
                { x: 470, y: 400 },
                { x: 520, y: 340 },
                { x: 500, y: 240 },
                { x: 440, y: 200 },
                { x: 340, y: 200 },
                { x: 400, y: 260 },
                { x: 540, y: 170 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 1], [7, 11]
            ]
        },
        {
            name: "Libra",
            stars: [
                { x: 400, y: 180 }, // Top
                { x: 300, y: 280 }, // Left
                { x: 500, y: 260 }, // Right
                { x: 400, y: 360 }, // Bottom
                { x: 250, y: 400 }, // Left scale pan
                { x: 550, y: 380 }  // Right scale pan
            ],
            edges: [
                [0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [2, 5]
            ]
        },
        {
            name: "Scorpio",
            stars: [
                { x: 420, y: 200 }, // Antares
                { x: 370, y: 170 },
                { x: 340, y: 210 },
                { x: 400, y: 140 },
                { x: 450, y: 260 },
                { x: 470, y: 330 },
                { x: 450, y: 400 },
                { x: 400, y: 450 },
                { x: 340, y: 440 },
                { x: 300, y: 400 },
                { x: 280, y: 340 },
                { x: 310, y: 300 }
            ],
            edges: [
                [0, 1], [1, 2], [0, 3], [0, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11]
            ]
        },
        {
            name: "Sagittarius",
            stars: [
                { x: 320, y: 370 },
                { x: 400, y: 320 },
                { x: 460, y: 380 },
                { x: 360, y: 440 },
                { x: 360, y: 270 },
                { x: 440, y: 240 },
                { x: 500, y: 300 },
                { x: 540, y: 360 },
                { x: 500, y: 440 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 2], [6, 2]
            ]
        },
        {
            name: "Capricorn",
            stars: [
                { x: 270, y: 220 },
                { x: 340, y: 200 },
                { x: 470, y: 240 },
                { x: 570, y: 300 },
                { x: 520, y: 400 },
                { x: 420, y: 420 },
                { x: 320, y: 370 },
                { x: 250, y: 300 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [1, 6]
            ]
        },
        {
            name: "Aquarius",
            stars: [
                { x: 420, y: 270 },
                { x: 370, y: 240 },
                { x: 320, y: 280 },
                { x: 270, y: 220 },
                { x: 300, y: 170 },
                { x: 470, y: 300 },
                { x: 520, y: 370 },
                { x: 600, y: 400 },
                { x: 480, y: 400 },
                { x: 400, y: 440 },
                { x: 340, y: 480 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [5, 8], [8, 9], [9, 10]
            ]
        },
        {
            name: "Pisces",
            stars: [
                { x: 420, y: 420 }, // Apex
                { x: 470, y: 360 }, // Line 1
                { x: 520, y: 300 },
                { x: 540, y: 220 },
                { x: 570, y: 190 }, // Loop 1
                { x: 600, y: 220 },
                { x: 570, y: 250 },
                { x: 350, y: 390 }, // Line 2
                { x: 280, y: 360 },
                { x: 210, y: 330 },
                { x: 170, y: 300 }, // Loop 2
                { x: 150, y: 330 },
                { x: 170, y: 360 },
                { x: 200, y: 350 }
            ],
            edges: [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3],
                [0, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 9]
            ]
        }
    ];

    // 3. Creative SVG Alien definition
    const ALIEN_SVG = `
        <div class="alien-container">
            <svg viewBox="0 0 200 200" width="130" height="130">
                <!-- Outer Space Helmet / Bubble -->
                <circle cx="100" cy="100" r="85" fill="rgba(52, 152, 219, 0.15)" stroke="#3498DB" stroke-width="2.5" stroke-dasharray="6, 4"/>
                <circle cx="100" cy="100" r="75" fill="rgba(52, 152, 219, 0.1)" stroke="rgba(52, 152, 219, 0.4)" stroke-width="1"/>
                
                <!-- Floating Alien Body -->
                <ellipse cx="100" cy="115" rx="55" ry="42" fill="#2ECC71" stroke="#25A255" stroke-width="4.5"/>
                
                <!-- Eye stalk -->
                <path d="M100 70 L100 45" stroke="#2ECC71" stroke-width="7.5" stroke-linecap="round"/>
                <circle cx="100" cy="35" r="16" fill="#2ECC71"/>
                
                <!-- Lateral Antennas -->
                <path d="M68 78 Q42 58 52 42" fill="none" stroke="#2ECC71" stroke-width="4.5" stroke-linecap="round"/>
                <circle cx="52" cy="42" r="7" fill="#F1C40F"/>
                
                <path d="M132 78 Q158 58 148 42" fill="none" stroke="#2ECC71" stroke-width="4.5" stroke-linecap="round"/>
                <circle cx="148" cy="42" r="7" fill="#F1C40F"/>
                
                <!-- Large central eye -->
                <circle cx="100" cy="102" r="23" fill="#FFFFFF" stroke="#1A252F" stroke-width="3.5"/>
                <circle cx="100" cy="102" r="9" fill="#3498DB"/>
                <circle cx="97" cy="99" r="4.5" fill="#FFFFFF"/> <!-- Shine -->
                
                <!-- Cheeks -->
                <circle cx="70" cy="120" r="5" fill="#E74C3C" opacity="0.65"/>
                <circle cx="130" cy="120" r="5" fill="#E74C3C" opacity="0.65"/>
                
                <!-- Happy Smile -->
                <path d="M86 128 Q100 142 114 128" stroke="#1A252F" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                
                <!-- Body details / Spots -->
                <circle cx="68" cy="104" r="3.5" fill="#25A255" opacity="0.4"/>
                <circle cx="132" cy="104" r="3.5" fill="#25A255" opacity="0.4"/>
                
                <!-- Weird floating arms / tentacles -->
                <path d="M48 126 Q22 135 32 152" fill="none" stroke="#2ECC71" stroke-width="5.5" stroke-linecap="round"/>
                <path d="M152 126 Q178 135 168 152" fill="none" stroke="#2ECC71" stroke-width="5.5" stroke-linecap="round"/>
            </svg>
        </div>
    `;

    // 4. Narrative Texts
    const TEXTS = {
        START_TITLE: "Voyager",
        START_BODY: `Astronaut 311-C,

As humanity's best pilot, you have been selected for a crucial, top-secret mission: to find extraterrestrial life.

To do this, you must pilot your spacecraft between the stars of the 12 Zodiac constellations, as they appear. With each new constellation, you will have less time to connect the points. You must connect all of the constellations within the time limit to discover our intergalactic friends.

Use your arrow keys to move the spacecraft. Press SHIFT to speed up and Z to slow down.

Good luck, and bon voyage!`,

        FAIL_TITLE: "Mission Failed",
        FAIL_BODY: `You have failed your mission, Astronaut 311-A. Humanity remains alone among the stars. Unless you choose to try again...`,

        SUCCESS_TITLE: "Mission Success",
        SUCCESS_BODY_PRE: `Hello, traveler. I am Zarg 966-Z. Welcome to Zargaborg!`,
        SUCCESS_BODY_POST: `I just pumped some fresh oxygen into my biosphere! So come on in, kick your boots off, and tell me all about your travels.`
    };

    // 5. Game Engine Class
    class VoyagerGame {
        constructor(parent) {
            this.parent = parent;
            this.buildDOMElements();
            this.initCanvas();
            this.bindInputEvents();
            
            // Initial Game State
            this.gameState = 'START';
            this.level = 0;
            this.score = 0;
            this.timeLeft = 35.0; // Seconds
            this.maxTime = 35.0;
            this.stars = [];
            this.edges = [];
            this.particles = [];
            
            this.ship = {
                x: 400,
                y: 300,
                vx: 0,
                vy: 0,
                angle: -Math.PI / 2, // Upwards
                radius: 12
            };

            this.keys = {};
            this.loopId = null;
            this.showOverlay();
        }

        buildDOMElements() {
            // Main Wrapper
            this.wrapper = document.createElement('div');
            this.wrapper.id = 'voyager-wrapper';

            // Canvas
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'voyager-canvas';
            this.canvas.width = 800;
            this.canvas.height = 600;
            this.wrapper.appendChild(this.canvas);

            // Overlay Div
            this.overlay = document.createElement('div');
            this.overlay.className = 'voyager-overlay';
            this.wrapper.appendChild(this.overlay);

            this.parent.appendChild(this.wrapper);
        }

        initCanvas() {
            this.ctx = this.canvas.getContext('2d');
            this.starsBackground = [];
            // Spawn static backdrop stars
            for (let i = 0; i < 150; i++) {
                this.starsBackground.push({
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    r: Math.random() * 1.5 + 0.5,
                    alpha: Math.random() * 0.8 + 0.2,
                    speed: Math.random() * 0.02 + 0.005
                });
            }
        }

        bindInputEvents() {
            window.addEventListener('keydown', (e) => {
                this.keys[e.key] = true;
                this.keys[e.code] = true; // Support standard codes like 'ShiftLeft', 'KeyZ'
                
                // Prevent browser scrolling on Arrow keys and Spacebar
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'].includes(e.key) || 
                    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                    e.preventDefault();
                }
                
                // Dev skip cheat: Shift + D
                if ((this.keys['Shift'] || this.keys['ShiftLeft'] || this.keys['ShiftRight']) && 
                    (e.key === 'D' || e.key === 'd' || e.code === 'KeyD')) {
                    if (this.gameState === 'PLAYING') {
                        e.preventDefault();
                        this.triggerDevWin();
                    }
                }
            });

            window.addEventListener('keyup', (e) => {
                this.keys[e.key] = false;
                this.keys[e.code] = false;
            });
        }

        showOverlay() {
            this.overlay.classList.remove('hidden');
            let content = '';

            if (this.gameState === 'START') {
                content = `
                    <div class="voyager-title">${TEXTS.START_TITLE}</div>
                    <div class="voyager-text">${TEXTS.START_BODY}</div>
                    <button class="voyager-btn" id="voyager-start-btn">Start Mission</button>
                `;
                this.overlay.innerHTML = content;
                document.getElementById('voyager-start-btn').addEventListener('click', () => this.startGame());

            } else if (this.gameState === 'FAIL') {
                content = `
                    <div class="voyager-title">${TEXTS.FAIL_TITLE}</div>
                    <div class="voyager-text">${TEXTS.FAIL_BODY}</div>
                    <button class="voyager-btn" id="voyager-restart-btn">Try Again</button>
                `;
                this.overlay.innerHTML = content;
                document.getElementById('voyager-restart-btn').addEventListener('click', () => this.restartGame());

            } else if (this.gameState === 'SUCCESS') {
                content = `
                    <div class="voyager-title">${TEXTS.SUCCESS_TITLE}</div>
                    <div class="voyager-text" style="margin-bottom: 10px;">${TEXTS.SUCCESS_BODY_PRE}</div>
                    ${ALIEN_SVG}
                    <div class="voyager-text" style="margin-top: 10px; margin-bottom: 25px;">${TEXTS.SUCCESS_BODY_POST}</div>
                    <button class="voyager-btn" id="voyager-close-btn">Return to Leaderboard</button>
                `;
                this.overlay.innerHTML = content;
                document.getElementById('voyager-close-btn').addEventListener('click', () => this.triggerHandoff());
            }
        }

        hideOverlay() {
            this.overlay.classList.add('hidden');
        }

        startGame() {
            this.gameState = 'PLAYING';
            this.level = 0;
            this.score = 0;
            this.hideOverlay();
            this.loadLevel();
            this.gameLoop();
        }

        restartGame() {
            this.gameState = 'PLAYING';
            this.level = 0;
            this.score = 0;
            this.hideOverlay();
            this.loadLevel();
            this.gameLoop();
        }

        loadLevel() {
            const data = CONSTELLATIONS[this.level];
            
            // Map stars
            this.stars = data.stars.map(s => ({
                x: s.x,
                y: s.y,
                visited: false,
                radius: 8,
                pulse: 0
            }));

            // Map edges
            this.edges = data.edges.map(e => ({
                from: e[0],
                to: e[1]
            }));

            // Time scaling: Level 0 is 35 seconds, Level 11 is 13 seconds (Aries to Pisces)
            this.maxTime = 35.0 - (this.level * 2.0);
            this.timeLeft = this.maxTime;

            // Reset ship location to center or first star
            this.ship.x = 400;
            this.ship.y = 300;
            this.ship.vx = 0;
            this.ship.vy = 0;
            this.ship.angle = -Math.PI / 2;

            // Clear particles
            this.particles = [];
        }

        triggerDevWin() {
            this.score += 5000;
            this.gameState = 'SUCCESS';
            this.stopLoop();
            this.showOverlay();
        }

        triggerHandoff() {
            this.stopLoop();
            if (window.Voyager && typeof window.Voyager.showLeaderboard === 'function') {
                window.Voyager.showLeaderboard(this.score);
            } else {
                console.log("window.Voyager.showLeaderboard called with score:", this.score);
            }
        }

        stopLoop() {
            if (this.loopId) {
                cancelAnimationFrame(this.loopId);
                this.loopId = null;
            }
        }

        gameLoop() {
            if (this.gameState !== 'PLAYING') return;

            this.update();
            this.draw();

            this.loopId = requestAnimationFrame(() => this.gameLoop());
        }

        update() {
            // 1. Time Limits Tracking
            this.timeLeft -= 1 / 60; // Approximate 60fps delta
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.gameState = 'FAIL';
                this.triggerHandoff();
                this.showOverlay();
                return;
            }

            // 2. Compute physics using "8-Way Direct" logic
            let dx = 0;
            let dy = 0;

            if (this.keys['ArrowUp'] || this.keys['KeyW']) dy -= 1;
            if (this.keys['ArrowDown'] || this.keys['KeyS']) dy += 1;
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) dx -= 1;
            if (this.keys['ArrowRight'] || this.keys['KeyD']) dx += 1;

            if (dx !== 0 || dy !== 0) {
                // Normalize for diagonal movement consistency
                const length = Math.sqrt(dx * dx + dy * dy);
                dx /= length;
                dy /= length;

                // Adjust speed constants with multipliers
                let multiplier = 1.0;
                if (this.keys['Shift'] || this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
                    multiplier = 2.0; // Boost
                } else if (this.keys['z'] || this.keys['KeyZ'] || this.keys['Z']) {
                    multiplier = 0.5; // Brake
                }

                const speed = 2.5 * multiplier;
                this.ship.vx = dx * speed;
                this.ship.vy = dy * speed;

                // Update Angle towards current travel vector
                this.ship.angle = Math.atan2(dy, dx);
            } else {
                // Direct stop physics
                this.ship.vx = 0;
                this.ship.vy = 0;
            }

            // Update positions
            this.ship.x += this.ship.vx;
            this.ship.y += this.ship.vy;

            // Keep spacecraft in canvas boundaries
            this.ship.x = Math.max(this.ship.radius, Math.min(800 - this.ship.radius, this.ship.x));
            this.ship.y = Math.max(this.ship.radius, Math.min(600 - this.ship.radius, this.ship.y));

            // 3. Update background stars (Subtle twinkle)
            this.starsBackground.forEach(star => {
                star.alpha += star.speed;
                if (star.alpha > 0.95 || star.alpha < 0.15) {
                    star.speed = -star.speed;
                }
            });

            // 4. Update Level Particles
            this.particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.02;
                if (p.alpha <= 0) {
                    this.particles.splice(idx, 1);
                }
            });

            // 5. Collision checks with Constellation Stars
            let allConnected = true;
            this.stars.forEach(star => {
                const dist = Math.hypot(this.ship.x - star.x, this.ship.y - star.y);
                if (dist < (this.ship.radius + star.radius)) {
                    if (!star.visited) {
                        star.visited = true;
                        this.score += 100;
                        this.spawnSparks(star.x, star.y);
                    }
                }
                if (!star.visited) {
                    allConnected = false;
                }
                
                // Twinkle/Pulse active stars
                star.pulse += 0.08;
            });

            // 6. Level transition
            if (allConnected) {
                // Level completion bonus
                const timeBonus = Math.round(this.timeLeft * 50);
                this.score += timeBonus;
                this.score += 500; // Flat completion bonus

                this.level++;
                if (this.level >= CONSTELLATIONS.length) {
                    this.gameState = 'SUCCESS';
                    this.triggerHandoff();
                    this.showOverlay();
                } else {
                    this.loadLevel();
                }
            }
        }

        spawnSparks(x, y) {
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 1;
                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    color: Math.random() > 0.5 ? '#00FFFF' : '#F1C40F',
                    size: Math.random() * 2 + 1
                });
            }
        }

        draw() {
            // Clear Canvas
            this.ctx.fillStyle = '#050811';
            this.ctx.fillRect(0, 0, 800, 600);

            // Draw Background Stars
            this.starsBackground.forEach(star => {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                this.ctx.fill();
            });

            // Draw Constellation Guide lines & Connected paths
            this.edges.forEach(edge => {
                const s1 = this.stars[edge.from];
                const s2 = this.stars[edge.to];
                
                this.ctx.beginPath();
                this.ctx.moveTo(s1.x, s1.y);
                this.ctx.lineTo(s2.x, s2.y);

                if (s1.visited && s2.visited) {
                    // Solid glowing neon line
                    this.ctx.strokeStyle = '#00F3FF';
                    this.ctx.lineWidth = 3;
                    this.ctx.shadowBlur = 12;
                    this.ctx.shadowColor = '#00F3FF';
                    this.ctx.stroke();
                } else {
                    // Dotted guide line
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.setLineDash([4, 4]);
                    this.ctx.shadowBlur = 0;
                    this.ctx.stroke();
                    this.ctx.setLineDash([]); // Reset
                }
            });

            // Draw Constellation Stars
            this.stars.forEach(star => {
                const pulseScale = Math.sin(star.pulse) * 2 + 3;
                
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.visited ? star.radius + 2 : star.radius, 0, Math.PI * 2);
                
                if (star.visited) {
                    // Glowing cyan star
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.shadowBlur = pulseScale + 8;
                    this.ctx.shadowColor = '#00FFFF';
                    this.ctx.fill();
                    
                    // Outer ring
                    this.ctx.strokeStyle = '#00FFFF';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.beginPath();
                    this.ctx.arc(star.x, star.y, star.radius + pulseScale, 0, Math.PI * 2);
                    this.ctx.stroke();
                } else {
                    // Dim gold star
                    this.ctx.fillStyle = '#C5A059';
                    this.ctx.shadowBlur = 4;
                    this.ctx.shadowColor = '#C5A059';
                    this.ctx.fill();
                }
            });
            this.ctx.shadowBlur = 0; // Reset shadow

            // Draw Particles
            this.particles.forEach(p => {
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1.0; // Reset transparency

            // Draw Spacecraft (Ship)
            this.ctx.save();
            this.ctx.translate(this.ship.x, this.ship.y);
            this.ctx.rotate(this.ship.angle);

            // Back thrust fire flame if moving
            if (this.ship.vx !== 0 || this.ship.vy !== 0) {
                const flameLength = Math.random() * 8 + 8;
                this.ctx.beginPath();
                this.ctx.moveTo(-15, -5);
                this.ctx.lineTo(-15 - flameLength, 0);
                this.ctx.lineTo(-15, 5);
                this.ctx.fillStyle = Math.random() > 0.5 ? '#E74C3C' : '#F1C40F';
                this.ctx.fill();
            }

            // Ship Body (Arrowhead/Rocket)
            this.ctx.beginPath();
            this.ctx.moveTo(15, 0);   // Nose cone
            this.ctx.lineTo(-10, -10); // Left wing tip
            this.ctx.lineTo(-6, 0);    // Back center indent
            this.ctx.lineTo(-10, 10);  // Right wing tip
            this.ctx.closePath();

            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.strokeStyle = '#00FFFF';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#00FFFF';
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.restore();
            this.ctx.shadowBlur = 0; // Reset

            // Draw Level UI info headers
            this.ctx.fillStyle = '#E2E8F0';
            this.ctx.font = 'bold 16px "Outfit", sans-serif';
            this.ctx.fillText(`Constellation ${this.level + 1}/12: ${CONSTELLATIONS[this.level].name.toUpperCase()}`, 20, 40);

            // Draw Score
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`SCORE: ${this.score}`, 780, 40);
            this.ctx.textAlign = 'left'; // Reset

            // Draw Timer Progress Bar
            const timerBarWidth = 760;
            const remainingRatio = this.timeLeft / this.maxTime;
            const currentWidth = timerBarWidth * remainingRatio;

            // Timer background container
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            this.ctx.fillRect(20, 52, timerBarWidth, 6);

            // Shinking neon status bar
            this.ctx.beginPath();
            this.ctx.rect(20, 52, currentWidth, 6);
            if (remainingRatio > 0.4) {
                this.ctx.fillStyle = '#00FFCC'; // Safe
                this.ctx.shadowColor = '#00FFCC';
            } else if (remainingRatio > 0.2) {
                this.ctx.fillStyle = '#F1C40F'; // Warning
                this.ctx.shadowColor = '#F1C40F';
            } else {
                this.ctx.fillStyle = '#E74C3C'; // Critical
                this.ctx.shadowColor = '#E74C3C';
            }
            this.ctx.shadowBlur = 4;
            this.ctx.fill();
            this.ctx.shadowBlur = 0; // Reset
        }
    }

    // 6. Auto-Initialize Game inside target container
    function initVoyager() {
        // Look for targeted game-container
        const gameContainer = document.getElementById('game-container') || 
                              document.getElementById('voyager-container') || 
                              document.body;
                              
        if (gameContainer) {
            window.VoyagerGameInstance = new VoyagerGame(gameContainer);
            console.log("Voyager game engine successfully initialized!");
        } else {
            console.error("Voyager initialization failed: target container not found.");
        }
    }

    // Export Class and start initializer
    window.VoyagerEngine = VoyagerGame;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVoyager);
    } else {
        initVoyager();
    }
})();

