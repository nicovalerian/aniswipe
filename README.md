# AniSwipe

## 1. Project Overview
AniSwipe is a full-stack application designed as an anime recommendation system with a unique swipe-based interface. The frontend is built with Next.js, providing a dynamic and responsive user experience, while the backend leverages Python and Flask to power the recommendation engine.

## 2. Prerequisites
To set up and run AniSwipe, ensure you have the following software and tools installed:

*   Node.js (v20 or later)
*   `pnpm` (a fast, disk space efficient package manager)
*   Python (3.8+)
*   `pip` (Python package installer)

## 3. Environment Variables
AniSwipe requires certain environment variables to function correctly. Create a file named `.env` in the root directory of the project and populate it with the following variables:

```env
# .env.example
# Get your MyAnimeList Client ID from the developer portal
NEXT_PUBLIC_MAL_CLIENT_ID="YOUR_MAL_CLIENT_ID"

# Supabase credentials for authentication and database
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

*   `NEXT_PUBLIC_MAL_CLIENT_ID`: Your client ID from the MyAnimeList developer portal. This is required for accessing the MyAnimeList API.
*   `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project. Used for authentication and database interactions.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous public key for your Supabase project.

## 4. Frontend Setup
Follow these steps to get the Next.js frontend running:

*   **Installation:**
    Navigate to the project's root directory in your terminal:
    ```bash
    cd /path/to/aniswipe
    ```
    Install the frontend dependencies:
    ```bash
    pnpm install
    ```
*   **Running the Development Server:**
    Start the Next.js development server:
    ```bash
    pnpm dev
    ```
    The frontend application will be accessible at `http://localhost:3000`.

## 5. Backend Setup
Follow these steps to get the Python/Flask backend running:

*   **Virtual Environment (Recommended):**
    It is highly recommended to use a Python virtual environment to manage dependencies.
    Create a virtual environment:
    ```bash
    python -m venv venv
    ```
    Activate the virtual environment:
    *   On Windows (PowerShell):
        ```powershell
        .\venv\Scripts\activate
        ```
    *   On Windows (Command Prompt):
        ```cmd
        venv\Scripts\activate.bat
        ```
    *   On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
*   **Installation:**
    Install the required Python packages:
    ```bash
    pip install -r api/requirements.txt
    ```
*   **Running the Development Server:**
    Start the Flask backend server:
    ```bash
    python api/main.py
    ```
    The backend API will be available at `http://localhost:5000`.

## 6. Running the Application
To run the complete AniSwipe application, both the frontend and backend servers need to be active concurrently.

1.  Open two separate terminal windows or tabs.
2.  In the first terminal, navigate to the project root and start the frontend:
    ```bash
    cd /path/to/aniswipe
    pnpm dev
    ```
3.  In the second terminal, navigate to the project root, activate your Python virtual environment (if not already active), and start the backend:
    ```bash
    cd /path/to/aniswipe
    # Activate virtual environment (e.g., source venv/bin/activate)
    python api/main.py
