import requests, time
import base64
import json
import io, os
import uuid
import logging
from PIL import Image
from functools import wraps

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, text, distinct, nulls_last, desc

import openai_api
import openai_msg


# social platform imports
import linkedin
import roblox
import snapchat
import tiktok
import twitch
import x
import youtube

# messaging
import messaging


# Keycloak configuration
REALM = 'Immerzo'
CLIENT_ID = 'immerzo'
CLIENT_SECRET = ''

KC_SERVER_URL = 'http://:8080/auth/'
TOKEN_URL = f'{KC_SERVER_URL}realms/{REALM}/protocol/openid-connect/token'
USERS_URL = f'{KC_SERVER_URL}admin/realms/{REALM}/users'
LOGOUT_URL = f'{KC_SERVER_URL}realms/{REALM}/protocol/openid-connect/logout'
INTROSPECT_URL = f'{TOKEN_URL}/introspect'

# PAYPAL
PAYPAL_CLIENT_ID = ''
PAYPAL_CLIENT_SECRET = ''
PAYPAL_AUTH = (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)

PAYPAL_URL = "https://api.sandbox.paypal.com"  # Use "https://api.paypal.com" for production
# PAYPAL_URL = "https://api.paypal.com"

PAYPAL_TOKEN_URL = f"{PAYPAL_URL}/v1/oauth2/token"
PAYPAL_ORDERS_URL = f"{PAYPAL_URL}/v2/checkout/orders"


FILES_DIR = 'files/'

app = Flask(__name__)


logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s [%(levelname)s] - %(message)s',
                    handlers=[logging.FileHandler('app.log'), logging.StreamHandler()])


# UNCOMMENT ONE OF THE FOLLOWING:
# LOCAL DEV
# CORS(app)
# PROD
CORS(app, resources={r"/*": {"origins": ["https://app.immerzo.io", "https://signup.immerzo.io"]}})


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://::5432/immerzo_db'

db = SQLAlchemy(app)


class KLogs(db.Model):
    __tablename__ = 'k_logs'

    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.String(256), nullable=False)
    object_id = db.Column(db.String(256), nullable=False)
    object_type = db.Column(db.String(32), nullable=False)
    action = db.Column(db.String(32), nullable=True)
    player_id = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False)


class KUsers(db.Model):
    __tablename__ = 'k_users'

    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('k_users.id', ondelete='SET NULL'))
    username = db.Column(db.String(256), unique=True, nullable=False)
    name = db.Column(db.Text)
    description = db.Column(db.Text)
    user_type = db.Column(db.String(1), nullable=False)
    categories = db.Column(db.ARRAY(db.Text))
    platforms = db.Column(db.ARRAY(db.Text))
    handles = db.Column(db.Text)
    pic = db.Column(db.String(64))
    image = db.Column(db.String(64))
    industry = db.Column(db.String(256), nullable=True)
    corporate_role = db.Column(db.String(64), nullable=True)
    motivation = db.Column(db.String(64), nullable=True)
    url = db.Column(db.String(2048), nullable=True)
    city = db.Column(db.String(128), nullable=True)
    country = db.Column(db.String(64), nullable=True)
    rating = db.Column(db.Numeric, nullable=False, default=0)
    reviews = db.Column(db.Numeric, nullable=False, default=0)
    bid_min = db.Column(db.Numeric, nullable=True)
    bid_max = db.Column(db.Numeric, nullable=True)
    followers = db.Column(db.Numeric, nullable=True)
    code = db.Column(db.String(32))
    state = db.Column(db.String(1), nullable=False, default='A')
    updated_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False)


class KProjects(db.Model):
    __tablename__ = 'k_projects'

    id = db.Column(db.Integer, primary_key=True)
    brand_id = db.Column(db.Integer, db.ForeignKey('k_users.id'))
    brand_name = db.Column(db.Text)
    creator_id = db.Column(db.Integer, db.ForeignKey('k_users.id'))
    title = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    categories = db.Column(db.ARRAY(db.Text))
    platforms = db.Column(db.ARRAY(db.Text))
    budget = db.Column(db.Numeric, nullable=True)
    state = db.Column(db.String(1), nullable=False, default='I')
    game_id = db.Column(db.String(256))
    published_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False)


class KRsvps(db.Model):
    __tablename__ = 'k_rsvps'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('k_projects.id'), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('k_users.id'), nullable=False)
    accepted = db.Column(db.Boolean, nullable=False)
    proposal = db.Column(db.Text)
    bid = db.Column(db.Numeric, nullable=True)
    created_at = db.Column(db.TIMESTAMP, nullable=False)


class KFiles(db.Model):
    __tablename__ = 'k_files'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256), nullable=False)
    location = db.Column(db.String(64), nullable=False)
    size = db.Column(db.Numeric, nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False)


class KChats(db.Model):
    __tablename__ = 'k_chats'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('k_projects.id'), nullable=False)
    brand_id = db.Column(db.Integer, db.ForeignKey('k_users.id'), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('k_users.id'), nullable=False)
    msg = db.Column(db.String(4096), nullable=True)
    file_id = db.Column(db.Integer, db.ForeignKey('k_files.id'), nullable=True)
    name = db.Column(db.String(256))
    size = db.Column(db.Numeric)
    sender = db.Column(db.String(1), nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False)


class KInvitations(db.Model):
    __tablename__ = 'k_invitations'

    id = db.Column(db.Integer, primary_key=True)
    user_type = db.Column(db.String(1), nullable=False)
    code = db.Column(db.String(32), nullable=False)
    ended_at = db.Column(db.TIMESTAMP)
    created_at = db.Column(db.TIMESTAMP, nullable=False)


class KCategories(db.Model):
    __tablename__ = 'k_categories'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(64), nullable=False)
    value = db.Column(db.String(256), nullable=False)


class KPlatforms(db.Model):
    __tablename__ = 'k_platforms'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(64), nullable=False)
    value = db.Column(db.String(256), nullable=False)


class KShares(db.Model):
    __tablename__ = 'k_shares'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('k_projects.id'), nullable=True)
    uuid = db.Column(db.Text)
    created_at = db.Column(db.TIMESTAMP, nullable=False)


class KInvoices(db.Model):
    __tablename__ = 'k_invoices'

    id = db.Column(db.Integer, primary_key=True)
    brand_id = db.Column(db.Integer, db.ForeignKey('k_users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('k_projects.id'), nullable=True)
    title = db.Column(db.Text, nullable=False)
    amount = db.Column(db.Numeric, nullable=True)
    state = db.Column(db.String(1), nullable=False, default='A')
    due_at = db.Column(db.TIMESTAMP, nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False)


class KTransactions(db.Model):
    __tablename__ = 'k_transactions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('k_users.id'), nullable=False)
    invoice_id = db.Column(db.Integer, db.ForeignKey('k_invoices.id'))
    title = db.Column(db.Text, nullable=False)
    amount = db.Column(db.Numeric, nullable=False)
    reference = db.Column(db.Text)
    capture = db.Column(db.Text)
    state = db.Column(db.String(1), nullable=False, default='T')
    created_at = db.Column(db.DateTime, nullable=False)


# wrapper function to handle empty string / None
def b64encode(data):
    return base64.b64encode(data).decode('utf-8') if data else None


# wrapper function to handle empty string / None
def b64decode(data):
    return base64.b64decode(data) if data else None


# set obj.field to value only if field exists in data
def set_field(obj, field, data, value=None):
    if field in data:
        value = data[field] if value is None else value
        setattr(obj, field, value)  # obj.field = value


def authorize(token):
    payload = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'token': token,
    }

    response = requests.post(INTROSPECT_URL, data=payload)
    if response.status_code == 200:
        res = response.json()
        if 'exp' in res:
            exp_time = res['exp']
            current_time = time.time()
            if current_time < exp_time:
                return True
    return False


def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token missing'}), 401

        token = token.split('Bearer ')[-1].strip()

        if not authorize(token):
            return jsonify({'error': 'Token invalid'}), 401

        return f(*args, **kwargs)

    return decorated_function


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username:
        username = username.lower()  # username all lowercase

    payload = {
        'grant_type': 'password',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'username': username,
        'password': password,
    }

    response = requests.post(TOKEN_URL, data=payload)
    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({'error': 'Unauthorized'}), 401


@app.route('/logout', methods=['POST'])
def logout():
    data = request.json
    refresh_token = data.get('refresh_token')

    payload = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'refresh_token': refresh_token,
    }

    response = requests.post(LOGOUT_URL, headers={'Content-Type': 'application/x-www-form-urlencoded'}, data=payload)
    if response.status_code == 204:
        return jsonify({'message': 'Logout success'}), 200
    else:
        return jsonify({'error': response.text}), 401


@app.route('/refresh', methods=['POST'])
def refresh():
    data = request.json
    refresh_token = data.get('refresh_token')

    payload = {
        'grant_type': 'refresh_token',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'refresh_token': refresh_token,
    }

    response = requests.post(TOKEN_URL, data=payload)
    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({'error': 'Unauthorized'}), 401


@app.route('/get_logs', methods=['GET'])
@token_required
def get_logs():
    try:
        game_id = request.args.get('game_id')    # GET argument
        if game_id is None:
            return jsonify({"error": "Missing 'game_id' parameter"}), 400

        logs = KLogs.query.filter_by(game_id=game_id).order_by(KLogs.created_at.desc()).all()

        if not logs:
            return jsonify([]), 200    # empty list

        response_data = []

        for log in logs:
            e = {
                'game_id': log.game_id,
                'object_id': log.object_id,
                'object_type': log.object_type,
                'action': log.action,
                'player_id': log.player_id,
                'created_at': log.created_at
            }
            response_data.append(e)

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/analytics', methods=['GET'])
@token_required
def analytics():
    try:
        game_id = request.args.get('game_id')
        action = request.args.get('action')
        period = request.args.get('period')

        if action is None or game_id is None:
            return jsonify({"error": "Missing 'action' or 'game_id' parameter"}), 400

        if period is None:
            period = 'day'

        object_id = request.args.get('object_id')

        trunc = func.date_trunc(period, KLogs.created_at)
        q = db.session.query(trunc.label('name'), func.count().label('value'))
        f = q.filter(KLogs.game_id == game_id, KLogs.action == action) if object_id is None else q.filter(KLogs.game_id == game_id, KLogs.object_id == object_id, KLogs.action == action)
        result = f.group_by(trunc).order_by(text('name ASC')).all()

        response_data = []
        for row in result:
            if period == 'hour':
                response_data.append({"name": row.name.strftime("%m-%d %Hh"), "value": row.value})
            elif period == 'month':
                response_data.append({"name": row.name.strftime("%Y-%m"), "value": row.value})
            else:
                response_data.append({"name": row.name.strftime("%m-%d"), "value": row.value})

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get_object_ids', methods=['GET'])
@token_required
def get_object_ids():
    try:
        game_id = request.args.get('game_id')
        action = request.args.get('action')
        if action is None or game_id is None:
            return jsonify({"error": "Missing 'action' or 'game_id' parameter"}), 400

        oids = KLogs.query.filter_by(action=action, game_id=game_id).distinct(KLogs.object_id).all()

        response_data = [record.object_id for record in oids]

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/user', methods=['GET'])
@token_required
def get_user():
    id = request.args.get('id')
    username = request.args.get('username')

    query = KUsers.query

    if id is not None:
        query = query.filter(KUsers.id == id)

    if username is not None:
        username = username.lower()  # username all lowercase
        query = query.filter(KUsers.username == username)

    user = query.first()

    if user:
        return jsonify({
            'id': user.id,
            'parent_id': user.parent_id,
            'username': user.username,
            'name': user.name,
            'description': user.description,
            'user_type': user.user_type,
            'categories': user.categories,
            'platforms': user.platforms,
            'handles': user.handles,
            'profile_picture': b64encode(load_file(user.pic)),
            'cover_image': b64encode(load_file(user.image)),
            'industry': user.industry,
            'motivation': user.motivation,
            'corporate_role': user.corporate_role,
            'url': user.url,
            'city': user.city,
            'country': user.country,
            'rating': user.rating,
            'reviews': user.reviews,
            'bid_min': user.bid_min,
            'bid_max': user.bid_max,
            'followers': user.followers,
            'state': user.state,
            # do not return code via API
            'updated_at': user.updated_at,
            'created_at': user.created_at
        })
    else:
        return jsonify({'error': 'User not found'}), 404


def load_file(location):
    file = None
    if location:
        with open(f'{FILES_DIR}{location}', 'rb') as in_file:
            file = in_file.read()
    return file


def store_file(file):
    if file:
        # Create file
        uu = str(uuid.uuid4())
        location = uu[0:2] + "/" + uu[2:4] + "/" + uu[4:6] + "/" + uu

        # store file in file system
        pathfilename = f'{FILES_DIR}{location}'

        # create directory if not exist
        os.makedirs(os.path.dirname(pathfilename), exist_ok=True)

        # open in binary mode, create if does not exist
        with open(pathfilename, 'wb+') as out_file:
            out_file.write(file)
            return location


def create_keycloak_user(username, password, email, name):

    payload = {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    }

    token_response = requests.post(TOKEN_URL, data=payload)
    token_response.raise_for_status()

    access_token = token_response.json()["access_token"]

    # Create a new user
    new_user_data = {
        "username": username,
        "email": username,
        "enabled": True,
        "lastName": name,
        "credentials": [{"type": "password", "value": password}]
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-Client-Roles": "manage-users"
    }

    create_user_response = requests.post(USERS_URL, headers=headers, data=json.dumps(new_user_data))
    create_user_response.raise_for_status()

    return True


@app.route('/creator', methods=['POST'])
def set_creator():
    data = request.json

    invitation_code = data.get('invitation_code')
    if invitation_code is None:
        return jsonify({'error': 'Missing invitation code'}), 404

    c = KInvitations.query.filter(KInvitations.code == invitation_code).first()

    ts = func.now()
    if c is None or (c.ended_at is not None and c.ended_at < ts):
        return jsonify({'error': 'Invitation code error.'}), 404

    username = data.get('username')
    password = data.get('password')
    name = data.get('name')

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 404

    username = username.lower()  # username all lowercase

    # Check if the user already exists
    user = KUsers.query.filter_by(username=username).first()

    if user:
        return jsonify({'error': 'Username already exists'}), 404

    elif create_keycloak_user(username, password, username, name):
        # email is the username by design
        new_user = KUsers(
            username = username,
            name = name,
            user_type = 'C',
            handles = data.get('handles'),
            pic = store_file(b64decode(data.get('profile_picture'))),
            city = data.get('city'),
            country = data.get('country'),
            code = invitation_code,
            state = 'A',
            created_at = func.now()
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'id': new_user.id}), 201


@app.route('/brand', methods=['POST'])
def set_brand():
    data = request.json

    invitation_code = data.get('invitation_code')
    if invitation_code is None:
        return jsonify({'error': 'Missing invitation code'}), 404

    c = KInvitations.query.filter(KInvitations.code == invitation_code).first()

    ts = func.now()
    if c is None or (c.ended_at is not None and c.ended_at < ts):
        return jsonify({'error': 'Invitation code error.'}), 404

    username = data.get('username')
    password = data.get('password')
    name = data.get('name')

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 404

    username = username.lower()  # username all lowercase

    # Check if the user already exists
    user = KUsers.query.filter_by(username=username).first()

    if user:
        return jsonify({'error': 'Username already exists'}), 404

    elif create_keycloak_user(username, password, username, name):
        # email is the username by design
        new_user = KUsers(
            username = username,
            name = name,
            user_type = 'B',
            pic = store_file(b64decode(data.get('profile_picture'))),
            industry = data.get('industry'),
            motivation = data.get('motivation'),
            corporate_role = data.get('corporate_role'),
            url = data.get('url'),
            city = data.get('city'),
            country = data.get('country'),
            code = invitation_code,
            state = 'A',
            created_at = func.now()
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'id': new_user.id}), 201


@app.route('/user/<string:username>', methods=['POST'])
@token_required
def set_user(username):
    data = request.json

    username = username.lower()  # username all lowercase

    # Check if the user already exists
    user = KUsers.query.filter_by(username=username).first()

    if user:
        # username can not change
        set_field(user, 'parent_id', data)
        set_field(user, 'name', data)
        set_field(user, 'description', data)
        # user_type can not change
        set_field(user, 'categories', data)
        set_field(user, 'platforms', data)
        set_field(user, 'handles', data)

        pic = store_file(b64decode(data.get('profile_picture')))
        if pic:
            user.pic = pic

        image = store_file(b64decode(data.get('cover_image')))
        if image:
            user.image = image

        set_field(user, 'industry', data)
        set_field(user, 'motivation', data)
        set_field(user, 'corporate_role', data)
        set_field(user, 'url', data)
        set_field(user, 'city', data)
        set_field(user, 'country', data)

        # rating and reviews must be set manually after validation 

        set_field(user, 'bid_min', data)
        set_field(user, 'bid_max', data)

        # followers must be set manually after validation 

        # code can only be set by set_creator() or set_brand() 
        # state must be set manually after validation
        user.updated_at = func.now()

        db.session.commit()
        return jsonify({'message': 'User updated successfully'})
    else:
        # Create
        # followers must be set manually after validation 

        new_user = KUsers(
            parent_id = data.get('parent_id'),
            username = username,
            name = data.get('name'),
            description = data.get('description'),
            user_type = data.get('user_type'),
            categories = data.get('categories'),
            platforms = data.get('platforms'),
            handles = data.get('handles'),
            pic = store_file(b64decode(data.get('profile_picture'))),
            image = store_file(b64decode(data.get('cover_image'))),
            industry = data.get('industry'),
            motivation = data.get('motivation'),
            corporate_role = data.get('corporate_role'),
            url = data.get('url'),
            city = data.get('city'),
            country = data.get('country'),

            # rating and reviews must be set manually after validation 

            bid_min = data.get('bid_min'),
            bid_max = data.get('bid_max'),

            # code is only set by set_brand() or set_creator() 
            state = 'I',
            created_at = func.now()
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'id': new_user.id}), 201


@app.route('/users', methods=['GET'])
@token_required
def get_users():
    parent_id = request.args.get('parent_id')
    user_type = request.args.get('user_type')
    category = request.args.get('category')
    platform = request.args.get('platform')
    name = request.args.get('name')
    limit = request.args.get('limit')

    query = KUsers.query

    # search for users with this parent
    if parent_id is not None:
        query = query.filter(KUsers.parent_id == parent_id)

    # search for all user_type when None
    if user_type is not None:
        query = query.filter(KUsers.user_type == user_type)

    if category is not None:
        query = query.filter(KUsers.categories.any(category))

    if platform is not None:
        query = query.filter(KUsers.platforms.any(platform))

    if name is not None:
        query = query.filter(KUsers.name.ilike(f'%{name}%'))

    if limit is not None:
        users = query.order_by(KUsers.rating.desc(), nulls_last(KUsers.followers.desc())).limit(limit).all()
    else:
        users = query.order_by(KUsers.rating.desc(), nulls_last(KUsers.followers.desc())).all()

    response_data = []
    for u in users:
        e = {
            'id': u.id,
            'parent_id': u.parent_id,
            'username': u.username,
            'name': u.name,
            'description': u.description,
            'user_type': u.user_type,
            'categories': u.categories,
            'platforms': u.platforms,
            'handles': u.handles,
            'profile_picture': b64encode(load_file(u.pic)),
            'cover_image': b64encode(load_file(u.image)),
            'industry': u.industry,
            'motivation': u.motivation,
            'corporate_role': u.corporate_role,
            'url': u.url,
            'city': u.city,
            'country': u.country,
            'rating': u.rating,
            'reviews': u.reviews,
            'bid_min': u.bid_min,
            'bid_max': u.bid_max,
            'followers': u.followers,
            'state': u.state,
            # do not return code via API
            'updated_at': u.updated_at,
            'created_at': u.created_at
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/creators', methods=['GET'])
@token_required
def get_creators():
    project_id = request.args.get('project_id')

    query = db.session.query(KUsers).filter(
                KUsers.id.in_(
                db.session.query(KRsvps.creator_id).filter(KRsvps.project_id == project_id)))

    users = query.order_by(KUsers.rating.desc(), nulls_last(KUsers.followers.desc())).all()

    response_data = []
    for u in users:
        e = {
            'id': u.id,
            'parent_id': u.parent_id,
            'username': u.username,
            'name': u.name,
            'description': u.description,
            'user_type': u.user_type,
            'categories': u.categories,
            'platforms': u.platforms,
            'handles': u.handles,
            'profile_picture': b64encode(load_file(u.pic)),
            'cover_image': b64encode(load_file(u.image)),
            'url': u.url,
            'city': u.city,
            'country': u.country,
            'rating': u.rating,
            'reviews': u.reviews,
            'bid_min': u.bid_min,
            'bid_max': u.bid_max,
            'followers': u.followers,
            'state': u.state,
            # do not return code via API
            'updated_at': u.updated_at,
            'created_at': u.created_at
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/project/<int:id>', methods=['GET'])
@token_required
def get_project(id):
    project = KProjects.query.get(id)
    if project is None:
        return jsonify({'error': 'Project not found'}), 404

    project_data = {
        'id': project.id,
        'brand_id': project.brand_id,
        'brand_name': project.brand_name,
        'creator_id': project.creator_id,
        'title': project.title,
        'description': project.description,
        'categories': project.categories,
        'platforms': project.platforms,
        'budget': project.budget,
        'state': project.state,
        'game_id': project.game_id,
        'published_at': project.published_at,
        'updated_at': project.updated_at,
        'created_at': project.created_at
    }

    return jsonify(project_data)


@app.route('/project', methods=['POST'])
@token_required
def set_project():
    # Extract data from the POST request
    data = request.json
    if "id" in data:
        # update current project
        project = KProjects.query.get(data['id'])
        if project is None:
            return jsonify({'error': 'Project not found'}), 404

        # brand_id can not be changed
        # brand_name can not be changed
        set_field(project, 'creator_id', data)
        set_field(project, 'title', data)
        set_field(project, 'description', data)
        set_field(project, 'categories', data)
        set_field(project, 'platforms', data)
        set_field(project, 'budget', data)
        set_field(project, 'state', data)
        set_field(project, 'game_id', data)
        set_field(project, 'published_at', data)

        project.updated_at = func.now()
        db.session.commit()

        return jsonify({'message': 'Project updated successfully'})
    else:
        # create new project
        state = data.get('state', 'I'),
        published_at = None if state == 'I' else func.now()
 
        new_project = KProjects(
            brand_id = data.get('brand_id'),
            brand_name = data.get('brand_name'),
            creator_id = data.get('creator_id'),
            title = data.get('title'),
            description = data.get('description'),
            categories = data.get('categories'),
            platforms = data.get('platforms'),
            budget = data.get('budget'),
            state = state, 
            game_id = str(uuid.uuid4()),
            published_at = published_at, 
            created_at = func.now()
        )
        db.session.add(new_project)
        db.session.commit()

        return jsonify({'id': new_project.id}), 201


@app.route('/invitations', methods=['GET'])
@token_required
def get_invitations():
    creator_id = request.args.get('creator_id')
    accepted = request.args.get('accepted')
    title = request.args.get('title')

    if accepted is None:
        query = db.session.query(KProjects).filter(
                    KProjects.state == 'P',
                    ~KProjects.id.in_(
                    db.session.query(KRsvps.project_id).filter(KRsvps.creator_id == creator_id)))
    else:
        query = db.session.query(KProjects).filter(
                    KProjects.state == 'P',
                    KProjects.id.in_(
                    db.session.query(KRsvps.project_id).filter(KRsvps.creator_id == creator_id, KRsvps.accepted == accepted)))

    if title is not None:
        query = query.filter(KProjects.title.ilike(f'%{title}%'))

    projects = query.order_by(KProjects.published_at.desc()).all()

    response_data = []
    for p in projects:
        e = {
            'id': p.id,
            'brand_id': p.brand_id,
            'brand_name': p.brand_name,
            'creator_id': p.creator_id,
            'title': p.title,
            'description': p.description,
            'categories': p.categories,
            'platforms': p.platforms,
            'budget': p.budget,
            'state': p.state,
            'game_id': p.game_id,
            'published_at': p.published_at,
            'updated_at': p.updated_at,
            'created_at': p.created_at
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/projects', methods=['GET'])
@token_required
def get_projects():

    brand_id = request.args.get('brand_id')
    state = request.args.get('state')
    creator_id = request.args.get('creator_id')
    title = request.args.get('title')

    query = KProjects.query

    # search for all brands when None
    if brand_id is not None:
        query = query.filter(KProjects.brand_id == brand_id)

    # search for all states when None
    if state is not None:
        query = query.filter(KProjects.state == state)
    else:
        query = query.filter(KProjects.state != 'I')

    # search for all creators when None
    if creator_id is not None:
        query = query.filter(KProjects.creator_id == creator_id)

    # search for all titles when None
    if title is not None:
        query = query.filter(KProjects.title.ilike(f'%{title}%'))

    projects = query.order_by(KProjects.published_at.desc()).all()

    response_data = []
    for p in projects:
        latest_brand_msg = (
            db.session.query(KChats.created_at)
            .filter_by(
                brand_id=p.brand_id,
                creator_id=p.creator_id,
                project_id=p.id,
                sender='B'
            )
            .order_by(desc(KChats.created_at))
            .first()
        )

        latest_creator_msg = (
            db.session.query(KChats.created_at)
            .filter_by(
                brand_id=p.brand_id,
                creator_id=p.creator_id,
                project_id=p.id,
                sender='C'
            )
            .order_by(desc(KChats.created_at))
            .first()
        )

        e = {
            'id': p.id,
            'brand_id': p.brand_id,
            'brand_name': p.brand_name,
            'creator_id': p.creator_id,
            'title': p.title,
            'description': p.description,
            'categories': p.categories,
            'platforms': p.platforms,
            'budget': p.budget,
            'state': p.state,
            'game_id': p.game_id,
            'published_at': p.published_at,
            'updated_at': p.updated_at,
            'created_at': p.created_at,
            'latest_brand_at': None if latest_brand_msg is None else latest_brand_msg.created_at,
            'latest_creator_at': None if latest_creator_msg is None else latest_creator_msg.created_at
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/ideas', methods=['GET'])
@token_required
def get_ideas():

    ideas = KProjects.query.filter(KProjects.state == 'I', KProjects.brand_id == None).all()

    response_data = []
    for p in ideas:
        e = {
            'id': p.id,
            'brand_id': p.brand_id,
            'brand_name': p.brand_name,
            'creator_id': p.creator_id,
            'title': p.title,
            'description': p.description,
            'categories': p.categories,
            'platforms': p.platforms,
            'budget': p.budget,
            'state': p.state,
            'game_id': p.game_id,
            'published_at': p.published_at,
            'updated_at': p.updated_at,
            'created_at': p.created_at
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/rsvp', methods=['GET'])
@token_required
def get_rsvp():
    creator_id = request.args.get('creator_id')
    project_id = request.args.get('project_id')

    rsvp = KRsvps.query.filter_by(creator_id=creator_id, project_id=project_id).first()

    if rsvp:
        return jsonify({
            'id': rsvp.id,
            'project_id': rsvp.project_id,
            'creator_id': rsvp.creator_id,
            'accepted': rsvp.accepted,
            'proposal': rsvp.proposal,
            'bid': rsvp.bid,
            'created_at': rsvp.created_at
        })
    else:
        return jsonify({'error': 'Rsvp not found'}), 404


@app.route('/rsvp', methods=['POST'])
@token_required
def set_rsvp():
    try:
        # Extract data from the POST request
        data = request.json
        project_id = data.get('project_id')
        creator_id = data.get('creator_id')
        accepted = data.get('accepted')
        proposal = data.get('proposal')
        bid = data.get('bid')

        # Create a new KRsvps object
        obj = KRsvps(project_id=project_id,
                     creator_id=creator_id,
                     accepted=accepted,
                     proposal=proposal,
                     bid=bid,
                     created_at=func.now())

        # Add the object to the session and commit to the database
        db.session.add(obj)
        db.session.commit()

        return jsonify({"message": "Data saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/share', methods=['GET'])
@token_required
def get_share():
    project_id = request.args.get('project_id')

    s = KShares.query.filter_by(project_id=project_id).first()

    if s:
        return jsonify({
            'id': s.id,
            'project_id': s.project_id,
            'uuid': s.uuid,
            'created_at': s.created_at
        }), 200
    else:
        return jsonify({'error': 'Share not found'}), 404


@app.route('/share', methods=['POST'])
@token_required
def set_share():
    try:
        # Extract data from the POST request
        data = request.json
        project_id = data.get('project_id')

        if project_id is None:
            return jsonify({'error': 'project_id is missing'}), 404

        # Create a new KShares object
        s= KShares(project_id=project_id,
                   uuid=str(uuid.uuid4()),
                   created_at=func.now())

        # Add the object to the session and commit to the database
        db.session.add(s)
        db.session.commit()

        return jsonify({
            'id': s.id,
            'project_id': s.project_id,
            'uuid': s.uuid,
            'created_at': s.created_at
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/shared_project', methods=['GET'])
def get_shared_project():
    share_id = request.args.get('share_id')
    if share_id is None:
        return jsonify({'error': 'share_id is missing'}), 404

    s = KShares.query.filter_by(uuid=share_id).first()
    if s is None:
        return jsonify({'error': 'Share not found'}), 404

    project = KProjects.query.get(s.project_id)
    if project is None:
        return jsonify({'error': 'Project not found'}), 404

    project_data = {
        'id': project.id,
        'brand_name': project.brand_name,
        'title': project.title,
        'description': project.description,
        'categories': project.categories,
        'platforms': project.platforms,
        'published_at': project.published_at,
        'created_at': project.created_at
    }

    return jsonify(project_data)


@app.route('/chats', methods=['GET'])
@token_required
def get_chats():
    project_id = request.args.get('project_id')
    brand_id = request.args.get('brand_id')
    creator_id = request.args.get('creator_id')

    chats = KChats.query.filter_by(project_id=project_id, creator_id=creator_id, brand_id=brand_id).order_by(KChats.created_at).all()

    response_data = []
    for c in chats:
        e = {
            'id': c.id,
            'project_id': c.project_id,
            'brand_id': c.brand_id,
            'creator_id': c.creator_id,
            'msg': c.msg,
            'file_id': c.file_id,
            'name': c.name,
            'size': c.size,
            'sender': c.sender,
            'created_at': c.created_at
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/chat', methods=['POST'])
@token_required
def set_chat():

    data = request.json

    file_id = None
    file = b64decode(data.get('file'))
    name = data.get('name')
    size = None

    if file:
        # Create file
        uu = str(uuid.uuid4())
        location = uu[0:2] + "/" + uu[2:4] + "/" + uu[4:6] + "/" + uu 

        # store file in file system
        pathfilename = f'{FILES_DIR}{location}'

        # create directory if not exist 
        os.makedirs(os.path.dirname(pathfilename), exist_ok=True)

        size = len(file)

        # open in binary mode, create if does not exist
        with open(pathfilename, 'wb+') as out_file:
            out_file.write(file)

            f = KFiles(
                name = name,
                location = location,
                size = size, 
                created_at = func.now()
            )
            db.session.add(f)
            db.session.commit()
            file_id = f.id

    project_id = data.get('project_id')
    brand_id = data.get('brand_id')
    creator_id = data.get('creator_id')
    msg = data.get('msg')
    sender = data.get('sender')

    # Create a new KChats object
    obj = KChats(project_id=project_id,
                 brand_id=brand_id,
                 creator_id=creator_id,
                 msg=msg,
                 file_id=file_id,
                 name=name,
                 size=size,
                 sender=sender,
                 created_at=func.now())

    # Add the object to the session and commit to the database
    db.session.add(obj)
    db.session.commit()

    # send notifications to creator
    if sender == 'B':
        creator = KUsers.query.filter(KUsers.id == creator_id).first()
        if creator is not None:
            try:
                messaging.notify(creator.username) 
            except Exception as e:
                logging.info("Error sending notification to " + creator.username)
                logging.info("error", e)
 
    return jsonify({"message": "Data saved successfully"}), 201


@app.route('/chat_brands', methods=['GET'])
@token_required
def get_chat_brands():

    creator_id = request.args.get('creator_id')

    users = (db.session.query(KUsers)
             .join(KChats, KChats.brand_id == KUsers.id)
             .filter(KChats.project_id.is_(None),
                     KChats.creator_id == creator_id,
                     KUsers.user_type == 'B')
             .order_by(KUsers.name)
             .all())

    response_data = []
    for u in users:
        latest_msg = (
            db.session.query(KChats.created_at)
            .filter_by(
                brand_id=u.id,
                creator_id=creator_id,
                project_id=None,
                sender='B'
            )
            .order_by(desc(KChats.created_at))
            .first()
        )

        e = {
            'id': u.id,
            'parent_id': u.parent_id,
            'username': u.username,
            'name': u.name,
            'description': u.description,
            'user_type': u.user_type,
            'categories': u.categories,
            'platforms': u.platforms,
            'profile_picture': b64encode(load_file(u.pic)),
            'cover_image': b64encode(load_file(u.image)),
            'url': u.url,
            'city': u.city,
            'country': u.country,
            'updated_at': u.updated_at,
            'created_at': u.created_at,
            'latest_at': None if latest_msg is None else latest_msg.created_at 
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/chat_creators', methods=['GET'])
@token_required
def get_chat_creators():

    brand_id = request.args.get('brand_id')
    user_type = request.args.get('user_type')

    if brand_id is None or user_type is None:
        return jsonify({"error": "Missing parameters"}), 400

    users = (db.session.query(KUsers)
             .join(KChats, KChats.creator_id == KUsers.id)
             .filter(KChats.project_id.is_(None),
                     KChats.brand_id == brand_id,
                     KUsers.user_type == user_type)
             .order_by(KUsers.name)
             .all())

    response_data = []
    for u in users:
        latest_msg = (
            db.session.query(KChats.created_at)
            .filter_by(
                brand_id=brand_id,
                creator_id=u.id,
                project_id=None,
                sender='C'
            )
            .order_by(desc(KChats.created_at))
            .first()
        )

        e = {
            'id': u.id,
            'parent_id': u.parent_id,
            'username': u.username,
            'name': u.name,
            'description': u.description,
            'user_type': u.user_type,
            'categories': u.categories,
            'platforms': u.platforms,
            'handles': u.handles,
            'profile_picture': b64encode(load_file(u.pic)),
            'cover_image': b64encode(load_file(u.image)),
            'url': u.url,
            'city': u.city,
            'country': u.country,
            'rating': u.rating,
            'reviews': u.reviews,
            'bid_min': u.bid_min,
            'bid_max': u.bid_max,
            'followers': u.followers,
            'updated_at': u.updated_at,
            'created_at': u.created_at,
            'latest_at': None if latest_msg is None else latest_msg.created_at
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/chat_files', methods=['GET'])
@token_required
def get_chat_files():
    project_id = request.args.get('project_id')
    creator_id = request.args.get('creator_id')

    query = KChats.query.filter(KChats.project_id == project_id, KChats.file_id.isnot(None), KChats.sender == 'B')

    if creator_id is not None:
        query = query.filter(KChats.creator_id == creator_id)

    chats = query.order_by(KChats.created_at).all()

    response_data = []
    for c in chats:
        e = {
            'id': c.id,
            'project_id': c.project_id,
            'brand_id': c.brand_id,
            'creator_id': c.creator_id,
            'msg': c.msg,
            'file_id': c.file_id,
            'name': c.name,
            'size': c.size,
            'sender': c.sender,
            'created_at': c.created_at
        }

        response_data.append(e)

    return jsonify(response_data)


# Delete a chat entry, the file entry, and the physical file
@app.route('/chat/<int:id>', methods=['DELETE'])
@token_required
def delete_chat(id):
    f = KChats.query.filter_by(id=id).first()
    if f is not None:
        g = KFiles.query.filter_by(id=f.file_id).first()

        KChats.query.filter_by(id=id).update({"file_id": None})    # break foreign key constraint

        if g is not None:
            h = f'{FILES_DIR}{g.location}'
            if os.path.exists(h):
                os.remove(h)
            db.session.delete(g)

        db.session.delete(f)
        db.session.commit()
        return jsonify({'message': f'Chat with ID {id} deleted successfully'})
    else:
        return jsonify({'message': f'Chat with ID {id} not found'}, 404)


@app.route('/categories', methods=['GET'])
def get_categories():
    cats = KCategories.query.order_by(KCategories.key).all()

    response_data = []
    for c in cats:
        e = {
            'id': c.id,
            'key': c.key,
            'value': c.value
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/platforms', methods=['GET'])
@token_required
def get_platforms():
    plats = KPlatforms.query.order_by(KPlatforms.key).all()

    response_data = []
    for p in plats:
        e = {
            'id': p.id,
            'key': p.key,
            'value': p.value
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/log', methods=['POST'])
def log():
    try:
        # Extract data from the POST request
        data = request.json
        game_id = data.get('game_id')
        object_id = data.get('object_id')
        object_type = data.get('object_type')
        action = data.get('action')
        player_id = data.get('player_id')

        # Create a new KBrpQn object
        obj = KLogs(game_id=game_id,
                    object_id=object_id,
                    object_type=object_type,
                    action=action,
                    player_id=player_id,
                    created_at=func.now())

        # Add the object to the session and commit to the database
        db.session.add(obj)
        db.session.commit()

        return jsonify({"message": "Data saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/download', methods=['GET'])
@token_required
def download():
    file_id = request.args.get('file_id')

    f = KFiles.query.get(file_id)
    if f is not None:
        pathfilename = f'{FILES_DIR}{f.location}'
        return send_file(pathfilename,
                         mimetype='application/octet-stream',
                         as_attachment=True,
                         download_name=f.name)
    else:
        return "File not found", 404


def scale_image(img):
    if img:
        tn = Image.open(io.BytesIO(img))

        tn_height = 100
        tn_width = int(tn_height * float(tn.size[0]) / float(tn.size[1]))
        tn.thumbnail((tn_width, tn_height))

        r = io.BytesIO()
        tn.save(r, format="PNG")
        return r.getvalue()


@app.route('/generate_ideas', methods=['POST'])
@token_required
def generate_ideas():
    # Extract data from the POST request
    data = request.json
    if "brand_id" not in data:
        return jsonify({'error': 'brand_id not found'}), 404

    query = KUsers.query.filter(KUsers.id == data['brand_id'])

    brand_user = query.first()

    if not brand_user:
        return jsonify({'error': 'Brand user not found'}), 404

    creators = []
    users = KUsers.query.filter(KUsers.user_type == 'C', KUsers.user_type == 'S').order_by(KUsers.rating.desc()).all()
    for u in users:
        e = {
            'username': u.username,
            'description': u.description,
            'categories': u.categories,
            'platforms': u.platforms
        }
        creators.append(e)

    lob = { "lines_of_business": brand_user.description }

    prompt = (
        f"{openai_msg.BRAND_NAME_PROMPT}\n"
        f"{brand_user.name}\n"
        f"{openai_msg.LINES_OF_BUSINESS_PROMPT}\n"
        f"{str(lob)}\n"
        f"{openai_msg.INDUSTRY_PROMPT}\n"
        f"{brand_user.industry}\n"
        f"{openai_msg.URL_PROMPT}\n"
        f"{brand_user.url}\n"
        f"{openai_msg.LOCATION_PROMPT}\n"
        f"{brand_user.city}, {brand_user.country}\n"
        f"{openai_msg.PRODUCT_SERVICE_PROMPT}\n"
        f"{data.get('products', 'Any')}\n"
        f"{openai_msg.OBJECTIVE_PROMPT}\n"
        f"{data.get('objective', '')}\n"
        f"{openai_msg.CREATORS_PROMPT}\n"
        f"{str(creators)}\n"
        f"{openai_msg.OUTPUT_PROMPT}\n"
        )

    app.logger.info(f"openai: prompt [{prompt}]")

    start_time = time.time()
    ideas, usage = openai_api.create(openai_msg.SYSTEM_MESSAGE, prompt)
    elapsed_time = time.time() - start_time

    app.logger.info(f"openai: time [{elapsed_time:.2f}s], usage[{usage}], brand_name[{brand_user.name}]")

    app.logger.info(f"openai: ideas [{ideas}]")

    return jsonify({'ideas': ideas}), 200


@app.route('/followers', methods=['GET'])
def get_followers():
    try:
        social_platform = request.args.get('social_platform')    # GET argument
        if social_platform is None:
            return jsonify({"error": "Missing 'social_platform' parameter"}), 400

        handle = request.args.get('handle')    # GET argument
        if handle is None:
            return jsonify({"error": "Missing 'handle' parameter"}), 400

        match social_platform:
            case 'LINKEDIN':
                return linkedin.get_follower_count(handle)
            case 'ROBLOX':
                return roblox.get_follower_count(handle)
            case 'SNAPCHAT':
                if handle[0] == '@':
                    handle = handle[1:]
                return snapchat.get_follower_count(handle)
            case 'TIKTOK':
                if handle[0] == '@':
                    handle = handle[1:]
                return tiktok.get_follower_count(handle)
            case 'TWITCH':
                return twitch.get_follower_count(handle)
            case 'X':
                if handle[0] == '@':
                    handle = handle[1:]
                return x.get_follower_count(handle)
            case 'YOUTUBE':
                return youtube.get_follower_count(handle)
            case _:
                return jsonify(0), 200


    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/invoices', methods=['GET'])
@token_required
def get_invoices():

    brand_id = request.args.get('brand_id')
    state = request.args.get('state')

    query = KInvoices.query

    # search for all brands when None
    if brand_id is not None:
        query = query.filter(KInvoices.brand_id == brand_id)

    # search for all states when None
    if state is not None:
        query = query.filter(KInvoices.state == state)

    invoices = query.order_by(KInvoices.created_at).all()

    response_data = []
    for i in invoices:
        e = {
            'id': i.id,
            'brand_id': i.brand_id,
            'project_id': i.project_id,
            'title': i.title,
            'amount': i.amount,
            'state': i.state,
            'due_at': i.due_at,
            'created_at': i.created_at
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/invoice', methods=['POST'])
@token_required
def set_invoice():

    # Extract data from the POST request
    data = request.json
    if "id" in data:
        # update current invoice
        invoice = KInvoices.query.get(data['id'])
        if invoice is None:
            return jsonify({'error': 'Invoice not found'}), 404

        # brand_id can not be changed
        # project_id can not be changed
        # title can not be changed
        # amount can not be changed

        set_field(invoice, 'state', data)

        # due_at can not be changed
        # created_at can not be changed

        db.session.commit()

        return jsonify({'message': 'Invoice updated successfully'})


@app.route('/transactions', methods=['GET'])
@token_required
def get_transactions():
    user_id = request.args.get('user_id')

    query = KTransactions.query

    # search for all users when None
    if user_id is not None:
        query = query.filter(KTransactions.user_id == user_id)

    transactions = query.order_by(KTransactions.created_at.desc()).all()

    response_data = []
    for p in transactions:
        e = {
            'id': p.id,
            'user_id': p.user_id,
            'invoice_id': p.invoice_id,
            'title': p.title,
            'amount': p.amount,
            'reference': p.reference,
            'capture': p.capture,
            'state': p.state,
            'created_at': p.created_at
        }

        response_data.append(e)

    return jsonify(response_data)


@app.route('/transaction', methods=['POST'])
@token_required
def set_transaction():
    # Extract data from the POST request
    data = request.json

    new_transaction = KTransactions(
        user_id = data.get('user_id'),
        invoice_id = data.get('invoice_id'),
        title = data.get('title'),
        amount = data.get('amount'),
        reference = data.get('reference'),
        capture = data.get('capture'),
        state = data.get('state', 'T'),
        created_at = func.now()
    )
    db.session.add(new_transaction)
    db.session.commit()

    return jsonify({'id': new_transaction.id}), 201


def get_paypal_access_token():
    response = requests.post(PAYPAL_TOKEN_URL,
                             auth=PAYPAL_AUTH,
                             data={"grant_type": "client_credentials"})
    access_token = response.json()["access_token"]
    return access_token


@app.route('/paypal_process', methods=['POST'])
@token_required
def paypal_process():
    data = request.json

    amount = data.get('amount')
    if not amount:
        return jsonify({'error': 'Missing paypal amount'}), 404

    url = data.get('url')
    if not url:
        return jsonify({'error': 'Missing url'}), 404

    access_token = get_paypal_access_token()

    headers={"Authorization": f"Bearer {access_token}",
             "Content-Type": "application/json"}

    data = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {
                "currency_code": "GBP",
                "value": amount
            }
        }],
        "application_context": {
            "cancel_url": url,
            "return_url": url
        }
    }

    response = requests.post(PAYPAL_ORDERS_URL, headers=headers, json=data)

    return jsonify(response.json())


@app.route('/paypal_capture', methods=['POST'])
@token_required
def paypal_capture():
    data = request.json

    token = data.get('token')
    payer_id = data.get('payerID')

    if not token:
        return jsonify({'error': 'Missing paypal token'}), 404

    if not payer_id:
        return jsonify({'error': 'Missing paypal payer_id'}), 404

    access_token = get_paypal_access_token()

    headers={"Authorization": f"Bearer {access_token}",
             "Content-Type": "application/json"}

    data = {'payer_id': payer_id}

    capture_url = f'{PAYPAL_ORDERS_URL}/{token}/capture'
    response = requests.post(capture_url, headers=headers, json=data)

    return jsonify(response.json())


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

