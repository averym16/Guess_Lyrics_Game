
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Index, UniqueConstraint, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()


class Artist(db.Model):
    __tablename__ = "artists"
    __table_args__ = (
        db.UniqueConstraint('name', name='unique_artist'),
    )

    id: Mapped[Integer] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[String] = mapped_column(String, nullable=False)

    #Relationships
    songs: Mapped[list["Song"]] = relationship(back_populates="artist", lazy="selectin")    

    def __repr__(self):
        return f"<Artist {self.id} - {self.name}>"


class Song(db.Model):
    __tablename__ = "songs"
    __table_args__ = (
        db.UniqueConstraint('title', 'artist_id', name='unique_song'),
    )
    id: Mapped[Integer] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    artist_id: Mapped[int] = mapped_column(Integer, ForeignKey("artists.id"), nullable=False)
    
    #Relationships
    lyrics: Mapped[list["Lyric"]] = relationship(back_populates="song", lazy="selectin")
    artist: Mapped["Artist"] = relationship(back_populates="songs")

    def __repr__(self):
        return f"<Song {self.id} - {self.title}>"

class Lyric(db.Model):
    __tablename__ = "lyrics" 

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    song_id: Mapped[int] = mapped_column(Integer, ForeignKey("songs.id"), nullable=False)
    lyric: Mapped[str] = mapped_column(String, nullable=False)

    
    #Relationships
    song: Mapped["Song"] = relationship(back_populates="lyrics", lazy="selectin")

    def __repr__(self):
        return f"<Lyric {self.song_id} - {self._id} - {self.lyric} >"
