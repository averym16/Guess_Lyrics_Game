import json, string
from app import app
import re
from models import db, Song, Lyric, Artist

def valid(words):
    """
    Process a list of words:
    - Split words containing hyphens into separate words
    - Remove all non-alphanumeric characters from each word
    - Return cleaned list of words
    """
    result = []
    
    for word in words:
        if '-' in word:
            # Split on hyphens and add each part separately
            parts = word.split('-')
            for part in parts:
                # Clean each part and add if not empty
                cleaned = ''.join(char for char in part if char.isalnum())
                if cleaned:
                    result.append(cleaned)
        else:
            # Clean the word and add if not empty
            cleaned = ''.join(char for char in word if char.isalnum())
            if cleaned:
                result.append(cleaned)
    
    return result

def seed():

    with open("data.json") as f:
        data = json.load(f)

    with app.app_context():
        if Song.query.count() > 0:
            print("Database already seeded, skipping...")
            return

        for item in data["Song"]:
            # Check if artist already exists
            artist = Artist.query.filter(Artist.name.ilike(item["artist"])).first()
            
            if not artist:
                artist = Artist(name=item["artist"])
                db.session.add(artist)
                db.session.flush()

            # Fixed: Assign the song to a variable so we can use song.id later
            song = Song(title=item["title"], artist_id=artist.id)
            db.session.add(song)
            db.session.flush()  # get song.id
            
            words = item["lyrics"].split()
            valid_words = valid(words)
            for word in valid_words:
                db.session.add(
                    Lyric(song_id=song.id, lyric=word)
                )

        db.session.commit()
        print("Database seeded")

if __name__ == "__main__":
    seed()
