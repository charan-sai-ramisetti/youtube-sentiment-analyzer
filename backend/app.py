from flask import Flask, request, jsonify
import requests
import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from flask_cors import CORS
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
@app.route("/analyze", methods=["OPTIONS"])
def analyze_options():
    return "", 200


API_KEY = os.getenv("YOUTUBE_API_KEY")
analyzer = SentimentIntensityAnalyzer()

def extract_video_id(url):
    patterns = [
        r"v=([^&]+)",
        r"youtu\.be/([^?]+)",
        r"embed/([^?]+)"
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


@app.route("/analyze", methods=["POST"])
def analyze():
    if not API_KEY:
        return jsonify({"error": "YouTube API key not set"}), 500

    data = request.json
    video_url = data.get("video_url")

    if not video_url:
        return jsonify({"error": "Video URL required"}), 400

    video_id = extract_video_id(video_url)
    if not video_id:
        return jsonify({"error": "Invalid YouTube URL"}), 400

    positive = negative = neutral = 0
    total = 0
    next_page_token = None

    while total < 1000:
        params = {
            "part": "snippet",
            "videoId": video_id,
            "maxResults": 100,
            "order": "time",
            "pageToken": next_page_token,
            "key": API_KEY
        }

        response = requests.get(
            "https://www.googleapis.com/youtube/v3/commentThreads",
            params=params,
            timeout=10
        )

        data = response.json()

        for item in data.get("items", []):
            text = item["snippet"]["topLevelComment"]["snippet"].get("textDisplay", "")

            score = analyzer.polarity_scores(text)
            if score["compound"] >= 0.05:
                positive += 1
            elif score["compound"] <= -0.05:
                negative += 1
            else:
                neutral += 1

            total += 1
            if total >= 1000:
                break

        next_page_token = data.get("nextPageToken")
        if not next_page_token:
            break

    return jsonify({
        "positive": positive,
        "negative": negative,
        "neutral": neutral,
        "total": total
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
