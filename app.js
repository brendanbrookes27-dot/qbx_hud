/* ==========================================================================
   SLEEK MODERN GLASS HUD - JS INTERACTION & STATE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // HUD State Model
    const hudState = {
        health: 85,
        armor: 60,
        food: 75,
        drink: 90,
        voice: 66,

        speedMph: 84,
        fuel: 68,
        gear: 'D',
        streetName: 'GREAT OCEAN HWY',

        seatbelt: true,
        engineWarn: false,
        headlights: true,

        weaponArmed: true,
        weaponName: 'COMBAT PISTOL',
        ammoClip: 12,
        ammoReserve: 120,

        inVehicle: false,
        radarVisible: true,

        // Customization Settings
        editMode: false,
        scale: 100,
        opacity: 100,
        visibility: {
            radar: true,
            vitals: true,
            telemetry: true,
            weapon: true
        },
        positions: {}
    };

    // DOM Elements Cache
    const el = {
        hudRoot: document.getElementById('hud-root'),

        // Draggable Widgets
        radarBox: document.getElementById('radar-box'),
        vitalsBox: document.getElementById('vitals-box'),
        speedoBox: document.getElementById('speedo-box'),
        weaponBox: document.getElementById('weapon-box'),

        // Settings Modal
        settingsModal: document.getElementById('settings-modal'),
        settingsCloseBtn: document.getElementById('settings-close-btn'),
        btnSaveExit: document.getElementById('btn-save-exit'),
        btnResetLayout: document.getElementById('btn-reset-layout'),

        setToggleRadar: document.getElementById('set-toggle-radar'),
        setToggleVitals: document.getElementById('set-toggle-vitals'),
        setToggleTelemetry: document.getElementById('set-toggle-telemetry'),
        setToggleWeapon: document.getElementById('set-toggle-weapon'),

        setScale: document.getElementById('set-scale'),
        setValScale: document.getElementById('set-val-scale'),
        setOpacity: document.getElementById('set-opacity'),
        setValOpacity: document.getElementById('set-val-opacity'),

        // Vitals Pills
        healthBar: document.getElementById('bar-health'),
        healthVal: document.getElementById('val-health'),

        armorBar: document.getElementById('bar-armor'),
        armorVal: document.getElementById('val-armor'),

        foodBar: document.getElementById('bar-food'),
        foodVal: document.getElementById('val-food'),

        drinkBar: document.getElementById('bar-drink'),
        drinkVal: document.getElementById('val-drink'),

        voiceBar: document.getElementById('bar-voice'),
        voiceVal: document.getElementById('val-voice'),

        // Speedometer
        speedVal: document.getElementById('val-speed'),
        gearVal: document.getElementById('val-gear'),
        fuelBar: document.getElementById('bar-fuel'),
        fuelVal: document.getElementById('val-fuel'),
        locationText: document.getElementById('location-text'),

        // Indicators
        indSeatbelt: document.getElementById('ind-seatbelt'),
        indEngine: document.getElementById('ind-engine'),
        indLights: document.getElementById('ind-lights'),

        // Weapon
        weaponName: document.getElementById('weapon-name'),
        ammoCurrent: document.getElementById('ammo-current'),
        ammoReserve: document.getElementById('ammo-reserve'),

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

        simSpeed: document.getElementById('sim-speed'),
        simValSpeed: document.getElementById('sim-val-speed'),

        simFuel: document.getElementById('sim-fuel'),
        simValFuel: document.getElementById('sim-val-fuel'),

        btnToggleVehicle: document.getElementById('btn-toggle-vehicle'),
        btnToggleSeatbelt: document.getElementById('btn-toggle-seatbelt'),
        btnToggleRadar: document.getElementById('btn-toggle-radar'),
        btnToggleWeapon: document.getElementById('btn-toggle-weapon'),
        btnToggleBg: document.getElementById('btn-toggle-bg'),

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
            const saved = localStorage.getItem('sleek_hud_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.positions) hudState.positions = parsed.positions;
                if (parsed.visibility) Object.assign(hudState.visibility, parsed.visibility);
                if (parsed.scale) hudState.scale = parsed.scale;
                if (parsed.opacity) hudState.opacity = parsed.opacity;
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
                opacity: hudState.opacity
            };
            localStorage.setItem('sleek_hud_settings', JSON.stringify(toSave));
        } catch (e) {
            console.error('Failed to save HUD layout:', e);
        }
    }

    // UPDATE HUD UI & POSITIONS
    function renderHUD() {
        // Edit Mode Body Class
        document.body.classList.toggle('edit-mode', hudState.editMode);

        // Settings Modal Visibility
        if (el.settingsModal) {
            el.settingsModal.classList.toggle('hidden', !hudState.editMode);
        }

        // Apply Scale & Opacity
        if (el.hudRoot) {
            el.hudRoot.style.transform = `scale(${hudState.scale / 100})`;
            el.hudRoot.style.transformOrigin = 'center bottom';
            el.hudRoot.style.opacity = `${hudState.opacity / 100}`;
        }

        // Apply Visibility Toggles
        if (el.radarBox) el.radarBox.style.display = (hudState.visibility.radar && hudState.radarVisible) ? 'block' : 'none';
        if (el.vitalsBox) el.vitalsBox.style.display = hudState.visibility.vitals ? 'flex' : 'none';

        // Speedometer only shows when inside vehicle or in edit mode
        if (el.speedoBox) {
            const showSpeedo = hudState.visibility.telemetry && (hudState.inVehicle || hudState.editMode);
            el.speedoBox.style.display = showSpeedo ? 'flex' : 'none';
            if (hudState.inVehicle || hudState.editMode) {
                el.speedoBox.classList.remove('hidden-hud');
            } else {
                el.speedoBox.classList.add('hidden-hud');
            }
        }

        // Weapon HUD
        if (el.weaponBox) {
            const showWeapon = hudState.visibility.weapon && (hudState.weaponArmed || hudState.editMode);
            el.weaponBox.style.display = showWeapon ? 'flex' : 'none';
            if (hudState.weaponArmed || hudState.editMode) {
                el.weaponBox.classList.add('weapon-active');
            } else {
                el.weaponBox.classList.remove('weapon-active');
            }
        }

        // Custom Positions
        const draggableElements = [
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
        if (el.healthVal) el.healthVal.textContent = Math.round(hudState.health);

        if (el.armorBar) el.armorBar.style.width = `${hudState.armor}%`;
        if (el.armorVal) el.armorVal.textContent = Math.round(hudState.armor);

        if (el.foodBar) el.foodBar.style.width = `${hudState.food}%`;
        if (el.foodVal) el.foodVal.textContent = Math.round(hudState.food);

        if (el.drinkBar) el.drinkBar.style.width = `${hudState.drink}%`;
        if (el.drinkVal) el.drinkVal.textContent = Math.round(hudState.drink);

        if (el.voiceBar) el.voiceBar.style.width = `${hudState.voice}%`;
        if (el.voiceVal) el.voiceVal.textContent = `${Math.round(hudState.voice)}%`;

        // Weapon
        if (el.weaponName) el.weaponName.textContent = hudState.weaponName;
        if (el.ammoCurrent) el.ammoCurrent.textContent = String(hudState.ammoClip).padStart(2, '0');
        if (el.ammoReserve) el.ammoReserve.textContent = String(hudState.ammoReserve).padStart(3, '0');

        // Speedometer
        if (el.speedVal) el.speedVal.textContent = String(Math.round(hudState.speedMph)).padStart(3, '0');
        if (el.gearVal) el.gearVal.textContent = hudState.gear;
        if (el.fuelBar) el.fuelBar.style.width = `${hudState.fuel}%`;
        if (el.fuelVal) el.fuelVal.textContent = `${Math.round(hudState.fuel)}%`;
        if (el.locationText) el.locationText.textContent = hudState.streetName;

        // Indicators
        if (el.indSeatbelt) el.indSeatbelt.classList.toggle('active', hudState.seatbelt);
        if (el.indEngine) el.indEngine.classList.toggle('active', hudState.engineWarn);
        if (el.indLights) el.indLights.classList.toggle('active', hudState.headlights);

        // Settings Buttons
        if (el.setToggleRadar) el.setToggleRadar.classList.toggle('active', hudState.visibility.radar);
        if (el.setToggleVitals) el.setToggleVitals.classList.toggle('active', hudState.visibility.vitals);
        if (el.setToggleTelemetry) el.setToggleTelemetry.classList.toggle('active', hudState.visibility.telemetry);
        if (el.setToggleWeapon) el.setToggleWeapon.classList.toggle('active', hudState.visibility.weapon);

        if (el.setScale) el.setScale.value = hudState.scale;
        if (el.setValScale) el.setValScale.textContent = `${hudState.scale}%`;

        if (el.setOpacity) el.setOpacity.value = hudState.opacity;
        if (el.setValOpacity) el.setValOpacity.textContent = `${hudState.opacity}%`;

        // Sim Sliders
        if (el.simHealth) el.simHealth.value = hudState.health;
        if (el.simValHealth) el.simValHealth.textContent = `${hudState.health}%`;

        if (el.simArmor) el.simArmor.value = hudState.armor;
        if (el.simValArmor) el.simValArmor.textContent = `${hudState.armor}%`;

        if (el.simFood) el.simFood.value = hudState.food;
        if (el.simValFood) el.simValFood.textContent = `${hudState.food}%`;

        if (el.simDrink) el.simDrink.value = hudState.drink;
        if (el.simValDrink) el.simValDrink.textContent = `${hudState.drink}%`;

        if (el.simSpeed) el.simSpeed.value = hudState.speedMph;
        if (el.simValSpeed) el.simValSpeed.textContent = `${hudState.speedMph} MPH`;

        if (el.simFuel) el.simFuel.value = hudState.fuel;
        if (el.simValFuel) el.simValFuel.textContent = `${hudState.fuel}%`;
    }

    // DRAG AND DROP HANDLER
    function setupDragAndDrop() {
        const draggableItems = [
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
                }
            };

            item.dom.addEventListener('mousedown', onMouseDown);
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    }

    // CLOSE SETTINGS
    function closeSettingsMode() {
        hudState.editMode = false;
        saveLayout();
        renderHUD();

        if (window.GetParentResourceName) {
            fetch(`https://${window.GetParentResourceName()}/closeSettings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            }).catch(() => {});
        }
    }

    // EVENT LISTENERS
    function setupEventListeners() {
        if (el.dockToggleBtn) el.dockToggleBtn.addEventListener('click', () => el.dockPanel.classList.toggle('hidden'));
        if (el.dockCloseBtn) el.dockCloseBtn.addEventListener('click', () => el.dockPanel.classList.add('hidden'));

        if (el.settingsCloseBtn) el.settingsCloseBtn.addEventListener('click', closeSettingsMode);
        if (el.btnSaveExit) el.btnSaveExit.addEventListener('click', closeSettingsMode);

        if (el.btnOpenSettingsSim) {
            el.btnOpenSettingsSim.addEventListener('click', () => {
                hudState.editMode = true;
                renderHUD();
            });
        }

        if (el.btnResetLayout) {
            el.btnResetLayout.addEventListener('click', () => {
                hudState.positions = {};
                hudState.scale = 100;
                hudState.opacity = 100;
                hudState.visibility = { radar: true, vitals: true, telemetry: true, weapon: true };
                saveLayout();
                renderHUD();
            });
        }

        // Toggles
        const bindVisibilityToggle = (btn, key) => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                hudState.visibility[key] = !hudState.visibility[key];
                saveLayout();
                renderHUD();
            });
        };

        bindVisibilityToggle(el.setToggleRadar, 'radar');
        bindVisibilityToggle(el.setToggleVitals, 'vitals');
        bindVisibilityToggle(el.setToggleTelemetry, 'telemetry');
        bindVisibilityToggle(el.setToggleWeapon, 'weapon');

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

        // Simulator Controls
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
        bindSlider(el.simSpeed, 'speedMph');
        bindSlider(el.simFuel, 'fuel');

        if (el.btnToggleVehicle) {
            el.btnToggleVehicle.addEventListener('click', () => {
                hudState.inVehicle = !hudState.inVehicle;
                el.btnToggleVehicle.classList.toggle('active', hudState.inVehicle);
                el.btnToggleVehicle.innerHTML = `<i class="fa-solid fa-car"></i> Vehicle HUD: ${hudState.inVehicle ? 'ON' : 'OFF'}`;
                renderHUD();
            });
        }

        if (el.btnToggleSeatbelt) {
            el.btnToggleSeatbelt.addEventListener('click', () => {
                hudState.seatbelt = !hudState.seatbelt;
                el.btnToggleSeatbelt.classList.toggle('active', hudState.seatbelt);
                el.btnToggleSeatbelt.innerHTML = `<i class="fa-solid fa-user-slash"></i> Seatbelt: ${hudState.seatbelt ? 'ON' : 'OFF'}`;
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
                el.btnToggleWeapon.innerHTML = `<i class="fa-solid fa-gun"></i> Weapon HUD: ${hudState.weaponArmed ? 'ON' : 'OFF'}`;
                renderHUD();
            });
        }

        if (el.btnToggleBg) {
            el.btnToggleBg.addEventListener('click', () => {
                const hasBg = document.body.classList.toggle('preview-bg');
                el.btnToggleBg.classList.toggle('active', hasBg);
                el.btnToggleBg.innerHTML = `<i class="fa-solid fa-image"></i> Preview BG: ${hasBg ? 'ON' : 'OFF'}`;
            });
        }

        // Presets
        if (el.presetNormal) {
            el.presetNormal.addEventListener('click', () => {
                Object.assign(hudState, { health: 100, armor: 80, food: 85, drink: 90, voice: 66, inVehicle: false });
                renderHUD();
            });
        }

        if (el.presetDamage) {
            el.presetDamage.addEventListener('click', () => {
                Object.assign(hudState, { health: 15, armor: 0 });
                renderHUD();
            });
        }

        if (el.presetHungry) {
            el.presetHungry.addEventListener('click', () => {
                Object.assign(hudState, { food: 10, drink: 5 });
                renderHUD();
            });
        }

        if (el.presetFull) {
            el.presetFull.addEventListener('click', () => {
                Object.assign(hudState, { health: 100, armor: 100, food: 100, drink: 100 });
                renderHUD();
            });
        }

        if (el.btnDriveFast) {
            el.btnDriveFast.addEventListener('click', () => {
                hudState.inVehicle = true;
                hudState.speedMph = 84;
                renderHUD();
            });
        }

        // ESC key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && hudState.editMode) closeSettingsMode();
        });
    }

    // FiveM NUI Message Listener
    window.addEventListener('message', (event) => {
        const item = event.data;
        if (!item) return;

        if (item.action === 'openSettings') {
            hudState.editMode = true;
            renderHUD();
            return;
        }

        if (item.action === 'toggleHud') {
            if (el.hudRoot) el.hudRoot.style.display = item.visible ? 'block' : 'none';
            return;
        }

        if (item.action === 'updateHUD' || item.action === 'updateStatus') {
            if (item.health !== undefined) hudState.health = item.health;
            if (item.armor !== undefined) hudState.armor = item.armor;
            if (item.food !== undefined) hudState.food = item.food;
            if (item.drink !== undefined) hudState.drink = item.drink;
            if (item.voice !== undefined) hudState.voice = item.voice;

            if (item.vehicle) {
                hudState.inVehicle = !!item.vehicle.inVehicle;
                if (item.vehicle.speed !== undefined) hudState.speedMph = item.vehicle.speed;
                if (item.vehicle.fuel !== undefined) hudState.fuel = item.vehicle.fuel;
                if (item.vehicle.gear !== undefined) hudState.gear = item.vehicle.gear;
                if (item.vehicle.seatbelt !== undefined) hudState.seatbelt = item.vehicle.seatbelt;
                if (item.vehicle.engine !== undefined) hudState.engineWarn = !item.vehicle.engine;
                if (item.vehicle.street !== undefined) hudState.streetName = item.vehicle.street;
            } else if (item.inVehicle !== undefined) {
                hudState.inVehicle = !!item.inVehicle;
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
});
