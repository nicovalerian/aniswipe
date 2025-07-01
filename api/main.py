from dotenv import load_dotenv
load_dotenv()

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import requests
import time
import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import lru_cache

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - [%(funcName)s] - %(message)s')

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="http://localhost:3000", supports_credentials=True)

# --- Configuration Constants ---
MAL_CLIENT_ID = os.environ.get('NEXT_PUBLIC_MAL_CLIENT_ID')
MAL_API_BASE_URL = os.environ.get('NEXT_PUBLIC_MAL_API_BASE_URL')

# Global variables for the model
df_processed = None
tfidf_matrix = None
indices = None
# --- Caching ---
# Using functools.lru_cache for efficient, in-memory caching of API responses.
# This will store up to 500 recent anime detail lookups.
@lru_cache(maxsize=500)
def fetch_anime_details_from_jikan(mal_id):
    """Fetches details for a single anime from the Jikan API with caching."""
    url = f"https://api.jikan.moe/v4/anime/{mal_id}"
    try:
        # Adding a small delay to respect the API's rate limits.
        time.sleep(0.5)
        start_time = time.time()
        logging.info(f"Fetching details for anime_id: {mal_id} (cache miss)")
        response = requests.get(url)
        response.raise_for_status()
        duration = time.time() - start_time
        logging.info(f"Successfully fetched details for anime_id: {mal_id} in {duration:.2f} seconds.")
        return response.json().get('data')
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching Jikan data for MAL ID {mal_id}: {e}")
        return None

def load_and_preprocess_data():
    """Loads the dataset and prepares the TF-IDF matrix and indices."""
    global df_processed, tfidf_matrix, indices

    logging.info("Starting data loading and preprocessing...")
    start_time = time.time()

    # --- Step 1: Loading ---
    script_dir = os.path.dirname(__file__)
    csv_path = os.path.join(script_dir, 'top_anime_dataset.csv')
    df_anime = pd.read_csv(csv_path)
    logging.info(f"Dataset loaded successfully with {df_anime.shape[0]} rows.")

    # --- Step 2: Early Filtering ---
    df_anime = df_anime[df_anime['rating'] != 'Rx - Hentai']
    df_anime = df_anime[df_anime['rating'] != 'R+ - Mild Nudity']
    logging.info(f"Filtered out sensitive content. Dataset now contains {df_anime.shape[0]} entries.")

    # --- Applying Column Selections ---
    columns_to_drop = ['rank', 'scored_by', 'popularity']
    df_processed = df_anime.drop(columns=columns_to_drop)
    logging.info(f"Dropped columns: {', '.join(columns_to_drop)}")

    # --- Feature Engineering ---
    desired_cols = ['genres', 'synopsis', 'producers', 'studios', 'type', 'source', 'english_name']
    found_cols = []
    for col in desired_cols:
        if col in df_processed.columns:
            df_processed[col] = df_processed[col].fillna('')
            found_cols.append(col)

    df_processed['content'] = df_processed[found_cols].apply(lambda row: ' '.join(row.astype(str).str.replace(',', ' ')), axis=1)
    logging.info(f"Engineered 'content' feature using: {', '.join(found_cols)}")

    # --- Vectorization (TF-IDF) ---
    tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=10000, ngram_range=(1, 2))
    tfidf_matrix = tfidf_vectorizer.fit_transform(df_processed['content'])
    logging.info(f"Vectorized {tfidf_matrix.shape[0]} anime entries into a matrix with {tfidf_matrix.shape[1]} features.")

    # --- Index Mapping ---
    indices = pd.Series(df_processed.index, index=df_processed['anime_id']).drop_duplicates()
    duration = time.time() - start_time
    logging.info(f"✅ Knowledge Base successfully built in {duration:.2f} seconds.")

def get_user_anime_list_official(username, client_id):
    """Fetches the full anime list for a given MAL user from the official v2 API."""
    url = f"{MAL_API_BASE_URL}/users/{username}/animelist"
    headers = {'X-MAL-CLIENT-ID': client_id}
    user_anime_list = []
    params = {'fields': 'list_status', 'limit': 1000, 'nsfw': 'false'}

    logging.info(f"Fetching anime list for user '{username}' from the official MAL API...")
    while url:
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            for item in data.get('data', []):
                list_status = item.get('list_status', {})
                if list_status.get('score', 0) > 0:
                    user_anime_list.append({
                        'mal_id': item.get('node', {}).get('id'),
                        'score': list_status.get('score')
                    })
            url = data.get('paging', {}).get('next')
            params = {}
            if url:
                logging.info("Fetching next page of user's list...")
                time.sleep(0.5)
        except requests.exceptions.HTTPError as e:
            logging.error(f"Error fetching data: User '{username}' may not exist or has a private list. (HTTP {e.response.status_code})")
            return []
        except Exception as e:
            logging.error(f"An unexpected error occurred: {e}")
            return []
    logging.info(f"Successfully fetched {len(user_anime_list)} scored anime for '{username}'.")
    return user_anime_list

def create_user_profile(user_anime_list, tfidf_matrix, indices, df_processed):
    """Creates a user's 'taste profile' vector."""
    logging.info("Creating user taste profile...")
    valid_user_anime = [item for item in user_anime_list if item['mal_id'] in indices]
    if not valid_user_anime:
        logging.warning("No anime from the user's list were found in the knowledge base.")
        return None, set()

    logging.info(f"Found {len(valid_user_anime)} anime from the user's list in our knowledge base.")
    watched_anime_ids = {item['mal_id'] for item in valid_user_anime}
    profile_vector = np.zeros(tfidf_matrix.shape[1])
    total_weight = 0
    for item in valid_user_anime:
        mal_id = item['mal_id']
        user_score = item['score']
        idx = indices[mal_id]
        members_count = df_processed.loc[idx, 'members']
        weight = user_score * np.log1p(members_count)
        if user_score <= 5:
            weight *= -0.5
        profile_vector += tfidf_matrix[idx].toarray().flatten() * weight
        total_weight += abs(weight)
    if total_weight > 0:
        profile_vector /= total_weight
    else:
        return None, set()
    return profile_vector, watched_anime_ids

def generate_recommendations_logic(username):
    """The main orchestrator function to generate recommendations."""
    logging.info(f"Starting recommendation generation for user: {username}")
    start_time = time.time()

    if MAL_CLIENT_ID is None:
        logging.error("MAL_CLIENT_ID is not set in environment variables.")
        return "MAL_CLIENT_ID is not set in environment variables.", []

    user_list = get_user_anime_list_official(username, MAL_CLIENT_ID)
    if not user_list:
        logging.warning(f"Could not fetch anime list for '{username}'.")
        return f"Could not fetch anime list for '{username}'. The user may not exist or has a private list.", []

    user_profile, watched_ids = create_user_profile(user_list, tfidf_matrix, indices, df_processed)
    if user_profile is None:
        logging.warning("Could not create a taste profile.")
        return "Could not create a taste profile. The user may have only watched anime not present in our knowledge base.", []

    sim_start_time = time.time()
    cosine_similarities = cosine_similarity(user_profile.reshape(1, -1), tfidf_matrix)
    logging.info(f"Calculated cosine similarity in {time.time() - sim_start_time:.2f} seconds.")
    sim_scores = list(enumerate(cosine_similarities[0]))

    potential_recommendations = []
    for i, score in sim_scores:
        anime_id = df_processed['anime_id'].iloc[i]
        if anime_id not in watched_ids:
            potential_recommendations.append({'index': i, 'anime_id': anime_id, 'similarity': score})

    if not potential_recommendations:
        logging.info("No new recommendations found after filtering watched anime.")
        return "No new recommendations found based on your list.", []

    # Log top 10 recommendations based on similarity before re-ranking
    top_sim_recs = sorted(potential_recommendations, key=lambda x: x['similarity'], reverse=True)[:10]
    logging.info(f"Top 10 recommendations by similarity (pre-reranking): {[rec['anime_id'] for rec in top_sim_recs]}")

    recs_df = pd.DataFrame(potential_recommendations)
    numerical_features_df = df_processed.iloc[recs_df['index']][['anime_id', 'score', 'members']].copy()
    recs_with_features = pd.merge(recs_df, numerical_features_df, on='anime_id')

    recs_with_features['rerank_score'] = (
        recs_with_features['similarity'] *
        (recs_with_features['score'] + 1) *
        np.log1p(recs_with_features['members'])
    )
    recs_with_features = recs_with_features.sort_values(by='rerank_score', ascending=False)
    
    # Log top 10 recommendations after re-ranking
    top_reranked_recs = recs_with_features.head(10)
    logging.info("Top 10 recommendations after re-ranking (anime_id: rerank_score):")
    for _, row in top_reranked_recs.iterrows():
        logging.info(f"  - {row['anime_id']}: {row['rerank_score']:.4f}")

    top_n_recommendation_ids = recs_with_features['anime_id'].head(50).tolist()

    total_duration = time.time() - start_time
    logging.info(f"Successfully generated {len(top_n_recommendation_ids)} recommendation IDs in {total_duration:.2f} seconds.")
    return "Recommendation IDs generated successfully.", top_n_recommendation_ids

@app.route('/recommend', methods=['POST'])
def recommend_anime():
    """API endpoint to get anime recommendations."""
    data = request.get_json()
    username = data.get('username')
    if not username:
        return jsonify({"error": "Username is required"}), 400

    message, recommendations = generate_recommendations_logic(username)
    if recommendations:
        return jsonify({"message": message, "recommendation_ids": recommendations}), 200
    else:
        return jsonify({"message": message, "recommendation_ids": []}), 500

if __name__ == '__main__':
    load_and_preprocess_data()
    app.run(host='0.0.0.0', port=5000, debug=True)