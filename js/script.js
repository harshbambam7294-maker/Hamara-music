console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    let m = Math.floor(seconds / 60).toString().padStart(2, "0");
    let s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

// Load songs inside the selected folder
async function getSongs(folder) {
    currFolder = folder;
    let req = await fetch(`${folder}/`);
    let text = await req.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let anchors = div.getElementsByTagName("a");
    songs = [];

    for (let a of anchors) {
        if (a.href.endsWith(".mp3")) {
            songs.push(a.href.split(`${folder}/`)[1]);
        }
    }

    // Display song list in sidebar
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (let song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Unknown Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Add event listeners to play a song when clicked
    document.querySelectorAll(".songList li").forEach(li => {
        li.onclick = () => playMusic(li.querySelector(".info div").innerText.trim());
    });

    return songs;
}

// Play a song
function playMusic(track, pause = false) {
    currentSong.src = `${currFolder}/${track}`;
    if (!pause) currentSong.play();

    document.querySelector("#play").src = "img/pause.svg";
    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

// Display Album Cards
async function displayAlbums() {
    let req = await fetch(`songs/`);
    let text = await req.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let a of anchors) {
        if (a.href.includes("/songs/") && !a.href.endsWith(".htaccess")) {
            let folder = a.href.split("/").slice(-1)[0]; // FIXED

            let metaReq = await fetch(`songs/${folder}/info.json`);
            let meta = await metaReq.json();

            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="24" height="24" fill="#fff">
                        <path d="M5 20V4L19 12L5 20Z"/>
                    </svg>
                </div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${meta.title}</h2>
                <p>${meta.description}</p>
            </div>`;
        }
    }

    // Click to load playlist
    document.querySelectorAll(".card").forEach(card => {
        card.onclick = async () => {
            let folder = card.dataset.folder;
            await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
        };
    });
}

async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);
    await displayAlbums();

    // Play / Pause button
    document.querySelector("#play").onclick = () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    };

    // Update progress / time
    currentSong.ontimeupdate = () => {
        let progress = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = `${progress}%`;
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    };

    // Seek bar
    document.querySelector(".seekbar").onclick = (e) => {
        let width = e.target.getBoundingClientRect().width;
        let percent = (e.offsetX / width) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    };

    // Volume control
    document.querySelector(".range input").oninput = (e) => {
        currentSong.volume = e.target.value / 100;
    };

    // Next / Previous song
    document.querySelector("#previous").onclick = () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    };

    document.querySelector("#next").onclick = () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    };

    // Mobile sidebar toggle
    document.querySelector(".hamburger").onclick = () => {
        document.querySelector(".left").style.left = "0";
    };

    document.querySelector(".close").onclick = () => {
        document.querySelector(".left").style.left = "-120%";
    };

    // === LOGIN POPUP ADDED HERE ===
    const loginOverlay = document.querySelector(".login-overlay");
    const loginBtn = document.querySelector(".loginbtn");
    const closeLogin = document.querySelector(".close-login");
    const loginSubmit = document.querySelector(".login-submit");

    loginBtn.addEventListener("click", () => {
        loginOverlay.classList.add("show-modal");
    });

    closeLogin.addEventListener("click", () => {
        loginOverlay.classList.remove("show-modal");
    });

    loginSubmit.addEventListener("click", () => {
        alert("Logged in successfully (demo)!");
        loginOverlay.classList.remove("show-modal");
    });


    // === SIGNUP POPUP ADDED HERE ===
const signupOverlay = document.querySelector(".signup-overlay");
const signupBtn = document.querySelector(".signupbtn");
const closeSignup = document.querySelector(".close-signup");
const signupSubmit = document.querySelector(".signup-submit");

signupBtn.addEventListener("click", () => {
    signupOverlay.classList.add("show-modal");
});

closeSignup.addEventListener("click", () => {
    signupOverlay.classList.remove("show-modal");
});

signupSubmit.addEventListener("click", () => {
    alert("Account created successfully (demo)!");
    signupOverlay.classList.remove("show-modal");
});

// ✅ SEARCH FUNCTIONALITY FOR PLAYLISTS
const searchInput = document.getElementById("playlistSearch");
if (searchInput) {
    searchInput.addEventListener("input", () => {
        const filter = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll(".card");

        cards.forEach(card => {
            const title = card.querySelector("h2")?.innerText.toLowerCase() || "";
            const desc = card.querySelector("p")?.innerText.toLowerCase() || "";
            card.style.display = (title.includes(filter) || desc.includes(filter)) ? "block" : "none";
        });
    });
}

// ✅ MAKE SEARCH ICON AND TEXT TOGGLE THE SEARCH BAR VISIBILITY
const searchButton = document.querySelector('li img[src="img/search.svg"]');
const searchText = document.querySelector('li img[src="img/search.svg"]').parentElement; // The <li> that contains "Search"
const searchContainer = document.querySelector(".search-container");
const searchInputField = document.getElementById("playlistSearch");

// Function to show the search bar
function showSearchBar() {
    if (!searchContainer.classList.contains("active")) {
        searchContainer.classList.add("active");
        searchInputField.focus();

        // Optional: Scroll to playlists section for better UX
        const playlistSection = document.querySelector(".spotifyPlaylists");
        if (playlistSection) {
            playlistSection.scrollIntoView({ behavior: "smooth" });
        }
    } else {
        // If already visible, just refocus the input (don’t hide it)
        searchInputField.focus();
    }
}

if (searchButton && searchText && searchContainer && searchInputField) {
    // Clicking search icon shows search bar
    searchButton.addEventListener("click", showSearchBar);

    // Clicking "Search" text also shows search bar
    searchText.addEventListener("click", showSearchBar);

    // ✅ Optional: hide search bar when user clicks outside or unfocuses
    searchInputField.addEventListener("blur", () => {
        setTimeout(() => searchContainer.classList.remove("active"), 200);
    });
}
}



main();
