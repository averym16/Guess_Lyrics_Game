/*
This file handles game state and logic:
- Manages current song, lyrics, guessed words
- Handles form submission and guess checking
- Coordinates between API calls and UI updates
*/

import { getSong, getRandomSong } from './api.js';
import { 
    initComponents,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setTimerEndCallback,
    renderLyrics,
    showGameSection,
    hideGameSection
} from './components.js';

// ==================== GAME STATE ====================
let currentSong = null;
let currentLyrics = [];
let guessedWords = new Set();
let score = 0;
let totalWords = 0;

// ==================== INITIALIZATION ====================
function initGame() {
    // Initialize UI components
    initComponents();
    
    // Set up event listeners
    const form = document.getElementById('selection');
    const guessInput = document.getElementById('gameinput');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    // Form submission starts the game
    form.addEventListener('submit', handleGameStart);
    
    // Guess input handling
    guessInput.addEventListener('keypress', handleGuessInput);
    
    // Timer controls
    pauseBtn.addEventListener('click', pauseTimer);
    stopBtn.addEventListener('click', handleStopGame);
    
    // Set callback for when timer ends
    setTimerEndCallback(handleTimerEnd);
}

// ==================== GAME START ====================
async function handleGameStart(e) {
    e.preventDefault();
    
    const artist = document.getElementById('artist').value.trim();
    const song = document.getElementById('song').value.trim();
    
    try {
        // Fetch song from API
        if (!artist && !song) {
            currentSong = await getRandomSong();
        } else if (artist && song) {
            currentSong = await getSong(artist, song);
        } else {
            alert('Please provide both artist and song, or leave both empty for random');
            return;
        }
        
        // Initialize game state
        currentLyrics = currentSong.lyrics;
        guessedWords.clear();
        score = 0;
        
        // Calculate total unique words
        totalWords = calculateTotalWords(currentLyrics);
        
        // Update UI
        renderLyrics(currentLyrics, guessedWords);
        showGameSection();
        
        // Start timer
        startTimer();
        
        // Focus on guess input
        document.getElementById('gameinput').focus();
        
        console.log(`Game started: ${currentSong.song} by ${currentSong.artist}`);
        
    } catch (error) {
        alert('Song not found. Please try again.');
        console.error('Error starting game:', error);
    }
}

// ==================== GUESS HANDLING ====================
function handleGuessInput(e) {
    // Check guess on Enter key
    if (e.key === 'Enter') {
        const guess = e.target.value.trim().toLowerCase();
        
        if (!guess) return;
        
        const wasCorrect = checkGuess(guess);
        
        if (wasCorrect) {
            e.target.value = ''; // Clear input on correct guess
            renderLyrics(currentLyrics, guessedWords);
            
            // Check if game is won
            if (checkWin()) {
                handleGameWin();
            }
        } else {
            // Optional: shake animation or feedback for wrong guess
            e.target.classList.add('wrong-guess');
            setTimeout(() => e.target.classList.remove('wrong-guess'), 500);
        }
    }
}

function checkGuess(guess) {
    let foundMatch = false;
    
    currentLyrics.forEach(lyric => {
        const words = lyric.toLowerCase().split(' ');
        words.forEach(word => {
            const cleanWord = word.replace(/[^a-z]/g, '');
            
            if (cleanWord === guess && !guessedWords.has(cleanWord)) {
                guessedWords.add(cleanWord);
                foundMatch = true;
                score++;
            }
        });
    });
    
    return foundMatch;
}

// ==================== WIN/LOSE CONDITIONS ====================
function checkWin() {
    return guessedWords.size === totalWords;
}

function handleGameWin() {
    stopTimer();
    
    const message = `
        🎉 Congratulations! 🎉
        You guessed all the lyrics!
        
        Song: "${currentSong.song}"
        Artist: ${currentSong.artist}
        Score: ${score}/${totalWords}
    `;
    
    alert(message);
    
    // Optional: Ask if they want to play again
    if (confirm('Play another song?')) {
        resetGame();
    }
}

function handleTimerEnd() {
    const message = `
        ⏰ Time's Up! ⏰
        
        Song: "${currentSong.song}"
        Artist: ${currentSong.artist}
        Score: ${score}/${totalWords}
        
        Better luck next time!
    `;
    
    alert(message);
    
    // Reveal all lyrics
    const allWords = new Set();
    currentLyrics.forEach(lyric => {
        lyric.toLowerCase().split(' ').forEach(word => {
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (cleanWord) allWords.add(cleanWord);
        });
    });
    
    guessedWords = allWords;
    renderLyrics(currentLyrics, guessedWords);
    
    if (confirm('Try again?')) {
        resetGame();
    }
}

function handleStopGame() {
    if (confirm('Are you sure you want to stop the game?')) {
        stopTimer();
        resetGame();
    }
}

// ==================== HELPER FUNCTIONS ====================
function calculateTotalWords(lyrics) {
    const uniqueWords = new Set();
    
    lyrics.forEach(lyric => {
        lyric.toLowerCase().split(' ').forEach(word => {
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (cleanWord) uniqueWords.add(cleanWord);
        });
    });
    
    return uniqueWords.size;
}

function resetGame() {
    // Reset game state
    currentSong = null;
    currentLyrics = [];
    guessedWords.clear();
    score = 0;
    totalWords = 0;
    
    // Reset UI
    hideGameSection();
    document.getElementById('artist').value = '';
    document.getElementById('song').value = '';
    document.getElementById('gameinput').value = '';
    resetTimer();
    
    console.log('Game reset');
}

// ==================== START THE GAME ====================
document.addEventListener('DOMContentLoaded', initGame);