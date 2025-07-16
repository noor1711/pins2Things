from datetime import datetime
import os
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

def analyze_image_with_gemini(image):
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
        results = []
        for item in data.get("items", []):
            print(f"Found item:", item.keys())  # Debugging line to see available keys
            results.append({
                "title": item.get("title"),
                "link": item.get("link"),
                "thumbnail": item.get("image", {}).get("thumbnailLink")
            })
        return results
    except Exception as e:
        logging.error(f"Error performing Google CSE search for '{query}': {e}")
        return []

def getRecommendations(pin_image_urls):
    if not pin_image_urls:
        return jsonify({"error": "Could not fetch images. Check board or API."}), 500

    all_keywords = set()
    overall_search_query_parts = []
    recommendations = []

    for img_url in pin_image_urls:
        img = get_image_from_url(img_url)
        if img:
            gemini_output = analyze_image_with_gemini(img)
            all_keywords.update(gemini_output["keywords"])
            if gemini_output["search_query"]:
                overall_search_query_parts.append(gemini_output["search_query"])

    final_keywords = list(all_keywords)
    final_search_query = " ".join(sorted(list(set(overall_search_query_parts))))
    if not final_search_query and final_keywords:
         final_search_query = " ".join(final_keywords) + " products"

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
    return access_token
    # refresh_token = session.get('pinterest_refresh_token')
    # access_token_expiry_str = session.get('pinterest_access_token_expiry')


    # if not access_token and not refresh_token and not access_token_expiry_str:
    #     print("No Pinterest tokens found in session.")
    #     return None # User needs to re-authenticate

    # access_token_expiry = access_token_expiry_str and datetime.fromisoformat(access_token_expiry_str) or datetime.datetime.now() - datetime.timedelta(seconds=1)

    # # Check if access token is expired or will expire soon (e.g., within 5 minutes)
    # if access_token_expiry < (datetime.datetime.now() + datetime.timedelta(minutes=5)):
    #     print("Access token expired or close to expiring. Attempting refresh...")
    #     refresh_payload = {
    #         "grant_type": "refresh_token",
    #         "refresh_token": refresh_token,
    #         "client_id": PINTEREST_CLIENT_ID,
    #         "client_secret": PINTEREST_CLIENT_SECRET
    #     }
    #     headers = {"Content-Type": "application/x-www-form-urlencoded"}

    #     try:
    #         refresh_response = requests.post(PINTEREST_TOKEN_URL, data=refresh_payload, headers=headers)
    #         refresh_response.raise_for_status()
    #         refresh_data = refresh_response.json()

    #         new_access_token = refresh_data['access_token']
    #         # Pinterest might send a new refresh token with a refresh, always use the latest
    #         new_refresh_token = refresh_data.get('refresh_token', refresh_token)
    #         new_expires_in = refresh_data['expires_in']
    #         new_access_token_expiry = datetime.now() + datetime.timedelta(seconds=new_expires_in)

    #         # --- Update stored tokens (CRITICAL!) ---
    #         session['pinterest_access_token'] = new_access_token
    #         session['pinterest_refresh_token'] = new_refresh_token
    #         session['pinterest_access_token_expiry'] = new_access_token_expiry.isoformat()
    #         print("Pinterest token refreshed successfully.")
    #         return new_access_token

    #     except requests.exceptions.RequestException as e:
    #         print(f"Error refreshing Pinterest token: {e}")
    #         # Refresh failed, tokens are likely invalid. Clear them and force re-auth.
    #         session.pop('pinterest_access_token', None)
    #         session.pop('pinterest_refresh_token', None)
    #         session.pop('pinterest_access_token_expiry', None)
    #         session.pop('pinterest_authenticated', None)
    #         return None
    # else:
    #     # Access token is still valid
    #     return access_token

@app.route('/api/auth/status', methods=['GET'])
def user_status():
    """
    Checks if the current user's session holds valid Pinterest authentication tokens.
    """
    # The get_valid_pinterest_token() function (from our previous discussion)
    # already handles checking if the access token is expired and refreshing it.
    token = get_valid_pinterest_token()
    if token:
        # If a valid token is returned, the user is authenticated.
        # You could also add user-specific data from your session here if needed.
        return jsonify({"isAuthenticated": True, "message": "Authenticated with Pinterest"})
    else:
        # No valid token found or refresh failed, user is not authenticated.
        # Ensure that get_valid_pinterest_token() clears tokens from session if refresh fails.
        return jsonify({"isAuthenticated": False, "message": "Not authenticated with Pinterest"})

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
    access_token = get_valid_pinterest_token()
    if not access_token:
        return redirect("pinterest-auth-start") # Redirect to start OAuth flow if no valid token
    
    access_token = get_valid_pinterest_token()
    if not access_token:   
        return jsonify({"error": "User not authenticated with Pinterest"}), 401
    
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