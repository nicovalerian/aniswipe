import os
from flask import Flask, jsonify, request # Add request later
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Import models AFTER db is defined
from models import db, User, Anime, UserAnimeEntry # Make sure models.py is in the same directory or importable

app = Flask(__name__)

# --- Configurations ---
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'a_default_secret_key_for_dev') # Use env var or default
# Configure database - use SQLite for simplicity
db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'app.db')
db_folder = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
os.makedirs(db_folder, exist_ok=True) # Ensure instance folder exists
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Extensions Initialization ---
db.init_app(app)
Migrate(app, db)
CORS(app) # Allow all origins for simplicity in dev, can restrict later

# --- Simple Routes (Start Here) ---
@app.route('/')
def hello():
    return "Hello from AniSwipe Backend!"

# Example: Get all users (for simple selection in frontend)
@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        return jsonify([{'id': user.id, 'email': user.email} for user in users])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Example: Create a user (simple POST)
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({"error": "Email is required"}), 400

    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 409

    # password = data.get('password') # Get password if provided, store plain (!! Not Secure !!)
    new_user = User(email=data['email']) # Add password=password if using
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'id': new_user.id, 'email': new_user.email}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route('/api/dev/reset_users', methods=['POST'])
def reset_users_dev_only():
    # WARNING: Development only! Do not expose in production!
    if app.config['DEBUG']: # Only allow in debug mode
        try:
            num_deleted = db.session.query(User).delete()
            db.session.commit()
            # You might want to delete related UserAnimeEntry too, or rely on cascade delete if set up
            # num_entries_deleted = db.session.query(UserAnimeEntry).delete()
            # db.session.commit()
            return jsonify({"message": f"Deleted {num_deleted} users."}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Endpoint only available in debug mode"}), 403

# --- Run the App (for local development) ---
if __name__ == '__main__':
    # Make sure the database tables are created if they don't exist
    with app.app_context():
        db.create_all() # Better to use migrations, but okay for initial setup
    app.run(debug=True) # Debug=True enables auto-reload