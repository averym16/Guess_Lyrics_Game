
/*
This file is used to pull information from backend
*/
//Serve specific lyrics to frontend
// api.js - All API calls

export async function getSong(artist, song) {
    try {
        const response = await fetch('/api/get_song', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ artist, song })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch song');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching song:', error);
        throw error;
    }
}

export async function getRandomSong() {
    try {
        const response = await fetch('/api/songs/random');
        
        if (!response.ok) {
            throw new Error('Failed to fetch random song');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching random song:', error);
        throw error;
    }
}

//Serve lyrics once user selects songs & artist
document.getElementById("selection").addEventListener("submit", async (e) => {
  e.preventDefault(); // stop normal form submit

  const artist = document.getElementById("artist").value.trim();
  const song = document.getElementById("song").value.trim();

  console.log(artist, song);
  data = await getSong(artist, song);
  
  console.log(data.lyrics);

});

