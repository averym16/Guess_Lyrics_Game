import pandas as pd
import json
import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.environ["DATABASE_URL_HOST"])
print(os.environ["DATABASE_URL_HOST"])

def make_song_table():
    with open("server/data.json") as f:
        d = json.load(f)

    songs_rows = []
    lyrics_rows = []

    for item in d["Song"]:
        songs_rows.append({
            "title": item["title"],
            "artist": item["artist"]
        })

    songs_df = pd.DataFrame(songs_rows)

    songs_df.to_sql(
        "songs",
        con=engine,
        if_exists="append",
        index=False
    )

   
    db_songs = pd.read_sql("SELECT id, title, artist FROM songs", engine)

    for item in d["Song"]:
        song_id = db_songs.loc[
            (db_songs["title"] == item["title"]) &
            (db_songs["artist"] == item["artist"]),
            "id"
        ].values[0]

        words = item["lyrics"].split()

        for word in words:
            lyrics_rows.append({
                "song_id": song_id,
                "lyric": word
            })

    lyrics_df = pd.DataFrame(lyrics_rows)

    lyrics_df.to_sql(
        "lyrics",
        con=engine,
        if_exists="append",
        index=False
    )

    print(f"Inserted {len(songs_df)} songs")
    print(f"Inserted {len(lyrics_df)} lyric tokens")

if __name__ == "__main__":
    make_song_table()
