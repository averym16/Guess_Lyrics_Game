🎵 Guess the Lyrics Game

An interactive full-stack web application that challenges users to guess song lyrics in real time. Built with a Flask backend and dynamic frontend logic, the app emphasizes performance, user experience, and scalable game design.

🚀 Overview

This project simulates a real-time lyric recognition game inspired by platforms like Sporcle, where users must correctly input every word of a song. The application processes user input dynamically, validates correctness against stored lyric datasets, and updates the UI instantly.

Designed with extensibility in mind, the system supports future features like user accounts, leaderboards, and difficulty scaling.

✨ Key Features
⚡ Real-time input validation against full lyric datasets
🎯 Word-by-word matching engine with dynamic UI updates
⏱️ Performance-based scoring system (speed + accuracy)
🔄 Asynchronous API communication using fetch requests
📖 Instructional UI + feedback system for usability improvements
🎨 Responsive and accessible UI design
🛠️ Tech Stack

Frontend

HTML5
CSS3
JavaScript (ES6+, Vanilla)

Backend

Python
Flask (REST API)

Tools & Assets

OpenMoji (UI icons)
Google Forms (feedback collection)
🧠 Data Sources

Lyrics used in this project were compiled from publicly available sources, including:

Google Lyrics (default search results)
Genius
AZLyrics

Note: This project is for educational purposes and not intended for commercial use.

🏗️ System Design
Frontend communicates with backend via RESTful API calls (api.js)
Backend handles:
Song retrieval
Word validation logic
Score calculation
Game Logic
Maintains state of correctly guessed words
Handles partial progress and completion detection
Ensures consistent ordering and matching of lyrics
🎮 How It Works
A song is fetched from the backend
The user inputs lyrics word-by-word
Each word is validated via API
Correct guesses are rendered in place
Game ends when all lyrics are completed or user stops
Score is calculated based on completion and speed
📦 Installation
git clone https://github.com/averym16/Guess_Lyrics_Game.git
cd Guess_Lyrics_Game
Backend Setup
pip install -r requirements.txt
python app.py
Run the App

Open index.html in your browser
(or use a local server for best performance)

📁 Project Structure
Guess_Lyrics_Game/
│
├── backend/
│   ├── app.py
│   ├── routes/
│   └── logic/
│
├── frontend/
│   ├── index.html
│   ├── instructions.html
│   ├── css/
│   └── js/
│       └── api.js
│
├── README.md
└── requirements.txt
📈 Engineering Highlights
Designed a custom lyric-matching algorithm to handle full-song validation
Implemented stateful game progression without a frontend framework
Structured backend for modular API expansion
Focused on low-latency user feedback loops for improved UX
Built with scalability in mind for future React + database integration
🔮 Future Improvements
👤 User authentication & profiles
🏆 Global leaderboard system
⚛️ Migration to React + SCSS
🗄️ Persistent database (PostgreSQL)
🎵 Expanded song library & difficulty tiers
🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

📬 Feedback

Use the in-app feedback form or open a GitHub issue.

📄 License

MIT License