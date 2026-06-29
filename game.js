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
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(241, 196, 15, 0.25);
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

    // 2. Weapon Intel & Skins configurations (Shell Shockers 3D layout)
    const WEAPONS = [
        {
            id: "cluck",
            name: "Cluck 9mm",
            skin: "Neon Chrome",
            desc: "Rapid semi-automatic pistol. Very steady handling, quick reload, and infinite backup magazine.",
            damage: 25,
            fireRate: 180,
            color: "#E2E8F0"
        },
        {
            id: "scrambler",
            name: "The Scrambler",
            skin: "Gold Wood",
            desc: "Tactical pump-action shotgun. Fires a wide spread of 8 shell fragments. Fatal at point-blank range.",
            damage: 15,
            fireRate: 900,
            color: "#D35400"
        },
        {
            id: "eggk47",
            name: "EggK-47",
            skin: "Military Camo",
            desc: "Fully automatic assault rifle. Fires armor-piercing bullets at high velocity. Excellent all-rounder.",
            damage: 22,
            fireRate: 90,
            color: "#27AE60"
        },
        {
            id: "rpegg",
            name: "RPEGG Launcher",
            skin: "Carbon Fiber",
            desc: "Heavy RPG firing high-explosive yolks that detonate on contact, clearing all nearby enemies.",
            damage: 90,
            fireRate: 1500,
            color: "#E74C3C",
            explosive: true,
            explosionRadius: 100
        }
    ];

    // 3. Main 3D Game Engine Class
    class ShellShockers3DGame {
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

            // Camera in 3D Space
            this.camera = {
                x: 0,
                y: 0, // Vertical position
                z: 0,
                yaw: -Math.PI / 2, // Rotational heading
                bob: 0
            };

            // Game loops structures
            this.enemies = [];
            this.bullets = [];
            this.particles = [];
            this.explosions = [];

            // Timing
            this.lastShotTime = 0;
            this.recoil = 0;
            this.recoilTarget = 0;
            this.loopId = null;
            this.keys = {};

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
            window.addEventListener('keydown', (e) => {
                this.keys[e.key] = true;
                this.keys[e.code] = true;

                // Stop scrolling
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
                    e.preventDefault();
                }

                // Cheat shortcut: Shift + D
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

            this.canvas.addEventListener('mousedown', () => {
                this.keys['Mouse'] = true;
            });

            window.addEventListener('mouseup', () => {
                this.keys['Mouse'] = false;
            });
        }

        showOverlay() {
            this.overlay.classList.remove('hidden');
            let content = '';

            if (this.gameState === 'START') {
                content = `
                    <div class="voyager-title">Shell Shockers 3D</div>
                    <div class="voyager-subtitle">Egg Warfare &bull; Arsenal Selection</div>
                    
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
                    <button class="voyager-btn" id="voyager-deploy-btn">Deploy In 3D</button>
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
                    <div class="voyager-title" style="color: #E74C3C;">Scrambled!</div>
                    <div class="voyager-text">Your shell was cracked by the bad eggs. Get back in the fight!</div>
                    <button class="voyager-btn" id="voyager-restart-btn">Redeploy</button>
                `;
                this.overlay.innerHTML = content;
                document.getElementById('voyager-restart-btn').addEventListener('click', () => this.restartGame());

            } else if (this.gameState === 'SUCCESS') {
                content = `
                    <div class="voyager-title" style="color: #2ECC71;">Splat Victory</div>
                    <div class="voyager-text">Egg-cellent combat! All waves of Bad Eggs have been scrambled. Zarg congratulates you.</div>
                    <button class="voyager-btn" id="voyager-close-btn">Return to Archives</button>
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
            
            // Clean arrays
            this.enemies = [];
            this.bullets = [];
            this.particles = [];
            this.explosions = [];

            // Reset camera in 3D
            this.camera.x = 0;
            this.camera.z = -200;
            this.camera.yaw = Math.PI / 2;
            this.camera.bob = 0;

            this.hideOverlay();
            this.startWave();
            this.gameLoop();
        }

        restartGame() {
            this.gameState = 'START';
            this.showOverlay();
        }

        startWave() {
            this.enemiesRemaining = this.wave * 5 + 3;
            this.enemies = [];
            for (let i = 0; i < Math.min(this.enemiesRemaining, 6); i++) {
                this.spawnEnemy();
            }
        }

        spawnEnemy() {
            // Spawn in 3D radius around player
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 500 + 400; // Far away

            const dice = Math.random();
            let type = 'normal';
            let hp = 40 + this.wave * 10;
            let speed = 1.6 + (this.wave * 0.12);
            let size = 25; // 3D billboard scale

            if (dice > 0.75 && this.wave >= 2) {
                type = 'speedy';
                hp = 25;
                speed = 2.8 + (this.wave * 0.15);
                size = 20;
            } else if (dice > 0.9 && this.wave >= 3) {
                type = 'brute';
                hp = 120 + this.wave * 20;
                speed = 0.8;
                size = 38;
            }

            this.enemies.push({
                x: this.camera.x + Math.cos(angle) * dist,
                z: this.camera.z + Math.sin(angle) * dist,
                y: 10, // Height relative to floor
                size: size,
                type: type,
                hp: hp,
                maxHp: hp,
                speed: speed,
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

            // 1. Camera Rotations & 3D Movement (Keyboard controls)
            // Rotate camera yaw (Horizontal look)
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
                this.camera.yaw -= 0.04;
            }
            if (this.keys['ArrowRight'] || this.keys['KeyD']) {
                this.camera.yaw += 0.04;
            }

            // Move forward/backward along view yaw
            let moveX = 0;
            let moveZ = 0;
            if (this.keys['ArrowUp'] || this.keys['KeyW']) {
                moveX += Math.cos(this.camera.yaw);
                moveZ += Math.sin(this.camera.yaw);
            }
            if (this.keys['ArrowDown'] || this.keys['KeyS']) {
                moveX -= Math.cos(this.camera.yaw);
                moveZ -= Math.sin(this.camera.yaw);
            }

            if (moveX !== 0 || moveZ !== 0) {
                const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
                let multiplier = 1.0;
                if (this.keys['Shift'] || this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
                    multiplier = 1.8; // Sprint
                } else if (this.keys['z'] || this.keys['KeyZ'] || this.keys['Z']) {
                    multiplier = 0.4; // Aim walk
                }

                const moveSpeed = 2.8 * multiplier;
                this.camera.x += (moveX / len) * moveSpeed;
                this.camera.z += (moveZ / len) * moveSpeed;

                // Bobbing camera
                this.camera.bob += 0.15;
                this.camera.y = Math.sin(this.camera.bob) * 1.5;
            } else {
                // Settle camera bobbing
                this.camera.y = this.camera.y * 0.9;
            }

            // Keep inside play field boundary limits (e.g. 800 width boundaries)
            this.camera.x = Math.max(-600, Math.min(600, this.camera.x));
            this.camera.z = Math.max(-600, Math.min(600, this.camera.z));

            // 2. Weapons shooting
            const now = Date.now();
            if (this.keys['Mouse'] && now - this.lastShotTime >= weapon.fireRate) {
                this.fireWeapon(weapon);
                this.lastShotTime = now;
            }

            // Recoil decay
            this.recoil += (this.recoilTarget - this.recoil) * 0.2;
            this.recoilTarget *= 0.8;

            // 3. Move Bullets in 3D Space
            this.bullets.forEach((b, idx) => {
                b.x += b.vx;
                b.y += b.vy;
                b.z += b.vz;
                
                // Bullet range check
                b.life--;
                if (b.life <= 0) {
                    if (b.explosive) {
                        this.explode3D(b.x, b.y, b.z, b.explosionRadius, b.damage);
                    }
                    this.bullets.splice(idx, 1);
                }
            });

            // 4. Update 3D Explosions
            this.explosions.forEach((ex, idx) => {
                ex.radius += ex.growthSpeed;
                ex.alpha -= 0.05;
                if (ex.alpha <= 0) {
                    this.explosions.splice(idx, 1);
                }
            });

            // 5. Update 3D Particles (Gravity physics)
            this.particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.z += p.vz;
                
                p.vy += 0.15; // Gravity
                p.alpha -= 0.03;
                if (p.alpha <= 0 || p.y > 40) { // Settle floor
                    this.particles.splice(idx, 1);
                }
            });

            // 6. Update 3D Enemies (Chase camera position)
            this.enemies.forEach((enemy, idx) => {
                if (enemy.damagedCooldown > 0) enemy.damagedCooldown--;

                const dx = this.camera.x - enemy.x;
                const dz = this.camera.z - enemy.z;
                const dist = Math.hypot(dx, dz);

                if (dist > 18) {
                    // Chase camera coordinates
                    enemy.x += (dx / dist) * enemy.speed;
                    enemy.z += (dz / dist) * enemy.speed;
                } else {
                    // Melee attack camera
                    this.playerHealth -= 0.35; // Damage player
                    this.spawnYolkSplats3D(enemy.x, enemy.y, enemy.z, 2);

                    if (this.playerHealth <= 0) {
                        this.playerHealth = 0;
                        this.gameState = 'FAIL';
                        this.triggerHandoff();
                        this.showOverlay();
                    }
                }

                // Check standard bullet collisions in 3D Space
                this.bullets.forEach((bullet, bIdx) => {
                    const dist3D = Math.sqrt(
                        Math.pow(bullet.x - enemy.x, 2) +
                        Math.pow(bullet.z - enemy.z, 2)
                    );

                    if (dist3D < (enemy.size * 0.7)) {
                        if (bullet.explosive) {
                            this.explode3D(bullet.x, bullet.y, bullet.z, bullet.explosionRadius, bullet.damage);
                        } else {
                            enemy.hp -= bullet.damage;
                            enemy.damagedCooldown = 5;
                            this.spawnYolkSplats3D(bullet.x, bullet.y, bullet.z, 5);
                        }

                        // Remove bullet (unless sniper pierces)
                        if (bullet.id !== 'sniper') {
                            this.bullets.splice(bIdx, 1);
                        }

                        if (enemy.hp <= 0) {
                            this.scrambleEnemy3D(enemy);
                            this.enemies.splice(idx, 1);
                        }
                    }
                });
            });

            // Spawner
            if (this.enemies.length < 5 && this.enemiesRemaining > 0) {
                this.spawnEnemy();
            }

            // Wave progress
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
            // Shoot forward along view yaw heading
            const pitch = 0; // Straight flat
            const speed = 25.0;
            const heading = this.camera.yaw;

            this.recoilTarget += 22; // Muzzle kick

            if (w.id === 'scrambler') {
                // Fan of 8 pellets
                for (let i = -3; i <= 3; i++) {
                    const devAngle = heading + (i * 0.05);
                    this.bullets.push({
                        id: w.id,
                        x: this.camera.x,
                        y: this.camera.y + 2,
                        z: this.camera.z,
                        vx: Math.cos(devAngle) * speed,
                        vy: (Math.random() - 0.5) * 1.5,
                        vz: Math.sin(devAngle) * speed,
                        damage: w.damage,
                        range: w.range,
                        life: 15,
                        explosive: false
                    });
                }
            } else {
                this.bullets.push({
                    id: w.id,
                    x: this.camera.x,
                    y: this.camera.y + 2,
                    z: this.camera.z,
                    vx: Math.cos(heading) * speed,
                    vy: 0,
                    vz: Math.sin(heading) * speed,
                    damage: w.damage,
                    range: w.range,
                    life: 25,
                    explosive: w.explosive || false,
                    explosionRadius: w.explosionRadius || 0
                });
            }

            // Muzzle sparks in front of camera
            this.spawnYolkSplats3D(
                this.camera.x + Math.cos(heading) * 15,
                this.camera.y + 2,
                this.camera.z + Math.sin(heading) * 15,
                4
            );
        }

        explode3D(x, y, z, radius, damage) {
            this.explosions.push({
                x: x,
                y: y,
                z: z,
                radius: 15,
                maxRadius: radius,
                growthSpeed: radius / 12,
                alpha: 1.0
            });

            // Splash damage
            this.enemies.forEach((enemy, idx) => {
                const dist = Math.hypot(enemy.x - x, enemy.z - z);
                if (dist < (radius + enemy.size)) {
                    const factor = 1 - (dist / (radius + enemy.size));
                    enemy.hp -= Math.round(damage * factor);
                    enemy.damagedCooldown = 5;
                    this.spawnYolkSplats3D(enemy.x, enemy.y, enemy.z, 5);

                    if (enemy.hp <= 0) {
                        this.scrambleEnemy3D(enemy);
                        this.enemies.splice(idx, 1);
                    }
                }
            });

            this.spawnYolkSplats3D(x, y, z, 20);
        }

        scrambleEnemy3D(enemy) {
            this.spawnYolkSplats3D(enemy.x, enemy.y, enemy.z, 25);
            this.score += enemy.type === 'brute' ? 400 : (enemy.type === 'speedy' ? 200 : 100);
        }

        spawnYolkSplats3D(x, y, z, count) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speedH = Math.random() * 4 + 1;
                const speedV = -(Math.random() * 4 + 1); // upwards jump

                let color = '#FFF8E7';
                let dice = Math.random();
                if (dice > 0.45) color = '#F1C40F';
                else if (dice > 0.25) color = '#E67E22';

                this.particles.push({
                    x: x,
                    y: y,
                    z: z,
                    vx: Math.cos(angle) * speedH,
                    vy: speedV,
                    vz: Math.sin(angle) * speedH,
                    alpha: 1.0,
                    color: color,
                    size: Math.random() * 3 + 1
                });
            }
        }

        draw() {
            // 1. Draw Sky (Dual Gradient)
            this.ctx.fillStyle = '#05070c';
            this.ctx.fillRect(0, 0, 800, 300); // Sky
            this.ctx.fillStyle = '#0d1117';
            this.ctx.fillRect(0, 300, 800, 300); // Floor base

            // Draw Horizon glow
            const horizonGrad = this.ctx.createLinearGradient(0, 240, 0, 300);
            horizonGrad.addColorStop(0, 'rgba(241, 196, 15, 0)');
            horizonGrad.addColorStop(1, 'rgba(241, 196, 15, 0.06)');
            this.ctx.fillStyle = horizonGrad;
            this.ctx.fillRect(0, 240, 800, 60);

            // 2. Project 3D floor grid lines (converges to horizon at 300px Y)
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
            this.ctx.lineWidth = 1.5;

            // Horizon line
            this.ctx.beginPath();
            this.ctx.moveTo(0, 300);
            this.ctx.lineTo(800, 300);
            this.ctx.stroke();

            // Perspective lines converging from camera
            const fov = 400; // perspective focal scale
            const floorY = 40; // Camera height offset

            // Draw vertical longitudinal perspective lines
            for (let x = -800; x <= 800; x += 100) {
                // Project line from horizon (0 length) to bottom of screen
                const startX = x - this.camera.x;
                
                // Let's project two points of the line
                // Point 1 (near horizon): z = 300
                // Point 2 (near bottom): z = 20
                const px1 = 400 + (startX / 250) * fov;
                const py1 = 300 + (floorY / 250) * fov;

                const px2 = 400 + (startX / 25) * fov;
                const py2 = 300 + (floorY / 25) * fov;

                this.ctx.beginPath();
                this.ctx.moveTo(px1, py1);
                this.ctx.lineTo(px2, py2);
                this.ctx.stroke();
            }

            // Draw horizontal transverse perspective lines
            // Z coordinates spaces exponentially
            for (let z = 20; z < 500; z *= 1.45) {
                const screenZ = z;
                const py = 300 + (floorY / screenZ) * fov;

                this.ctx.beginPath();
                this.ctx.moveTo(0, py);
                this.ctx.lineTo(800, py);
                this.ctx.stroke();
            }

            // 3. Project 3D elements (Enemies, Bullets, Explosions, Particles)
            const renderQueue = [];

            // Project Enemies
            this.enemies.forEach(e => {
                const proj = this.project3D(e.x, e.y, e.z);
                if (proj) {
                    renderQueue.push({
                        type: 'enemy',
                        z: proj.rz,
                        proj: proj,
                        ref: e
                    });
                }
            });

            // Project Bullets
            this.bullets.forEach(b => {
                const proj = this.project3D(b.x, b.y, b.z);
                if (proj) {
                    renderQueue.push({
                        type: 'bullet',
                        z: proj.rz,
                        proj: proj,
                        ref: b
                    });
                }
            });

            // Project Particles
            this.particles.forEach(p => {
                const proj = this.project3D(p.x, p.y, p.z);
                if (proj) {
                    renderQueue.push({
                        type: 'particle',
                        z: proj.rz,
                        proj: proj,
                        ref: p
                    });
                }
            });

            // Project Explosions
            this.explosions.forEach(ex => {
                const proj = this.project3D(ex.x, ex.y, ex.z);
                if (proj) {
                    renderQueue.push({
                        type: 'explosion',
                        z: proj.rz,
                        proj: proj,
                        ref: ex
                    });
                }
            });

            // Sort render queue by distance (Back-to-Front painter's algorithm)
            renderQueue.sort((a, b) => b.z - a.z);

            // Draw projected queue
            renderQueue.forEach(item => {
                if (item.type === 'enemy') {
                    this.drawEnemy3D(item.proj, item.ref);
                } else if (item.type === 'bullet') {
                    this.drawBullet3D(item.proj, item.ref);
                } else if (item.type === 'particle') {
                    this.drawParticle3D(item.proj, item.ref);
                } else if (item.type === 'explosion') {
                    this.drawExplosion3D(item.proj, item.ref);
                }
            });

            // 4. First-Person Weapons HUD overlay
            this.drawFirstPersonWeapon();

            // Screen damage vignette
            if (this.playerHealth < 40) {
                const vigGrad = this.ctx.createRadialGradient(400, 300, 200, 400, 300, 500);
                vigGrad.addColorStop(0, 'rgba(231, 76, 60, 0)');
                vigGrad.addColorStop(1, `rgba(231, 76, 60, ${0.4 * (1 - this.playerHealth/40)})`);
                this.ctx.fillStyle = vigGrad;
                this.ctx.fillRect(0, 0, 800, 600);
            }

            // HUD
            this.drawHUD();
        }

        project3D(ox, oy, oz) {
            // Translate relative to camera position
            const dx = ox - this.camera.x;
            const dy = oy - this.camera.y;
            const dz = oz - this.camera.z;

            // Rotate based on Camera Heading Yaw
            const rx = dx * Math.cos(-this.camera.yaw) - dz * Math.sin(-this.camera.yaw);
            const rz = dx * Math.sin(-this.camera.yaw) + dz * Math.cos(-this.camera.yaw);
            const ry = dy + 15; // height offset

            // Don't draw if behind camera or too close
            if (rz <= 4.0) return null;

            const fov = 400; // perspective focal scale
            const scale = fov / rz;

            return {
                x: 400 + rx * scale,
                y: 300 + ry * scale,
                scale: scale,
                rz: rz
            };
        }

        drawEnemy3D(p, enemy) {
            const size = enemy.size * p.scale * 0.75;
            if (size <= 0) return;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);

            // Shading based on distance (Atmospheric fog)
            const fogFactor = Math.min(1.0, p.rz / 900);
            const baseColor = enemy.damagedCooldown > 0 ? '#E74C3C' : (enemy.type === 'brute' ? '#7F8C8D' : (enemy.type === 'speedy' ? '#E2E8F0' : '#F1C40F'));
            
            // Draw Billboard Egg
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size * 1.35);
            this.ctx.bezierCurveTo(size * 1.0, -size * 1.35, size * 1.15, size, 0, size);
            this.ctx.bezierCurveTo(-size * 1.15, size, -size * 1.0, -size * 1.35, 0, -size * 1.35);
            this.ctx.closePath();

            this.ctx.fillStyle = baseColor;
            this.ctx.fill();
            this.ctx.strokeStyle = '#95A5A6';
            this.ctx.lineWidth = Math.max(1, 2.5 * p.scale * 0.015);
            this.ctx.stroke();

            // Cracks on egg
            this.ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            this.ctx.beginPath();
            this.ctx.moveTo(-size*0.2, -size*0.2);
            this.ctx.lineTo(0, 0);
            this.ctx.lineTo(-size*0.3, size*0.3);
            this.ctx.stroke();

            // Determined Red Eyes
            this.ctx.fillStyle = '#E74C3C';
            this.ctx.beginPath();
            this.ctx.arc(-size * 0.3, -size * 0.35, Math.max(1, size * 0.15), 0, Math.PI * 2);
            this.ctx.arc(size * 0.3, -size * 0.35, Math.max(1, size * 0.15), 0, Math.PI * 2);
            this.ctx.fill();

            // Eyebrows
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = Math.max(1, size * 0.1);
            this.ctx.beginPath();
            this.ctx.moveTo(-size * 0.5, -size * 0.5);
            this.ctx.lineTo(-size * 0.1, -size * 0.4);
            this.ctx.moveTo(size * 0.5, -size * 0.5);
            this.ctx.lineTo(size * 0.1, -size * 0.4);
            this.ctx.stroke();

            // Military Accessories (Shell Shockers style cosmetics)
            if (enemy.type === 'brute') {
                // Soldier Helmet
                this.ctx.fillStyle = '#34495E';
                this.ctx.beginPath();
                this.ctx.arc(0, -size * 0.5, size * 1.1, Math.PI, 0);
                this.ctx.fill();
            } else if (enemy.type === 'speedy') {
                // Red bandana band
                this.ctx.fillStyle = '#E74C3C';
                this.ctx.fillRect(-size*0.8, -size*0.5, size*1.6, size*0.2);
            }

            // Health bar 3D
            if (enemy.hp < enemy.maxHp) {
                const barW = size * 1.5;
                this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
                this.ctx.fillRect(-barW/2, -size * 1.6, barW, 4);
                this.ctx.fillStyle = '#2ECC71';
                this.ctx.fillRect(-barW/2, -size * 1.6, barW * (enemy.hp / enemy.maxHp), 4);
            }

            // Fog layer overlay
            this.ctx.fillStyle = `rgba(13, 17, 23, ${fogFactor * 0.8})`;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size * 1.35);
            this.ctx.bezierCurveTo(size * 1.0, -size * 1.35, size * 1.15, size, 0, size);
            this.ctx.bezierCurveTo(-size * 1.15, size, -size * 1.0, -size * 1.35, 0, -size * 1.35);
            this.ctx.fill();

            this.ctx.restore();
        }

        drawBullet3D(p, bullet) {
            const size = Math.max(1.5, 6 * p.scale * 0.02);
            this.ctx.fillStyle = bullet.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.shadowBlur = size * 3;
            this.ctx.shadowColor = bullet.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0; // Reset
        }

        drawParticle3D(p, particle) {
            const size = Math.max(1, particle.size * p.scale * 0.02);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }

        drawExplosion3D(p, ex) {
            const size = ex.radius * p.scale * 0.055;
            if (size <= 0) return;

            this.ctx.save();
            this.ctx.globalAlpha = ex.alpha * 0.55;

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

        drawFirstPersonWeapon() {
            const weapon = WEAPONS[this.selectedWeaponIndex];
            const recoilOffset = this.recoil;
            
            // Bobbing movement offset when sprinting
            const isMoving = this.keys['ArrowUp'] || this.keys['ArrowDown'] || this.keys['ArrowLeft'] || this.keys['ArrowRight'] ||
                             this.keys['KeyW'] || this.keys['KeyS'] || this.keys['KeyA'] || this.keys['KeyD'];
            const bobX = isMoving ? Math.sin(this.camera.bob) * 12 : 0;
            const bobY = isMoving ? Math.abs(Math.cos(this.camera.bob)) * 8 : 0;

            const isSniperScope = (weapon.id === 'cluck' || weapon.id === 'cluck') ? false : (this.keys['z'] || this.keys['KeyZ'] || this.keys['Z']);

            if (isSniperScope) {
                // RENDER SNIPER SCOPE VIEW (Aiming down sights zoom)
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                this.ctx.fillRect(0, 0, 800, 600);

                // Scope black bounds
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 140;
                this.ctx.beginPath();
                this.ctx.arc(400, 300, 380, 0, Math.PI * 2);
                this.ctx.stroke();

                // Crosshair lines
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(400, 50);
                this.ctx.lineTo(400, 550);
                this.ctx.moveTo(50, 300);
                this.ctx.lineTo(750, 300);
                this.ctx.stroke();

                // Center red dot
                this.ctx.fillStyle = 'red';
                this.ctx.beginPath();
                this.ctx.arc(400, 300, 3, 0, Math.PI * 2);
                this.ctx.fill();
                return;
            }

            // Normal First Person Weapon Drawing (Call of Duty / Shell Shockers perspective)
            this.ctx.save();
            this.ctx.translate(560 + bobX, 480 + bobY + recoilOffset);

            // Draw Player Hands (Cute white egg shells holding weapon)
            this.ctx.fillStyle = '#FFF8E7';
            this.ctx.strokeStyle = '#D5C5A1';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(-40, 80, 26, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Draw Weapon based on Skin
            if (weapon.id === 'cluck') {
                // Pistol (Neon Chrome skin)
                this.ctx.fillStyle = '#7F8C8D';
                this.ctx.fillRect(-25, -20, 20, 50); // grip
                this.ctx.fillStyle = '#BDC3C7';
                this.ctx.fillRect(-25, -20, 60, 22);  // slide
                this.ctx.fillStyle = '#00F3FF'; // Neon glow lines
                this.ctx.fillRect(-10, -10, 40, 3);
            } else if (weapon.id === 'scrambler') {
                // Shotgun (Gold Wood skin)
                this.ctx.fillStyle = '#873600'; // wooden butt stock
                this.ctx.beginPath();
                this.ctx.moveTo(-70, 60);
                this.ctx.lineTo(-40, 20);
                this.ctx.lineTo(-10, 10);
                this.ctx.lineTo(-50, 60);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#F39C12'; // golden receiver
                this.ctx.fillRect(-30, 0, 50, 28);
                
                this.ctx.fillStyle = '#1A252F'; // dual iron barrels
                this.ctx.fillRect(20, 4, 110, 10);
                this.ctx.fillRect(20, 14, 110, 10);
            } else if (weapon.id === 'eggk47') {
                // Assault Rifle (Military Camo skin)
                this.ctx.fillStyle = '#2E4053'; // frame
                this.ctx.fillRect(-40, -10, 80, 32);
                
                // Camo barrel
                this.ctx.fillStyle = '#27AE60';
                this.ctx.fillRect(40, -5, 110, 16);
                this.ctx.fillStyle = '#1E8449';
                this.ctx.fillRect(60, -5, 30, 16);
                
                this.ctx.fillStyle = '#85929E'; // magazine clip
                this.ctx.beginPath();
                this.ctx.moveTo(-10, 22);
                this.ctx.lineTo(-5, 65);
                this.ctx.lineTo(15, 60);
                this.ctx.lineTo(10, 22);
                this.ctx.fill();
            } else if (weapon.id === 'rpegg') {
                // Heavy Rocket (Carbon fiber skin)
                this.ctx.fillStyle = '#1F242D'; // Carbon black body
                this.ctx.fillRect(-50, -25, 120, 50);
                
                this.ctx.fillStyle = '#E74C3C'; // Red stripes
                this.ctx.fillRect(-30, -25, 8, 50);
                this.ctx.fillRect(20, -25, 8, 50);

                this.ctx.fillStyle = '#2C3E50'; // Launcher tube front
                this.ctx.fillRect(70, -18, 45, 36);

                // Load rocket yolk head
                this.ctx.fillStyle = '#F1C40F';
                this.ctx.beginPath();
                this.ctx.arc(115, 0, 14, -Math.PI/2, Math.PI/2);
                this.ctx.fill();
            }

            this.ctx.restore();

            // Crosshair in center
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(400, 300, 6, 0, Math.PI * 2);
            this.ctx.stroke();
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
            this.ctx.fillText(`SKIN: ${weapon.skin}  |  DAMAGE: ${weapon.damage}`, 35, 565);
        }
    }

    // Auto Init
    function initGame() {
        const gameContainer = document.getElementById('game-container') || document.body;
        if (gameContainer) {
            window.VoyagerGameInstance = new ShellShockers3DGame(gameContainer);
            console.log("Shell Shockers 3D engine loaded successfully!");
        }
    }

    window.VoyagerEngine = ShellShockers3DGame;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
})();
