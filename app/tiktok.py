import requests
from flask import jsonify


'''
API DOCS ->

https://rapidapi.com/omarmhaimdat/api/tiktok-api6/

FREE -> 50 REQUESTS/MONTH
$10/MONTH -> 10000 REQUESTS/MONTH

'''


def get_follower_count(handle):
    url = "https://tiktok-api6.p.rapidapi.com/user/details"
    params = {"username": handle}
    headers = {
        "X-RapidAPI-Key": "8bd3d60450mshaba8b6b752a5d72p106627jsne71c857ba385",
        "X-RapidAPI-Host": "tiktok-api6.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        return jsonify(data['followers']), 200
    else:
        return jsonify(0), 200

