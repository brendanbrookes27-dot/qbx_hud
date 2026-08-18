-- QBX Sleek Glass HUD Client Script

local isHudVisible = true
local isEditMode = false

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

            -- QBX Player Data (Hunger, Thirst)
            local pData = GetQBXPlayerData()
            local foodVal = 100
            local drinkVal = 100

            if pData and pData.metadata then
                if pData.metadata.hunger ~= nil then foodVal = math.floor(pData.metadata.hunger) end
                if pData.metadata.thirst ~= nil then drinkVal = math.floor(pData.metadata.thirst) end
            end

            -- Voice Proximity Detection (PMA-Voice or Mumble)
            local voiceVal = 66
            if LocalPlayer and LocalPlayer.state then
                if LocalPlayer.state.proximity then
                    local mode = LocalPlayer.state.proximity.mode or 'Normal'
                    if mode == 'Whisper' then voiceVal = 33
                    elseif mode == 'Normal' then voiceVal = 66
                    elseif mode == 'Shout' then voiceVal = 100 end
                end
            end

            -- Weapon State Detection
            local currentWeapon = GetSelectedPedWeapon(playerPed)
            local isArmed = false
            local weaponName = "UNARMED"
            local clipAmmo = 0
            local reserveAmmo = 0

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
                local speedMph = math.floor(speedMs * 2.236936) -- Speed in MPH
                local fuel = GetVehicleFuelLevel(vehicle)
                local gearNum = GetVehicleCurrentGear(vehicle)
                local gearText = "D"
                if gearNum == 0 then gearText = "R"
                elseif gearNum == 1 then gearText = "1"
                elseif gearNum == 2 then gearText = "2"
                elseif gearNum == 3 then gearText = "3"
                elseif gearNum == 4 then gearText = "4"
                elseif gearNum >= 5 then gearText = "5" end

                -- Location / Street Name
                local coords = GetEntityCoords(vehicle)
                local streetHash, crossingHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
                local streetName = GetStreetNameFromHashKey(streetHash)
                if crossingHash ~= 0 then
                    streetName = streetName .. " / " .. GetStreetNameFromHashKey(crossingHash)
                end
                if streetName == "" then streetName = "LOS SANTOS" end

                vehData = {
                    inVehicle = true,
                    speed = speedMph,
                    fuel = math.floor(fuel or 100),
                    gear = gearText,
                    seatbelt = true,
                    engine = GetIsVehicleEngineRunning(vehicle),
                    street = string.upper(streetName)
                }
            else
                vehData = {
                    inVehicle = false,
                    speed = 0,
                    fuel = 0,
                    gear = "P",
                    street = "LOS SANTOS"
                }
            end

            SendNUIMessage({
                action = 'updateStatus',
                health = healthPercent,
                armor = armorPercent,
                food = foodVal,
                drink = drinkVal,
                voice = voiceVal,
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

-- Open HUD Settings & Edit Mode via /settings
RegisterCommand('settings', function()
    isEditMode = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'openSettings'
    })
end, false)

-- Alias /hudsettings for convenience
RegisterCommand('hudsettings', function()
    ExecuteCommand('settings')
end, false)

-- Toggle HUD Visibility
RegisterCommand('togglehud', function()
    isHudVisible = not isHudVisible
    SendNUIMessage({
        action = 'toggleHud',
        visible = isHudVisible
    })
end, false)

-- NUI Callback: Close Settings
RegisterNUICallback('closeSettings', function(data, cb)
    isEditMode = false
    SetNuiFocus(false, false)
    cb('ok')
end)
