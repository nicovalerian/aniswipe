from dotenv import load_dotenv
load_dotenv()

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import requests
import time
from collections import Counter
import re
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Configuration Constants ---
# IMPORTANT: In a real production SaaS, store this securely (e.g., as an environment variable),
# not hardcoded in the source code.
MAL_CLIENT_ID = os.environ.get('NEXT_PUBLIC_MAL_CLIENT_ID')
MAL_API_BASE_URL = os.environ.get('NEXT_PUBLIC_MAL_API_BASE_URL', 'https://api.myanimelist.net/v2')

def fetch_anime_details_from_jikan(mal_id):
    """Fetches details for a single anime from the Jikan API."""
    url = f"https://api.jikan.moe/v4/anime/{mal_id}"
    try:
        # Add a small delay to avoid hitting rate limits too hard
        time.sleep(1)
        response = requests.get(url)
        response.raise_for_status()
        return response.json().get('data')
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Jikan data for MAL ID {mal_id}: {e}")
        return None

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Configuration Constants ---
# IMPORTANT: In a real production SaaS, store this securely (e.g., as an environment variable),
# not hardcoded in the source code.
MAL_CLIENT_ID = os.environ.get('NEXT_PUBLIC_MAL_CLIENT_ID')
MAL_API_BASE_URL = os.environ.get('NEXT_PUBLIC_MAL_API_BASE_URL', 'https://api.myanimelist.net/v2')

# Global variables for the model
df_processed = None
tfidf_matrix = None
indices = None

def load_and_preprocess_data():
    global df_processed, tfidf_matrix, indices

    # --- Step 1: Loading ---
    script_dir = os.path.dirname(__file__)
    csv_path = os.path.join(script_dir, 'top_anime_dataset.csv')
    df_anime = pd.read_csv(csv_path)
    print("Dataset loaded successfully!")

    # --- Step 2: Early Filtering ---
    df_anime = df_anime[df_anime['rating'] != 'Rx - Hentai']
    df_anime = df_anime[df_anime['rating'] != 'R+ - Mild Nudity']
    print(f"Filtered out 'Rx - Hentai' and 'R+ - Mild Nudity'. Dataset now contains {df_anime.shape[0]} entries.")

    # --- Applying Column Selections ---
    columns_to_drop = ['rank', 'scored_by', 'popularity']
    df_processed = df_anime.drop(columns=columns_to_drop)
    print(f"Dropped columns: {', '.join(columns_to_drop)}")

    # --- Feature Engineering (Creating the 'content' string - Updated) ---
    desired_cols_updated = ['genres', 'synopsis', 'producers', 'studios', 'type', 'source', 'english_name']
    found_cols_updated = []

    for col in desired_cols_updated:
        if col in df_processed.columns:
            df_processed[col] = df_processed[col].fillna('')
            found_cols_updated.append(col)

    df_processed['content'] = df_processed[found_cols_updated].apply(lambda row: ' '.join(row.astype(str).str.replace(',', ' ')), axis=1)
    print(f"Engineered 'content' feature using: {', '.join(found_cols_updated)}")

    # --- Vectorization (TF-IDF) ---
    tfidf_updated = TfidfVectorizer(stop_words='english', max_features=10000, ngram_range=(1, 2))
    tfidf_matrix = tfidf_updated.fit_transform(df_processed['content'])
    print(f"Vectorized {tfidf_matrix.shape[0]} anime entries into a matrix with {tfidf_matrix.shape[1]} features.")

    # --- Index Mapping ---
    indices = pd.Series(df_processed.index, index=df_processed['anime_id']).drop_duplicates()
    print(f"✅ Knowledge Base successfully built.")

def get_user_anime_list_official(username, client_id):
    """
    Fetches the full anime list for a given MAL user from the official v2 API.
    It handles pagination to retrieve all entries the user has rated.
    """
    url = f"{MAL_API_BASE_URL}/users/{username}/animelist"
    headers = {'X-MAL-CLIENT-ID': client_id}
    user_anime_list = []

    # API parameters: we request the list_status field to get scores and set a high limit.
    # 'nsfw=false' is included.
    params = {'fields': 'list_status', 'limit': 1000, 'nsfw': 'false'}

    print(f"Fetching anime list for user '{username}' from the official MAL API...")

    while url:
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()  # Raises an error for bad status codes (4xx or 5xx)
            data = response.json()

            # Process each anime in the current page of results
            for item in data.get('data', []):
                list_status = item.get('list_status', {})
                # We only consider anime the user has actually scored
                if list_status.get('score', 0) > 0:
                    user_anime_list.append({
                        'mal_id': item.get('node', {}).get('id'),
                        'score': list_status.get('score')
                    })

            # Get the URL for the next page, or None if it's the last page
            url = data.get('paging', {}).get('next')
            params = {} # Subsequent requests using the 'next' URL don't need params

            if url:
                print(f"Fetching next page...")
                time.sleep(0.5) # Be respectful to the API by adding a small delay

        except requests.exceptions.HTTPError as e:
            print(f"Error fetching data: User '{username}' may not exist or has a private list. (HTTP {e.response.status_code})")
            return [] # Return an empty list on error
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return []

    print(f"Successfully fetched {len(user_anime_list)} scored anime for '{username}'.")
    return user_anime_list

def create_user_profile(user_anime_list, tfidf_matrix, indices, df_processed):
    valid_user_anime = [item for item in user_anime_list if item['mal_id'] in indices]
    if not valid_user_anime:
        return None, set()

    watched_anime_ids = {item['mal_id'] for item in valid_user_anime}
    profile_vector = np.zeros(tfidf_matrix.shape[1])
    total_weight = 0

    for item in valid_user_anime:
        mal_id = item['mal_id']
        user_score = item['score']
        idx = indices[mal_id]
        members_count = df_processed[df_processed['anime_id'] == mal_id]['members'].iloc[0]
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

def create_user_profile(user_anime_list, tfidf_matrix, indices, df_processed):
    """
    Creates a user's 'taste profile' vector.
    This is a weighted average of the TF-IDF vectors of anime they have rated,
    weighted by both score and the number of members for the anime.
    Includes a simple penalty for low scores.
    """
    # Filter the user's list to only include anime that exist in our knowledge base
    valid_user_anime = [item for item in user_anime_list if item['mal_id'] in indices]
    if not valid_user_anime:
        return None, set()

    # Get the set of anime IDs the user has already seen to filter them out later
    watched_anime_ids = {item['mal_id'] for item in valid_user_anime}

    # Create a vector initialized to zeros that matches the width of our TF-IDF matrix
    profile_vector = np.zeros(tfidf_matrix.shape[1])

    # Calculate the weighted sum of vectors
    total_weight = 0
    for item in valid_user_anime:
        mal_id = item['mal_id']
        user_score = item['score']
        idx = indices[mal_id]

        # Get the number of members for this anime from the processed dataframe
        members_count = df_processed[df_processed['anime_id'] == mal_id]['members'].iloc[0]

        # Calculate weight: Score * log(members_count + 1) to dampen the effect of extremely popular anime
        # Adding 1 to members_count to avoid log(0)
        weight = user_score * np.log1p(members_count)

        # Simple penalty for low scores (e.g., scores 1-5)
        if user_score <= 5:
            weight *= -0.5 # Assign a negative weight to low scores (adjust the multiplier as needed)

        # Convert the sparse matrix row to a dense numpy array before multiplication
        profile_vector += tfidf_matrix[idx].toarray().flatten() * weight
        total_weight += abs(weight) # Sum absolute weights for normalization

    # Normalize the profile vector
    if total_weight > 0:
        profile_vector /= total_weight
    else:
        return None, set() # Handle case where all weights are zero (unlikely but possible)

    return profile_vector, watched_anime_ids

def generate_recommendations_logic(username):
    """
    The main orchestrator function. It takes a username and returns a list of
    recommended anime IDs, now with a numerical feature re-ranking step.
    """
    if MAL_CLIENT_ID is None:
        return "MAL_CLIENT_ID is not set in environment variables.", []

    # 1. Fetch user's live data from the MAL API
    user_list = get_user_anime_list_official(username, MAL_CLIENT_ID)
    if not user_list:
        return f"Could not generate recommendations for '{username}'.", []

    # 2. Build the user's unique taste profile
    user_profile, watched_ids = create_user_profile(user_list, tfidf_matrix, indices, df_processed)
    if user_profile is None:
        return "Could not create a taste profile. The user may have only watched anime not present in our knowledge base or all weights were zero.", []

    # 3. Calculate Cosine Similarity
    cosine_similarities = cosine_similarity(user_profile.reshape(1, -1), tfidf_matrix)

    # Get a list of (index, similarity_score) pairs
    sim_scores = list(enumerate(cosine_similarities[0]))

    # --- 4. Filter and Prepare for Numerical Re-ranking ---
    # Create a temporary list of potential recommendations including original index and similarity
    potential_recommendations = []
    for i, score in sim_scores:
        anime_id = df_processed['anime_id'].iloc[i]
        # Only consider anime the user hasn't seen
        if anime_id not in watched_ids:
            potential_recommendations.append({'index': i, 'anime_id': anime_id, 'similarity': score})

    # If no potential recommendations are found after filtering, return empty list
    if not potential_recommendations:
        return "No potential recommendations found after filtering.", []

    # --- 5. Retrieve Numerical Features for Potential Recommendations ---
    # Get the original indices of the potential recommendations
    potential_indices = [rec['index'] for rec in potential_recommendations]

    # Extract numerical features from the processed dataframe based on these indices
    numerical_features_df = df_processed.iloc[potential_indices][['anime_id', 'score', 'members']].copy()

    # Merge the similarity scores with the numerical features
    recs_with_features = pd.merge(
        pd.DataFrame(potential_recommendations),
        numerical_features_df,
        on='anime_id'
    )

    # --- 6. Apply Numerical Re-ranking ---
    # We'll combine similarity score with overall score and members count.
    recs_with_features['rerank_score'] = (
        recs_with_features['similarity'] *
        (recs_with_features['score'] + 1) * # Add 1 to score to avoid multiplying by 0
        np.log1p(recs_with_features['members']) # Use log1p for members count
    )

    # Sort by the new re-ranking score in descending order
    recs_with_features = recs_with_features.sort_values(by='rerank_score', ascending=False)

    # --- 7. Select and Return Top Recommendations ---
    # Get the top N anime IDs after re-ranking (n=20 for consistency with previous implementation)
    top_n_recommendation_ids = recs_with_features['anime_id'].head(20).tolist()

    # Fetch full details for each recommendation
    full_recommendations = []
    for anime_id in top_n_recommendation_ids:
        details = fetch_anime_details_from_jikan(anime_id)
        if details:
            full_recommendations.append(details)

    if not full_recommendations:
        return "Generated recommendations, but failed to fetch details from Jikan.", []

    return "Recommendations generated successfully.", full_recommendations

@app.route('/recommend', methods=['POST'])
def recommend_anime():
    data = request.get_json()
    username = data.get('username')

    if not username:
        return jsonify({"error": "Username is required"}), 400

    message, recommendations = generate_recommendations_logic(username)

    if recommendations:
        return jsonify({"message": message, "recommendations": recommendations}), 200
    else:
        return jsonify({"message": message, "recommendations": []}), 500

if __name__ == '__main__':
    load_and_preprocess_data()
    app.run(host='0.0.0.0', port=5000, debug=True)