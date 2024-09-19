import requests
from flask import jsonify


CLIENT_ID = '3r789ppsoj2lye10jjgtffblr8h3xi'
CLIENT_SECRET = 'v7juirhk5exe9s2vdtthj3ye22pryv'


def get_oauth_token():
    url = 'https://id.twitch.tv/oauth2/token'
    params = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'client_credentials'
    }
    response = requests.post(url, params=params).json()
    return response['access_token']


def get_user_id(handle, oauth_token):
    url = 'https://api.twitch.tv/helix/users'

    headers = {
        'Client-ID': CLIENT_ID,
        'Authorization': f'Bearer {oauth_token}'
    }

    params = {
        'login': handle 
    }
    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        if data['data']:
            return data['data'][0]['id']  

    return None


def get_follower_count(handle):
    oauth_token = get_oauth_token()

    user_id = get_user_id(handle, oauth_token)
    if user_id is None:
        return jsonify(0), 200

    
    url = 'https://api.twitch.tv/helix/channels/followers'

    headers = {
        'Client-ID': CLIENT_ID, 
        'Authorization': f'Bearer {oauth_token}'
    }

    params = {
        'broadcaster_id': user_id
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        return jsonify(data['total']), 200
    else:
        return jsonify(0), 200

