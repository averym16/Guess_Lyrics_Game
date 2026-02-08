import os
from flask import Flask, jsonify, send_from_directory, request, render_template
from sqlalchemy import and_
from flask_migrate import Migrate
from dotenv import load_dotenv
from models import db, Song

load_dotenv()  # reads .env if present

app = Flask(__name__, static_folder="static", static_url_path="")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.get("/api/health")
def health():
    return {"ok": True}

@app.get("/api/songs/random")
def random_song():
    result = song
    if not song:
        return jsonify({"error": "no songs"}), 404
    return jsonify({
        "artist": result.artist,
        "song": result.title,
        "lyrics": [l.lyric for l in result.lyrics]
    })

#POST request receives user selection from html 
@app.route('/api/get_song', methods=['POST'])
def api_get_song():
    data = request.get_json()
    artist = data.get('artist', '').strip()
    song = data.get('song', '').strip()

    if not artist or not song:
        return jsonify({"error": "Artist and song required"}), 400

    result = Song.query.filter(
        Song.artist.ilike(artist),
        Song.title.ilike(song)  # Changed from 'title' to 'song'
    ).first()

    if not result:
        return jsonify({"error": "Song not found"}), 404

    return jsonify({
        "artist": result.artist,
        "song": result.title,  # Changed from result.song to result.title
        "lyrics": [lyric.lyric for lyric in result.lyrics]
    })

if __name__ == "__main__":
    app.run(debug=True)