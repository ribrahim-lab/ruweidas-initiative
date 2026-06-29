(function() {
    // 1. Inject CSS Styles
    const styles = `
        #voyager-wrapper {
            position: relative;
            width: 800px;
            height: 600px;
            background-color: #0d1117;
            border: 3px solid #E74C3C;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(231, 76, 60, 0.25);
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
            user-select: none;
            margin: 0 auto;
        }

        #voyager-canvas {
            display: block;
            width: 100%;
            height: 100%;
            cursor: crosshair;
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
            background: rgba(13, 17, 23, 0.96);
            backdrop-filter: blur(8px);
            padding: 30px 40px;
            text-align: center;
            color: #F8FAFC;
            z-index: 10;
            box-sizing: border-box;
        }

        .voyager-overlay.hidden {
            display: none !important;
        }

        .voyager-title {
            font-size: 2.4rem;
            font-weight: 800;
            color: #E74C3C;
            margin-bottom: 10px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            text-shadow: 0 0 15px rgba(231, 76, 60, 0.5);
        }

        .voyager-subtitle {
            font-size: 1rem;
            color: #94A3B8;
            margin-bottom: 25px;
            font-weight: 500;
        }

        .weapon-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            width: 100%;
            max-width: 680px;
            margin-bottom: 25px;
        }

        .weapon-card {
            background: rgba(255, 255, 255, 0.03);
            border: 2px solid #30363d;
            border-radius: 10px;
            padding: 16px;
            text-align: left;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .weapon-card:hover {
            border-color: #E74C3C;
            background: rgba(231, 76, 60, 0.04);
            transform: translateY(-2px);
        }

        .weapon-card.selected {
            border-color: #E74C3C;
            background: rgba(231, 76, 60, 0.15);
            box-shadow: 0 0 15px rgba(231, 76, 60, 0.2);
        }

        .weapon-name {
            font-size: 1.15rem;
            font-weight: 700;
            color: #F8FAFC;
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .weapon-ammo-tag {
            font-size: 0.75rem;
            background: #E74C3C;
            color: #FFF;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
        }

        .weapon-desc {
            font-size: 0.85rem;
            color: #94A3B8;
            line-height: 1.4;
            margin-bottom: 10px;
        }

        .weapon-stats {
            display: flex;
            gap: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            color: #CBD5E1;
        }

        .stat-item span {
            color: #E74C3C;
        }

        .voyager-text {
            font-size: 1rem;
            line-height: 1.6;
            color: #CBD5E1;
            max-width: 600px;
            margin-bottom: 25px;
            white-space: pre-line;
        }

        .voyager-btn {
            font-family: inherit;
            padding: 12px 32px;
            font-size: 1.1rem;
            font-weight: 800;
            border: 2px solid #E74C3C;
            border-radius: 8px;
            background-color: transparent;
            color: #E74C3C;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.1);
            transition: all 0.25s ease;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .voyager-btn:hover {
            background-color: #E74C3C;
            color: #FFF;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(231, 76, 60, 0.35);
        }

        .voyager-btn:active {
            transform: translateY(0);
        }
    `;

    // Inject CSS
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // 2. Weapons Configurations
    const WEAPONS = [
        {
            id: "pistol",
            name: "Red's Revolver",
            desc: "Red bird's reliable standard sidearm. High precision, infinite ammo, and solid mid-range combat capabilities.",
            damage: 25,
            fireRate: 200, // Ms between shots
            range: 500,
            ammoType: "Infinite",
            color: "#E74C3C"
        },
        {
            id: "shotgun",
            name: "Chuck's Boomstick",
            desc: "Yellow bird's close-range scatter gun. Fires 5 high-impact feathers in a wide cone. Devastating up close.",
            damage: 15,
            fireRate: 800,
            range: 220,
            ammoType: "Medium",
            color: "#F1C40F"
        },
        {
            id: "rifle",
            name: "Bomb's Blaster",
            desc: "Black bird's fully automatic assault rifle. Fires rapid-velocity explosive bullets that shred waves of pigs.",
            damage: 18,
            fireRate: 80,
            range: 600,
            ammoType: "High",
            color: "#34495E"
        },
        {
            id: "sniper",
            name: "Terence's Longshot",
            desc: "Huge bird's heavy piercing sniper. Extremely slow bolt-action, but pierces through multiple pigs at infinite range.",
            damage: 110,
            fireRate: 1500,
            range: 1000,
            ammoType: "Low",
            color: "#9B59B6"
        }
    ];

    // 3. Main Game Class
    class CallOfBirdsGame {
        constructor(parent) {
            this.parent = parent;
            this.buildDOMElements();
            this.initCanvas();
            this.bindInputEvents();

            // Game variables
            this.gameState = 'START'; // START, PLAYING, FAIL, SUCCESS
            this.selectedWeaponIndex = 0;
            
            // Stats
            this.score = 0;
            this.playerHealth = 100;
            this.wave = 1;
            this.maxWaves = 5;
            this.enemiesRemaining = 0;

            // Arrays
            this.enemies = [];
            this.bullets = [];
            this.particles = [];

            // Player coordinates
            this.player = {
                x: 400,
                y: 300,
                radius: 20,
                angle: 0,
                speed: 3.0
            };

            this.mouse = { x: 400, y: 300 };
            this.keys = {};
            this.lastShotTime = 0;
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

            // Overlay Screen
            this.overlay = document.createElement('div');
            this.overlay.className = 'voyager-overlay';
            this.wrapper.appendChild(this.overlay);

            this.parent.appendChild(this.wrapper);
        }

        initCanvas() {
            this.ctx = this.canvas.getContext('2d');
        }

        bindInputEvents() {
            // Mouse Coordinates and Shooting
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });

            this.canvas.addEventListener('mousedown', (e) => {
                this.keys['Mouse'] = true;
            });

            window.addEventListener('mouseup', () => {
                this.keys['Mouse'] = false;
            });

            // Keyboard movements
            window.addEventListener('keydown', (e) => {
                this.keys[e.key] = true;
                this.keys[e.code] = true;

                // Prevent standard browser scrolling
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
                    e.preventDefault();
                }

                // Cheat shortcut: Shift + D (Auto Win)
                if ((this.keys['Shift'] || this.keys['ShiftLeft'] || this.keys['ShiftRight']) && 
                    (e.key === 'D' || e.key === 'd' || e.code === 'KeyD')) {
                    if (this.gameState === 'PLAYING') {
                        e.preventDefault();
                        this.triggerVictory();
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
                    <div class="voyager-title">Call of Birds</div>
                    <div class="voyager-subtitle">Angry Warfare &bull; Weapon Intel Dashboard</div>
                    
                    <div class="weapon-grid">
                `;

                WEAPONS.forEach((w, idx) => {
                    const isSelected = idx === this.selectedWeaponIndex ? 'selected' : '';
                    content += `
                        <div class="weapon-card ${isSelected}" data-idx="${idx}">
                            <div class="weapon-name">
                                ${w.name}
                                <span class="weapon-ammo-tag">${w.ammoType}</span>
                            </div>
                            <div class="weapon-desc">${w.desc}</div>
                            <div class="weapon-stats">
                                <div class="stat-item">DMG: <span>${w.damage}</span></div>
                                <div class="stat-item">RATE: <span>${w.fireRate}ms</span></div>
                                <div class="stat-item">RANGE: <span>${w.range}px</span></div>
                            </div>
                        </div>
                    `;
                });

                content += `
                    </div>
                    <button class="voyager-btn" id="voyager-deploy-btn">Deploy Mission</button>
                `;
                this.overlay.innerHTML = content;

                // Add card click listeners
                const cards = this.overlay.querySelectorAll('.weapon-card');
                cards.forEach(card => {
                    card.addEventListener('click', () => {
                        cards.forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        this.selectedWeaponIndex = parseInt(card.getAttribute('data-idx'));
                    });
                });

                document.getElementById('voyager-deploy-btn').addEventListener('click', () => this.startGame());

            } else if (this.gameState === 'FAIL') {
                content = `
                    <div class="voyager-title" style="color: #E74C3C;">Defeated in Combat</div>
                    <div class="voyager-text">You have failed the mission, Pilot. Piggy Island remains under pig control. Unless you choose to deploy again...</div>
                    <button class="voyager-btn" id="voyager-restart-btn">Redeploy</button>
                `;
                this.overlay.innerHTML = content;
                document.getElementById('voyager-restart-btn').addEventListener('click', () => this.restartGame());

            } else if (this.gameState === 'SUCCESS') {
                content = `
                    <div class="voyager-title" style="color: #2ECC71;">Mission Accomplished</div>
                    <div class="voyager-text">Congratulations! You have wiped out all pig resistance and secured the eggs. Zarg 966-Z greets you from his biosphere!</div>
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
            this.score = 0;
            this.playerHealth = 100;
            this.wave = 1;
            this.enemies = [];
            this.bullets = [];
            this.particles = [];
            this.player.x = 400;
            this.player.y = 300;

            this.hideOverlay();
            this.startWave();
            this.gameLoop();
        }

        restartGame() {
            this.gameState = 'START';
            this.showOverlay();
        }

        startWave() {
            this.enemiesRemaining = this.wave * 5;
            this.enemies = [];
            // Spawn initial enemies
            for (let i = 0; i < Math.min(this.enemiesRemaining, 8); i++) {
                this.spawnEnemy();
            }
        }

        spawnEnemy() {
            const side = Math.floor(Math.random() * 4); // 0: Top, 1: Right, 2: Bottom, 3: Left
            let x, y;
            const offset = 40;

            if (side === 0) {
                x = Math.random() * 800;
                y = -offset;
            } else if (side === 1) {
                x = 800 + offset;
                y = Math.random() * 600;
            } else if (side === 2) {
                x = Math.random() * 800;
                y = 600 + offset;
            } else {
                x = -offset;
                y = Math.random() * 600;
            }

            // Pig types based on wave progress
            const dice = Math.random();
            let type = 'normal';
            let hp = 30 + this.wave * 5;
            let speed = 1.0 + Math.random() * 0.5 + (this.wave * 0.1);
            let radius = 18;

            if (dice > 0.8 && this.wave >= 2) {
                type = 'fast';
                hp = 20;
                speed = 2.2 + (this.wave * 0.15);
                radius = 15;
            } else if (dice > 0.92 && this.wave >= 3) {
                type = 'brute';
                hp = 100 + this.wave * 15;
                speed = 0.6;
                radius = 28;
            }

            this.enemies.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                radius: radius,
                type: type,
                hp: hp,
                maxHp: hp,
                speed: speed,
                angle: 0
            });
            this.enemiesRemaining--;
        }

        triggerVictory() {
            this.score += 3000;
            this.gameState = 'SUCCESS';
            this.stopLoop();
            this.showOverlay();
        }

        triggerHandoff() {
            this.stopLoop();
            if (window.Voyager && typeof window.Voyager.showLeaderboard === 'function') {
                window.Voyager.showLeaderboard(this.score);
            } else {
                console.log("Handoff trigger: Final Score = ", this.score);
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
            const weapon = WEAPONS[this.selectedWeaponIndex];

            // 1. Move Player (8-Way Direct with Shift/Z multipliers)
            let dx = 0;
            let dy = 0;

            if (this.keys['ArrowUp'] || this.keys['KeyW']) dy -= 1;
            if (this.keys['ArrowDown'] || this.keys['KeyS']) dy += 1;
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) dx -= 1;
            if (this.keys['ArrowRight'] || this.keys['KeyD']) dx += 1;

            if (dx !== 0 || dy !== 0) {
                const length = Math.sqrt(dx * dx + dy * dy);
                dx /= length;
                dy /= length;

                let multiplier = 1.0;
                if (this.keys['Shift'] || this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
                    multiplier = 1.8; // Sprint
                } else if (this.keys['z'] || this.keys['KeyZ'] || this.keys['Z']) {
                    multiplier = 0.5; // Walk/Aim
                }

                const moveSpeed = this.player.speed * multiplier;
                this.player.x += dx * moveSpeed;
                this.player.y += dy * moveSpeed;
            }

            // Keep within boundaries
            this.player.x = Math.max(this.player.radius, Math.min(800 - this.player.radius, this.player.x));
            this.player.y = Math.max(this.player.radius, Math.min(600 - this.player.radius, this.player.y));

            // Face mouse cursor
            this.player.angle = Math.atan2(this.mouse.y - this.player.y, this.mouse.x - this.player.x);

            // 2. Shooting Logic
            const now = Date.now();
            if (this.keys['Mouse'] && now - this.lastShotTime >= weapon.fireRate) {
                this.fireWeapon(weapon);
                this.lastShotTime = now;
            }

            // 3. Move Bullets
            this.bullets.forEach((b, idx) => {
                b.x += b.vx;
                b.y += b.vy;
                b.distanceTraveled += Math.sqrt(b.vx * b.vx + b.vy * b.vy);

                if (b.distanceTraveled >= b.range || b.x < 0 || b.x > 800 || b.y < 0 || b.y > 600) {
                    this.bullets.splice(idx, 1);
                }
            });

            // 4. Update Particles
            this.particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.03;
                if (p.alpha <= 0) {
                    this.particles.splice(idx, 1);
                }
            });

            // 5. Update Enemies
            this.enemies.forEach((enemy, eIdx) => {
                // Walk toward player
                const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                enemy.angle = angle;
                enemy.vx = Math.cos(angle) * enemy.speed;
                enemy.vy = Math.sin(angle) * enemy.speed;

                enemy.x += enemy.vx;
                enemy.y += enemy.vy;

                // Collide with player
                const playerDist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
                if (playerDist < (this.player.radius + enemy.radius)) {
                    this.playerHealth -= 0.2; // Continuous damage on touch
                    this.spawnSparks(enemy.x, enemy.y, '#E74C3C', 3);
                    if (this.playerHealth <= 0) {
                        this.playerHealth = 0;
                        this.gameState = 'FAIL';
                        this.triggerHandoff();
                        this.showOverlay();
                    }
                }

                // Check bullet collisions
                this.bullets.forEach((bullet, bIdx) => {
                    const bulletDist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
                    if (bulletDist < (enemy.radius + 4)) {
                        enemy.hp -= bullet.damage;
                        this.spawnSparks(bullet.x, bullet.y, enemy.type === 'brute' ? '#7F8C8D' : '#F1C40F', 8);

                        // Bullet disposal (except sniper, which pierces)
                        if (bullet.id !== 'sniper') {
                            this.bullets.splice(bIdx, 1);
                        }

                        // Enemy death check
                        if (enemy.hp <= 0) {
                            this.spawnSparks(enemy.x, enemy.y, '#2ECC71', 25); // Large feather blast
                            this.enemies.splice(eIdx, 1);
                            this.score += enemy.type === 'brute' ? 300 : (enemy.type === 'fast' ? 150 : 100);
                        }
                    }
                });
            });

            // Spawner checks
            if (this.enemies.length < 5 && this.enemiesRemaining > 0) {
                this.spawnEnemy();
            }

            // Wave completion
            if (this.enemies.length === 0 && this.enemiesRemaining === 0) {
                this.wave++;
                if (this.wave > this.maxWaves) {
                    this.gameState = 'SUCCESS';
                    this.triggerHandoff();
                    this.showOverlay();
                } else {
                    this.startWave();
                }
            }
        }

        fireWeapon(w) {
            const angle = this.player.angle;
            const speed = 12.0;

            if (w.id === 'shotgun') {
                // Shoot a fan of 5 pellets
                for (let i = -2; i <= 2; i++) {
                    const devAngle = angle + (i * 0.08);
                    this.bullets.push({
                        id: w.id,
                        x: this.player.x + Math.cos(angle) * 20,
                        y: this.player.y + Math.sin(angle) * 20,
                        vx: Math.cos(devAngle) * speed,
                        vy: Math.sin(devAngle) * speed,
                        damage: w.damage,
                        range: w.range,
                        distanceTraveled: 0,
                        color: w.color
                    });
                }
            } else {
                // Single bullet shooter (Pistol, Rifle, Sniper)
                this.bullets.push({
                    id: w.id,
                    x: this.player.x + Math.cos(angle) * 20,
                    y: this.player.y + Math.sin(angle) * 20,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    damage: w.damage,
                    range: w.range,
                    distanceTraveled: 0,
                    color: w.color
                });
            }

            // Spawn slight fire particles
            this.spawnSparks(this.player.x + Math.cos(angle) * 20, this.player.y + Math.sin(angle) * 20, '#F1C40F', 4);
        }

        spawnSparks(x, y, color, count) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 1;
                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    color: color,
                    size: Math.random() * 2.5 + 1
                });
            }
        }

        draw() {
            // Background
            this.ctx.fillStyle = '#0f141c';
            this.ctx.fillRect(0, 0, 800, 600);

            // Tech grid lines
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 800; i += 40) {
                this.ctx.beginPath();
                this.ctx.moveTo(i, 0);
                this.ctx.lineTo(i, 600);
                this.ctx.stroke();
            }
            for (let j = 0; j < 600; j += 40) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, j);
                this.ctx.lineTo(800, j);
                this.ctx.stroke();
            }

            // Draw Bullets
            this.bullets.forEach(b => {
                this.ctx.beginPath();
                this.ctx.moveTo(b.x, b.y);
                this.ctx.lineTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
                this.ctx.strokeStyle = b.color;
                this.ctx.lineWidth = b.id === 'sniper' ? 4 : 2;
                this.ctx.stroke();
            });

            // Draw Particles
            this.particles.forEach(p => {
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1.0;

            // Draw Enemies (Green Pigs in Helmets)
            this.enemies.forEach(e => {
                this.ctx.save();
                this.ctx.translate(e.x, e.y);
                this.ctx.rotate(e.angle);

                // Pig Body (Green sphere)
                this.ctx.beginPath();
                this.ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = '#2ECC71';
                this.ctx.fill();
                this.ctx.strokeStyle = '#27AE60';
                this.ctx.lineWidth = 2.5;
                this.ctx.stroke();

                // Pig Snout
                this.ctx.beginPath();
                this.ctx.ellipse(3, 0, e.radius * 0.45, e.radius * 0.35, 0, 0, Math.PI * 2);
                this.ctx.fillStyle = '#259C51';
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(1, -2, 1.5, 0, Math.PI * 2);
                this.ctx.arc(1, 2, 1.5, 0, Math.PI * 2);
                this.ctx.fillStyle = '#1A6B37';
                this.ctx.fill();

                // Eyes (gaze direction forward)
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.arc(-2, -e.radius * 0.4, 4, 0, Math.PI * 2);
                this.ctx.arc(-2, e.radius * 0.4, 4, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(0, -e.radius * 0.4, 1.8, 0, Math.PI * 2);
                this.ctx.arc(0, e.radius * 0.4, 1.8, 0, Math.PI * 2);
                this.ctx.fill();

                // Pig Ears
                this.ctx.fillStyle = '#2ECC71';
                this.ctx.beginPath();
                this.ctx.arc(-e.radius * 0.7, -e.radius * 0.7, 5, 0, Math.PI * 2);
                this.ctx.arc(-e.radius * 0.7, e.radius * 0.7, 5, 0, Math.PI * 2);
                this.ctx.fill();

                // Helmet (Military Call of Duty theme)
                this.ctx.fillStyle = e.type === 'brute' ? '#1F242D' : '#566573';
                this.ctx.beginPath();
                this.ctx.arc(-e.radius * 0.25, 0, e.radius * 1.05, Math.PI / 2, -Math.PI / 2);
                this.ctx.fill();

                // Health status line
                if (e.hp < e.maxHp) {
                    this.ctx.restore();
                    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    this.ctx.fillRect(e.x - e.radius, e.y - e.radius - 10, e.radius * 2, 4);
                    this.ctx.fillStyle = '#E74C3C';
                    this.ctx.fillRect(e.x - e.radius, e.y - e.radius - 10, (e.radius * 2) * (e.hp / e.maxHp), 4);
                    this.ctx.save();
                    this.ctx.translate(e.x, e.y);
                }

                this.ctx.restore();
            });

            // Draw Player (Angry Red Bird in Army Helmet)
            this.ctx.save();
            this.ctx.translate(this.player.x, this.player.y);
            this.ctx.rotate(this.player.angle);

            // Red Bird Body
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.player.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#E74C3C';
            this.ctx.fill();
            this.ctx.strokeStyle = '#C0392B';
            this.ctx.lineWidth = 2.5;
            this.ctx.stroke();

            // Belly
            this.ctx.beginPath();
            this.ctx.arc(-this.player.radius * 0.3, 0, this.player.radius * 0.7, -Math.PI / 2, Math.PI / 2);
            this.ctx.fillStyle = '#FFF2F2';
            this.ctx.fill();

            // Eyes (Glaring forward)
            this.ctx.fillStyle = '#FFF';
            this.ctx.beginPath();
            this.ctx.arc(6, -5, 5, 0, Math.PI * 2);
            this.ctx.arc(6, 5, 5, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(7, -5, 2, 0, Math.PI * 2);
            this.ctx.arc(7, 5, 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Angry eyebrows
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3.5;
            this.ctx.beginPath();
            this.ctx.moveTo(1, -9);
            this.ctx.lineTo(8, -5);
            this.ctx.lineTo(8, 5);
            this.ctx.lineTo(1, 9);
            this.ctx.stroke();

            // Beak (Orange)
            this.ctx.fillStyle = '#F1C40F';
            this.ctx.beginPath();
            this.ctx.moveTo(8, -3);
            this.ctx.lineTo(16, 0);
            this.ctx.lineTo(8, 3);
            this.ctx.closePath();
            this.ctx.fill();

            // Army Helmet (Military green)
            this.ctx.fillStyle = '#27AE60';
            this.ctx.beginPath();
            this.ctx.arc(-this.player.radius * 0.15, 0, this.player.radius * 1.05, Math.PI / 2, -Math.PI / 2);
            this.ctx.fill();

            // Weapon Barrel (glowing gun barrel)
            const weaponColor = WEAPONS[this.selectedWeaponIndex].color;
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(8, -4, 18, 8);
            this.ctx.fillStyle = weaponColor;
            this.ctx.fillRect(23, -3, 5, 6);

            this.ctx.restore();

            // HUD
            this.drawHUD();
        }

        drawHUD() {
            const weapon = WEAPONS[this.selectedWeaponIndex];

            // 1. Health Bar
            this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.ctx.fillRect(20, 20, 200, 16);
            this.ctx.fillStyle = '#E74C3C';
            this.ctx.fillRect(20, 20, 200 * (this.playerHealth / 100), 16);
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(20, 20, 200, 16);

            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 12px "Outfit", sans-serif';
            this.ctx.fillText(`HP: ${Math.ceil(this.playerHealth)}%`, 30, 32);

            // 2. Score & Wave indicators
            this.ctx.font = 'bold 16px "Outfit", sans-serif';
            this.ctx.fillText(`SCORE: ${this.score}`, 20, 60);

            this.ctx.textAlign = 'right';
            this.ctx.fillText(`WAVE: ${this.wave} / ${this.maxWaves}`, 780, 35);
            this.ctx.font = '13px "Outfit", sans-serif';
            this.ctx.fillStyle = '#E74C3C';
            this.ctx.fillText(`INCOMING: ${this.enemies.length + this.enemiesRemaining} PIGS`, 780, 55);
            this.ctx.textAlign = 'left';

            // 3. Selected Weapon info
            this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.ctx.fillRect(20, 520, 250, 60);
            this.ctx.strokeStyle = weapon.color;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(20, 520, 250, 60);

            this.ctx.fillStyle = weapon.color;
            this.ctx.font = 'bold 16px "Outfit", sans-serif';
            this.ctx.fillText(weapon.name, 35, 545);
            this.ctx.fillStyle = '#94A3B8';
            this.ctx.font = '12px "Outfit", sans-serif';
            this.ctx.fillText(`AMMO: ${weapon.ammoType}  |  POWER: ${weapon.damage}`, 35, 565);
        }
    }

    // Auto Init
    function initGame() {
        const gameContainer = document.getElementById('game-container') || document.body;
        if (gameContainer) {
            window.VoyagerGameInstance = new CallOfBirdsGame(gameContainer);
            console.log("Call of Birds engine loaded successfully!");
        }
    }

    window.VoyagerEngine = CallOfBirdsGame;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
})();
