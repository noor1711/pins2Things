from datetime import datetime, timedelta
import os
from random import random
from flask.cli import load_dotenv
import requests
import base64

from flask import Flask, redirect, request, session, jsonify
from flask_cors import CORS

import google.generativeai as genai
from PIL import Image
from io import BytesIO
import json
import logging
import requests
import asyncio

ERRORS = {
    "TOO_MANY_REQUESTS": {
        "status": 429,
        "message": "You have reached the maximum number of requests allowed. Please try again later."
    },
    "PINTEREST_UNAUTHORIZED": {
        "status": 401,
        "message": "You are not authorized to access this Pinterest board. Redirecting..."
    },
    "UNKNOWN_ERROR": {
        "status": 500,
        "message": "An unknown error occurred. Please try again later."
    }
}

def get_jsonified_error(error_name):
    if error_name in ERRORS:
        error = ERRORS[error_name]
    else:
        error = ERRORS["UNKNOWN_ERROR"]
    return jsonify({ "error": error["message"] }), error["status"]


# from dotenv import load_dotenv
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

GOOGLE_GEMINI_API_KEY = os.environ.get("GOOGLE_GEMINI_API_KEY")
GOOGLE_CSE_ID = os.environ.get("GOOGLE_CSE_ID")
GOOGLE_CSE_API_KEY = os.environ.get("GOOGLE_CSE_API_KEY")

genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

def get_image_from_url(url):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        return img
    except Exception as e:
        logging.error(f"Error fetching/processing image from URL {url}: {e}")
        return None

async def analyze_image_with_gemini(image):
    if not image:
        return {"keywords": [], "search_query": ""}
    prompt = """
    Analyze the aesthetic of this image. Identify key objects, color palette, and general mood.
    Generate 3-5 concise, comma-separated keywords representing the core aesthetic and any prominent product types.
    Also, provide a single, broad Google Search query (e.g., 'minimalist home decor products') that captures the overall style for finding related products.
    Format your response strictly as JSON:
    {
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "search_query": "Your descriptive search query"
    }
    """
    try:
        await asyncio.sleep(random())
        logging.info("Requesting gemini content generation at", datetime.now())
        response = gemini_model.generate_content([prompt, image])
        response_text = response.text.strip()
        try:
            result = json.loads(response_text)
            return result
        except json.JSONDecodeError:
            logging.warning(f"Gemini response not perfect JSON, attempting fallback parsing: {response_text}")
            keywords = []
            search_query = ""
            if "keywords" in response_text:
                k_match = response_text.split('"keywords": [')[1].split(']')[0]
                keywords = [kw.strip().strip('"') for kw in k_match.split(',') if kw.strip()]
            if "search_query" in response_text:
                s_match = response_text.split('"search_query": "')[1].split('"')[0]
                search_query = s_match
            return {"keywords": keywords, "search_query": search_query}
    except Exception as e:
        logging.error(f"Error analyzing image with Gemini: {e}")
        return {"keywords": [], "search_query": ""}

def perform_google_cse_search(query):
    if not query:
        return []
    search_url = f"https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_CSE_API_KEY,
        "cx": GOOGLE_CSE_ID,
        "q": query,
        "num": 3,
    }
    try:
        response = requests.get(search_url, params=params)
        response.raise_for_status()
        data = response.json()
        logging.info(f"Google CSE performed for {query}")
        results = []
        for item in data.get("items", []):
            results.append({
                "title": item.get("title"),
                "link": item.get("link"),
                "thumbnail": item.get("pagemap", {}).get("cse_image", [{}])[0].get("src", "") or item.get("displayLink", ""),
                "snippet": item.get("snippet", ""),
            })
        return results
    except Exception as e:
        logging.error(f"Error performing Google CSE search for '{query}': {e}")
        return []
    
async def getRecommendations(pin_image_urls):
    if not pin_image_urls:
        return jsonify({"error": "Could not fetch images. Check board or API."}), 500

    all_keywords = set()
    overall_search_query_parts = []
    recommendations = []

    validImages = [get_image_from_url(img_url) for img_url in pin_image_urls if img_url]
    
    tasks = []
    for image in validImages:
        task = asyncio.create_task(
            coro=analyze_image_with_gemini(image)
        )    
        tasks.append(task)
    
    results = await asyncio.gather(*tasks)

    for gemini_output in results:  
            all_keywords.update(gemini_output["keywords"])
            if gemini_output["search_query"]:
                overall_search_query_parts.append(gemini_output["search_query"])

    final_keywords = list(all_keywords)
    final_search_query = " ".join(sorted(list(set(overall_search_query_parts))))
    if not final_search_query and final_keywords:
         final_search_query = " ".join(final_keywords) + " buy" if len(final_keywords) > 0 else ""

    if final_search_query:
        cse_results = perform_google_cse_search(final_search_query)
        recommendations.extend(cse_results)

    response_data = {
        "processed_pins": pin_image_urls,
        "identified_keywords": final_keywords,
        "generated_search_query": final_search_query,
        "recommendations": recommendations
    }

    return response_data

# --- Backend Endpoint to Handle OAuth Callback ---
FRONTEND_HOME_URL = os.getenv('FRONTEND_HOME_URL', 'http://localhost:3000') # Default to localhost if not set

# OAuth Endpoints
PINTEREST_AUTHORIZE_URL = os.getenv('PINTEREST_AUTHORIZE_URL', 'https://www.pinterest.com/oauth/')
PINTEREST_TOKEN_URL = os.getenv('PINTEREST_TOKEN_URL', 'https://api.pinterest.com/v5/oauth/token')

def get_valid_pinterest_token():
    
    access_token = session.get('pinterest_access_token')
    refresh_token = session.get('pinterest_refresh_token')
    access_token_expiry_str = session.get('pinterest_access_token_expiry')
    # refresh_token_expiry_str = session.get('pinterest_refresh_token_expiry')

    if not access_token or not refresh_token or not access_token_expiry_str:
        print("No Pinterest tokens found in session.")
        return None # User needs to re-authenticate

    access_token_expiry = access_token_expiry_str and datetime.fromisoformat(access_token_expiry_str) or datetime.now() - timedelta(seconds=1)

    # Check if access token is expired or will expire soon (e.g., within 5 minutes)
    if access_token_expiry < (datetime.now() + timedelta(minutes=5)):
        print("Access token expired or close to expiring. Attempting refresh...")
        refresh_payload = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": PINTEREST_CLIENT_ID,
            "client_secret": PINTEREST_CLIENT_SECRET
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        try:
            refresh_response = requests.post(PINTEREST_TOKEN_URL, data=refresh_payload, headers=headers)
            refresh_response.raise_for_status()
            refresh_data = refresh_response.json()

            new_access_token = refresh_data['access_token']
            session['pinterest_access_token'] = new_access_token
            session['pinterest_refresh_token'] = refresh_data.get('refresh_token') # Store refresh token if available
            session['pinterest_access_token_expiry'] = (datetime.now() + timedelta(seconds=refresh_data.get('expires_in', 3600))).isoformat() # Store expiry time
            session['pinterest_refresh_token_expiry'] = (datetime.now() + timedelta(seconds=refresh_data.get('refresh_token_expires_in', 3600))).isoformat() # Store refresh token expiry time
            print("Pinterest token refreshed successfully.")
            return new_access_token

        except requests.exceptions.RequestException as e:
            print(f"Error refreshing Pinterest token: {e}")
            # Refresh failed, tokens are likely invalid. Clear them and force re-auth.
            session.pop('pinterest_access_token', None)
            session.pop('pinterest_refresh_token', None)
            session.pop('pinterest_access_token_expiry', None)
            session.pop('pinterest_authenticated', None)
            return None
    else:
        # Access token is still valid
        return access_token

@app.route('/api/auth/status', methods=['GET'])
def user_status():
    """
    Checks if the current user's session holds valid Pinterest authentication tokens.
    """
    token = get_valid_pinterest_token()
    if token:
        return jsonify({"isAuthenticated": True, "message": "Authenticated with Pinterest"})
    else:
        return jsonify({"isAuthenticated": False, "message": "Not authenticated with Pinterest"})

# --- Backend Endpoint to Initiate OAuth ---
@app.route('/api/pinterest-auth-start')
def pinterest_auth_start():
    # For reading pins and boards: 'boards:read', 'pins:read', 'user_accounts:read'
    SCOPES = "boards:read,pins:read,user_accounts:read" # Comma-separated
    boardName = request.args.get('board')
    session['boardName'] = boardName
    
    auth_url = (
        f"{PINTEREST_AUTHORIZE_URL}?"
        f"client_id={PINTEREST_CLIENT_ID}&"
        f"redirect_uri={PINTEREST_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={SCOPES}"
    )

    logging.info("Starting Oauth flow: Redirecting to Pinterest OAuth URL")
    return redirect(auth_url)

@app.route('/api/pinterest-callback')
def pinterest_callback():
    code = request.args.get('code')
    error = request.args.get('error')

    if error:
        logging.error(f"Pinterest authorization error: {error}")
        # Redirect to frontend with error status and message
        return redirect(f"{FRONTEND_HOME_URL}/?status=error&message={error}")

    if not code:
        logging.error("No authorization code received from Pinterest.")
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
        session['pinterest_refresh_token'] = token_data.get('refresh_token') # Store refresh token if available
        session['pinterest_access_token_expiry'] = (datetime.now() + timedelta(seconds=token_data.get('expires_in', 3600))).isoformat() # Store expiry time
        session['pinterest_refresh_token_expiry'] = (datetime.now() + timedelta(seconds=token_data.get('refresh_token_expires_in', 3600))).isoformat() # Store refresh token expiry time
        boardName = request.args.get('board')
        boardName = session.get('boardName')
        
        return redirect(f"{FRONTEND_HOME_URL}/?board={boardName}")

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
async def get_recommendations():
    access_token = get_valid_pinterest_token()
    if not access_token:
        return redirect("pinterest-auth-start") # Redirect to start OAuth flow if no valid token
    
    access_token = get_valid_pinterest_token()
    if not access_token:   
        return jsonify({"error": "User not authenticated with Pinterest"}), 401

    recommendationsGenerated = session.get('recommendations_generated', 0)

    logging.info("Recommendations Generated:", recommendationsGenerated)

    if recommendationsGenerated >= 2:
        return get_jsonified_error("TOO_MANY_REQUESTS")
    try:
        # Example: Fetching user's top pins (Pinterest API might vary)
        # You'll need to consult Pinterest API docs for specific "recommendation" endpoints.
        # For this example, let's fetch some dummy data or user's boards again.

        board_name = request.args.get('board')
        print(f"Received board name from frontend: {board_name}") # For debugging
        if not board_name:
            return jsonify({"error": "Missing 'board_name' parameter"}), 400

        board_name = board_name.strip().lower()

        # Example: Get current user's boards again
        boards_url = "https://api.pinterest.com/v5/boards?page_size=250";
        headers = {
            "Authorization": f"Bearer {access_token}",
            'Content-Type': 'application/json'
        }
        boards_response = requests.get(boards_url, headers=headers)
        print("Board response status code:", boards_response.status_code,[board.get('name') for board in boards_response.json().get('items', [])]) # For debugging
        boards_response.raise_for_status()
        boards_data = boards_response.json().get('items', []) # Assuming 'items' contains boards

        # You would process 'boards_data' or other API results into your recommendations
        recommendations = [
            {"id": board.get('id'), "name": board.get('name'), "description": board.get('description')}
            for board in boards_data
        ]   
        userEnteredBoardName = board_name
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
        pin_urls = [pin.get('media', {}).get('images', {}).get('600x', {}).get('url', '') for pin in pins_data if pin.get('media')]
        print(f"Extracted {len(pin_urls)} pin image URLs") # For debugging
        # get recommendations based on pin URLs
        recommendations = await getRecommendations(pin_urls[:5])
        session['recommendations_generated'] = recommendationsGenerated + 1
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