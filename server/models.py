from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Song(db.Model):
    __tablename__ = "songs"

    id = db.Column(db.BigInteger, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    artist = db.Column(db.Text, nullable=False)
    tokens = db.Column(db.Text, nullable=True)  # JSON string of list[list[str]]

