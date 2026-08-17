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

        cash: 5240,
        bank: 148920,

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

        weaponArmed: false,
        weaponName: 'M2038-TACTICAL SHOTGUN',
        ammoClip: 8,
        ammoReserve: 64,

        vehicleMode: true,
        radarVisible: true,
        scanlinesVisible: true,
        currentTheme: 'cyber',

        // Customization Settings
        editMode: false,
        scale: 100,
        opacity: 100,
        visibility: {
            topbar: true,
            radar: true,
            vitals: true,
            telemetry: true,
            weapon: true
        },
        positions: {} // Stores custom x/y offsets for draggable widgets
    };

    // DOM Elements Cache
    const el = {
        hudRoot: document.getElementById('hud-root'),

        // Draggable Widgets
        topBarBox: document.getElementById('top-bar-box'),
        radarBox: document.getElementById('radar-box'),
        vitalsBox: document.getElementById('vitals-box'),
        speedoBox: document.getElementById('speedo-box'),
        weaponBox: document.getElementById('weapon-box'),

        // Settings Modal
        settingsModal: document.getElementById('settings-modal'),
        settingsCloseBtn: document.getElementById('settings-close-btn'),
        btnSaveExit: document.getElementById('btn-save-exit'),
        btnResetLayout: document.getElementById('btn-reset-layout'),

        setToggleTopbar: document.getElementById('set-toggle-topbar'),
        setToggleRadar: document.getElementById('set-toggle-radar'),
        setToggleVitals: document.getElementById('set-toggle-vitals'),
        setToggleTelemetry: document.getElementById('set-toggle-telemetry'),
        setToggleWeapon: document.getElementById('set-toggle-weapon'),

        setScale: document.getElementById('set-scale'),
        setValScale: document.getElementById('set-val-scale'),
        setOpacity: document.getElementById('set-opacity'),
        setValOpacity: document.getElementById('set-val-opacity'),

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

        // Cash & Bank Money
        hudCash: document.getElementById('hud-cash'),
        hudBank: document.getElementById('hud-bank'),

        // Weapon
        weaponName: document.getElementById('weapon-name'),
        ammoCurrent: document.getElementById('ammo-current'),
        ammoReserve: document.getElementById('ammo-reserve'),

        // Radar & Scanlines
        scanlines: document.getElementById('scanlines'),
        hudClock: document.getElementById('hud-clock'),
        compassDeg: document.getElementById('compass-deg'),

        // Simulator Sliders & Controls
        dockToggleBtn: document.getElementById('dock-toggle-btn'),
        dockPanel: document.getElementById('dock-panel'),
        dockCloseBtn: document.getElementById('dock-close-btn'),
        btnOpenSettingsSim: document.getElementById('btn-open-settings-sim'),

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
        btnToggleBg: document.getElementById('btn-toggle-bg'),
        btnGlitchFx: document.getElementById('btn-glitch-fx'),

        // Presets
        presetNormal: document.getElementById('preset-normal'),
        presetDamage: document.getElementById('preset-damage'),
        presetHungry: document.getElementById('preset-hungry'),
        presetFull: document.getElementById('preset-full'),
        btnDriveFast: document.getElementById('btn-drive-fast')
    };

    // Load saved settings & positions from localStorage
    function loadSavedLayout() {
        try {
            const saved = localStorage.getItem('cyber_hud_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.positions) hudState.positions = parsed.positions;
                if (parsed.visibility) Object.assign(hudState.visibility, parsed.visibility);
                if (parsed.scale) hudState.scale = parsed.scale;
                if (parsed.opacity) hudState.opacity = parsed.opacity;
                if (parsed.theme) hudState.currentTheme = parsed.theme;
            }
        } catch (e) {
            console.error('Failed to load HUD layout:', e);
        }
    }

    // Save layout to localStorage
    function saveLayout() {
        try {
            const toSave = {
                positions: hudState.positions,
                visibility: hudState.visibility,
                scale: hudState.scale,
                opacity: hudState.opacity,
                theme: hudState.currentTheme
            };
            localStorage.setItem('cyber_hud_settings', JSON.stringify(toSave));
        } catch (e) {
            console.error('Failed to save HUD layout:', e);
        }
    }

    // Audio Synthesis for Sci-Fi Feedback Sound
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
        } catch (err) {}
    }

    // UPDATE HUD UI & POSITIONS
    function renderHUD() {
        // Edit Mode Body Class
        document.body.classList.toggle('edit-mode', hudState.editMode);

        // Settings Modal Visibility
        if (el.settingsModal) {
            el.settingsModal.classList.toggle('hidden', !hudState.editMode);
        }

        // Apply Global Scale & Opacity
        if (el.hudRoot) {
            el.hudRoot.style.transform = `scale(${hudState.scale / 100})`;
            el.hudRoot.style.transformOrigin = 'center center';
            el.hudRoot.style.opacity = `${hudState.opacity / 100}`;
        }

        // Apply Theme Class
        document.body.className = 'cyber-body';
        if (hudState.editMode) document.body.classList.add('edit-mode');
        if (hudState.currentTheme !== 'cyber') {
            document.body.classList.add(`theme-${hudState.currentTheme}`);
        }

        // Apply Visibility Toggles
        if (el.topBarBox) el.topBarBox.style.display = hudState.visibility.topbar ? 'flex' : 'none';
        if (el.radarBox) el.radarBox.style.display = (hudState.visibility.radar && hudState.radarVisible) ? 'block' : 'none';
        if (el.vitalsBox) el.vitalsBox.style.display = hudState.visibility.vitals ? 'block' : 'none';
        if (el.speedoBox) {
            const showSpeedo = hudState.visibility.telemetry && (hudState.vehicleMode || hudState.editMode);
            el.speedoBox.style.display = showSpeedo ? 'flex' : 'none';
            if (hudState.vehicleMode || hudState.editMode) {
                el.speedoBox.classList.remove('hidden-hud');
            } else {
                el.speedoBox.classList.add('hidden-hud');
            }
        }
        if (el.weaponBox) {
            const showWeapon = hudState.visibility.weapon && (hudState.weaponArmed || hudState.editMode);
            el.weaponBox.style.display = showWeapon ? 'flex' : 'none';
            if (hudState.weaponArmed || hudState.editMode) {
                el.weaponBox.classList.add('weapon-active');
            } else {
                el.weaponBox.classList.remove('weapon-active');
            }
        }

        // Apply Custom Saved Positions for Draggables
        const draggableElements = [
            { id: 'topBarBox', dom: el.topBarBox },
            { id: 'radarBox', dom: el.radarBox },
            { id: 'vitalsBox', dom: el.vitalsBox },
            { id: 'speedoBox', dom: el.speedoBox },
            { id: 'weaponBox', dom: el.weaponBox }
        ];

        draggableElements.forEach(item => {
            if (item.dom) {
                const pos = hudState.positions[item.id];
                if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
                    item.dom.style.position = 'absolute';
                    item.dom.style.left = `${pos.left}px`;
                    item.dom.style.top = `${pos.top}px`;
                    item.dom.style.right = 'auto';
                    item.dom.style.bottom = 'auto';
                } else if (!hudState.editMode && !pos) {
                    item.dom.style.position = '';
                    item.dom.style.left = '';
                    item.dom.style.top = '';
                    item.dom.style.right = '';
                    item.dom.style.bottom = '';
                }
            }
        });

        // Vitals Render
        if (el.healthBar) el.healthBar.style.width = `${hudState.health}%`;
        if (el.healthVal) el.healthVal.textContent = `${hudState.health}%`;
        if (el.healthWrapper) {
            if (hudState.health <= 25) el.healthWrapper.classList.add('health-critical');
            else el.healthWrapper.classList.remove('health-critical');
        }

        if (el.armorBar) el.armorBar.style.width = `${hudState.armor}%`;
        if (el.armorVal) el.armorVal.textContent = `${hudState.armor}%`;

        if (el.foodBar) el.foodBar.style.width = `${hudState.food}%`;
        if (el.foodVal) el.foodVal.textContent = `${hudState.food}%`;

        if (el.drinkBar) el.drinkBar.style.width = `${hudState.drink}%`;
        if (el.drinkVal) el.drinkVal.textContent = `${hudState.drink}%`;

        if (el.staminaBar) el.staminaBar.style.width = `${hudState.stamina}%`;
        if (el.staminaVal) el.staminaVal.textContent = `${hudState.stamina}%`;

        if (el.stressBar) el.stressBar.style.width = `${hudState.stress}%`;
        if (el.stressVal) el.stressVal.textContent = `${hudState.stress}%`;

        // Cash & Bank Money
        if (el.hudCash) el.hudCash.textContent = `$ ${hudState.cash.toLocaleString()}`;
        if (el.hudBank) el.hudBank.textContent = `$ ${hudState.bank.toLocaleString()}`;

        if (el.weaponName) el.weaponName.textContent = hudState.weaponName;
        if (el.ammoCurrent) el.ammoCurrent.textContent = String(hudState.ammoClip).padStart(2, '0');
        if (el.ammoReserve) el.ammoReserve.textContent = String(hudState.ammoReserve).padStart(3, '0');

        // Vehicle Telemetry (KM/H)
        if (el.speedVal) el.speedVal.textContent = Math.round(hudState.speedKmh);

        // Speedometer Gauge Arc SVG Math
        if (el.speedArc) {
            const maxArcLength = 376;
            const speedPercent = Math.min(hudState.speedKmh / hudState.maxSpeed, 1);
            const dashOffset = 502 - (speedPercent * maxArcLength);
            el.speedArc.style.strokeDashoffset = dashOffset;
        }

        // Auto-calculate Gear based on Speed KM/H
        if (hudState.speedKmh === 0) hudState.gear = 'P';
        else if (hudState.speedKmh < 30) hudState.gear = 1;
        else if (hudState.speedKmh < 70) hudState.gear = 2;
        else if (hudState.speedKmh < 120) hudState.gear = 3;
        else if (hudState.speedKmh < 180) hudState.gear = 4;
        else if (hudState.speedKmh < 240) hudState.gear = 5;
        else hudState.gear = 6;
        if (el.gearVal) el.gearVal.textContent = typeof hudState.gear === 'number' ? `GEAR ${hudState.gear}` : hudState.gear;

        if (el.fuelBar) el.fuelBar.style.width = `${hudState.fuel}%`;
        if (el.fuelVal) el.fuelVal.textContent = `${hudState.fuel}%`;

        if (el.rpmBar) {
            const rpmPercent = Math.min((hudState.rpm / hudState.maxRpm) * 100, 100);
            el.rpmBar.style.width = `${rpmPercent}%`;
        }
        if (el.rpmVal) el.rpmVal.textContent = Math.round(hudState.rpm).toLocaleString();

        // Indicators
        if (el.indSeatbelt) el.indSeatbelt.classList.toggle('active', hudState.seatbelt);
        if (el.indEngine) el.indEngine.classList.toggle('active', hudState.engineWarn);
        if (el.indLights) el.indLights.classList.toggle('active', hudState.headlights);
        if (el.indLock) el.indLock.classList.toggle('active', hudState.doorsLocked);

        if (el.scanlines) el.scanlines.style.display = hudState.scanlinesVisible ? 'block' : 'none';

        // Settings Modal Button States
        if (el.setToggleTopbar) el.setToggleTopbar.classList.toggle('active', hudState.visibility.topbar);
        if (el.setToggleRadar) el.setToggleRadar.classList.toggle('active', hudState.visibility.radar);
        if (el.setToggleVitals) el.setToggleVitals.classList.toggle('active', hudState.visibility.vitals);
        if (el.setToggleTelemetry) el.setToggleTelemetry.classList.toggle('active', hudState.visibility.telemetry);
        if (el.setToggleWeapon) el.setToggleWeapon.classList.toggle('active', hudState.visibility.weapon);

        if (el.setScale) el.setScale.value = hudState.scale;
        if (el.setValScale) el.setValScale.textContent = `${hudState.scale}%`;

        if (el.setOpacity) el.setOpacity.value = hudState.opacity;
        if (el.setValOpacity) el.setValOpacity.textContent = `${hudState.opacity}%`;

        // Simulator Slider Values
        if (el.simHealth) el.simHealth.value = hudState.health;
        if (el.simValHealth) el.simValHealth.textContent = `${hudState.health}%`;

        if (el.simArmor) el.simArmor.value = hudState.armor;
        if (el.simValArmor) el.simValArmor.textContent = `${hudState.armor}%`;

        if (el.simFood) el.simFood.value = hudState.food;
        if (el.simValFood) el.simValFood.textContent = `${hudState.food}%`;

        if (el.simDrink) el.simDrink.value = hudState.drink;
        if (el.simValDrink) el.simValDrink.textContent = `${hudState.drink}%`;

        if (el.simStamina) el.simStamina.value = hudState.stamina;
        if (el.simValStamina) el.simValStamina.textContent = `${hudState.stamina}%`;

        if (el.simStress) el.simStress.value = hudState.stress;
        if (el.simValStress) el.simValStress.textContent = `${hudState.stress}%`;

        if (el.simSpeed) el.simSpeed.value = hudState.speedKmh;
        if (el.simValSpeed) el.simValSpeed.textContent = `${hudState.speedKmh} KM/H`;

        if (el.simFuel) el.simFuel.value = hudState.fuel;
        if (el.simValFuel) el.simValFuel.textContent = `${hudState.fuel}%`;

        if (el.simRpm) el.simRpm.value = hudState.rpm;
        if (el.simValRpm) el.simValRpm.textContent = `${hudState.rpm}`;

        // Active palette indicator
        document.querySelectorAll('.palette-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === hudState.currentTheme);
        });
    }

    // DRAG AND DROP HANDLER FOR HUD ELEMENTS
    function setupDragAndDrop() {
        const draggableItems = [
            { id: 'topBarBox', dom: el.topBarBox },
            { id: 'radarBox', dom: el.radarBox },
            { id: 'vitalsBox', dom: el.vitalsBox },
            { id: 'speedoBox', dom: el.speedoBox },
            { id: 'weaponBox', dom: el.weaponBox }
        ];

        draggableItems.forEach(item => {
            if (!item.dom) return;

            let isDragging = false;
            let startX = 0, startY = 0;
            let initialLeft = 0, initialTop = 0;

            const onMouseDown = (e) => {
                if (!hudState.editMode) return;
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;

                const rect = item.dom.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;

                item.dom.style.position = 'absolute';
                item.dom.style.left = `${initialLeft}px`;
                item.dom.style.top = `${initialTop}px`;

                playCyberBeep(900, 0.05);
                e.preventDefault();
            };

            const onMouseMove = (e) => {
                if (!isDragging || !hudState.editMode) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                const newLeft = Math.max(0, Math.min(window.innerWidth - item.dom.offsetWidth, initialLeft + dx));
                const newTop = Math.max(0, Math.min(window.innerHeight - item.dom.offsetHeight, initialTop + dy));

                item.dom.style.left = `${newLeft}px`;
                item.dom.style.top = `${newTop}px`;

                hudState.positions[item.id] = { left: newLeft, top: newTop };
            };

            const onMouseUp = () => {
                if (isDragging) {
                    isDragging = false;
                    saveLayout();
                    playCyberBeep(700, 0.05);
                }
            };

            item.dom.addEventListener('mousedown', onMouseDown);
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    }

    // CLOSE SETTINGS & RETURN TO GAME
    function closeSettingsMode() {
        hudState.editMode = false;
        saveLayout();
        renderHUD();

        // NUI Callback back to FiveM client lua
        if (window.GetParentResourceName) {
            fetch(`https://${window.GetParentResourceName()}/closeSettings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            }).catch(() => {});
        }
    }

    // EVENT LISTENERS BINDING
    function setupEventListeners() {
        // Dock Toggle Panel
        if (el.dockToggleBtn) {
            el.dockToggleBtn.addEventListener('click', () => {
                el.dockPanel.classList.toggle('hidden');
                playCyberBeep(900);
            });
        }

        if (el.dockCloseBtn) {
            el.dockCloseBtn.addEventListener('click', () => {
                el.dockPanel.classList.add('hidden');
                playCyberBeep(600);
            });
        }

        // Settings Modal Handlers
        if (el.settingsCloseBtn) {
            el.settingsCloseBtn.addEventListener('click', () => {
                closeSettingsMode();
            });
        }

        if (el.btnSaveExit) {
            el.btnSaveExit.addEventListener('click', () => {
                closeSettingsMode();
            });
        }

        if (el.btnOpenSettingsSim) {
            el.btnOpenSettingsSim.addEventListener('click', () => {
                hudState.editMode = true;
                renderHUD();
                playCyberBeep(1000);
            });
        }

        if (el.btnResetLayout) {
            el.btnResetLayout.addEventListener('click', () => {
                hudState.positions = {};
                hudState.scale = 100;
                hudState.opacity = 100;
                hudState.visibility = { topbar: true, radar: true, vitals: true, telemetry: true, weapon: true };
                saveLayout();
                renderHUD();
                playCyberBeep(400, 0.2);
            });
        }

        // Visibility Toggles in Settings
        const bindVisibilityToggle = (btn, key) => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                hudState.visibility[key] = !hudState.visibility[key];
                saveLayout();
                renderHUD();
                playCyberBeep(800);
            });
        };

        bindVisibilityToggle(el.setToggleTopbar, 'topbar');
        bindVisibilityToggle(el.setToggleRadar, 'radar');
        bindVisibilityToggle(el.setToggleVitals, 'vitals');
        bindVisibilityToggle(el.setToggleTelemetry, 'telemetry');
        bindVisibilityToggle(el.setToggleWeapon, 'weapon');

        // Scale & Opacity Sliders in Settings
        if (el.setScale) {
            el.setScale.addEventListener('input', (e) => {
                hudState.scale = parseInt(e.target.value, 10);
                saveLayout();
                renderHUD();
            });
        }

        if (el.setOpacity) {
            el.setOpacity.addEventListener('input', (e) => {
                hudState.opacity = parseInt(e.target.value, 10);
                saveLayout();
                renderHUD();
            });
        }

        // Simulator Sliders
        const bindSlider = (inputEl, stateKey) => {
            if (!inputEl) return;
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

        // Simulator Toggle Buttons
        if (el.btnToggleVehicle) {
            el.btnToggleVehicle.addEventListener('click', () => {
                hudState.vehicleMode = !hudState.vehicleMode;
                el.btnToggleVehicle.classList.toggle('active', hudState.vehicleMode);
                el.btnToggleVehicle.innerHTML = `<i class="fa-solid fa-car"></i> Vehicle HUD: ${hudState.vehicleMode ? 'ON' : 'OFF'}`;
                playCyberBeep(750);
                renderHUD();
            });
        }

        if (el.btnToggleSeatbelt) {
            el.btnToggleSeatbelt.addEventListener('click', () => {
                hudState.seatbelt = !hudState.seatbelt;
                el.btnToggleSeatbelt.classList.toggle('active', hudState.seatbelt);
                el.btnToggleSeatbelt.innerHTML = `<i class="fa-solid fa-user-slash"></i> Seatbelt: ${hudState.seatbelt ? 'ON' : 'OFF'}`;
                playCyberBeep(1000);
                renderHUD();
            });
        }

        if (el.btnToggleEngine) {
            el.btnToggleEngine.addEventListener('click', () => {
                hudState.engineWarn = !hudState.engineWarn;
                el.btnToggleEngine.classList.toggle('active', hudState.engineWarn);
                el.btnToggleEngine.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Engine Warn: ${hudState.engineWarn ? 'ON' : 'OFF'}`;
                playCyberBeep(400);
                renderHUD();
            });
        }

        if (el.btnToggleLights) {
            el.btnToggleLights.addEventListener('click', () => {
                hudState.headlights = !hudState.headlights;
                el.btnToggleLights.classList.toggle('active', hudState.headlights);
                el.btnToggleLights.innerHTML = `<i class="fa-solid fa-lightbulb"></i> Headlights: ${hudState.headlights ? 'ON' : 'OFF'}`;
                playCyberBeep(850);
                renderHUD();
            });
        }

        if (el.btnToggleScanlines) {
            el.btnToggleScanlines.addEventListener('click', () => {
                hudState.scanlinesVisible = !hudState.scanlinesVisible;
                el.btnToggleScanlines.classList.toggle('active', hudState.scanlinesVisible);
                el.btnToggleScanlines.innerHTML = `<i class="fa-solid fa-tv"></i> Scanlines: ${hudState.scanlinesVisible ? 'ON' : 'OFF'}`;
                renderHUD();
            });
        }

        if (el.btnToggleRadar) {
            el.btnToggleRadar.addEventListener('click', () => {
                hudState.radarVisible = !hudState.radarVisible;
                el.btnToggleRadar.classList.toggle('active', hudState.radarVisible);
                el.btnToggleRadar.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Radar: ${hudState.radarVisible ? 'ON' : 'OFF'}`;
                renderHUD();
            });
        }

        if (el.btnToggleWeapon) {
            el.btnToggleWeapon.addEventListener('click', () => {
                hudState.weaponArmed = !hudState.weaponArmed;
                el.btnToggleWeapon.classList.toggle('active', hudState.weaponArmed);
                el.btnToggleWeapon.innerHTML = `<i class="fa-solid fa-gun"></i> Weapon Armed: ${hudState.weaponArmed ? 'YES' : 'NO'}`;
                renderHUD();
            });
        }

        if (el.btnToggleBg) {
            el.btnToggleBg.addEventListener('click', () => {
                const hasBg = document.body.classList.toggle('preview-bg');
                el.btnToggleBg.classList.toggle('active', hasBg);
                el.btnToggleBg.innerHTML = `<i class="fa-solid fa-image"></i> Preview BG: ${hasBg ? 'ON' : 'OFF'}`;
                playCyberBeep(650);
            });
        }

        if (el.btnGlitchFx) {
            el.btnGlitchFx.addEventListener('click', () => {
                document.body.classList.add('glitch-active');
                playCyberBeep(250, 0.2);
                setTimeout(() => {
                    document.body.classList.remove('glitch-active');
                }, 500);
            });
        }

        // Presets
        if (el.presetNormal) {
            el.presetNormal.addEventListener('click', () => {
                Object.assign(hudState, { health: 100, armor: 80, food: 85, drink: 90, stamina: 100, stress: 10, speedKmh: 65, rpm: 3200 });
                playCyberBeep(700);
                renderHUD();
            });
        }

        if (el.presetDamage) {
            el.presetDamage.addEventListener('click', () => {
                Object.assign(hudState, { health: 15, armor: 0, stress: 85, engineWarn: true });
                playCyberBeep(300, 0.2);
                renderHUD();
            });
        }

        if (el.presetHungry) {
            el.presetHungry.addEventListener('click', () => {
                Object.assign(hudState, { food: 10, drink: 5, stamina: 30 });
                playCyberBeep(450);
                renderHUD();
            });
        }

        if (el.presetFull) {
            el.presetFull.addEventListener('click', () => {
                Object.assign(hudState, { health: 100, armor: 100, food: 100, drink: 100, stamina: 100, stress: 0 });
                playCyberBeep(1200);
                renderHUD();
            });
        }

        if (el.btnDriveFast) {
            el.btnDriveFast.addEventListener('click', () => {
                hudState.vehicleMode = true;
                hudState.speedKmh = 285;
                hudState.rpm = 8400;
                playCyberBeep(1100);
                renderHUD();
            });
        }

        // Theme Customizer Buttons
        document.querySelectorAll('.palette-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                hudState.currentTheme = theme;
                saveLayout();
                renderHUD();
                playCyberBeep(950);
            });
        });

        // ESC key to close settings
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && hudState.editMode) {
                closeSettingsMode();
            }
        });
    }

    // Dynamic Clock & Compass simulation loop
    function startClockLoop() {
        setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const mins = String(now.getMinutes()).padStart(2, '0');
            const secs = String(now.getSeconds()).padStart(2, '0');
            if (el.hudClock) el.hudClock.textContent = `${hours}:${mins}:${secs} // 2077.10.24`;
        }, 1000);

        let headingDeg = 94;
        setInterval(() => {
            headingDeg = (headingDeg + (Math.random() > 0.5 ? 1 : -1)) % 360;
            if (headingDeg < 0) headingDeg += 360;
            const dir = headingDeg >= 315 || headingDeg < 45 ? 'NORTH' :
                        headingDeg >= 45 && headingDeg < 135 ? 'EAST' :
                        headingDeg >= 135 && headingDeg < 225 ? 'SOUTH' : 'WEST';
            if (el.compassDeg) el.compassDeg.textContent = `${String(headingDeg).padStart(3, '0')}° ${dir}`;
        }, 3000);
    }

    // FiveM / NUI Integration Window Event Listener
    window.addEventListener('message', (event) => {
        const item = event.data;
        if (!item) return;

        if (item.action === 'openSettings') {
            hudState.editMode = true;
            renderHUD();
            return;
        }

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

            if (item.cash !== undefined) hudState.cash = item.cash;
            if (item.bank !== undefined) hudState.bank = item.bank;

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

            if (item.weapon) {
                if (item.weapon.armed !== undefined) hudState.weaponArmed = item.weapon.armed;
                if (item.weapon.name !== undefined) hudState.weaponName = item.weapon.name;
                if (item.weapon.clip !== undefined) hudState.ammoClip = item.weapon.clip;
                if (item.weapon.reserve !== undefined) hudState.ammoReserve = item.weapon.reserve;
            }

            renderHUD();
        }
    });

    // Initialize
    loadSavedLayout();
    setupDragAndDrop();
    setupEventListeners();
    renderHUD();
    startClockLoop();
});
