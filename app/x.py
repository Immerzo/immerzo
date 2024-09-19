import requests
from flask import jsonify

'''
API DOCS

https://rapidapi.com/alexanderxbx/api/twitter-api45/

FREE -> 1000 REQUESTS/MONTH
$5/MONTH -> 100,000 REQUESTS/MONTH

'''


def get_follower_count(handle):

    url = "https://twitter-api45.p.rapidapi.com/followers.php"
    params = {"screenname": handle}
    headers = {
        "X-RapidAPI-Key": "8bd3d60450mshaba8b6b752a5d72p106627jsne71c857ba385",
        "X-RapidAPI-Host": "twitter-api45.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        return jsonify(data['followers_count']), 200
    else:
        return jsonify(0), 200

