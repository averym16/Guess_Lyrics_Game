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
        const data = await response.json(); 
        console.log('Song data:', data);      
        console.log('Lyrics:', data.lyrics);  
        return data;                          
        
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

export async function getSongLibrary() {
    try {
        const response = await fetch('/api/library');
        
        if (!response.ok) {
            throw new Error('Failed to fetch songs');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching songs', error);
        throw error;
    }
}

export async function getArtists(){
    try {
        const response = await fetch('/api/artist/get_artists');
        
        if (!response.ok) {
            throw new Error('Failed to fetch artists');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching artists', error);
        throw error;
    }
}

export async function getSongs_ByArtist(artist){
     try {
            const response = await fetch('/api/artist/get_songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ artist })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch songs by artist');
        }
        const data = await response.json(); 
        console.log('Songs By Artist:', data);      
        return data;                          
        
    } catch (error) {
        console.error('Error fetching song:', error);
        throw error;
    }
}

export async function getRandSong_ByArtist(artist){
    try {
        const response = await fetch('/api/artist/get_random_song', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ artist })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch random song by artist');
        }
        const data = await response.json(); 
        return data;                          
        
    } catch (error) {
        console.error('Error fetching song:', error);
        throw error;
    }

}
