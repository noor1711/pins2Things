import os
from flask.cli import load_dotenv
import requests
import base64

from flask import Flask, redirect, request, session, jsonify
from flask_cors import CORS
# from dotenv import load_dotenv
from recommend import getRecommendations  # Import the function from recommend.py

load_dotenv() # Load environment variables from .env file

app = Flask(__name__)
# Enable CORS for the API, 
# TODO: also enable it for production 
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000", "supports_credentials": True}})
app.secret_key = os.urandom(24) # Replace with a strong, permanent secret key for production
ENV = os.getenv('FLASK_ENV', 'local') # Default to 'local' if not set
if ENV == 'production':
    # In production, you should set a strong secret key and use HTTPS
    app.secret_key = os.getenv('SECRET_KEY') # Set this in your environment variables

CERT_FILE = os.path.join(os.path.dirname(__file__), 'sshSecret/localhost+1.pem') # Or your certs subfolder
KEY_FILE = os.path.join(os.path.dirname(__file__), 'sshSecret/localhost+1-key.pem') # Or your certs subfolder

app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True,  # <<< Now this will work because Flask is HTTPS
    SESSION_COOKIE_HTTPONLY=True # Good practice
)

# --- Pinterest API Configuration (Get these from your Pinterest Developer Dashboard) ---
PINTEREST_CLIENT_ID = os.getenv('PINTEREST_CLIENT_ID')
PINTEREST_CLIENT_SECRET = os.getenv('PINTEREST_CLIENT_SECRET')
PINTEREST_REDIRECT_URI = os.getenv('PINTEREST_REDIRECT_URI') # This must EXACTLY match one of the Redirect URIs configured in your Pinterest app settings

# --- Backend Endpoint to Handle OAuth Callback ---
FRONTEND_HOME_URL = os.getenv('FRONTEND_HOME_URL', 'http://localhost:3000') # Default to localhost if not set

# OAuth Endpoints
PINTEREST_AUTHORIZE_URL = os.getenv('PINTEREST_AUTHORIZE_URL', 'https://www.pinterest.com/oauth/')
PINTEREST_TOKEN_URL = os.getenv('PINTEREST_TOKEN_URL', 'https://api.pinterest.com/v5/oauth/token')

# --- Backend Endpoint to Initiate OAuth ---
@app.route('/api/pinterest-auth-start')
def pinterest_auth_start():
    print("Starting Pinterest OAuth flow...")
    # For reading pins and boards: 'boards:read', 'pins:read', 'user_accounts:read'
    SCOPES = "boards:read,pins:read,user_accounts:read" # Comma-separated
    
    auth_url = (
        f"{PINTEREST_AUTHORIZE_URL}?"
        f"client_id={PINTEREST_CLIENT_ID}&"
        f"redirect_uri={PINTEREST_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={SCOPES}"
    )
    return redirect(auth_url)

@app.route('/api/pinterest-callback')
def pinterest_callback():
    code = request.args.get('code')
    error = request.args.get('error')

    if error:
        print(f"Pinterest authorization error: {error}")
        # Redirect to frontend with error status and message
        return redirect(f"{FRONTEND_HOME_URL}/?status=error&message={error}")

    if not code:
        print("No authorization code received from Pinterest.")
        return redirect(f"{FRONTEND_HOME_URL}/?status=error&message=No_code_received")

    # Exchange the authorization code for an access token
    token_exchange_payload = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': PINTEREST_REDIRECT_URI, # This MUST match the one registered in Pinterest Dev app
    }
    auth = PINTEREST_CLIENT_ID + ":" + PINTEREST_CLIENT_SECRET
    headers = {
        'Authorization': f"Basic {base64.b64encode(auth.encode('ascii')).decode('ascii')}",
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    try:
        token_response = requests.post(PINTEREST_TOKEN_URL, data=token_exchange_payload, headers=headers)
        token_response.raise_for_status()
        token_data = token_response.json()
        
        access_token = token_data.get('access_token')
        # You should also store refresh_token if your tokens expire and you need to renew them
        # refresh_token = token_data.get('refresh_token') 
        
        if not access_token:
            print(f"Failed to get access token: {token_data}")
            return redirect(f"{FRONTEND_HOME_URL}/?status=error&message=Token_exchange_failed")

        # --- IMPORTANT: Securely store the access_token ---
        # For a real application, you would store this access_token (and refresh_token)
        # in a database associated with the user, or in a secure, HttpOnly cookie.
        # Using Flask's `session` is for DEMO PURPOSES ONLY and won't persist across restarts
        # or be shared between multiple client requests reliably in a serverless environment.
        session['pinterest_access_token'] = access_token
        # print(f"Successfully exchanged code for access token: {access_token}")
        # Redirect back to the frontend's home page with a success status
        return redirect(f"{FRONTEND_HOME_URL}/?status=success")

    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error during token exchange: {e.response.status_code} - {e.response.text}")
        error_message = f"API_Error: {e.response.text}"
        return redirect(f"{FRONTEND_HOME_URL}/?status=error&message={error_message}")
    except requests.exceptions.RequestException as e:
        print(f"Network or request error during token exchange: {e}")
        error_message = f"Network_Error: {str(e)}"
        return redirect(f"{FRONTEND_HOME_URL}/?status=error&message={error_message}")

# Endpoint for frontend to fetch recommendations (after the redirect)
# This assumes you stored the access_token in the session for the user
@app.route('/api/get-recommendations', methods=['GET'])
def get_recommendations():
    access_token = session.get('pinterest_access_token')
    if not access_token:
        return jsonify({"error": "Not authenticated with Pinterest"}), 401

    try:
        # Example: Fetching user's top pins (Pinterest API might vary)
        # You'll need to consult Pinterest API docs for specific "recommendation" endpoints.
        # For this example, let's fetch some dummy data or user's boards again.
        
        board_url = request.args.get('board_url')
        print(f"Received board_url from frontend: {board_url}") # For debugging
        if not board_url:
            return jsonify({"error": "Missing 'board_url' parameter"}), 400
        
        # Example: Get current user's boards again
        boards_url = "https://api.pinterest.com/v5/boards/";
        headers = {
            "Authorization": f"Bearer {access_token}",
            'Content-Type': 'application/json'
        }
        boards_response = requests.get(boards_url, headers=headers)
        boards_response.raise_for_status()
        boards_data = boards_response.json().get('items', []) # Assuming 'items' contains boards

        
        # You would process 'boards_data' or other API results into your recommendations
        recommendations = [
            {"id": board.get('id'), "name": board.get('name'), "description": board.get('description')}
            for board in boards_data
        ]   
        print(boards_data) # For debugging
        userEnteredBoardName = board_url.split('/')[-2].lower() if board_url else None
        print(f"User entered board name: {userEnteredBoardName}") # For debugging
        currentBoardId = None
        for board in boards_data:
            if board.get('name').lower() == userEnteredBoardName:
                currentBoardId = board.get('id')
                break   
        if not currentBoardId:
            return jsonify({"error": "Board not found"}), 404   
        # Now fetch pins from the specific board
        pins_url = f"https://api.pinterest.com/v5/boards/{currentBoardId}/pins/"
        pins_response = requests.get(pins_url, headers=headers)
        pins_response.raise_for_status()
        pins_data = pins_response.json().get('items', []) # Assuming 'items' contains pins      
        print(f"Fetched {len(pins_data)} pins from board {currentBoardId}") # For debugging
        print(pins_data) # For debugging
        pin_urls = [pin.get('media', {}).get('images', {}).get('600x', {}).get('url', '') for pin in pins_data if pin.get('media')]
        print(f"Extracted {len(pin_urls)} pin image URLs") # For debugging
        # get recommendations based on pin URLs
        recommendations = getRecommendations(pin_urls)
        return jsonify(recommendations), 200

    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error fetching recommendations: {e}")
        print(f"Response: {e.response.text}")
        return jsonify({"error": "Failed to fetch recommendations from Pinterest", "details": e.response.text}), 500
    except Exception as e:
        print(f"An unexpected error occurred while fetching recommendations: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
# --- You can remove or modify the default '/' route if you want Flask to only handle API ---
# @app.route('/')
# def home():
#     return "Backend is running. Access frontend at http://localhost:3000"
# --- Helper to get the access token from session (or DB in real app) ---
def get_current_user_pinterest_token():
    return session.get('pinterest_access_token')

# Run the Flask app
if __name__ == '__main__':
    if ENV == "local":
        # For local development, run with HTTPS using self-signed certs
        app.run(debug=True, host='0.0.0.0', ssl_context=(CERT_FILE, KEY_FILE), port=8080)
    else:
        app.run(debug=True, host='0.0.0.0', port=8080)