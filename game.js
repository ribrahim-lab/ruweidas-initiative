(function() {
    // 1. Inject CSS Styles
    const styles = `
        #voyager-wrapper {
            position: relative;
            width: 800px;
            height: 600px;
            background-color: #0d1117;
            border: 3px solid #F1C40F;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(241, 196, 15, 0.2);
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
            background: rgba(10, 14, 23, 0.96);
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
            font-size: 2.6rem;
            font-weight: 900;
            color: #F1C40F;
            margin-bottom: 5px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            text-shadow: 0 0 15px rgba(241, 196, 15, 0.4);
        }

        .voyager-subtitle {
            font-size: 1rem;
            color: #94A3B8;
            margin-bottom: 25px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
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
            background: rgba(255, 255, 255, 0.02);
            border: 2px solid #30363d;
            border-radius: 10px;
            padding: 16px;
            text-align: left;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .weapon-card:hover {
            border-color: #F1C40F;
            background: rgba(241, 196, 15, 0.03);
            transform: translateY(-2px);
        }

        .weapon-card.selected {
            border-color: #F1C40F;
            background: rgba(241, 196, 15, 0.12);
            box-shadow: 0 0 15px rgba(241, 196, 15, 0.15);
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
            background: #F1C40F;
            color: #050811;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
            font-weight: 700;
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
            color: #F1C40F;
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
            border: 2px solid #F1C40F;
            border-radius: 8px;
            background-color: transparent;
            color: #F1C40F;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(241, 196, 15, 0.1);
            transition: all 0.25s ease;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .voyager-btn:hover {
            background-color: #F1C40F;
            color: #050811;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(241, 196, 15, 0.35);
        }

        .voyager-btn:active {
            transform: translateY(0);
        }
    `;

    // Inject CSS
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // 2. Weapons Configurations (Shell Shockers Themed)
    const WEAPONS = [
        {
            id: "cluck",
            name: "Cluck 9mm",
            desc: "Rapid semi-auto pistol. Perfect accuracy, infinite ammo reserve, and steady single-target suppression.",
            damage: 22,
            fireRate: 180,
            range: 520,
            ammoType: "Infinite",
            color: "#BDC3C7"
        },
        {
            id: "scrambler",
            name: "The Scrambler",
            desc: "Heavy pump-action shotgun. Explodes 6 shell shards in a wide spread. Scrambles close range targets instantly.",
            damage: 14,
            fireRate: 850,
            range: 240,
            ammoType: "High Spread",
            color: "#E67E22"
        },
        {
            id: "eggk47",
            name: "EggK-47",
            desc: "Classic fully automatic assault rifle. Devastating fire rate with balanced spray damage and excellent mid-range accuracy.",
            damage: 20,
            fireRate: 90,
            range: 620,
            ammoType: "Auto",
            color: "#2ECC71"
        },
        {
            id: "rpegg",
            name: "RPEGG Launcher",
            desc: "Heavy rocket-propelled egg launcher. Shoots high-explosive yolks that detonate on contact, dealing area-of-effect damage.",
            damage: 80,
            fireRate: 1400,
            range: 700,
            ammoType: "Explosive",
            color: "#E74C3C",
            explosive: true,
            explosionRadius: 80
        }
    ];

    // 3. Main Game Class
    class ShellShockersGame {
        constructor(parent) {
            this.parent = parent;
            this.buildDOMElements();
            this.initCanvas();
            this.bindInputEvents();

            // Game State
            this.gameState = 'START';
            this.selectedWeaponIndex = 0;
            
            // Statistics
            this.score = 0;
            this.playerHealth = 100;
            this.wave = 1;
            this.maxWaves = 5;
            this.enemiesRemaining = 0;

            // Arrays
            this.enemies = [];
            this.bullets = [];
            this.particles = [];
            this.explosions = []; // AOE explosions

            // Player configuration (Egg shaped physics)
            this.player = {
                x: 400,
                y: 300,
                radius: 18,
                angle: 0,
                speed: 3.2
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

            window.addEventListener('keydown', (e) => {
                this.keys[e.key] = true;
                this.keys[e.code] = true;

                // Stop scrolling
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
                    e.preventDefault();
                }

                // Win cheat: Shift + D
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
                    <div class="voyager-title">Shell Shockers 2D</div>
                    <div class="voyager-subtitle">Egg Warfare &bull; Arsenal Selection</div>
                    
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
                    <button class="voyager-btn" id="voyager-deploy-btn">Crack some Shells</button>
                `;
                this.overlay.innerHTML = content;

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
                    <div class="voyager-title" style="color: #E74C3C;">You Got Scrambled!</div>
                    <div class="voyager-text">Your shell has been cracked. The Bad Eggs successfully occupied the grid. Try again, pilot!</div>
                    <button class="voyager-btn" id="voyager-restart-btn">Redeploy</button>
                `;
                this.overlay.innerHTML = content;
                document.getElementById('voyager-restart-btn').addEventListener('click', () => this.restartGame());

            } else if (this.gameState === 'SUCCESS') {
                content = `
                    <div class="voyager-title" style="color: #2ECC71;">Egg-cellent Victory</div>
                    <div class="voyager-text">Spectacular combat! You successfully scrambled all 5 waves of Bad Eggs. Zarg welcomes you back to the biosphere.</div>
                    <button class="voyager-btn" id="voyager-close-btn">Transmit Logs</button>
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
            this.explosions = [];
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
            this.enemiesRemaining = this.wave * 6;
            this.enemies = [];
            for (let i = 0; i < Math.min(this.enemiesRemaining, 10); i++) {
                this.spawnEnemy();
            }
        }

        spawnEnemy() {
            const side = Math.floor(Math.random() * 4);
            let x, y;
            const offset = 40;

            if (side === 0) {
                x = Math.random() * 800; y = -offset;
            } else if (side === 1) {
                x = 800 + offset; y = Math.random() * 600;
            } else if (side === 2) {
                x = Math.random() * 800; y = 600 + offset;
            } else {
                x = -offset; y = Math.random() * 600;
            }

            const dice = Math.random();
            let type = 'normal';
            let hp = 30 + this.wave * 6;
            let speed = 1.1 + (this.wave * 0.1);
            let radius = 16;

            if (dice > 0.8 && this.wave >= 2) {
                type = 'speedy';
                hp = 22;
                speed = 2.4 + (this.wave * 0.12);
                radius = 13;
            } else if (dice > 0.9 && this.wave >= 3) {
                type = 'brute';
                hp = 110 + this.wave * 20;
                speed = 0.65;
                radius = 24;
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
            this.score += 4000;
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
                    multiplier = 1.8;
                } else if (this.keys['z'] || this.keys['KeyZ'] || this.keys['Z']) {
                    multiplier = 0.5;
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

            // 2. Shooting
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

                // Check out of range
                if (b.distanceTraveled >= b.range || b.x < 0 || b.x > 800 || b.y < 0 || b.y > 600) {
                    if (b.explosive) {
                        this.explode(b.x, b.y, b.explosionRadius, b.damage);
                    }
                    this.bullets.splice(idx, 1);
                }
            });

            // 4. Update AOE Explosions
            this.explosions.forEach((ex, idx) => {
                ex.radius += ex.growthSpeed;
                ex.alpha -= 0.04;
                if (ex.alpha <= 0) {
                    this.explosions.splice(idx, 1);
                }
            });

            // 5. Update Particles
            this.particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.03;
                if (p.alpha <= 0) {
                    this.particles.splice(idx, 1);
                }
            });

            // 6. Update Enemies
            this.enemies.forEach((enemy, eIdx) => {
                const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                enemy.angle = angle;
                enemy.vx = Math.cos(angle) * enemy.speed;
                enemy.vy = Math.sin(angle) * enemy.speed;

                enemy.x += enemy.vx;
                enemy.y += enemy.vy;

                // Collide with player
                const playerDist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
                if (playerDist < (this.player.radius + enemy.radius)) {
                    this.playerHealth -= 0.22; 
                    this.spawnYolkSplats(enemy.x, enemy.y, 2);
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
                        if (bullet.explosive) {
                            this.explode(bullet.x, bullet.y, bullet.explosionRadius, bullet.damage);
                        } else {
                            enemy.hp -= bullet.damage;
                            this.spawnYolkSplats(bullet.x, bullet.y, 6);
                        }

                        // Bullet disposal (non-sniper bullets)
                        if (bullet.id !== 'sniper') {
                            this.bullets.splice(bIdx, 1);
                        }

                        // Enemy death check
                        if (enemy.hp <= 0) {
                            this.scrambleEnemy(enemy);
                            this.enemies.splice(eIdx, 1);
                        }
                    }
                });
            });

            // Spawn next enemies
            if (this.enemies.length < 6 && this.enemiesRemaining > 0) {
                this.spawnEnemy();
            }

            // Wave progress check
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

        explode(x, y, radius, damage) {
            this.explosions.push({
                x: x,
                y: y,
                radius: 10,
                maxRadius: radius,
                growthSpeed: radius / 12,
                alpha: 1.0
            });

            // Splash damage check on all enemies
            this.enemies.forEach((enemy, idx) => {
                const dist = Math.hypot(enemy.x - x, enemy.y - y);
                if (dist < (radius + enemy.radius)) {
                    // Linear falloff damage
                    const damageFactor = 1 - (dist / (radius + enemy.radius));
                    enemy.hp -= Math.round(damage * damageFactor);

                    this.spawnYolkSplats(enemy.x, enemy.y, 4);

                    if (enemy.hp <= 0) {
                        this.scrambleEnemy(enemy);
                        this.enemies.splice(idx, 1);
                    }
                }
            });

            // Explosion sparks
            this.spawnYolkSplats(x, y, 20);
        }

        scrambleEnemy(enemy) {
            this.spawnYolkSplats(enemy.x, enemy.y, 30); // Large splat
            this.score += enemy.type === 'brute' ? 350 : (enemy.type === 'speedy' ? 180 : 100);
        }

        fireWeapon(w) {
            const angle = this.player.angle;
            const speed = 13.0;

            if (w.id === 'scrambler') {
                // Shoot a fan of 6 shells
                for (let i = -2.5; i <= 2.5; i += 1.0) {
                    const devAngle = angle + (i * 0.08);
                    this.bullets.push({
                        id: w.id,
                        x: this.player.x + Math.cos(angle) * 22,
                        y: this.player.y + Math.sin(angle) * 22,
                        vx: Math.cos(devAngle) * speed,
                        vy: Math.sin(devAngle) * speed,
                        damage: w.damage,
                        range: w.range,
                        distanceTraveled: 0,
                        color: w.color,
                        explosive: false
                    });
                }
            } else {
                this.bullets.push({
                    id: w.id,
                    x: this.player.x + Math.cos(angle) * 22,
                    y: this.player.y + Math.sin(angle) * 22,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    damage: w.damage,
                    range: w.range,
                    distanceTraveled: 0,
                    color: w.color,
                    explosive: w.explosive || false,
                    explosionRadius: w.explosionRadius || 0
                });
            }

            // Muzzle flash sparks
            this.spawnYolkSplats(this.player.x + Math.cos(angle) * 22, this.player.y + Math.sin(angle) * 22, 5);
        }

        spawnYolkSplats(x, y, count) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 1.5;
                const dice = Math.random();

                let color = '#FFF8E7'; // Eggshell fragment
                let size = Math.random() * 2 + 1;
                
                if (dice > 0.4) {
                    color = '#F1C40F'; // Yellow yolk
                    size = Math.random() * 3.5 + 1.5;
                } else if (dice > 0.25) {
                    color = '#E67E22'; // Orange yolk
                    size = Math.random() * 3 + 1;
                }

                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1.0,
                    color: color,
                    size: size
                });
            }
        }

        draw() {
            // Background
            this.ctx.fillStyle = '#0a0d13';
            this.ctx.fillRect(0, 0, 800, 600);

            // Technical/Futuristic map grid lines
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
                this.ctx.lineWidth = b.id === 'rpegg' ? 5 : (b.id === 'sniper' ? 3.5 : 2);
                this.ctx.stroke();
            });

            // Draw AOE Explosions (Expanding yolk bubbles)
            this.explosions.forEach(ex => {
                this.ctx.save();
                this.ctx.globalAlpha = ex.alpha * 0.45;
                
                // Exploding core
                const grad = this.ctx.createRadialGradient(ex.x, ex.y, 2, ex.x, ex.y, ex.radius);
                grad.addColorStop(0, '#FFFFFF');
                grad.addColorStop(0.2, '#F1C40F');
                grad.addColorStop(0.8, '#E67E22');
                grad.addColorStop(1.0, 'rgba(231, 76, 60, 0)');
                
                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.restore();
            });

            // Draw Particles (Egg yolks and shards)
            this.particles.forEach(p => {
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1.0;

            // Draw Bad Egg Enemies (Gray cracked eggs with red eyes)
            this.enemies.forEach(e => {
                this.ctx.save();
                this.ctx.translate(e.x, e.y);
                this.ctx.rotate(e.angle);

                // Body (Egg shape)
                this.ctx.beginPath();
                this.ctx.moveTo(0, -e.radius * 1.25);
                this.ctx.bezierCurveTo(e.radius * 0.9, -e.radius * 1.25, e.radius * 1.1, e.radius, 0, e.radius);
                this.ctx.bezierCurveTo(-e.radius * 1.1, e.radius, -e.radius * 0.9, -e.radius * 1.25, 0, -e.radius * 1.25);
                this.ctx.closePath();
                this.ctx.fillStyle = e.type === 'brute' ? '#7F8C8D' : (e.type === 'speedy' ? '#D5D8DC' : '#BDC3C7');
                this.ctx.fill();
                this.ctx.strokeStyle = '#95A5A6';
                this.ctx.lineWidth = 2.5;
                this.ctx.stroke();

                // Shell Crack Lines
                this.ctx.strokeStyle = '#7F8C8D';
                this.ctx.lineWidth = 1.8;
                this.ctx.beginPath();
                this.ctx.moveTo(-e.radius * 0.3, -e.radius * 0.3);
                this.ctx.lineTo(-e.radius * 0.1, 0);
                this.ctx.lineTo(-e.radius * 0.4, e.radius * 0.3);
                this.ctx.stroke();

                // Angry red eyes
                this.ctx.fillStyle = '#E74C3C';
                this.ctx.beginPath();
                this.ctx.arc(e.radius * 0.3, -e.radius * 0.35, 3, 0, Math.PI * 2);
                this.ctx.arc(e.radius * 0.3, e.radius * 0.35, 3, 0, Math.PI * 2);
                this.ctx.fill();

                // Gun (Bad eggs carrying SMGs)
                this.ctx.fillStyle = '#34495E';
                this.ctx.fillRect(e.radius * 0.4, -3, 12, 6);

                // Health bar draw
                if (e.hp < e.maxHp) {
                    this.ctx.restore();
                    this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    this.ctx.fillRect(e.x - e.radius, e.y - e.radius - 12, e.radius * 2, 4);
                    this.ctx.fillStyle = '#E74C3C';
                    this.ctx.fillRect(e.x - e.radius, e.y - e.radius - 12, (e.radius * 2) * (e.hp / e.maxHp), 4);
                    this.ctx.save();
                    this.ctx.translate(e.x, e.y);
                }

                this.ctx.restore();
            });

            // Draw Player (Dapper shell shockers Egg carrying weapons)
            this.ctx.save();
            this.ctx.translate(this.player.x, this.player.y);
            this.ctx.rotate(this.player.angle);

            // Egg Body Shape
            this.ctx.beginPath();
            this.ctx.moveTo(0, -this.player.radius * 1.25);
            this.ctx.bezierCurveTo(this.player.radius * 0.9, -this.player.radius * 1.25, this.player.radius * 1.1, this.player.radius, 0, this.player.radius);
            this.ctx.bezierCurveTo(-this.player.radius * 1.1, this.player.radius, -this.player.radius * 0.9, -this.player.radius * 1.25, 0, -this.player.radius * 1.25);
            this.ctx.closePath();
            this.ctx.fillStyle = '#FFF8E7'; // Clean egg color
            this.ctx.fill();
            this.ctx.strokeStyle = '#D5C5A1';
            this.ctx.lineWidth = 2.8;
            this.ctx.stroke();

            // Determined black eyes
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(this.player.radius * 0.35, -this.player.radius * 0.3, 3, 0, Math.PI * 2);
            this.ctx.arc(this.player.radius * 0.35, this.player.radius * 0.3, 3, 0, Math.PI * 2);
            this.ctx.fill();

            // Angry eyebrows
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.moveTo(this.player.radius * 0.1, -this.player.radius * 0.5);
            this.ctx.lineTo(this.player.radius * 0.5, -this.player.radius * 0.35);
            this.ctx.moveTo(this.player.radius * 0.1, this.player.radius * 0.5);
            this.ctx.lineTo(this.player.radius * 0.5, this.player.radius * 0.35);
            this.ctx.stroke();

            // Weapon model
            const weapon = WEAPONS[this.selectedWeaponIndex];
            this.ctx.fillStyle = '#34495E';
            if (weapon.id === 'rpegg') {
                this.ctx.fillRect(this.player.radius * 0.4, -6, 22, 12);
                this.ctx.fillStyle = '#E74C3C';
                this.ctx.fillRect(this.player.radius * 0.4 + 20, -5, 4, 10);
            } else if (weapon.id === 'scrambler') {
                this.ctx.fillRect(this.player.radius * 0.4, -5, 18, 10);
                this.ctx.strokeStyle = '#1B2631';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(this.player.radius * 0.4, -5, 18, 10);
            } else {
                this.ctx.fillRect(this.player.radius * 0.4, -3, 20, 6);
            }

            this.ctx.restore();

            // HUD overlay drawing
            this.drawHUD();
        }

        drawHUD() {
            const weapon = WEAPONS[this.selectedWeaponIndex];

            // Health Bar
            this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.ctx.fillRect(20, 20, 200, 16);
            this.ctx.fillStyle = '#F1C40F';
            this.ctx.fillRect(20, 20, 200 * (this.playerHealth / 100), 16);
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(20, 20, 200, 16);

            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 12px "Outfit", sans-serif';
            this.ctx.fillText(`ARMOR: ${Math.ceil(this.playerHealth)}%`, 30, 32);

            // Score & Wave info
            this.ctx.font = 'bold 16px "Outfit", sans-serif';
            this.ctx.fillText(`SCORE: ${this.score}`, 20, 60);

            this.ctx.textAlign = 'right';
            this.ctx.fillText(`WAVE: ${this.wave} / ${this.maxWaves}`, 780, 35);
            this.ctx.font = '13px "Outfit", sans-serif';
            this.ctx.fillStyle = '#F1C40F';
            this.ctx.fillText(`INCOMING EGGS: ${this.enemies.length + this.enemiesRemaining}`, 780, 55);
            this.ctx.textAlign = 'left';

            // Selected Weapon panel
            this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.ctx.fillRect(20, 520, 250, 60);
            this.ctx.strokeStyle = '#F1C40F';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(20, 520, 250, 60);

            this.ctx.fillStyle = '#F1C40F';
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
            window.VoyagerGameInstance = new ShellShockersGame(gameContainer);
            console.log("Shell Shockers 2D engine loaded successfully!");
        }
    }

    window.VoyagerEngine = ShellShockersGame;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
})();
