# AniSwipe 🚀

Swipe right on your next favorite anime! AniSwipe is a web application providing personalized anime recommendations based on your MyAnimeList (MAL) data or manually curated lists, presented through an interactive, Tinder-like interface. Built as an ML final project.

## Key Features ✨

*   **User Accounts:** Secure registration and login (username/password).
*   **Profile Management:** Simple profiles with username and uploadable profile picture. Designate one favorite anime!
*   **MyAnimeList Integration:**
    *   Import your *entire* MAL list (statuses & scores) via username using the Jikan API.
    *   Update your local list by re-importing from MAL (handles new/updated entries, warns on rating overrides).
    *   Asynchronous import process to handle potentially large lists without blocking the UI.
*   **Manual List Building:** Search for anime (via Jikan) and add them manually with status and 1-10 ratings.
*   **Hybrid Recommendation Engine:**
    *   Combines Content-Based Filtering (anime genres, themes, etc.) and Item-Based Collaborative Filtering (user behavior patterns).
    *   Utilizes both explicit ratings (1-10) and implicit signals (watching status, completed status, plan-to-watch).
    *   Handles the "cold start" problem by suggesting popular anime to new users.
*   **Interactive Swipe Interface ("Tinder for Anime"):**
    *   **Swipe Right:** Add anime to your "Plan to Watch" list.
    *   **Swipe Left:** Skip/Not interested (temporarily removed from recommendations).
    *   **Swipe Up:** Add anime directly as "Watching" or "Watched" (user chooses).
*   **Skipped Anime Pool:** Skipped anime can reappear after ~30 swipes.

## Tech Stack 🛠️

*   **Frontend:**
    *   React (Vite)
    *   React Router (Routing)
    *   Axios (API Calls)
    *   Chakra UI (UI Components)
*   **Backend:**
    *   Python 3
    *   Flask (Web Framework)
    *   Celery & Redis/RabbitMQ (Async Task Queue for MAL Import)
    *   Requests (Jikan API Interaction)
    *   Werkzeug (File Handling)
*   **Database:**
    *   SQLite (Simple, file-based for development/demo)
*   **Machine Learning:**
    *   Pandas (Data Manipulation)
    *   Scikit-learn (TF-IDF, Cosine Similarity, NearestNeighbors, etc.)
*   **API:**
    *   Jikan API (v4) (Source for MAL data)

## Getting Started ⚙️

### Prerequisites

*   Git
*   Node.js and npm (or yarn)
*   Python 3.x and pip
*   (Optional but Recommended for Async Tasks) Redis or RabbitMQ server running locally if using Celery.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/aniswipe.git
    cd aniswipe
    ```

2.  **Backend Setup:**
    ```bash
    cd backend

    # Create and activate virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`

    # Install dependencies
    pip install -r requirements.txt # (Make sure to `pip freeze > requirements.txt` first!)

    # Set up environment variables
    cp .env.example .env
    # Edit .env and set a secure FLASK_SECRET_KEY

    # Initialize and upgrade the database
    flask db upgrade # Creates the initial SQLite file and tables based on models.py

    cd ..
    ```
    *(Note: You'll need to generate `requirements.txt` via `pip freeze > requirements.txt` once your backend dependencies are stable)*

3.  **Frontend Setup:**
    ```bash
    cd frontend

    # Install dependencies
    npm install

    cd ..
    ```

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd backend
    source venv/bin/activate # If not already activated
    flask run # Starts Flask development server (usually on http://127.0.0.1:5000)
    ```

2.  **Start the Frontend Development Server:**
    ```bash
    cd frontend
    npm run dev # Starts React development server (usually on http://localhost:5173 or 3000)
    ```

3.  Open your browser and navigate to the frontend address (e.g., `http://localhost:5173`).

## Usage 🖱️

1.  Register for a new account or log in.
2.  Navigate to your profile to optionally upload a picture or set a favorite anime.
3.  Import your MyAnimeList data via username or start adding anime manually using the search function.
4.  Go to the "Recommendations" or "Swipe" page.
5.  Start swiping! Your interactions will refine future recommendations. View your accumulating lists ("Plan to Watch", "Watching", "Completed") on your profile or a dedicated list page.

## ML Model Overview 🧠

The recommendation engine employs a hybrid approach:

1.  **Content-Based Filtering:** Uses anime metadata (genres, themes, potentially studio/source) vectorized using techniques like multi-hot encoding or TF-IDF. It calculates cosine similarity between anime to find items similar to those the user has liked.
2.  **Item-Based Collaborative Filtering:** Analyzes the user-item interaction matrix (scores derived from explicit ratings and implicit statuses like 'Completed' or 'Watching'). It uses Scikit-learn's `NearestNeighbors` to find anime frequently liked by users with similar tastes.
3.  **Hybridization:** Scores from both methods are combined (e.g., weighted average) to rank potential candidates.
4.  **Cold Start:** For new users, globally popular/highly-rated anime are recommended initially.

## Screenshots 📸

*TBA*

*   `[Screenshot of Login Page]`
*   `[Screenshot of Profile Page]`
*   `[Screenshot of Manual Add Search]`
*   `[Screenshot of Swipe Interface]`
*   `[Screenshot of User List]`

## License 📄

This project was created for academic purposes (BINUS ML Final Project).

## Acknowledgements 🙏

*   **Jikan.moe API:** For providing accessible MyAnimeList data.
*   **MyAnimeList:** The source of the anime data.
*   The developers of Flask, React, Scikit-learn, and all other libraries used.
