document.getElementById("selection").addEventListener("submit", async (e) => {
  e.preventDefault(); // stop normal form submit

  const artist = document.getElementById("artist").value.trim();
  const song = document.getElementById("song").value.trim();

  const response = await fetch("/api/get_song", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      artist: artist,
      song: song
    })
  });

  const data = await response.json();

  if (!response.ok) {
    document.getElementById("lyrics").textContent = data.error;
    return;
  }

  console.log(data.lyrics);

});
