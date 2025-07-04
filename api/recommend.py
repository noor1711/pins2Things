# your-pinterest-ai-app/api/recommend.py
from flask import Flask, request, jsonify
import os
import requests
import google.generativeai as genai
from PIL import Image
from io import BytesIO
import json
import logging

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

# --- API Key Initialization from Vercel Environment Variables ---
# These variables will be set in your Vercel Project Settings
PINTEREST_APP_ID = os.environ.get("PINTEREST_APP_ID")
PINTEREST_APP_SECRET = os.environ.get("PINTEREST_APP_SECRET")
GOOGLE_GEMINI_API_KEY = os.environ.get("GOOGLE_GEMINI_API_KEY")
GOOGLE_CSE_ID = os.environ.get("GOOGLE_CSE_ID")
GOOGLE_CSE_API_KEY = os.environ.get("GOOGLE_CSE_API_KEY")

genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-pro-vision')

# --- Helper Functions (Copy these from the previous detailed main.py) ---
def fetch_pinterest_pins(board_url, num_pins=5):
    # This is the placeholder/dummy implementation for MVP.
    # Replace with actual Pinterest API calls for production.
    logging.info(f"Attempting to fetch pins from: {board_url}")
    dummy_urls = [
        "https://i.pinimg.com/564x/23/e8/67/23e867d60e7e17c09e3a6c117d91d1c3.jpg",
        "https://i.pinimg.com/564x/0f/c6/8e/0fc68e1e7e40c8f5d070b4a4c5f9b4c0.jpg",
        "https://i.pinimg.com/564x/8a/1b/09/8a1b09b0a1d0f81d1e4c7e6c4f0b2f5c.jpg"
    ]
    return dummy_urls[:num_pins]

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
        "searchType": "image" # or "product"
    }
    try:
        response = requests.get(search_url, params=params)
        response.raise_for_status()
        data = response.json()
        results = []
        for item in data.get("items", []):
            results.append({
                "title": item.get("title"),
                "link": item.get("link"),
                "thumbnail": item.get("image", {}).get("thumbnailLink")
            })
        return results
    except Exception as e:
        logging.error(f"Error performing Google CSE search for '{query}': {e}")
        return []

# --- Main Flask Endpoint ---
@app.route('/recommend', methods=['POST', 'OPTIONS'])
def recommend_endpoint():
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*') # IMPORTANT for frontend
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    # Handle the POST request
    request_json = request.get_json(silent=True)
    board_url = request_json.get('board_url') if request_json else None

    if not board_url:
        return jsonify({"error": "Missing 'board_url' in request."}), 400

    pin_image_urls = fetch_pinterest_pins(board_url)
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

    response = jsonify(response_data)
    response.headers.add('Access-Control-Allow-Origin', '*') # Set your Vercel domain here in production
    return response

# Vercel will look for an 'app' variable, which is our Flask app
# For local testing with `vercel dev` or `flask run`, you might add:
# if __name__ == '__main__':
#     app.run(debug=True, port=3001)