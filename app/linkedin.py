import requests
from flask import jsonify

# utilises 3rd party api
# API DOCS https://nubela.co/proxycurl/docs?python#people-api-person-profile-endpoint

BEARER_TOKEN = 'GIiiqcSRHg2o2Fvg1np0-g'


def get_follower_count(profile_url):
    url = 'https://nubela.co/proxycurl/api/v2/linkedin'

    headers = {'Authorization': f'Bearer {BEARER_TOKEN}'}
    params = {'linkedin_profile_url': profile_url}

    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200:
        data = response.json()
        return jsonify( data['follower_count']), 200
    else:
        return jsonify(0), 200

