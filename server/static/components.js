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
    const resetBtn = document.getElementById('resetBtn');
    
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
        return false;
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

    return true;
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

export function displayScore(score, total)
{
    document.getElementById('score').innerHTML = score + '/' + total;   
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
        <button id="open-instructions">Instructions</button>
    `;
    
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
}

// ==================== FOOTER ====================
export function loadFooter() {
    const footer = document.querySelector('.footer');
    footer.innerHTML = `
        <p>&copy; ${new Date().getFullYear()} Guess The Lyrics.</p>
    `;
}

// ==================== LYRICS DISPLAY ====================
export function renderLyrics(guessedWords) {
   const cells = document.querySelectorAll('#lyrics-table td');

    cells.forEach(cell => {
        const cleanWord = cell.dataset.word
            .toLowerCase()
            .replace(/[^a-z]/g, '');

        cell.textContent = guessedWords.has(cleanWord)
            ? cell.dataset.word
            : '______';
    });
}

export function revealHiddenLyrics(guessedWords)
{
    const cells = document.querySelectorAll('#lyrics-table td');

    cells.forEach(cell => {
        const cleanWord = cell.dataset.word
            .toLowerCase()
            .replace(/[^a-z]/g, '');

        if ( !guessedWords.has(cleanWord) ){
            cell.textContent = cell.dataset.word;
            cell.style.color = 'red';
        }
    });
}


export function buildTable(lyrics) {
    const lyricsContainer = document.getElementById('lyrics-table');

    // Clear previous content
    if (lyricsContainer !== null) lyricsContainer.innerHTML = "";
    const tbody = document.createElement('tbody');
    let trow = document.createElement('tr');

    for (let i = 0; i < lyrics.length; i++) {
        const td = document.createElement('td');
        td.textContent = "______";
        td.dataset.word = lyrics[i];
        trow.appendChild(td);

        // Every 4 words, finish the row
        if ((i + 1) % 10 === 0) {
            tbody.appendChild(trow);
            trow = document.createElement('tr');
        }
    }

    // Append leftover row if it has cells
    if (trow.children.length > 0) {
        tbody.appendChild(trow);
    }

    lyricsContainer.appendChild(tbody);
}
export function buildLibrary(library){
    const song_list = document.getElementById('song-list');
    library.forEach(item => {

        const li = document.createElement('li');
        li.textContent = item.title + ' - ' + item.artist;
        song_list.appendChild(li);
    });
}
export function loadArtists(artists){
    const artist_list = document.getElementById('artist');
    artists.forEach(item => {
        const option_artist = document.createElement('option');
        option_artist.textContent = item.artist;
        artist_list.appendChild(option_artist);
    });
}

export function loadSongsByArtist(songs){
    const song_list = document.getElementById('song');
    songs.forEach(item => {
        const option_song = document.createElement('option');
        option_song.textContent = item.title;
        song_list.appendChild(option_song);
    });
}
export function showGameSection() {
    document.getElementById('game').style.display = 'block';
    document.getElementById('lyrics').style.display = 'block';
    document.getElementById('settings').style.display = 'none';
    document.getElementById('options').style.display = 'none';
}

export function hideGameSection() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('lyrics').style.display = 'none';
    document.getElementById('settings').style.display = 'block';
    document.getElementById('options').style.display = 'block';
}

// ==================== INITIALIZE ====================
export function initComponents() {
    loadNavbar();
    loadFooter();
    loadTheme();
    initTimer();
}