from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # password = db.Column(db.String(80), nullable=True) # Store plain text - !! Not secure !!
    profile_pic_filename = db.Column(db.String(100), nullable=True)
    favorite_anime_id = db.Column(db.Integer, db.ForeignKey('anime.id'), nullable=True) # Link to Anime table later

    # Relationship to user's list entries
    anime_entries = db.relationship('UserAnimeEntry', backref='user', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.email}>'

class Anime(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mal_id = db.Column(db.Integer, unique=True, nullable=False)
    title = db.Column(db.String(250), nullable=False)
    # Add more fields later if caching (image_url, genres_str, etc.)

    # Relationship back to User (for favorite) - optional but can be useful
    favorited_by_users = db.relationship('User', backref='favorite_anime', lazy=True)

    def __repr__(self):
        return f'<Anime {self.mal_id}: {self.title}>'

class UserAnimeEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    anime_id = db.Column(db.Integer, db.ForeignKey('anime.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False) # e.g., 'Watching', 'Completed', 'Plan to Watch', 'Dropped'
    score = db.Column(db.Integer, nullable=True) # 1-10

    # Ensure a user can only have one entry per anime
    __table_args__ = (db.UniqueConstraint('user_id', 'anime_id', name='_user_anime_uc'),)

    # Relationship back to Anime (optional but can be useful)
    anime = db.relationship('Anime', backref='user_entries')

    def __repr__(self):
        return f'<UserAnimeEntry UserID:{self.user_id} AnimeID:{self.anime_id} Status:{self.status}>'