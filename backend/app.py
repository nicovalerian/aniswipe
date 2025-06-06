import os
import time
import requests
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy.exc import IntegrityError

load_dotenv()
from models import db, User, Anime, UserAnimeEntry

app = Flask(__name__)

# --- Configurations ---
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'a_default_secret_key_for_dev')
db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'app.db')
db_folder = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
os.makedirs(db_folder, exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Extensions Initialization ---
db.init_app(app)
Migrate(app, db)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# --- Jikan API Configuration ---
JIKAN_API_BASE_URL = "https://api.jikan.moe/v4"
JIKAN_REQUEST_DELAY = 1

# --- Jikan Helper Function ---
def search_jikan_anime(query_string):
    if not query_string: return []
    search_url = f"{JIKAN_API_BASE_URL}/anime"
    params = {'q': query_string, 'limit': 15, 'sfw': 'true'}
    print(f"Searching Jikan API for: {query_string} with params: {params}")
    time.sleep(JIKAN_REQUEST_DELAY)
    try:
        response = requests.get(search_url, params=params)
        response.raise_for_status()
        data = response.json()
        results = []
        if 'data' in data:
            for item in data['data']:
                image_url = None
                if item.get('images') and item['images'].get('jpg') and item['images']['jpg'].get('image_url'):
                    image_url = item['images']['jpg']['image_url']
                results.append({
                    'mal_id': item.get('mal_id'),
                    'title': item.get('title'),
                    'image_url': image_url, # This is what the frontend search gets
                    'synopsis': item.get('synopsis', '')[:200] + '...' if item.get('synopsis') else 'No synopsis available.'
                })
        return results
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from Jikan API: {e}. URL: {response.url if 'response' in locals() else search_url}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred during Jikan search: {e}")
        return []

# --- Routes ---
@app.route('/')
def hello(): return "Hello from AniSwipe Backend!"

@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        return jsonify([{'id': user.id, 'email': user.email, 'username': user.username} for user in users]) # Return username in response
    except Exception as e: print(f"Error in /api/users GET: {e}"); return jsonify({"error": "Failed to fetch users"}), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data or 'email' not in data: return jsonify({"error": "Email is required"}), 400
    if not data or 'username' not in data: return jsonify({"error": "Username is required"}), 400 # Adding username check
    if User.query.filter_by(email=data['email']).first(): return jsonify({"error": "Email already exists"}), 409
    if User.query.filter_by(username=data['username']).first(): return jsonify({"error": "Username already exists"}), 409 # Check for existing username
    new_user = User(email=data['email'], username=data['username']) # Pass username to User constructor
    try:
        db.session.add(new_user); db.session.commit()
        return jsonify({'id': new_user.id, 'email': new_user.email, 'username': new_user.username}), 201 # Return username in response
    except Exception as e: db.session.rollback(); print(f"Error in /api/users POST: {e}"); return jsonify({"error": "Failed to create user"}), 500

@app.route('/api/dev/reset_users', methods=['POST'])
def reset_users_dev_only():
    if app.config['DEBUG']:
        try:
            UserAnimeEntry.query.delete(); User.query.delete(); db.session.commit()
            return jsonify({"message": "All users and their list entries have been reset."}), 200
        except Exception as e: db.session.rollback(); return jsonify({"error": str(e)}), 500
    else: return jsonify({"error": "Endpoint only available in debug mode"}), 403

@app.route('/api/anime/search', methods=['GET'])
def anime_search_route():
    query = request.args.get('query', None)
    if not query: return jsonify({"error": "Query parameter is required"}), 400
    if len(query.strip()) < 3: print(f"Query '{query}' too short, returning empty results."); return jsonify([]), 200
    results = search_jikan_anime(query)
    return jsonify(results)

@app.route('/api/users/<int:user_id>/list', methods=['POST'])
def add_anime_to_list(user_id):
    user = User.query.get(user_id)
    if not user: return jsonify({"error": "User not found"}), 404
    data = request.get_json()
    if not data: return jsonify({"error": "Request body is missing"}), 400
    
    mal_id = data.get('mal_id')
    title = data.get('title')
    image_url_from_payload = data.get('image_url') # Get image_url from payload
    status = data.get('status')
    score = data.get('score', None)

    if not all([mal_id, title, status]): return jsonify({"error": "Missing required fields: mal_id, title, status"}), 400
    valid_statuses = ["Plan to Watch", "Watching", "Completed", "On Hold", "Dropped"]
    if status not in valid_statuses: return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
    if score is not None:
        try:
            score = int(score);
            if not (0 <= score <= 10): raise ValueError()
        except ValueError: return jsonify({"error": "Score must be an integer between 0 and 10, or null"}), 400
    
    anime = Anime.query.filter_by(mal_id=mal_id).first()
    if not anime:
        # If anime doesn't exist, create it WITH the image_url
        anime = Anime(mal_id=mal_id, title=title, image_url=image_url_from_payload)
        db.session.add(anime)
        try: db.session.commit()
        except Exception as e: db.session.rollback(); print(f"Error saving new anime: {str(e)}"); return jsonify({"error": f"Could not save new anime: {str(e)}"}), 500
    elif anime.image_url is None and image_url_from_payload:
        # If anime exists but doesn't have an image_url, update it
        anime.image_url = image_url_from_payload
        # No need to db.session.add(anime) again if it's already tracked
        # Commit will happen with the UserAnimeEntry or separately if needed

    existing_entry = UserAnimeEntry.query.filter_by(user_id=user.id, anime_id=anime.id).first()
    if existing_entry:
        existing_entry.status, existing_entry.score, message = status, score, "Anime entry updated successfully"
    else:
        new_entry = UserAnimeEntry(user_id=user.id, anime_id=anime.id, status=status, score=score)
        db.session.add(new_entry); message = "Anime added to list successfully"
    try:
        db.session.commit()
        entry_data = {"user_id": user.id, "anime_id": anime.id, "mal_id": anime.mal_id, "title": anime.title, "status": status, "score": score, "image_url": anime.image_url}
        return jsonify({"message": message, "entry": entry_data}), 200 if existing_entry else 201
    except IntegrityError: db.session.rollback(); return jsonify({"error": "This anime is already on your list."}), 409
    except Exception as e: db.session.rollback(); print(f"Error adding/updating: {str(e)}"); return jsonify({"error": f"Could not add/update: {str(e)}"}), 500

@app.route('/api/users/<int:user_id>/list', methods=['GET'])
def get_user_anime_list(user_id):
    user = User.query.get(user_id)
    if not user: return jsonify({"error": "User not found"}), 404
    try:
        entries = db.session.query(
                UserAnimeEntry.id.label('entry_id'),
                UserAnimeEntry.status,
                UserAnimeEntry.score,
                Anime.mal_id,
                Anime.title,
                Anime.image_url # <-- NOW QUERYING THE STORED image_url
            ).join(Anime, UserAnimeEntry.anime_id == Anime.id)\
            .filter(UserAnimeEntry.user_id == user_id)\
            .order_by(Anime.title)\
            .all()
        
        user_list = [
            {
                "entry_id": entry.entry_id, "mal_id": entry.mal_id, "title": entry.title,
                "status": entry.status, "score": entry.score, "image_url": entry.image_url
            } for entry in entries
        ]
        return jsonify(user_list)
    except Exception as e:
        print(f"Error fetching user list for user_id {user_id}: {e}")
        return jsonify({"error": "Failed to fetch user anime list"}), 500
    
@app.route('/api/users/<int:user_id>/list/<int:entry_id>', methods=['DELETE'])
def remove_anime_from_list(user_id, entry_id):
    try:
        entry = UserAnimeEntry.query.filter_by(id=entry_id, user_id=user_id).first()
        if not entry:
            return jsonify({"error": "Entry not found"}), 404
        
        db.session.delete(entry)
        db.session.commit()
        return jsonify({"message": "Anime removed from list"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<int:user_id>/list/<int:entry_id>', methods=['PATCH'])
def update_anime_score(user_id, entry_id):
    data = request.get_json()   
    print(data)
    if not data or 'score' not in data:
        return jsonify({"error": "Score is required"}), 400
    
    try:
        if data['score'] is None:
            score = 0
        else:
            score = int(data['score'])
        if not (0 <= score <= 10):
            return jsonify({"error": "Score must be between 0 and 10"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Score must be an integer"}), 400

    
    try:
        entry = UserAnimeEntry.query.filter_by(id=entry_id, user_id=user_id).first()
        if not entry:
            return jsonify({"error": "Entry not found"}), 404
        
        entry.score = score
        db.session.commit()
        return jsonify({
            "message": "Score updated",
            "entry": {
                "entry_id": entry.id,
                "score": entry.score
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    with app.app_context(): db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)