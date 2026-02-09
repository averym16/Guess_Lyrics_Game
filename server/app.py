import os
from flask import Flask, jsonify, send_from_directory, request, render_template
from sqlalchemy import and_, func, select
from flask_migrate import Migrate
from dotenv import load_dotenv
from models import db, Song

load_dotenv()  # reads .env if present

app = Flask(__name__, static_folder="static", static_url_path="/static")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

@app.get("/")
def index():
    return render_template("index.html")
@app.get("/guess")  
def guess_lyrics():
    return render_template("lyric_game.html")

@app.get("/api/health")
def health():
    return {"ok": True}

#Pull random song from database if user selects none
@app.get("/api/songs/random")
def random_song():
    song = Song.select(func.random()).first()

    if not song:
        return jsonify({"error": "No songs found"}), 404

    return jsonify({
        "artist": result.artist,
        "song": result.title,
        "lyrics": [lyric.lyric for lyric in result.lyrics]
    })

@app.get("/api/library")
def get_library():
    # Query using the Song model
    songs = Song.query.with_entities(Song.artist, Song.title).all()
    
    if not songs:
        return jsonify({"error": "Songs not found"}), 404
    
    # Convert to list of dictionaries
    songs_list = [{"artist": song.artist, "title": song.title} for song in songs]
    return jsonify(songs_list)
    
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
        Song.title.ilike(song)
    ).first()

    if not result:
        return jsonify({"error": "Song not found"}), 404

    return jsonify({
        "artist": result.artist,
        "song": result.title,  # Changed from result.song to result.title
        "lyrics": [lyric.lyric for lyric in result.lyrics]
    })

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)