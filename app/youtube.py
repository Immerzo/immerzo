import requests 
from flask import jsonify

'''
1. Create new project inside google cloud apis
2. enable apis ans service
3. enaable YouTube Data API v3
4. create credentials to generate api key
'''
API_KEY = 'AIzaSyBUzdXWVoZ07k-ocnkb65PC_uuIVcoiuXY'


def get_follower_count(handle):
    url = f'https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle={handle}&key={API_KEY}'

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        return jsonify(data['items'][0]['statistics']['subscriberCount']), 200
    else:
        return jsonify(0), 200

