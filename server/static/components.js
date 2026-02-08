/*
This file handles all frontend UI components:
- Timer functionality
- Theme switching
- Loading/updating header, footer, navbar
- Any other pure UI updates
*/

// ==================== TIMER ====================
let countdown;
let timeLeft = 0;
let isPaused = false;

export function initTimer() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    // Note: These are separate from game start
    // You'll trigger startTimer from game_logic.js when game actually starts
}

export function startTimer() {
    clearInterval(countdown);
    isPaused = false;
    
    const minutesInput = document.getElementById('minutesInput');
    const secondsInput = document.getElementById('secondsInput');
    const display = document.getElementById('display');
    
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    timeLeft = (minutes * 60) + seconds;
    
    if (timeLeft <= 0) {
        alert('Please set a timer duration');
        return;
    }
    
    countdown = setInterval(() => {
        if (isPaused) return;
        
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        
        const displayMins = `${mins < 10 ? '0' : ''}${mins}`;
        const displaySecs = `${secs < 10 ? '0' : ''}${secs}`;
        
        display.textContent = `${displayMins}:${displaySecs}`;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            display.textContent = "Time's up!";
            onTimerEnd(); // Callback for game logic
        } else {
            timeLeft--;
        }
    }, 1000);
}

export function pauseTimer() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

export function stopTimer() {
    clearInterval(countdown);
    isPaused = false;
    const display = document.getElementById('display');
    const pauseBtn = document.getElementById('pauseBtn');
    
    display.textContent = '00:00';
    pauseBtn.textContent = 'Pause';
    timeLeft = 0;
}

export function resetTimer() {
    stopTimer();
    document.getElementById('minutesInput').value = 0;
    document.getElementById('secondsInput').value = 0;
}

// Callback when timer ends (game_logic will set this)
let onTimerEnd = () => {};
export function setTimerEndCallback(callback) {
    onTimerEnd = callback;
}

// ==================== THEME ====================
export function setTheme(theme) {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
}

export function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

export function toggleTheme() {
    const currentTheme = document.body.className || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// ==================== NAVBAR ====================
export function loadNavbar() {
    const navbar = document.getElementById('navbar');
    navbar.innerHTML = `
        <a href="/">Home</a>
        <a href="/guess">Play</a>
        <button id="themeToggle">Toggle Theme</button>
    `;
    
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
}

// ==================== FOOTER ====================
export function loadFooter() {
    const footer = document.querySelector('.footer');
    footer.innerHTML = `
        <p>&copy; ${new Date().getFullYear()} Guess The Lyrics. All rights reserved.</p>
    `;
}

// ==================== LYRICS DISPLAY ====================
export function renderLyrics(lyrics, guessedWords) {
    const lyricsContainer = document.getElementById('lyrics');
    
    const displayLyrics = lyrics.map(lyric => {
        return lyric.split(' ').map(word => {
            const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
            if (guessedWords.has(cleanWord)) {
                return word;
            } else {
                return '_'.repeat(word.length);
            }
        }).join(' ');
    }).join('\n');
    
    lyricsContainer.textContent = displayLyrics;
}

export function showGameSection() {
    document.getElementById('game').style.display = 'block';
}

export function hideGameSection() {
    document.getElementById('game').style.display = 'none';
}

// ==================== INITIALIZE ====================
export function initComponents() {
    loadNavbar();
    loadFooter();
    loadTheme();
    initTimer();
}