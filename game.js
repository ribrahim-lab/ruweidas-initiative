(function() {
    // 1. Inject CSS Styles
    const styles = `
        #voyager-wrapper {
            position: relative;
            width: 800px;
            height: 600px;
            background-color: #0d0f14;
            border: 3px solid #E74C3C;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(231, 76, 60, 0.3);
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
            font-weight: 950;
            color: #E74C3C;
            margin-bottom: 5px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            text-shadow: 0 0 15px rgba(231, 76, 60, 0.4);
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
            border-color: #E74C3C;
            background: rgba(231, 76, 60, 0.03);
            transform: translateY(-2px);
        }

        .weapon-card.selected {
            border-color: #E74C3C;
            background: rgba(231, 76, 60, 0.12);
            box-shadow: 0 0 15px rgba(231, 76, 60, 0.15);
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

    // 2. Weapon Intel & Skins Configurations (Call of Duty / Fortnite Themed)
    const WEAPONS = [
        {
            id: "m4",
            name: "M4 Carbine",
            skin: "Digital Camo",
            desc: "Tactical fully automatic assault rifle. Extremely reliable fire rate, low recoil, and balanced mid-range damage.",
            damage: 24,
            fireRate: 100, // ms between shots
            range: 800,
            ammoType: "Auto",
            color: "#2ECC71"
        },
        {
            id: "shotgun",
            name: "Tactical Shotgun",
            skin: "Neon Inferno",
            desc: "Fires a wide spread of 8 high-impact buckshots. Devastating close-range punch that clears groups of zombies.",
            damage: 16,
            fireRate: 850,
            range: 300,
            ammoType: "Spread",
            color: "#E67E22"
        },
        {
            id: "rpg",
            name: "RPG-7 Launcher",
            skin: "Carbon Fiber",
            desc: "Fires a high-explosive rocket. Detonates on impact, dealing massive area-of-effect splash damage.",
            damage: 120,
            fireRate: 1600,
            range: 1000,
            ammoType: "Explosive",
            color: "#E74C3C",
            explosive: true,
            explosionRadius: 120
        },
        {
            id: "sniper",
            name: "Barrett .50 Cal",
            skin: "Golden Tiger",
            desc: "Heavy bolt-action sniper rifle. Holding Z zooms in with a scope. Pierces through all zombies in its path.",
            damage: 150,
            fireRate: 1400,
            range: 1200,
            ammoType: "Sniper",
            color: "#F1C40F"
        }
    ];

    // 3. Main POV Game Engine Class
    class POVZombieShooterGame {
        constructor(parent) {
            this.parent = parent;
            this.buildDOMElements();
            this.initCanvas();
            this.bindInputEvents();

            // Game Settings
            this.gameState = 'START';
            this.selectedWeaponIndex = 0;
            this.score = 0;
            this.playerHealth = 100;
            this.wave = 1;
            this.maxWaves = 5;
            this.enemiesRemaining = 0;

            // Camera / Character POV
            this.camera = {
                x: 0, // Horizontal panning coordinate
                y: 0, // Vertical bobbing coordinate
                targetX: 0
            };

            // Game Arrays
            this.enemies = [];
            this.bullets = [];
            this.particles = [];
            this.explosions = [];
            this.bloodSplats = []; // Splats on the character's lens

            // Timing & Recoil
            this.lastShotTime = 0;
            this.recoil = 0;
            this.recoilTarget = 0;
            this.loopId = null;
            this.keys = {};
            this.mouse = { x: 400, y: 300 };

            this.showOverlay();
        }

        buildDOMElements() {
            this.wrapper = document.createElement('div');
            this.wrapper.id = 'voyager-wrapper';

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'voyager-canvas';
            this.canvas.width = 800;
            this.canvas.height = 600;
            this.wrapper.appendChild(this.canvas);

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

            this.canvas.addEventListener('mousedown', () => {
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
                    <div class="voyager-title">Zombie Ops: Warzone</div>
                    <div class="voyager-subtitle">First-Person Tactical Defense</div>
                    
                    <div class="weapon-grid">
                `;

                WEAPONS.forEach((w, idx) => {
                    const isSelected = idx === this.selectedWeaponIndex ? 'selected' : '';
                    content += `
                        <div class="weapon-card ${isSelected}" data-idx="${idx}">
                            <div class="weapon-name">
                                ${w.name}
                                <span class="weapon-ammo-tag">${w.skin}</span>
                            </div>
                            <div class="weapon-desc">${w.desc}</div>
                            <div class="weapon-stats">
                                <div class="stat-item">DMG: <span>${w.damage}</span></div>
                                <div class="stat-item">RATE: <span>${w.fireRate}ms</span></div>
                            </div>
                        </div>
                    `;
                });

                content += `
                    </div>
                    <button class="voyager-btn" id="voyager-deploy-btn">Deploy Operations</button>
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
                    <div class="voyager-title" style="color: #E74C3C;">K.I.A.</div>
                    <div class="voyager-text">Your defenses were breached. The zombie horde scrambled your vitals. Redeploy!</div>
                    <button class="voyager-btn" id="voyager-restart-btn">Redeploy Ops</button>
                `;
                this.overlay.innerHTML = content;
                document.getElementById('voyager-restart-btn').addEventListener('click', () => this.restartGame());

            } else if (this.gameState === 'SUCCESS') {
                content = `
                    <div class="voyager-title" style="color: #2ECC71;">VICTORY ROYALE</div>
                    <div class="voyager-text">Outstanding survival! You cleared all waves of the tactical zombie swarm and secured the sector.</div>
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
            this.explosions = [];
            this.bloodSplats = [];

            // Panning Camera
            this.camera.x = 0;
            this.camera.targetX = 0;
            this.camera.y = 0;

            this.hideOverlay();
            this.startWave();
            this.gameLoop();
        }

        restartGame() {
            this.gameState = 'START';
            this.showOverlay();
        }

        startWave() {
            this.enemiesRemaining = this.wave * 5 + 5;
            this.enemies = [];
            for (let i = 0; i < Math.min(this.enemiesRemaining, 5); i++) {
                this.spawnEnemy();
            }
        }

        spawnEnemy() {
            // Spawn far away in the background (Z represents distance from camera)
            // Z starts at 1000 (very far) and runs to 0 (reaches player screen)
            // X is horizontal offset (-400 to 400)
            const angle = Math.random() * Math.PI - Math.PI / 2; // Fan in front
            const dist = 1000;

            const dice = Math.random();
            let type = 'normal';
            let hp = 40 + this.wave * 12;
            let speed = 2.2 + (this.wave * 0.15); // Z-axis approach speed
            let size = 26; // Base rendering scale

            if (dice > 0.8 && this.wave >= 2) {
                type = 'speedy';
                hp = 25;
                speed = 3.6 + (this.wave * 0.2);
                size = 20;
            } else if (dice > 0.92 && this.wave >= 3) {
                type = 'brute';
                hp = 140 + this.wave * 20;
                speed = 1.2;
                size = 40;
            }

            this.enemies.push({
                x: (Math.random() - 0.5) * 800, // Horizontal layout offset
                z: dist,
                y: 80, // Elevation above horizon
                size: size,
                type: type,
                hp: hp,
                maxHp: hp,
                speed: speed,
                bob: Math.random() * 100, // bobbing animation offset
                damagedCooldown: 0
            });
            this.enemiesRemaining--;
        }

        triggerVictory() {
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
                console.log("Handoff trigger: Score = ", this.score);
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

            // 1. Move Camera Lens Panning (Left/Right to scan panorama)
            let panSpeed = 6.5;
            if (this.keys['Shift'] || this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
                panSpeed = 10.0; // Fast pan
            } else if (this.keys['z'] || this.keys['KeyZ'] || this.keys['Z']) {
                panSpeed = 2.5; // Steady sniper pan
            }

            if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
                this.camera.targetX -= panSpeed;
            }
            if (this.keys['ArrowRight'] || this.keys['KeyD']) {
                this.camera.targetX += panSpeed;
            }

            // Limit panning to maintain focus on the sector
            this.camera.targetX = Math.max(-500, Math.min(500, this.camera.targetX));
            
            // Interpolate camera for smooth glide panning
            this.camera.x += (this.camera.targetX - this.camera.x) * 0.15;

            // Camera Bobbing
            const isMoving = this.keys['ArrowLeft'] || this.keys['ArrowRight'] || this.keys['KeyA'] || this.keys['KeyD'];
            if (isMoving) {
                this.camera.y = Math.sin(Date.now() * 0.015) * 1.8;
            } else {
                this.camera.y = this.camera.y * 0.85;
            }

            // 2. Shooting Firing
            const now = Date.now();
            if (this.keys['Mouse'] && now - this.lastShotTime >= weapon.fireRate) {
                this.fireWeapon(weapon);
                this.lastShotTime = now;
            }

            // Decay weapon recoil kick
            this.recoil += (this.recoilTarget - this.recoil) * 0.18;
            this.recoilTarget *= 0.8;

            // 3. Move Bullets (in 3D screen space)
            this.bullets.forEach((b, idx) => {
                b.z -= b.speed; // Flies forward (away from camera)
                
                // Keep bullet relative to player's shot heading
                b.x += b.vx;
                b.y += b.vy;

                // Out of range check
                if (b.z <= 0 || b.z >= 1200) {
                    if (b.explosive) {
                        this.explodeExplosive(b.x, b.y, b.z, b.explosionRadius, b.damage);
                    }
                    this.bullets.splice(idx, 1);
                }
            });

            // 4. Update Explosions
            this.explosions.forEach((ex, idx) => {
                ex.radius += ex.growthSpeed;
                ex.alpha -= 0.04;
                if (ex.alpha <= 0) {
                    this.explosions.splice(idx, 1);
                }
            });

            // 5. Update Blood Splats on visor screen
            this.bloodSplats.forEach((s, idx) => {
                s.y += s.slideSpeed; // Drops slowly slide down
                s.alpha -= 0.005; // Fade out slowly
                if (s.alpha <= 0 || s.y > 620) {
                    this.bloodSplats.splice(idx, 1);
                }
            });

            // 6. Update Spark/Feather particles
            this.particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.03;
                if (p.alpha <= 0) {
                    this.particles.splice(idx, 1);
                }
            });

            // 7. Update Zombies (Scaling towards the screen)
            this.enemies.forEach((enemy, idx) => {
                if (enemy.damagedCooldown > 0) enemy.damagedCooldown--;

                // Move closer on Z axis
                enemy.z -= enemy.speed;

                // Bobbing height to simulate running
                enemy.bob += 0.12;

                // Check screen strike (Reached the camera lens!)
                if (enemy.z <= 30) {
                    this.playerHealth -= 12; // Striking damage
                    this.spawnBloodSplatOnScreen();
                    
                    // Push zombie back on hit to let them charge again
                    enemy.z = 250;
                    enemy.x += (Math.random() - 0.5) * 200;

                    if (this.playerHealth <= 0) {
                        this.playerHealth = 0;
                        this.gameState = 'FAIL';
                        this.triggerHandoff();
                        this.showOverlay();
                    }
                }

                // Check bullet collisions (Bullet must intersect zombie projected size)
                this.bullets.forEach((bullet, bIdx) => {
                    // Check if bullet and enemy are at a similar Z distance
                    const zDiff = Math.abs(bullet.z - enemy.z);
                    if (zDiff < 60) {
                        // Project enemy and bullet coordinates to check intersection
                        const dist = Math.hypot(bullet.x - enemy.x, bullet.y - (enemy.y + Math.sin(enemy.bob) * 5));
                        if (dist < enemy.size * 1.5) {
                            if (bullet.explosive) {
                                this.explodeExplosive(bullet.x, bullet.y, bullet.z, bullet.explosionRadius, bullet.damage);
                            } else {
                                enemy.hp -= bullet.damage;
                                enemy.damagedCooldown = 6;
                                this.spawnSparks(bullet.x, bullet.y, bullet.z, '#E74C3C', 6);
                            }

                            if (bullet.id !== 'sniper') {
                                this.bullets.splice(bIdx, 1);
                            }

                            if (enemy.hp <= 0) {
                                this.scrambleZombie(enemy);
                                this.enemies.splice(idx, 1);
                            }
                        }
                    }
                });
            });

            // Spawn next enemies
            if (this.enemies.length < 5 && this.enemiesRemaining > 0) {
                this.spawnEnemy();
            }

            // Check wave completion
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
            // Shoots from weapon barrel towards the mouse crosshair center
            // We calculate bullet trajectory vectors in screen/world coords
            const targetX = this.camera.x + (this.mouse.x - 400);
            const targetY = 15 + (this.mouse.y - 300); // vertical elevation offset

            this.recoilTarget += 24; // recoil kick back

            if (w.id === 'shotgun') {
                // Wide shotgun spray of 6 pellets
                for (let i = -2; i <= 2; i++) {
                    const devX = targetX + (i * 25);
                    const devY = targetY + (Math.random() - 0.5) * 40;

                    this.bullets.push({
                        id: w.id,
                        x: this.camera.x + 30, // fires slightly offset right
                        y: 80,
                        z: 100, // starts near screen
                        vx: (devX - this.camera.x) / 12,
                        vy: (devY - 80) / 12,
                        speed: 35.0, // moving Z-axis step
                        damage: w.damage,
                        range: w.range,
                        color: w.color,
                        explosive: false
                    });
                }
            } else {
                this.bullets.push({
                    id: w.id,
                    x: this.camera.x + 30,
                    y: 80,
                    z: 100,
                    vx: (targetX - this.camera.x) / 15,
                    vy: (targetY - 80) / 15,
                    speed: 40.0,
                    damage: w.damage,
                    range: w.range,
                    color: w.color,
                    explosive: w.explosive || false,
                    explosionRadius: w.explosionRadius || 0
                });
            }

            // Flash sparks
            this.spawnSparks(this.camera.x + 30, 80, 100, '#F1C40F', 5);
        }

        explodeExplosive(x, y, z, radius, damage) {
            this.explosions.push({
                x: x,
                y: y,
                z: z,
                radius: 10,
                maxRadius: radius,
                growthSpeed: radius / 12,
                alpha: 1.0
            });

            // Splash damage
            this.enemies.forEach((enemy, idx) => {
                const dist = Math.hypot(enemy.x - x, enemy.z - z);
                if (dist < (radius + enemy.size * 2)) {
                    const factor = 1 - (dist / (radius + enemy.size * 2));
                    enemy.hp -= Math.round(damage * factor);
                    enemy.damagedCooldown = 6;
                    this.spawnSparks(enemy.x, enemy.y, enemy.z, '#E74C3C', 8);

                    if (enemy.hp <= 0) {
                        this.scrambleZombie(enemy);
                        this.enemies.splice(idx, 1);
                    }
                }
            });

            this.spawnSparks(x, y, z, '#E67E22', 15);
        }

        scrambleZombie(enemy) {
            this.spawnSparks(enemy.x, enemy.y, enemy.z, '#2ECC71', 25); // blast green zombie sparks
            this.score += enemy.type === 'brute' ? 400 : (enemy.type === 'speedy' ? 200 : 100);
        }

        spawnSparks(x, y, z, color, count) {
            // Project world coordinate into screen coordinates to spawn flat screen-particle effects
            const scale = 250 / z;
            const screenX = 400 + (x - this.camera.x) * scale;
            const screenY = 300 + (y - this.camera.y) * scale;

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 1;
                this.particles.push({
                    x: screenX,
                    y: screenY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1.0,
                    color: color,
                    size: Math.random() * 3 + 1.5
                });
            }
        }

        spawnBloodSplatOnScreen() {
            // Add a blood splat at a random position on the screen
            const bx = Math.random() * 600 + 100;
            const by = Math.random() * 400 + 100;
            this.bloodSplats.push({
                x: bx,
                y: by,
                radius: Math.random() * 20 + 15,
                alpha: 0.85,
                slideSpeed: Math.random() * 0.4 + 0.15
            });
        }

        draw() {
            // 1. Draw Panoramic Background (Destroyed City / COD Warzone style)
            // Sky gradient (Sunset crimson/purple apocalypse)
            const skyGrad = this.ctx.createLinearGradient(0, 0, 0, 300);
            skyGrad.addColorStop(0, '#0c0714');
            skyGrad.addColorStop(1, '#2c131d');
            this.ctx.fillStyle = skyGrad;
            this.ctx.fillRect(0, 0, 800, 600);

            // Draw Ruined buildings silhouette (Scrolls horizontally relative to camera panning)
            this.ctx.fillStyle = '#170c14';
            const panOffset = -this.camera.x * 0.5; // Parallax effect
            
            // Render basic parallax silhouette buildings
            for (let i = -1000; i < 1800; i += 240) {
                const h = 180 + Math.sin(i * 0.05) * 80;
                this.ctx.fillRect(i + panOffset, 300 - h, 180, h);
                // Draw antennas
                this.ctx.strokeStyle = '#170c14';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(i + panOffset + 90, 300 - h);
                this.ctx.lineTo(i + panOffset + 90, 300 - h - 30);
                this.ctx.stroke();
            }

            // Draw Ground floor base
            this.ctx.fillStyle = '#0f0e13';
            this.ctx.fillRect(0, 300, 800, 300);

            // Draw road lanes/details scrolling parallax
            this.ctx.fillStyle = '#18171f';
            for (let i = -1000; i < 1800; i += 180) {
                this.ctx.fillRect(i + -this.camera.x, 300, 100, 300);
            }

            // 2. Project & Draw elements (Zombies, Explosions, Bullets)
            const renderQueue = [];

            // Project Zombies
            this.enemies.forEach(e => {
                const scale = 220 / e.z;
                const screenX = 400 + (e.x - this.camera.x) * scale;
                const screenY = 300 + (e.y + Math.sin(e.bob) * 5 - this.camera.y) * scale;

                renderQueue.push({
                    type: 'zombie',
                    z: e.z,
                    x: screenX,
                    y: screenY,
                    scale: scale,
                    ref: e
                });
            });

            // Project Explosions
            this.explosions.forEach(ex => {
                const scale = 220 / ex.z;
                const screenX = 400 + (ex.x - this.camera.x) * scale;
                const screenY = 300 + (ex.y - this.camera.y) * scale;

                renderQueue.push({
                    type: 'explosion',
                    z: ex.z,
                    x: screenX,
                    y: screenY,
                    scale: scale,
                    ref: ex
                });
            });

            // Project Bullets
            this.bullets.forEach(b => {
                const scale = 220 / b.z;
                const screenX = 400 + (b.x - this.camera.x) * scale;
                const screenY = 300 + (b.y - this.camera.y) * scale;

                renderQueue.push({
                    type: 'bullet',
                    z: b.z,
                    x: screenX,
                    y: screenY,
                    scale: scale,
                    ref: b
                });
            });

            // Sort Back-to-Front
            renderQueue.sort((a, b) => b.z - a.z);

            // Draw Queue
            renderQueue.forEach(item => {
                if (item.type === 'zombie') {
                    this.drawZombiePOV(item);
                } else if (item.type === 'explosion') {
                    this.drawExplosionPOV(item);
                } else if (item.type === 'bullet') {
                    this.drawBulletPOV(item);
                }
            });

            // 3. Draw Flat Particles (Blood sparks/flashes on screen layer)
            this.particles.forEach(p => {
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1.0;

            // 4. Draw First-Person Gun Overlay
            this.drawFirstPersonGun();

            // 5. Draw Blood Splats on the camera lens/visor
            this.drawBloodSplatsOnScreen();

            // 6. Draw HUD overlays
            this.drawHUD();
        }

        drawZombiePOV(p) {
            const size = p.ref.size * p.scale * 0.9;
            if (size <= 0 || p.x < -size || p.x > 800 + size) return; // Cull off-screen

            this.ctx.save();
            this.ctx.translate(p.x, p.y);

            // Fog / Distance shading
            const fogFactor = Math.min(0.9, p.z / 1000);
            
            // Draw Zombie (Angry rot-green face with glowing eyes)
            const headColor = p.ref.damagedCooldown > 0 ? '#E74C3C' : (p.ref.type === 'brute' ? '#1E6B37' : '#2ECC71');
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, size, 0, Math.PI * 2);
            this.ctx.fillStyle = headColor;
            this.ctx.fill();
            this.ctx.strokeStyle = '#27AE60';
            this.ctx.lineWidth = Math.max(1, 2.5 * p.scale * 0.012);
            this.ctx.stroke();

            // Glowing Green/Yellow Eyes (Undead look!)
            this.ctx.fillStyle = '#F1C40F';
            this.ctx.shadowBlur = size * 0.4;
            this.ctx.shadowColor = '#F1C40F';
            this.ctx.beginPath();
            this.ctx.arc(-size * 0.35, -size * 0.25, Math.max(1.5, size * 0.15), 0, Math.PI * 2);
            this.ctx.arc(size * 0.35, -size * 0.25, Math.max(1.5, size * 0.15), 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0; // reset

            // Rotten mouth / Snarl
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = Math.max(1, size * 0.08);
            this.ctx.beginPath();
            this.ctx.arc(0, size * 0.3, size * 0.4, Math.PI, 0);
            this.ctx.stroke();

            // Military Vest / Tactical skins (COD Theme)
            this.ctx.fillStyle = p.ref.type === 'brute' ? '#2C3E50' : '#4E5A44'; // camo military vest
            this.ctx.fillRect(-size * 0.65, size * 0.8, size * 1.3, size * 1.5);
            this.ctx.strokeStyle = '#1B2631';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(-size * 0.65, size * 0.8, size * 1.3, size * 1.5);

            // Draw military tactical helmet on standard/brute zombies
            if (p.ref.type === 'brute') {
                this.ctx.fillStyle = '#34495E';
                this.ctx.beginPath();
                this.ctx.arc(0, -size * 0.4, size * 1.15, Math.PI, 0);
                this.ctx.fill();
            } else if (p.ref.type === 'normal') {
                // Helmet straps/cover
                this.ctx.fillStyle = '#5D6D7E';
                this.ctx.beginPath();
                this.ctx.arc(0, -size * 0.3, size * 1.1, Math.PI, 0);
                this.ctx.fill();
            }

            // Health bar above zombie
            if (p.ref.hp < p.ref.maxHp) {
                const barW = size * 1.5;
                this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
                this.ctx.fillRect(-barW/2, -size * 1.6, barW, 4);
                this.ctx.fillStyle = '#E74C3C';
                this.ctx.fillRect(-barW/2, -size * 1.6, barW * (p.ref.hp / p.ref.maxHp), 4);
            }

            // Apply Fog shading relative to Z distance
            this.ctx.fillStyle = `rgba(13, 17, 23, ${fogFactor * 0.82})`;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        }

        drawExplosionPOV(p) {
            const size = p.ref.radius * p.scale * 0.055;
            if (size <= 0) return;

            this.ctx.save();
            this.ctx.globalAlpha = p.ref.alpha * 0.55;

            const grad = this.ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, size);
            grad.addColorStop(0, '#FFFFFF');
            grad.addColorStop(0.3, '#F1C40F');
            grad.addColorStop(0.7, '#D35400');
            grad.addColorStop(1, 'rgba(231,76,60,0)');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        }

        drawBulletPOV(p, bullet) {
            const size = Math.max(1.5, 5 * p.scale * 0.02);
            this.ctx.fillStyle = bullet.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.shadowBlur = size * 2.5;
            this.ctx.shadowColor = bullet.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0; // Reset
        }

        drawFirstPersonGun() {
            const weapon = WEAPONS[this.selectedWeaponIndex];
            const recoilOffset = this.recoil;
            
            // Panning recoil displacement
            const panDev = (this.camera.targetX - this.camera.x) * 0.6;
            
            // Bobbing movement when scanning/running
            const isMoving = this.keys['ArrowLeft'] || this.keys['ArrowRight'] || this.keys['KeyA'] || this.keys['KeyD'];
            const bobX = isMoving ? Math.sin(Date.now() * 0.015) * 12 : 0;
            const bobY = isMoving ? Math.abs(Math.cos(Date.now() * 0.015)) * 8 : 0;

            const isSniperZoom = (weapon.id === 'sniper') && (this.keys['z'] || this.keys['KeyZ'] || this.keys['Z']);

            if (isSniperZoom) {
                // RENDER SNIPER SCOPE VIEW OVERLAY (Call of Duty Style Zoom)
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                this.ctx.fillRect(0, 0, 800, 600);

                // Scope black circle border
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 150;
                this.ctx.beginPath();
                this.ctx.arc(400, 300, 390, 0, Math.PI * 2);
                this.ctx.stroke();

                // Scope reticle grid lines
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.lineWidth = 2.5;
                this.ctx.beginPath();
                this.ctx.moveTo(400, 50);
                this.ctx.lineTo(400, 550);
                this.ctx.moveTo(50, 300);
                this.ctx.lineTo(750, 300);
                this.ctx.stroke();

                // Tick markings
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.lineWidth = 2;
                for (let i = 100; i < 500; i += 50) {
                    if (i === 300) continue;
                    this.ctx.beginPath();
                    this.ctx.moveTo(400 - 10, i); this.ctx.lineTo(400 + 10, i);
                    this.ctx.moveTo(i, 300 - 10); this.ctx.lineTo(i, 300 + 10);
                    this.ctx.stroke();
                }

                // Center red hot dot
                this.ctx.fillStyle = 'red';
                this.ctx.beginPath();
                this.ctx.arc(400, 300, 3.5, 0, Math.PI * 2);
                this.ctx.fill();
                return;
            }

            // Draw Weapon in First-Person hands (Military / Fortnite skins)
            this.ctx.save();
            this.ctx.translate(450 - panDev + bobX, 470 + bobY + recoilOffset);

            // Left/Right character hands (wearing black combat gloves)
            this.ctx.fillStyle = '#2C3E50'; // Glove color
            this.ctx.strokeStyle = '#1A252F';
            this.ctx.lineWidth = 3;
            
            // Draw weapon models
            if (weapon.id === 'm4') {
                // M4 Rifle (Digital Camo green skin)
                this.ctx.fillStyle = '#27AE60'; // Camo green body
                this.ctx.fillRect(-60, 10, 100, 30);
                this.ctx.fillStyle = '#212F3D'; // carbon stock
                this.ctx.fillRect(-110, 15, 50, 24);
                
                // Camo prints
                this.ctx.fillStyle = '#1E8449';
                this.ctx.fillRect(-40, 15, 30, 20);
                this.ctx.fillRect(10, 15, 20, 20);
                
                this.ctx.fillStyle = '#2C3E50'; // long barrel
                this.ctx.fillRect(40, 20, 110, 12);
                this.ctx.fillStyle = '#000'; // iron sight
                this.ctx.fillRect(140, 10, 6, 10);
                this.ctx.fillStyle = '#BDC3C7'; // magazine
                this.ctx.fillRect(-20, 40, 22, 45);

            } else if (weapon.id === 'shotgun') {
                // Tactical Shotgun (Neon Inferno skin)
                this.ctx.fillStyle = '#D35400'; // Neon orange body
                this.ctx.fillRect(-70, 10, 120, 32);
                this.ctx.fillStyle = '#E67E22';
                this.ctx.fillRect(-20, 13, 50, 26);

                // Glow lines
                this.ctx.fillStyle = '#FF5733';
                this.ctx.fillRect(-60, 23, 100, 3);
                
                this.ctx.fillStyle = '#566573'; // Dual shotgun barrel
                this.ctx.fillRect(50, 16, 120, 10);
                this.ctx.fillRect(50, 26, 120, 10);

            } else if (weapon.id === 'rpg') {
                // RPG Launcher (Carbon Fiber skin)
                this.ctx.fillStyle = '#1F242D'; // Carbon black body tube
                this.ctx.fillRect(-90, 0, 170, 45);
                this.ctx.fillStyle = '#E74C3C'; // Warning label stripe
                this.ctx.fillRect(-50, 0, 8, 45);
                this.ctx.fillRect(30, 0, 8, 45);

                this.ctx.fillStyle = '#34495E'; // launcher barrel
                this.ctx.fillRect(80, 5, 60, 35);

                // Loaded rocket tip
                this.ctx.fillStyle = '#2ECC71';
                this.ctx.beginPath();
                this.ctx.moveTo(140, 5);
                this.ctx.lineTo(165, 22);
                this.ctx.lineTo(140, 40);
                this.ctx.closePath();
                this.ctx.fill();

            } else if (weapon.id === 'sniper') {
                // Barrett .50 Cal (Golden Tiger skin)
                this.ctx.fillStyle = '#F1C40F'; // Golden frame
                this.ctx.fillRect(-80, 8, 120, 34);
                this.ctx.fillStyle = '#D4AC0D';
                this.ctx.fillRect(-30, 11, 60, 28);
                
                // Black tiger stripes
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(-60, 8, 8, 34);
                this.ctx.fillRect(-20, 8, 8, 34);
                this.ctx.fillRect(20, 8, 8, 34);

                this.ctx.fillStyle = '#34495E'; // long sniper barrel
                this.ctx.fillRect(40, 19, 140, 10);
                this.ctx.fillStyle = '#000'; // muzzle brake
                this.ctx.fillRect(180, 15, 12, 18);

                // Scope mounted on top
                this.ctx.fillStyle = '#2C3E50';
                this.ctx.fillRect(-20, -14, 45, 16);
                this.ctx.fillStyle = '#1F242D';
                this.ctx.fillRect(-35, -17, 15, 22);
                this.ctx.fillRect(25, -17, 15, 22);
            }

            // Draw player's gloves holding the weapon
            this.ctx.fillStyle = '#1C2833';
            this.ctx.beginPath();
            this.ctx.arc(-20, 42, 22, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.restore();

            // Tactile Crosshair (Call of Duty dot reticle)
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.arc(400, 300, 5, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(400, 300, 1.8, 0, Math.PI * 2);
            this.ctx.fill();
        }

        drawBloodSplatsOnScreen() {
            // Draw red blood splats splattered on the lens/visor
            this.bloodSplats.forEach(s => {
                this.ctx.save();
                this.ctx.globalAlpha = s.alpha;

                // Radial gradient to make the blood drop look 3D and liquid
                const grad = this.ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, s.radius);
                grad.addColorStop(0, '#C0392B'); // dark blood core
                grad.addColorStop(0.6, '#922B21');
                grad.addColorStop(1.0, 'rgba(120, 40, 40, 0)');
                
                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw secondary sliding drops
                this.ctx.fillStyle = '#922B21';
                this.ctx.beginPath();
                this.ctx.arc(s.x, s.y - s.radius * 0.8, s.radius * 0.25, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.restore();
            });
        }

        drawHUD() {
            const weapon = WEAPONS[this.selectedWeaponIndex];

            // Vitals health bar
            this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.ctx.fillRect(20, 20, 200, 16);
            this.ctx.fillStyle = '#E74C3C';
            this.ctx.fillRect(20, 20, 200 * (this.playerHealth / 100), 16);
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(20, 20, 200, 16);

            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 12px "Outfit", sans-serif';
            this.ctx.fillText(`VITALS: ${Math.ceil(this.playerHealth)}%`, 30, 32);

            // Score & Wave info
            this.ctx.font = 'bold 16px "Outfit", sans-serif';
            this.ctx.fillText(`SCORE: ${this.score}`, 20, 60);

            this.ctx.textAlign = 'right';
            this.ctx.fillText(`WAVE: ${this.wave} / ${this.maxWaves}`, 780, 35);
            this.ctx.font = '13px "Outfit", sans-serif';
            this.ctx.fillStyle = '#E74C3C';
            this.ctx.fillText(`ZOMBIES REMAINING: ${this.enemies.length + this.enemiesRemaining}`, 780, 55);
            this.ctx.textAlign = 'left';

            // Selected Weapon panel
            this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.ctx.fillRect(20, 520, 250, 60);
            this.ctx.strokeStyle = '#E74C3C';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(20, 520, 250, 60);

            this.ctx.fillStyle = '#E74C3C';
            this.ctx.font = 'bold 16px "Outfit", sans-serif';
            this.ctx.fillText(weapon.name, 35, 545);
            this.ctx.fillStyle = '#94A3B8';
            this.ctx.font = '12px "Outfit", sans-serif';
            this.ctx.fillText(`SKIN: ${weapon.skin}  |  POWER: ${weapon.damage}`, 35, 565);
        }
    }

    // Auto Init
    function initGame() {
        const gameContainer = document.getElementById('game-container') || document.body;
        if (gameContainer) {
            window.VoyagerGameInstance = new POVZombieShooterGame(gameContainer);
            console.log("Zombie Ops: Warzone engine loaded successfully!");
        }
    }

    window.VoyagerEngine = POVZombieShooterGame;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
})();
