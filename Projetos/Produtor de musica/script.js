const player = document.querySelector("#player")
const musicName = document.querySelector("#musicName")
const playPauseButton = document.querySelector("#playPauseButton")
const prevButton = document.querySelector("#prevButton")
const nextButton = document.querySelector("#nextButton")
const totaltime = document.querySelector("#totaltime")
const lastTime = document.querySelector("#lastTime")
const track = document.querySelector(".track")
const progess = document.querySelector(".progress")

import songs from "./songs.js"

const textButtonPlay = "<i class='bx bx-caret-right'></i>"
const textButtonPause = "<i class='bx bx-pause'></i>"

let index = 0

prevButton.onclick = () => prevNxtMusic("prev")
nextButton.onclick = () => prevNxtMusic()

playPauseButton.onclick = () => playPause()

const playPause = () => {
  if (player.paused) {
    player.play();
    playPauseButton.innerHTML = textButtonPause;
  } else {
    player.pause();
    playPauseButton.innerHTML = textButtonPlay;
  }
};

const prevNxtMusic = (type = "next") => {
  if ((type == "next" && index + 1 === songs.length) || type === "init") {
    index = 0;
  } else if (type == "prev" && index === 0) {
    index = songs.length;
  } else {
    index = type === "prev" && index ? index - 1 : index + 1;
  }

  player.src = songs[index].src;
  musicName.innerHTML = songs[index].name;
  if (type !== "init") playerPause();
}

prevNxtMusic("init")
