let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

//getting all the songs from server
async function getSongs(folder) {

    currFolder = folder
    let a = await fetch(`/${folder}`)
    let response = await a.text();
    let div = document.createElement('div')
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`${folder}`)[1])
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                                                    <img class="invert" src="img/music.svg" alt="">
                                                    <div class="info">
                                                        <div>${song.replaceAll("%20", " ")}</div>
                                                        <div>Harshal</div>
            
                                                    </div>
                                                    <div class="playnow justify-center items-center">
                                                        <span>Play Now</span>
                                                        <img id="playnow" class="invert playnow" src="img/play.svg" alt="">
                                                    </div>
                                                 </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            play.src = "img/pause.svg"
        })
    })

    return songs

}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement('div')
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = (e.href.split("/").slice(-1)[0])
            //Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder = "${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="50" fill="#1fdf64" />
                    <svg xmlns="http://www.w3.org/2000/svg" x="25%" y="25%" width="50%" height="50%"
                        viewBox="0 0 24 24" fill="black" class="injected-svg"
                        data-src="/icons/play-stroke-sharp.svg" role="img" color="#000000"
                        preserveAspectRatio="xMidYMid meet">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#000000" stroke-width="1.5"
                            stroke-linejoin="round"></path>
                    </svg>
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="poster">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    //Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {


        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}/`)
            playMusic(songs[0])
            play.src = "img/pause.svg"
        })
    })

}


async function main() {

    document.querySelector(".range").getElementsByTagName("input")[0].value = 100

    //get the list of all the songs
    await getSongs(`songs/ncs/`)
    playMusic(songs[0], true)



    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //Display all the albums on the page
    displayAlbums()

    //Add an eventListener to previous
    previous.addEventListener('click', () => {

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
            play.src = "img/pause.svg"
        }
    })

    //Add an eventListener to next
    next.addEventListener('click', () => {

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
            play.src = "img/pause.svg"
        }
    })

    //Listen for TimeUpdate Event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //Add an eventListener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add an eventListener to Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })

    //Add an eventListener to CloseHam
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -130 + "%"
    })



    //Add an eventListener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes(("volume.svg"))){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.5
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100
        }
    })


}


main()

//3:18:15
