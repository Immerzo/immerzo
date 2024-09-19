local HttpService = game:GetService("HttpService")
local ProximityPromptService = game:GetService("ProximityPromptService")

local URL = "http://198.55.51.106:8002/log"		-- URL of external service
local GAME_ID = "game_id"     -- Replace with your actual game ID
local PART_NAME = "Board"	  -- Replace with name of the part

local billboards = script.Parent:GetChildren()  -- Assuming the script is a sibling of the billboards
local visitors = {}

-- Function to track an action and send data to the external service
local function trackAction(object, action, player)
	
	-- Define the data to be sent
	local postData = {
		game_id = GAME_ID,
		object_id = object.Name,
		object_type = object.ClassName,
		action = action,
		player_id = player.UserId
	}

	-- Convert the Lua table to JSON format
	local postDataJson = HttpService:JSONEncode(postData)

	-- Make an HTTP POST request to your external service
	local success, response = pcall(function()
		return HttpService:PostAsync(URL, postDataJson, Enum.HttpContentType.ApplicationJson)
	end)
	print(response)
end
	
local function checkVisit(seconds)
	while true do
		for _, player in ipairs(game.Players:GetPlayers()) do
			local character = player.Character
			if character and character.PrimaryPart then
				local characterPosition = character.PrimaryPart.Position
				
				for _, bb in ipairs(billboards) do
					local board = bb:FindFirstChild(PART_NAME)
					if board ~= nil then 
						local distance = (characterPosition - board.Position).Magnitude
						local prompt = bb:FindFirstChildOfClass("ProximityPrompt")
						if distance <= prompt.MaxActivationDistance then
							-- IN
							if visitors[bb.Name] then
								if not visitors[bb.Name][player.UserId] then
									visitors[bb.Name][player.UserId] = true
									trackAction(bb, "visit", player)
								end
							else
								visitors[bb.Name] = {}								
								visitors[bb.Name][player.UserId] = true
								trackAction(bb, "visit", player)
							end
						else
							-- OUT
							if visitors[bb.Name] and visitors[bb.Name][player.UserId] then
								visitors[bb.Name][player.UserId] = nil
							end
						end						
					end

				end
			end
		end
		wait(seconds)
	end
end

checkVisit(5)	-- check visits every 5 seconds
