import os
import requests
import base64

from flask import Flask, redirect, request, session
# from dotenv import load_dotenv

# load_dotenv() # Load environment variables from .env file

app = Flask(__name__)
app.secret_key = os.urandom(24) # Replace with a strong, permanent secret key for production

# --- Pinterest API Configuration (Get these from your Pinterest Developer Dashboard) ---
PINTEREST_CLIENT_ID = "application_id_here" # Replace with your actual Pinterest app client ID
PINTEREST_CLIENT_SECRET = "pin_secret_here"
# This must EXACTLY match one of the Redirect URIs configured in your Pinterest app settings
# For local development: http://localhost:8080/pinterest-callback
# For Vercel deployment: https://your-vercel-domain.vercel.app/api/pinterest-callback (or adjust your backend's domain)
PINTEREST_REDIRECT_URI = "http://localhost:8080/api/pinterest-callback"

# OAuth Endpoints
PINTEREST_AUTHORIZE_URL = "https://www.pinterest.com/oauth/"
PINTEREST_TOKEN_URL = "https://api.pinterest.com/v5/oauth/token"

# --- Backend Endpoint to Initiate OAuth ---
@app.route('/api/pinterest-auth-start')
def pinterest_auth_start():
    print("Starting Pinterest OAuth flow...")
    # Define the scopes (permissions) your app needs.
    # For reading pins and boards: 'boards:read', 'pins:read', 'user_accounts:read'
    # Check Pinterest API docs for all available scopes.
    SCOPES = "boards:read,pins:read,user_accounts:read" # Comma-separated
    
    auth_url = (
        f"{PINTEREST_AUTHORIZE_URL}?"
        f"client_id={PINTEREST_CLIENT_ID}&"
        f"redirect_uri={PINTEREST_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={SCOPES}"
    )
    return redirect(auth_url)

# --- Backend Endpoint to Handle OAuth Callback ---
FRONTEND_HOME_URL = "http://localhost:3000" # For local development

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

# --- You can remove or modify the default '/' route if you want Flask to only handle API ---
# @app.route('/')
# def home():
#     return "Backend is running. Access frontend at http://localhost:3000"
# --- Helper to get the access token from session (or DB in real app) ---
def get_current_user_pinterest_token():
    return session.get('pinterest_access_token')

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080) 