

//Serve lyrics to frontend
async function getSong(artist, song) {
    const response = await fetch('/api/get_song', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ artist, song })
    });
    
    const data = await response.json();
    return data;
}

function checkGuess(value){
    
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

