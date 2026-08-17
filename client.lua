-- QBX Cyberpunk Neon HUD Client Script

local isHudVisible = true
local inVehicle = false

CreateThread(function()
    while true do
        Wait(200)
        local playerPed = PlayerPedId()

        if playerPed and playerPed ~= 0 then
            local health = GetEntityHealth(playerPed) - 100
            local maxHealth = GetEntityMaxHealth(playerPed) - 100
            local healthPercent = math.max(0, math.min(100, math.floor((health / maxHealth) * 100)))

            local armor = GetPedArmour(playerPed)
            local armorPercent = math.max(0, math.min(100, armor))

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
                    fuel = math.floor(fuel),
                    rpm = math.floor(rpm * 8000 + 1000),
                    gear = gear,
                    seatbelt = true,
                    engine = GetIsVehicleEngineRunning(vehicle),
                    highbeam = false,
                    locked = false
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
                food = 85,
                drink = 80,
                stamina = 100,
                stress = 10,
                vehicle = vehData
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
