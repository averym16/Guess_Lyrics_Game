import os
from flask import Flask, jsonify, send_from_directory
from dotenv import load_dotenv
from models import db, Song

load_dotenv()  # reads .env if present

app = Flask(__name__, static_folder="static", static_url_path="")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.get("/api/health")
def health():
    return {"ok": True}

@app.get("/api/songs/random")
def random_song():
    song = Song.query.order_by(db.func.random()).first()
    if not song:
        return jsonify({"error": "no songs"}), 404
    return jsonify({
        "id": song.id,
        "title": song.title,
        "artist": song.artist,
        "lyrics": song.lyrics
    })

