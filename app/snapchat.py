import requests
from flask import jsonify

# currently doesn't have publicly available api to access follower counts
# But have plans to release new 'creator discover api' 

'''
API DOCS

https://rapidapi.com/bloomautomation-bloomautomation-default/api/snapchat-profile-scraper-api

FREE -> 10 REQUESTS/MONTH
$30/MONTH -> 20000 REQUESTS/MONTH

'''

def get_follower_count(handle):

    url = "https://snapchat-profile-scraper-api.p.rapidapi.com/profile"
    querystring = {"username": handle}
    headers = {
        "X-RapidAPI-Key": "8bd3d60450mshaba8b6b752a5d72p106627jsne71c857ba385",
        "X-RapidAPI-Host": "snapchat-profile-scraper-api.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)

    if response.status_code == 200:
        data = response.json()
        return jsonify(data['publicAccountData']['subscriberCount']), 200
    else:
        return jsonify(0), 200

