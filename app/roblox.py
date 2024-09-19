import requests
from flask import jsonify


def get_follower_count(handle):

    url = f'https://friends.roblox.com/v1/users/{handle}/followers/count'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return jsonify(data['count']), 200

    return jsonify(0), 200

