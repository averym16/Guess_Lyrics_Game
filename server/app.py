import os
from flask import Flask, jsonify, send_from_directory, request, render_template
from sqlalchemy import and_, func, select
from flask_migrate import Migrate
from dotenv import load_dotenv
from models import db, Song, Artist

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
    song = Song.query.order_by(func.random()).first()

    if not song:
        return jsonify({"error": "No songs found"}), 404

    return jsonify({
        "artist": song.artist.name,  # Fixed: Access artist name through relationship
        "song": song.title,
        "lyrics": [lyric.lyric for lyric in song.lyrics]
    })

@app.get("/api/library")
def get_library():
    # Query using the Song model with artist relationship
    songs = Song.query.all()
    
    if not songs:
        return jsonify({"error": "Songs not found"}), 404
    
    # Convert to list of dictionaries
    songs_list = [{"artist": song.artist.name, "title": song.title} for song in songs]
    return jsonify(songs_list)
    
#POST request receives user selection from html 
@app.route('/api/get_song', methods=['POST'])
def api_get_song():
    data = request.get_json()
    artist_name = data.get('artist', '').strip()
    song_title = data.get('song', '').strip()

    if not artist_name or not song_title:
        return jsonify({"error": "Artist and song required"}), 400

    # Join Song with Artist to filter by artist name
    result = Song.query.join(Artist).filter(
        Artist.name.ilike(artist_name),
        Song.title.ilike(song_title)
    ).first()

    if not result:
        return jsonify({"error": "Song not found"}), 404

    return jsonify({
        "artist": result.artist.name,
        "song": result.title,
        "lyrics": [lyric.lyric for lyric in result.lyrics]
    })

@app.route('/api/artist/get_songs', methods=['POST'])
def get_songs_by_artist():
    data = request.get_json()
    artist_name = data.get('artist', '').strip()

    if not artist_name:
        return jsonify({"error": "Artist required"}), 400
    
    # Fixed: Changed Artists to Artist
    result = Artist.query.filter(
        Artist.name.ilike(artist_name)
    ).first()

    if not result:
        return jsonify({"error": "Songs not found"}), 404
    
    song_list = [{"song": song.title} for song in result.songs]
    return jsonify(song_list)

@app.get('/api/artist/get_artists')
def get_artists():

    artists = Artist.query.with_entities(Artist.name).all()
    
    if not artists:
        return jsonify({"error": "Artists not found"}), 404
    
    # Fixed: Changed Artist.name to artist.name (the loop variable)
    artist_list = [{"artist": artist.name} for artist in artists]
    return jsonify(artist_list)

@app.route('/api/artist/get_random_song', methods=['POST'])
def get_random_song_by_artist():
    data = request.get_json()
    artist_name = data.get('artist', '').strip()

    if not artist_name:
        return jsonify({"error": "Artist required"}), 400
    
    # Find the artist
    artist = Artist.query.filter(
        Artist.name.ilike(artist_name)
    ).first()

    if not artist:
        return jsonify({"error": "Artist not found"}), 404
    
    # Get a random song from that artist
    random_song = Song.query.filter(
        Song.artist_id == artist.id
    ).order_by(func.random()).first()
    
    if not random_song:
        return jsonify({"error": "No songs found for this artist"}), 404
    
    return jsonify({
        "artist": artist.name,
        "song": random_song.title,
        "lyrics": [lyric.lyric for lyric in random_song.lyrics]
    })


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
