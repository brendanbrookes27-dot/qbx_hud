-- QBX Cyberpunk Neon HUD Client Script

local isHudVisible = true

-- QBX Core helper
local function GetQBXPlayerData()
    if exports['qbx_core'] and exports['qbx_core'].GetPlayerData then
        return exports['qbx_core']:GetPlayerData()
    elseif exports['qb-core'] and exports['qb-core'].GetCoreObject then
        local QBCore = exports['qb-core']:GetCoreObject()
        if QBCore and QBCore.Functions then
            return QBCore.Functions.GetPlayerData()
        end
    end
    return nil
end

CreateThread(function()
    -- Enable FiveM Native Radar/Minimap
    DisplayRadar(true)
    SetRadarBigmapEnabled(false, false)

    while true do
        Wait(200)
        local playerPed = PlayerPedId()

        if playerPed and playerPed ~= 0 then
            -- Force display radar when ped is alive or in vehicle
            DisplayRadar(isHudVisible)
            -- Health & Armor
            local health = GetEntityHealth(playerPed) - 100
            local maxHealth = GetEntityMaxHealth(playerPed) - 100
            local healthPercent = math.max(0, math.min(100, math.floor((health / math.max(1, maxHealth)) * 100)))
            local armorPercent = math.max(0, math.min(100, GetPedArmour(playerPed)))
            local staminaPercent = math.max(0, math.min(100, math.floor(100 - GetPlayerStamina(PlayerId()))))

            -- QBX Player Data (Cash, Bank, Hunger, Thirst, Stress)
            local pData = GetQBXPlayerData()
            local cashVal = 0
            local bankVal = 0
            local foodVal = 100
            local drinkVal = 100
            local stressVal = 0

            if pData then
                if pData.money then
                    cashVal = pData.money.cash or 0
                    bankVal = pData.money.bank or 0
                end
                if pData.metadata then
                    if pData.metadata.hunger ~= nil then foodVal = math.floor(pData.metadata.hunger) end
                    if pData.metadata.thirst ~= nil then drinkVal = math.floor(pData.metadata.thirst) end
                    if pData.metadata.stress ~= nil then stressVal = math.floor(pData.metadata.stress) end
                end
            end

            -- Weapon State Detection
            local currentWeapon = GetSelectedPedWeapon(playerPed)
            local isArmed = false
            local weaponName = "UNARMED"
            local clipAmmo = 0
            local reserveAmmo = 0

            -- Check if holding a real weapon (not unarmed / fist / melee without ammo)
            if currentWeapon ~= `WEAPON_UNARMED` and currentWeapon ~= 0 then
                isArmed = true
                local ammoInPed = GetAmmoInPedWeapon(playerPed, currentWeapon)
                local _, clipCount = GetAmmoInClip(playerPed, currentWeapon)
                clipAmmo = clipCount or 0
                reserveAmmo = math.max(0, (ammoInPed or 0) - clipAmmo)
                weaponName = "EQUIPPED WEAPON"
            end

            -- Vehicle Telemetry
            local pedInVeh = IsPedInAnyVehicle(playerPed, false)
            local vehData = nil

            if pedInVeh then
                local vehicle = GetVehiclePedIsIn(playerPed, false)
                local speedMs = GetEntitySpeed(vehicle)
                local speedKmh = math.floor(speedMs * 3.6)
                local fuel = GetVehicleFuelLevel(vehicle)
                local rpm = GetVehicleCurrentRpm(vehicle)
                local gear = GetVehicleCurrentGear(vehicle)

                vehData = {
                    inVehicle = true,
                    speed = speedKmh,
                    fuel = math.floor(fuel or 100),
                    rpm = math.floor((rpm or 0) * 8000 + 1000),
                    gear = gear or 1,
                    seatbelt = true,
                    engine = GetIsVehicleEngineRunning(vehicle)
                }
            else
                vehData = {
                    inVehicle = false,
                    speed = 0,
                    fuel = 0,
                    rpm = 0,
                    gear = 0
                }
            end

            SendNUIMessage({
                action = 'updateStatus',
                health = healthPercent,
                armor = armorPercent,
                food = foodVal,
                drink = drinkVal,
                stamina = staminaPercent,
                stress = stressVal,
                cash = cashVal,
                bank = bankVal,
                vehicle = vehData,
                weapon = {
                    armed = isArmed,
                    name = weaponName,
                    clip = clipAmmo,
                    reserve = reserveAmmo
                }
            })
        end
    end
end)

RegisterCommand('togglehud', function()
    isHudVisible = not isHudVisible
    SendNUIMessage({
        action = 'toggleHud',
        visible = isHudVisible
    })
end, false)
