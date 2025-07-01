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

To run the backend server, follow these steps:

### 1. Navigate to the API Directory

First, open your terminal and change to the `api` directory:

```bash
cd api
```

> **Note:** All subsequent commands in this section should be run from within the `api` directory.

### 2. Create and Activate a Virtual Environment

It's recommended to use a virtual environment to manage project-specific dependencies.

**Create the virtual environment:**

```bash
python -m venv venv
```

**Activate the virtual environment:**

*   **On Windows:**

    ```bash
    .\venv\Scripts\activate
    ```

*   **On macOS and Linux:**

    ```bash
    source venv/bin/activate
    ```

### 3. Install Dependencies

With the virtual environment activated, install the required packages using `pip`:

```bash
pip install -r requirements.txt
```

### 4. Run the Backend Server

Finally, start the server with the following command:

```bash
python main.py
```

The server should now be running and accessible at the address printed to the console, which is typically `http://127.0.0.1:5000`.

## 6. Running the Application

To run the complete AniSwipe application, both the frontend and backend servers need to be active concurrently.

1.  **Start the Frontend:**
    Open a terminal, navigate to the project root, and start the Next.js development server:
    ```bash
    pnpm dev
    ```

2.  **Start the Backend:**
    Open a second terminal and follow the "Backend Setup" instructions to start the Python/Flask server.
