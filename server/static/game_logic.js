/*
This file handles game state and logic:
- Manages current song, lyrics, guessed words
- Handles form submission and guess checking
- Coordinates between API calls and UI updates
*/

import { getSong, getRandomSong, getSongLibrary, getArtists, getSongs_ByArtist } from './api.js';
import { 
    initComponents,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setTimerEndCallback,
    renderLyrics,
    buildTable,
    showGameSection,
    hideGameSection,
    revealHiddenLyrics,
    buildLibrary,
    displayScore,
    loadSongsByArtist,
    loadArtists
} from './components.js';

// ==================== GAME STATE ====================
let currentSong = null;
let currentLyrics = [];
let guessedWords = new Set();
let score = 0;
let currentArtist = null;
let totalWords = 0;
let library = {};
let artists = {};

// ==================== INITIALIZATION ====================
async function initGame() {
    library = await getSongLibrary();
    artists = await getArtists();
    console.log(library);
    console.log(artists);
    // Initialize UI components 
    initComponents();
    buildLibrary(library);
    loadArtists(artists);
    // Set up event listeners
    const form = document.getElementById('selection');
    const guessInput = document.getElementById('gameinput');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const artist_select = document.getElementById('artist');


    artist_select.addEventListener('change', loadSongs);
    

    // Form submission starts the game
    form.addEventListener('submit', handleGameStart);
   
    // Guess input handling
    guessInput.addEventListener('keypress', handleGuessInput);
    
    // Timer controls
    pauseBtn.addEventListener('click', pauseTimer);
    stopBtn.addEventListener('click', handleStopGame);
    resetBtn.addEventListener('click', handleResetGame);
    
    // Set callback for when timer ends
    setTimerEndCallback(handleTimerEnd);
}

// ==================== GAME START ====================
async function handleGameStart(e) {
    e.preventDefault();
    
    const artist = document.getElementById('artist').value.trim();
    const song = document.getElementById('song').value.trim();
    console.log(artist, song);
    
    try {
        // Fetch song from API
        if ((!artist && !song) || artist === "random"  ) {
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
        buildTable(currentLyrics);
        renderLyrics(guessedWords);
        showGameSection();
        displayScore(0, totalWords);
        
        // Start timer
        if (!startTimer()) {
            alert('Please set a timer duration');
            
            resetGame();
            return;
        }
        
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
    const guess = e.target.value.trim().toLowerCase();

    if (!guess) return;

    const wasCorrect = checkGuess(guess);

    if (wasCorrect) {
        e.target.value = '';   // clear after correct guess
        renderLyrics(guessedWords);

        if (checkWin()) {
            handleGameWin();
        }
    } else {
        // Optional: only show feedback if the guess is "complete"
        e.target.classList.add('wrong-guess');
        setTimeout(() => e.target.classList.remove('wrong-guess'), 300);
    }
}

function checkGuess(guess) {
    let foundMatch = false;
    
    currentLyrics.forEach(lyric => {
        const words = lyric.toLowerCase().split(' ');
        words.forEach(word => {
            const cleanWord = word.replace(/[^a-z0-9]/g, '');
            cleanWord.toLowerCase();
            
            if (cleanWord === guess && !guessedWords.has(cleanWord)) {
                guessedWords.add(cleanWord);
                foundMatch = true;
                score++;
                displayScore(score, totalWords);
            }
            else if (word == guess && !guessedWords.has(word))
            {
                guessedWords.add(word);
                foundMatch = true;
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
    revealHiddenLyrics(guessedWords);
}

function handleResetGame(){
    if (confirm('Are you sure you want to reset the game?')) {
        stopTimer();
        resetGame();
    }
}

function handleStopGame() {
    if (confirm('Are you sure you want to give up?\nTHIS WILL STOP TIMER AND REVEAL ALL LYRICS!!!!')) {
        stopTimer();
        handleTimerEnd();
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
    currentArtist = null;
    library = {};
    artists = {};
    guessedWords.clear();
    score = 0;
    totalWords = 0;
    
    // Reset UI
    hideGameSection();
    document.getElementById('gameinput').value = '';
    document.getElementById('lyrics-table').innerHTML='';
    resetTimer();
   
    
    console.log('Game reset');
}

async function loadSongs(){
    currentArtist = document.getElementById('artist').value
    let songs_by_artist = await getSongs_ByArtist(currentArtist);
    loadSongsByArtist(songs_by_artist);
}

// ==================== START THE GAME ====================
document.addEventListener('DOMContentLoaded', initGame);
document.addEventListener('input', handleGuessInput);