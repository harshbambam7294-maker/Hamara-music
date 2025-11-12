console.log('Lets write JavaScript');

async function getSongs() {
    let a = await fetch("../gaana/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.getAttribute("href"));
        }
    }

    return songs;
}

async function main() {
    let songs = await getSongs();
    console.log("Loaded songs:", songs);

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `<li class="song-item" data-song="${song}">${song.replaceAll("%20", " ")}</li>`;
    }

    //  Wait for user click to start playback
    document.body.addEventListener("click", () => {
        let audio = new Audio(`../gaana/${songs[0]}`);
        audio.play().catch(err => {
            console.error("Playback failed:", err);
        });

        audio.addEventListener("loadeddata", () => {
            console.log("Duration:", audio.duration);
        });
    }, { once: true }); // Only trigger once
}

main();