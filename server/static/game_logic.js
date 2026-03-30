/*
This file handles game state and logic:
- Manages current song, lyrics, guessed words
- Handles form submission and guess checking
- Coordinates between API calls and UI updates
*/

import { getSong, getRandomSong, getArtists, getSongs_ByArtist, getRandSong_ByArtist } from './api.js';
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
let artists = {};
let synonyms = [];
let sameArtist = false;
let random = false;
let gameActive = false;

// ==================== INITIALIZATION ====================
async function initGame() {

    handlePopup(0); // Ensure popup is hidden on start
    artists = await getArtists();
    
    // Load synonyms
    try {
        const response = await fetch('static/synonyms.json');
        synonyms = await response.json();
    } catch (error) {
        console.error('Error loading synonyms:', error);
        synonyms = [];
    }
    
    // Initialize UI components 
    initComponents();

     if ( document.getElementById('home_header') !== null) return;
    loadArtists(artists);
    // Set up event listeners
    const form = document.getElementById('selection');
    const guessInput = document.getElementById('gameinput');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const artist_select = document.getElementById('artist');// Get the elements

    artist_select.addEventListener('change', loadSongs);
    

    // Form submission starts the game
    form.addEventListener('submit', handleGameStart);
   
    // Guess input handling
    guessInput.addEventListener('keypress', handleGuessInput);
    
    // Timer controls
    pauseBtn.addEventListener('click', pauseTimer);
    stopBtn.addEventListener('click', () =>handlePopup(3));
    resetBtn.addEventListener('click', () =>handlePopup(1));
    
    // Set callback for when timer ends
    setTimerEndCallback(() =>handlePopup(4));
}

// ==================== GAME START ====================
async function handleGameStart(e) {
    e.preventDefault();
    
    const artist = document.getElementById('artist').value.trim();
    const song = document.getElementById('song').value.trim();
    let timer_normal = 0;
    
    try {
        // Fetch song from API
        if ((!artist && !song) || artist === "random"  ) {
            currentSong = await getRandomSong();
            document.getElementById('header').innerText = 'Random Song';
            random = true;
        } else if (artist && song === 'random')
        {
            currentSong = await getRandSong_ByArtist(artist);
            document.getElementById('header').innerText = artist + ' - Random Song';
            random = false;
        } else if (artist && song) {
            currentSong = await getSong(artist, song);
            document.getElementById('header').innerText = artist + ' - ' + song;
            random = false;
        } else {
            return;
        }
        
        // Initialize game state
        currentLyrics = currentSong.lyrics;
        guessedWords.clear();
        score = 0;

        //Get time for song
        timer_normal = currentSong.timer_normal; // Set time based on song's timer value
        
        // Calculate total unique words
        totalWords = calculateTotalWords(currentLyrics);
        
        // Update UI
        buildTable(currentLyrics);
        renderLyrics(guessedWords);
        showGameSection();
        displayScore(0, totalWords);
        document.getElementById('lyrics').scrollTop = 0;

        // Start timer
        if (!startTimer(timer_normal)) {
            resetGame();
            gameActive = false;
            return;
        }

        gameActive = true;
        
        // Focus on guess input
        document.getElementById('gameinput').focus();
        
        console.log(`Game started`);
        
    } catch (error) {
        handleError('Song not found. Please try again.');
        console.error('Error starting game:', error);
    }
}

// ==================== GUESS HANDLING ====================
function handleGuessInput(e) {

    if (e.key == 'Enter') {
        e.target.value = ''; // clear input on Enter
        return;
    }

    const guess = e.target.value.trim().toLowerCase();

    if (!guess) return;

    const wasCorrect = checkGuess(guess);

    if (wasCorrect) {
        e.target.value = '';   // clear after correct guess
        renderLyrics(guessedWords);

        if (checkWin()) {
            setTimeout(() => {
                handlePopup(5);
            }, 500);
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
            const cleanWord = word.replace(/[^a-z0-9$]/g, '');
            cleanWord.toLowerCase();
            
            // Check exact match with original word
            if (word === guess && !guessedWords.has(word)) {
                guessedWords.add(word);
                foundMatch = true;
                score++;
                displayScore(score, totalWords);
            }
            // Check exact match with cleaned word
            else if (cleanWord === guess && !guessedWords.has(cleanWord)) {
                guessedWords.add(cleanWord);
                foundMatch = true;
                score++;
                displayScore(score, totalWords);
            }
            // Check if guess is a synonym of the word
            else if (hasSimilar(guess, cleanWord) && !guessedWords.has(cleanWord)) {
                console.log("Found similar word: " + cleanWord + " for guess: " + guess);
                guessedWords.add(cleanWord);
                foundMatch = true;
                score++;
                displayScore(score, totalWords);
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
    gameActive = false;
    // Optional: Ask if they want to play again with the same artist
    if ( !random ) handlePopup(2);
   
}

function handleTimerEnd() {
    revealHiddenLyrics(guessedWords);
    gameActive = false;
    continueButtonHandler(false);
   
}

function continueButtonHandler(reset) {
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const contBtn = document.getElementById('continueBtn');
  
    if (reset){
        contBtn.textContent = 'Reset';
        contBtn.setAttribute('id', 'resetBtn');
        stopBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'inline-block';
    }
    else{
        resetBtn.textContent = 'Continue';
        resetBtn.setAttribute('id', 'continueBtn');
        stopBtn.style.display = 'none';
        pauseBtn.style.display = 'none';
    }
}

function handleResetGame(){
    gameActive = false;
    stopTimer();    
    if ( !random ) handlePopup(2);
    else resetGame();
}

function handleStopGame() {
        gameActive = false;
        stopTimer();
        handleTimerEnd();
}

// ==================== HELPER FUNCTIONS ====================
function calculateTotalWords(lyrics) {
    const uniqueWords = new Set();
    
    lyrics.forEach(lyric => {
        lyric.toLowerCase().split(' ').forEach(word => {
            const cleanWord = word.replace(/[^a-z0-9$]/g, '');
            if (cleanWord) uniqueWords.add(cleanWord);
        });
    });
    
    return uniqueWords.size;
}

function hasSimilar(guess, targetWord) {
    // Clean the target word
    const cleanTarget = targetWord.replace(/[^a-z0-9$]/g, '').toLowerCase();
    const cleanGuess = guess.toLowerCase();
    
    // Check each synonym group
    for (const synonymGroup of synonyms) {
        const mainWord = synonymGroup.word.toLowerCase();
        const similarWords = synonymGroup.sim.map(s => s.toLowerCase());
        
        // If the target word is the main word or one of its variants
        if (cleanTarget === mainWord || similarWords.includes(cleanTarget)) {
            // Check if the guess matches any variant in this group
            if (cleanGuess === mainWord || similarWords.includes(cleanGuess)) {
                return true;
            }
        }
    }
    
    return false;
}

function resetGame() {
    // Reset game state
    currentSong = null;
    currentLyrics = [];
    currentArtist = sameArtist ? currentArtist : null;
    guessedWords.clear();
    score = 0;
    totalWords = 0;
    if(document.getElementById('continueBtn') !== null) {
        continueButtonHandler(true);
    }
    
    // Reset UI
    hideGameSection();
    document.getElementById('artist').innerHTML =  sameArtist ? `<option value="${currentArtist}">${currentArtist}</option>` : '<option value="random">Random</option>';
    document.getElementById('song').innerHTML =  '<option value="random">Random</option>';
    document.getElementById('gameinput').value = '';
    document.getElementById('lyrics-table').innerHTML='';
    document.getElementById('header').innerText = 'Guess The Lyrics';
    if(sameArtist) {
        loadSongs();
    }

    else {
        loadArtists(artists);
    }
    resetTimer();
   
    
    console.log('Game reset');
}

async function loadSongs(){
    currentArtist = document.getElementById('artist').value;
    const songs_by_artist = await getSongs_ByArtist(currentArtist);
    loadSongsByArtist(songs_by_artist);
}

function handleError(message) {
    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");
    toast.className = "toast toast-error";

    // Create message span
    const text = document.createElement("span");
    text.textContent = message;

    // Create close button
    const closeBtn = document.createElement("span");
    closeBtn.className = "toast-close";
    closeBtn.innerHTML = "&times;";

    // Add both to toast
    toast.appendChild(text);
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    // Manual close
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });

    // Auto remove
    setTimeout(() => {
        removeToast(toast);
    }, 3000);
}

function removeToast(toast) {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
}

function handlePopup(type){
    const popupOverlay = document.getElementById("popupOverlay");
    const popupContent = document.querySelector(".popup-content");
    const closeBtn = document.querySelector(".popup-close");
    const popupBtn = document.querySelector(".popup-btn");
    const cancelBtn = document.querySelector(".cancel-btn");

    if (popupOverlay === null || popupContent === null || closeBtn === null) {
        console.error("Popup elements not found");
        return;
    }

    //Close popup
    if (type === 0) {
        popupOverlay.classList.remove("active");
        popupOverlay.style.display = "none";
        return;
    }

    popupOverlay.style.display = "flex";
    popupOverlay.classList.add("active");

    if (type === 1) {
        if (!gameActive) {
            handlePopup(0);
            handleResetGame();
            return;
        }
        cancelBtn.style.display = 'inline-block';
        const message = 'Are you sure you want to reset the game?';
        popupContent.querySelector("p").textContent = message;
        popupContent.querySelector("h2").textContent = "Reset Game?";
        cancelBtn.innerHTML = 'No';
        popupBtn.innerHTML = 'Yes';
        popupBtn.onclick = function() {
            handlePopup(0);
            handleResetGame();
        }
        closeBtn.onclick = function() {
            handlePopup(0);
        }
        cancelBtn.onclick = function() {
            handlePopup(0);
        }
    }
    else if (type === 2) {
        cancelBtn.style.display = 'inline-block';
        const message = 'Do you want to play another song with the same artist?';
        popupContent.querySelector("p").textContent = message;
        popupContent.querySelector("h2").textContent = "Continue?";
        cancelBtn.innerHTML = 'No';
        popupBtn.innerHTML = 'Yes';
        popupBtn.onclick = function() {
            handlePopup(0);
            sameArtist = true;
            resetGame();
        }
        cancelBtn.onclick = function() {
            handlePopup(0);
            sameArtist = false;
            resetGame();
        }
        closeBtn.onclick = function() {
            handlePopup(0);
            sameArtist = false;
            resetGame();
        }
    }
    else if (type === 3) {
        cancelBtn.style.display = 'inline-block';
        popupContent.className = "popup-content"; // reset first
        popupContent.classList.add("popup-danger");
        const message = 'Are you sure you want to give up?\nTHIS WILL STOP TIMER AND REVEAL ALL LYRICS!!!!';
        popupContent.querySelector("p").textContent = message;
        popupContent.querySelector("h2").textContent = "Give Up?";
        cancelBtn.innerHTML = 'No';
        popupBtn.innerHTML = 'Yes';
        popupBtn.onclick = function() {
            handlePopup(0);
            handleStopGame();
        }
        cancelBtn.onclick = function() {
            handlePopup(0);
        }
        closeBtn.onclick = function() {
            handlePopup(0);
        }
    }
    else if (type === 4) {
       cancelBtn.style.display = 'none';
       popupContent.className = "popup-content"; // reset first
       popupContent.classList.add("popup-time");
       const message = `
        ⏰ Time's Up! ⏰
        ${score}/${totalWords} words correct!
        
        Song: "${currentSong.song}"
        Artist: ${currentSong.artist}
        
        Better luck next time!
        `;
        popupContent.querySelector("p").textContent = message;
        popupContent.querySelector("h2").textContent = "Play Again?";
        popupBtn.innerHTML = 'Continue';
        popupBtn.onclick = function() {
            handlePopup(0);
            handleTimerEnd();
        }
    }
    else if (type === 5) { 
        cancelBtn.style.display = 'none';
        popupContent.className = "popup-content popup-win";
        const message = `
        🎉 Congratulations! 🎉
        You guessed all the lyrics!
        ${score}/${totalWords} words correct!
        
        Song: "${currentSong.song}"
        Artist: ${currentSong.artist}
        `;
        popupContent.querySelector("p").textContent = message;
        popupContent.querySelector("h2").textContent = "Congratulations!";
        popupBtn.innerHTML = 'Continue';
        popupBtn.onclick = function() {
            handlePopup(0);
            handleGameWin();
        }
    }
}

// ==================== START THE GAME ====================
document.addEventListener('DOMContentLoaded', initGame);
document.addEventListener('input', handleGuessInput);

// Optional: Close the popup if the user clicks outside of the content
window.addEventListener("click", function(event) {
    const popupOverlay = document.getElementById("popupOverlay");
    if (event.target === popupOverlay) {
        handlePopup(0);
    }
});