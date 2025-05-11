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
from models import db, User, Anime, UserAnimeEntry # Assuming models.py is correct

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
    if not query_string:
        return []
    search_url = f"{JIKAN_API_BASE_URL}/anime"
    params = {'q': query_string, 'limit': 15, 'sfw': 'true'} # Your fix applied
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
                    'image_url': image_url,
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
def hello():
    return "Hello from AniSwipe Backend!"

@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        return jsonify([{'id': user.id, 'email': user.email} for user in users])
    except Exception as e:
        print(f"Error in /api/users GET: {e}")
        return jsonify({"error": "Failed to fetch users"}), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({"error": "Email is required"}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 409
    new_user = User(email=data['email'])
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'id': new_user.id, 'email': new_user.email}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in /api/users POST: {e}")
        return jsonify({"error": "Failed to create user"}), 500

@app.route('/api/dev/reset_users', methods=['POST'])
def reset_users_dev_only():
    if app.config['DEBUG']:
        try:
            UserAnimeEntry.query.delete()
            User.query.delete()
            db.session.commit()
            return jsonify({"message": "All users and their list entries have been reset."}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Endpoint only available in debug mode"}), 403

@app.route('/api/anime/search', methods=['GET'])
def anime_search_route():
    query = request.args.get('query', None)
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    if len(query.strip()) < 3:
        print(f"Query '{query}' too short, returning empty results.")
        return jsonify([]), 200
    results = search_jikan_anime(query)
    return jsonify(results)

@app.route('/api/users/<int:user_id>/list', methods=['POST'])
def add_anime_to_list(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = request.get_json()
    if not data: return jsonify({"error": "Request body is missing"}), 400
    mal_id, title, status, score = data.get('mal_id'), data.get('title'), data.get('status'), data.get('score', None)
    if not all([mal_id, title, status]): return jsonify({"error": "Missing required fields: mal_id, title, status"}), 400
    valid_statuses = ["Plan to Watch", "Watching", "Completed", "On Hold", "Dropped"]
    if status not in valid_statuses: return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
    if score is not None:
        try:
            score = int(score)
            if not (0 <= score <= 10): raise ValueError()
        except ValueError: return jsonify({"error": "Score must be an integer between 0 and 10, or null"}), 400
    
    anime = Anime.query.filter_by(mal_id=mal_id).first()
    if not anime:
        anime = Anime(mal_id=mal_id, title=title)
        # If you were caching image_url from search results, you'd fetch it here or expect it in payload
        # anime.image_url = data.get('image_url')
        db.session.add(anime)
        try:
            db.session.commit() # Commit to get anime.id
        except Exception as e:
            db.session.rollback(); print(f"Error saving new anime: {str(e)}"); return jsonify({"error": f"Could not save new anime: {str(e)}"}), 500
    
    existing_entry = UserAnimeEntry.query.filter_by(user_id=user.id, anime_id=anime.id).first()
    if existing_entry:
        existing_entry.status, existing_entry.score, message = status, score, "Anime entry updated successfully"
    else:
        new_entry = UserAnimeEntry(user_id=user.id, anime_id=anime.id, status=status, score=score)
        db.session.add(new_entry); message = "Anime added to list successfully"
    try:
        db.session.commit()
        entry_data = {"user_id": user.id, "anime_id": anime.id, "mal_id": anime.mal_id, "title": anime.title, "status": status, "score": score}
        return jsonify({"message": message, "entry": entry_data}), 200 if existing_entry else 201
    except IntegrityError: db.session.rollback(); return jsonify({"error": "This anime is already on your list."}), 409
    except Exception as e: db.session.rollback(); print(f"Error adding/updating: {str(e)}"); return jsonify({"error": f"Could not add/update: {str(e)}"}), 500

# --- NEW: Get User's Anime List ---
@app.route('/api/users/<int:user_id>/list', methods=['GET'])
def get_user_anime_list(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        entries = db.session.query(
                UserAnimeEntry.id.label('entry_id'), # ID of the UserAnimeEntry itself
                UserAnimeEntry.status,
                UserAnimeEntry.score,
                Anime.mal_id,
                Anime.title
                # We need Anime.image_url. We'll assume it was populated from Jikan search or MAL import.
                # If not, we'd need to fetch it here or store it when adding.
                # For now, let's assume Anime table might not have image_url.
                # We can add a placeholder or decide to fetch it if missing.
            ).join(Anime, UserAnimeEntry.anime_id == Anime.id)\
            .filter(UserAnimeEntry.user_id == user_id)\
            .order_by(Anime.title)\
            .all()

        # Convert SQLAlchemy Row objects to dictionaries
        user_list = []
        for entry in entries:
            # We need the image_url for display. If it's not in your Anime table,
            # you'd typically fetch it from Jikan here by anime.mal_id for each item.
            # This can be slow. For now, let's simulate having it or use a placeholder.
            # This is a good place to optimize later (e.g., store image_url when adding anime).
            anime_details_from_jikan = search_jikan_anime(entry.title) # This will search by title again
            image_url_to_use = None
            if anime_details_from_jikan and anime_details_from_jikan[0]['mal_id'] == entry.mal_id:
                 image_url_to_use = anime_details_from_jikan[0]['image_url']


            user_list.append({
                "entry_id": entry.entry_id,
                "mal_id": entry.mal_id,
                "title": entry.title,
                "status": entry.status,
                "score": entry.score,
                "image_url": image_url_to_use # You'll need to populate this
            })
        
        return jsonify(user_list)
    except Exception as e:
        print(f"Error fetching user list for user_id {user_id}: {e}")
        return jsonify({"error": "Failed to fetch user anime list"}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)