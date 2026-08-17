/* ==========================================================================
   CYBERPUNK NEON HUD - INTERACTIVE APPLICATION & SIMULATOR
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // HUD State Model
    const hudState = {
        health: 85,
        armor: 60,
        food: 75,
        drink: 90,
        stamina: 100,
        stress: 20,

        speedKmh: 142,
        maxSpeed: 320,
        fuel: 68,
        rpm: 6200,
        maxRpm: 9000,
        gear: 4,

        seatbelt: false,
        engineWarn: false,
        headlights: true,
        doorsLocked: false,

        vehicleMode: true,
        radarVisible: true,
        weaponVisible: true,
        scanlinesVisible: true,
        currentTheme: 'cyber'
    };

    // DOM Elements Cache
    const el = {
        hudRoot: document.getElementById('hud-root'),

        // Vitals
        healthBar: document.getElementById('bar-health'),
        healthVal: document.getElementById('val-health'),
        healthWrapper: document.getElementById('health-wrapper'),

        armorBar: document.getElementById('bar-armor'),
        armorVal: document.getElementById('val-armor'),

        foodBar: document.getElementById('bar-food'),
        foodVal: document.getElementById('val-food'),

        drinkBar: document.getElementById('bar-drink'),
        drinkVal: document.getElementById('val-drink'),

        staminaBar: document.getElementById('bar-stamina'),
        staminaVal: document.getElementById('val-stamina'),

        stressBar: document.getElementById('bar-stress'),
        stressVal: document.getElementById('val-stress'),

        // Speedometer
        speedoBox: document.getElementById('speedo-box'),
        speedVal: document.getElementById('val-speed'),
        speedArc: document.getElementById('speedo-arc'),
        gearVal: document.getElementById('val-gear'),
        fuelBar: document.getElementById('bar-fuel'),
        fuelVal: document.getElementById('val-fuel'),
        rpmBar: document.getElementById('bar-rpm'),
        rpmVal: document.getElementById('val-rpm'),

        // Indicators
        indSeatbelt: document.getElementById('ind-seatbelt'),
        indEngine: document.getElementById('ind-engine'),
        indLights: document.getElementById('ind-lights'),
        indLock: document.getElementById('ind-lock'),

        // Radar & Weapon & Scanlines
        radarBox: document.getElementById('radar-box'),
        weaponBox: document.getElementById('weapon-box'),
        scanlines: document.getElementById('scanlines'),
        hudClock: document.getElementById('hud-clock'),
        compassDeg: document.getElementById('compass-deg'),

        // Simulator Sliders & Controls
        dockToggleBtn: document.getElementById('dock-toggle-btn'),
        dockPanel: document.getElementById('dock-panel'),
        dockCloseBtn: document.getElementById('dock-close-btn'),

        simHealth: document.getElementById('sim-health'),
        simValHealth: document.getElementById('sim-val-health'),

        simArmor: document.getElementById('sim-armor'),
        simValArmor: document.getElementById('sim-val-armor'),

        simFood: document.getElementById('sim-food'),
        simValFood: document.getElementById('sim-val-food'),

        simDrink: document.getElementById('sim-drink'),
        simValDrink: document.getElementById('sim-val-drink'),

        simStamina: document.getElementById('sim-stamina'),
        simValStamina: document.getElementById('sim-val-stamina'),

        simStress: document.getElementById('sim-stress'),
        simValStress: document.getElementById('sim-val-stress'),

        simSpeed: document.getElementById('sim-speed'),
        simValSpeed: document.getElementById('sim-val-speed'),

        simFuel: document.getElementById('sim-fuel'),
        simValFuel: document.getElementById('sim-val-fuel'),

        simRpm: document.getElementById('sim-rpm'),
        simValRpm: document.getElementById('sim-val-rpm'),

        btnToggleVehicle: document.getElementById('btn-toggle-vehicle'),
        btnToggleSeatbelt: document.getElementById('btn-toggle-seatbelt'),
        btnToggleEngine: document.getElementById('btn-toggle-engine'),
        btnToggleLights: document.getElementById('btn-toggle-lights'),
        btnToggleScanlines: document.getElementById('btn-toggle-scanlines'),
        btnToggleRadar: document.getElementById('btn-toggle-radar'),
        btnToggleWeapon: document.getElementById('btn-toggle-weapon'),
        btnGlitchFx: document.getElementById('btn-glitch-fx'),

        // Presets
        presetNormal: document.getElementById('preset-normal'),
        presetDamage: document.getElementById('preset-damage'),
        presetHungry: document.getElementById('preset-hungry'),
        presetFull: document.getElementById('preset-full'),
        btnDriveFast: document.getElementById('btn-drive-fast')
    };

    // Initialize Audio Synthesis for Sci-Fi Feedback Sound
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playCyberBeep(freq = 880, duration = 0.08) {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (err) {
            // Audio context fallback
        }
    }

    // UPDATE HUD UI
    function renderHUD() {
        // Vitals Render
        el.healthBar.style.width = `${hudState.health}%`;
        el.healthVal.textContent = `${hudState.health}%`;
        if (hudState.health <= 25) {
            el.healthWrapper.classList.add('health-critical');
        } else {
            el.healthWrapper.classList.remove('health-critical');
        }

        el.armorBar.style.width = `${hudState.armor}%`;
        el.armorVal.textContent = `${hudState.armor}%`;

        el.foodBar.style.width = `${hudState.food}%`;
        el.foodVal.textContent = `${hudState.food}%`;

        el.drinkBar.style.width = `${hudState.drink}%`;
        el.drinkVal.textContent = `${hudState.drink}%`;

        el.staminaBar.style.width = `${hudState.stamina}%`;
        el.staminaVal.textContent = `${hudState.stamina}%`;

        el.stressBar.style.width = `${hudState.stress}%`;
        el.stressVal.textContent = `${hudState.stress}%`;

        // Vehicle Telemetry (KM/H)
        el.speedVal.textContent = Math.round(hudState.speedKmh);

        // Speedometer Gauge Arc SVG Math
        // Circumference = 2 * PI * 80 = ~502px. Arc span = 270 degrees out of 360 = 376px max visible
        const maxArcLength = 376;
        const speedPercent = Math.min(hudState.speedKmh / hudState.maxSpeed, 1);
        const dashOffset = 502 - (speedPercent * maxArcLength);
        el.speedArc.style.strokeDashoffset = dashOffset;

        // Auto-calculate Gear based on Speed KM/H
        if (hudState.speedKmh === 0) hudState.gear = 'P';
        else if (hudState.speedKmh < 30) hudState.gear = 1;
        else if (hudState.speedKmh < 70) hudState.gear = 2;
        else if (hudState.speedKmh < 120) hudState.gear = 3;
        else if (hudState.speedKmh < 180) hudState.gear = 4;
        else if (hudState.speedKmh < 240) hudState.gear = 5;
        else hudState.gear = 6;
        el.gearVal.textContent = typeof hudState.gear === 'number' ? `GEAR ${hudState.gear}` : hudState.gear;

        el.fuelBar.style.width = `${hudState.fuel}%`;
        el.fuelVal.textContent = `${hudState.fuel}%`;

        const rpmPercent = Math.min((hudState.rpm / hudState.maxRpm) * 100, 100);
        el.rpmBar.style.width = `${rpmPercent}%`;
        el.rpmVal.textContent = Math.round(hudState.rpm).toLocaleString();

        // Vehicle Mode Toggle
        if (hudState.vehicleMode) {
            el.speedoBox.classList.remove('hidden-hud');
        } else {
            el.speedoBox.classList.add('hidden-hud');
        }

        // Indicators
        el.indSeatbelt.classList.toggle('active', hudState.seatbelt);
        el.indEngine.classList.toggle('active', hudState.engineWarn);
        el.indLights.classList.toggle('active', hudState.headlights);
        el.indLock.classList.toggle('active', hudState.doorsLocked);

        // Visibility Toggles
        el.radarBox.style.opacity = hudState.radarVisible ? '1' : '0';
        el.weaponBox.style.opacity = hudState.weaponVisible ? '1' : '0';
        el.scanlines.style.display = hudState.scanlinesVisible ? 'block' : 'none';

        // Update Slider Values in Controller Dock
        el.simHealth.value = hudState.health;
        el.simValHealth.textContent = `${hudState.health}%`;

        el.simArmor.value = hudState.armor;
        el.simValArmor.textContent = `${hudState.armor}%`;

        el.simFood.value = hudState.food;
        el.simValFood.textContent = `${hudState.food}%`;

        el.simDrink.value = hudState.drink;
        el.simValDrink.textContent = `${hudState.drink}%`;

        el.simStamina.value = hudState.stamina;
        el.simValStamina.textContent = `${hudState.stamina}%`;

        el.simStress.value = hudState.stress;
        el.simValStress.textContent = `${hudState.stress}%`;

        el.simSpeed.value = hudState.speedKmh;
        el.simValSpeed.textContent = `${hudState.speedKmh} KM/H`;

        el.simFuel.value = hudState.fuel;
        el.simValFuel.textContent = `${hudState.fuel}%`;

        el.simRpm.value = hudState.rpm;
        el.simValRpm.textContent = `${hudState.rpm}`;
    }

    // BIND SLIDER EVENTS
    function setupEventListeners() {
        // Toggle Dock Panel
        el.dockToggleBtn.addEventListener('click', () => {
            el.dockPanel.classList.toggle('hidden');
            playCyberBeep(900);
        });

        el.dockCloseBtn.addEventListener('click', () => {
            el.dockPanel.classList.add('hidden');
            playCyberBeep(600);
        });

        // Sliders
        const bindSlider = (inputEl, stateKey) => {
            inputEl.addEventListener('input', (e) => {
                hudState[stateKey] = parseInt(e.target.value, 10);
                renderHUD();
            });
        };

        bindSlider(el.simHealth, 'health');
        bindSlider(el.simArmor, 'armor');
        bindSlider(el.simFood, 'food');
        bindSlider(el.simDrink, 'drink');
        bindSlider(el.simStamina, 'stamina');
        bindSlider(el.simStress, 'stress');
        bindSlider(el.simSpeed, 'speedKmh');
        bindSlider(el.simFuel, 'fuel');
        bindSlider(el.simRpm, 'rpm');

        // Toggle Buttons
        el.btnToggleVehicle.addEventListener('click', () => {
            hudState.vehicleMode = !hudState.vehicleMode;
            el.btnToggleVehicle.classList.toggle('active', hudState.vehicleMode);
            el.btnToggleVehicle.innerHTML = `<i class="fa-solid fa-car"></i> Vehicle HUD: ${hudState.vehicleMode ? 'ON' : 'OFF'}`;
            playCyberBeep(750);
            renderHUD();
        });

        el.btnToggleSeatbelt.addEventListener('click', () => {
            hudState.seatbelt = !hudState.seatbelt;
            el.btnToggleSeatbelt.classList.toggle('active', hudState.seatbelt);
            el.btnToggleSeatbelt.innerHTML = `<i class="fa-solid fa-user-slash"></i> Seatbelt: ${hudState.seatbelt ? 'ON' : 'OFF'}`;
            playCyberBeep(1000);
            renderHUD();
        });

        el.btnToggleEngine.addEventListener('click', () => {
            hudState.engineWarn = !hudState.engineWarn;
            el.btnToggleEngine.classList.toggle('active', hudState.engineWarn);
            el.btnToggleEngine.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Engine Warn: ${hudState.engineWarn ? 'ON' : 'OFF'}`;
            playCyberBeep(400);
            renderHUD();
        });

        el.btnToggleLights.addEventListener('click', () => {
            hudState.headlights = !hudState.headlights;
            el.btnToggleLights.classList.toggle('active', hudState.headlights);
            el.btnToggleLights.innerHTML = `<i class="fa-solid fa-lightbulb"></i> Headlights: ${hudState.headlights ? 'ON' : 'OFF'}`;
            playCyberBeep(850);
            renderHUD();
        });

        el.btnToggleScanlines.addEventListener('click', () => {
            hudState.scanlinesVisible = !hudState.scanlinesVisible;
            el.btnToggleScanlines.classList.toggle('active', hudState.scanlinesVisible);
            el.btnToggleScanlines.innerHTML = `<i class="fa-solid fa-tv"></i> Scanlines: ${hudState.scanlinesVisible ? 'ON' : 'OFF'}`;
            renderHUD();
        });

        el.btnToggleRadar.addEventListener('click', () => {
            hudState.radarVisible = !hudState.radarVisible;
            el.btnToggleRadar.classList.toggle('active', hudState.radarVisible);
            el.btnToggleRadar.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Radar: ${hudState.radarVisible ? 'ON' : 'OFF'}`;
            renderHUD();
        });

        el.btnToggleWeapon.addEventListener('click', () => {
            hudState.weaponVisible = !hudState.weaponVisible;
            el.btnToggleWeapon.classList.toggle('active', hudState.weaponVisible);
            el.btnToggleWeapon.innerHTML = `<i class="fa-solid fa-gun"></i> Weapon HUD: ${hudState.weaponVisible ? 'ON' : 'OFF'}`;
            renderHUD();
        });

        // Trigger Glitch Effect
        el.btnGlitchFx.addEventListener('click', () => {
            document.body.classList.add('glitch-active');
            playCyberBeep(250, 0.2);
            setTimeout(() => {
                document.body.classList.remove('glitch-active');
            }, 500);
        });

        // Presets
        el.presetNormal.addEventListener('click', () => {
            Object.assign(hudState, { health: 100, armor: 80, food: 85, drink: 90, stamina: 100, stress: 10, speedKmh: 65, rpm: 3200 });
            playCyberBeep(700);
            renderHUD();
        });

        el.presetDamage.addEventListener('click', () => {
            Object.assign(hudState, { health: 15, armor: 0, stress: 85, engineWarn: true });
            playCyberBeep(300, 0.2);
            renderHUD();
        });

        el.presetHungry.addEventListener('click', () => {
            Object.assign(hudState, { food: 10, drink: 5, stamina: 30 });
            playCyberBeep(450);
            renderHUD();
        });

        el.presetFull.addEventListener('click', () => {
            Object.assign(hudState, { health: 100, armor: 100, food: 100, drink: 100, stamina: 100, stress: 0 });
            playCyberBeep(1200);
            renderHUD();
        });

        el.btnDriveFast.addEventListener('click', () => {
            hudState.vehicleMode = true;
            hudState.speedKmh = 285;
            hudState.rpm = 8400;
            playCyberBeep(1100);
            renderHUD();
        });

        // Theme Customizer Buttons
        document.querySelectorAll('.palette-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
                const theme = e.target.dataset.theme;
                e.target.classList.add('active');
                document.body.className = 'cyber-body';
                if (theme !== 'cyber') {
                    document.body.classList.add(`theme-${theme}`);
                }
                hudState.currentTheme = theme;
                playCyberBeep(950);
            });
        });
    }

    // Dynamic Clock & Compass simulation loop
    function startClockLoop() {
        setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const mins = String(now.getMinutes()).padStart(2, '0');
            const secs = String(now.getSeconds()).padStart(2, '0');
            el.hudClock.textContent = `${hours}:${mins}:${secs} // 2077.10.24`;
        }, 1000);

        let headingDeg = 94;
        setInterval(() => {
            headingDeg = (headingDeg + (Math.random() > 0.5 ? 1 : -1)) % 360;
            if (headingDeg < 0) headingDeg += 360;
            const dir = headingDeg >= 315 || headingDeg < 45 ? 'NORTH' :
                        headingDeg >= 45 && headingDeg < 135 ? 'EAST' :
                        headingDeg >= 135 && headingDeg < 225 ? 'SOUTH' : 'WEST';
            el.compassDeg.textContent = `${String(headingDeg).padStart(3, '0')}° ${dir}`;
        }, 3000);
    }

    // FiveM / NUI Integration Window Event Listener
    window.addEventListener('message', (event) => {
        const item = event.data;
        if (!item) return;

        if (item.action === 'toggleHud') {
            if (el.hudRoot) {
                el.hudRoot.style.display = item.visible ? 'block' : 'none';
            }
            return;
        }

        if (item.action === 'updateHUD' || item.action === 'updateStatus') {
            if (item.health !== undefined) hudState.health = item.health;
            if (item.armor !== undefined) hudState.armor = item.armor;
            if (item.food !== undefined) hudState.food = item.food;
            if (item.drink !== undefined) hudState.drink = item.drink;
            if (item.stamina !== undefined) hudState.stamina = item.stamina;
            if (item.stress !== undefined) hudState.stress = item.stress;
            if (item.speedKmh !== undefined) hudState.speedKmh = item.speedKmh;
            if (item.fuel !== undefined) hudState.fuel = item.fuel;
            if (item.rpm !== undefined) hudState.rpm = item.rpm;
            if (item.inVehicle !== undefined) hudState.vehicleMode = item.inVehicle;

            if (item.vehicle) {
                if (item.vehicle.inVehicle !== undefined) hudState.vehicleMode = item.vehicle.inVehicle;
                if (item.vehicle.speed !== undefined) hudState.speedKmh = item.vehicle.speed;
                if (item.vehicle.fuel !== undefined) hudState.fuel = item.vehicle.fuel;
                if (item.vehicle.rpm !== undefined) hudState.rpm = item.vehicle.rpm;
                if (item.vehicle.seatbelt !== undefined) hudState.seatbelt = item.vehicle.seatbelt;
                if (item.vehicle.engine !== undefined) hudState.engineWarn = !item.vehicle.engine;
            }

            renderHUD();
        }
    });

    // Initialize
    setupEventListeners();
    renderHUD();
    startClockLoop();
});
