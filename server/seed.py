import json, string
from app import app
import re
from models import db, Song, Lyric

def valid(word):
    word.strip()
    for char in word:
        if char == '-':
            char = ' '
        elif char.isalnum() == False:
            char = ''
    return word
def seed():

    with open("data.json") as f:
        data = json.load(f)

    with app.app_context():
        if Song.query.count() > 0:
            print("Database already seeded, skipping...")
            return

        for item in data["Song"]:
            song = Song(
                title=item["title"],
                artist=item["artist"]
            )
            db.session.add(song)
            db.session.flush()  # get song.id

            words = item["lyrics"].split()
            for word in words:
                fixed_word = valid(word)

                db.session.add(
                    Lyric(song_id=song.id, lyric=fixed_word)
                )

        db.session.commit()
        print("Database seeded")

if __name__ == "__main__":
    seed()
