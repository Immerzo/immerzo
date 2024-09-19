local HttpService = game:GetService("HttpService")

local URL = "http://198.55.51.106:8002/log"		-- URL of external service
local GAME_ID = "game_id"     -- Replace with your actual game ID

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

local function popup(object)
	local billboardGui = object:FindFirstChild("BillboardGui")
	if billboardGui then
		local textLabel = billboardGui:FindFirstChild("TextLabel")
		if textLabel then
			textLabel.Visible = true
			wait(3)
			textLabel.Visible = false			
		end
	end
end

local obj = script.Parent  -- Assuming the script is a child of the object
-- Connect the onClick function to the ClickDetector's MouseClick event
local clickDetector = obj:FindFirstChild("ClickDetector")

if clickDetector then
	clickDetector.MouseClick:Connect(function(player)
		trackAction(obj, "click", player)
		popup(obj)
	end)
end
