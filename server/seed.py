import json
from app import app
from models import db, Song, Lyric

def seed():

    if Song.query.count() > 0:
            print("Database already seeded, skipping...")
            return
            
    with open("data.json") as f:
        data = json.load(f)

    with app.app_context():
        for item in data["Song"]:
            song = Song(
                title=item["title"],
                artist=item["artist"]
            )
            db.session.add(song)
            db.session.flush()  # get song.id

            words = item["lyrics"].split()
            for word in words:
                db.session.add(
                    Lyric(song_id=song.id, lyric=word)
                )

        db.session.commit()
        print("Database seeded")

if __name__ == "__main__":
    seed()
