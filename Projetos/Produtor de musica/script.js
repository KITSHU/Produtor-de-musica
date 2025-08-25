const player = document.querySelector("#player")
const musicName = document.querySelector("#musicName")
const playPauseButton = document.querySelector("#playPauseButton")
const prevButton = document.querySelector("#prevButton")
const nextButton = document.querySelector("#nextButton")
const progressBar = document.querySelector(".progress-bar")
const currentTime = document.querySelector("#currentTime")
const duration = document.querySelector("#duration")
const footer = document.querySelector(".footer")
const progress = document.querySelector(".progress")
const cover = document.querySelector("#cover")

import songs from "./songs.js"

const textButtonPlay = "<i class='bx bx-caret-right'></i>"
const textButtonPause = "<i class='bx bx-pause'></i>"

let index = 0

prevButton.onclick = () => prevNxtMusic("prev")
nextButton.onclick = () => prevNxtMusic()

playPauseButton.onclick = () => playPause()

const playPause = () => {
  if (player.paused) {
    player.play()
    playPauseButton.innerHTML = textButtonPause
  } else {
    player.pause()
    playPauseButton.innerHTML = textButtonPlay
  }
}

player.ontimeupdate = () => updateTime()

const updateTime = () => {
  const currentMinutes = Math.floor(player.currentTime / 60)
  const currentSeconds = Math.floor(player.currentTime % 60)
  currentTime.textContent = currentMinutes + ":" + formatZero(currentSeconds)

  const durationFormatted = isNaN(player.duration) ? 0 : player.duration
  const durationMinutes = Math.floor(durationFormatted / 60)
  const durationSeconds = Math.floor(durationFormatted % 60)
  duration.textContent = durationMinutes + ":" + formatZero(durationSeconds)

  const progressWidth = durationFormatted
    ? (player.currentTime / durationFormatted) * 100
    : 0
  progress.style.width = progressWidth + "%"
}

const formatZero = (n) => (n < 10 ? "0" + n : n)

progressBar.onclick = (e) => {
  const newTime = (e.offsetX / progressBar.offsetWidth) * player.duration
  player.currentTime = newTime
}

const prevNxtMusic = (type = "next") => {
  if ((type == "next" && index + 1 === songs.length) || type === "init") {
    index = 0
  } else if (type == "prev" && index === 0) {
    index = songs.length - 1
  } else {
    index = type === "prev" && index ? index - 1 : index + 1
  }

  player.src = songs[index].src
  musicName.innerHTML = songs[index].name
  cover.src = songs[index].cover ?? "./asset/download.jpeg"

  // Remove todas as soundwaves dos elementos .geral
  document.querySelectorAll(".geral .soundwave").forEach((sw) => sw.remove())

  // Adiciona a soundwave apenas no .geral da música atual
  const listaGeral = document.querySelectorAll(".geral")
  if (listaGeral[index]) {
    const iquali = listaGeral[index].querySelector(".iquali")
    if (iquali) {
      iquali.appendChild(criarSoundwave())
    }
  }

  if (type !== "init") {
    player.load() // força o carregamento do novo src
    player.onloadeddata = () => {
      player.play().catch(() => {}) // ignora erros de autoplay
      playPauseButton.innerHTML = textButtonPause
      player.onloadeddata = null
    }
  } else {
    playPauseButton.innerHTML = textButtonPlay
  }

  updateTime()
}

prevNxtMusic("init")

function criarSoundwave() {
  const div = document.createElement("div")
  div.className = "soundwave"
  for (let i = 0; i < 5; i++) {
    const bar = document.createElement("div")
    bar.className = "bar"
    div.appendChild(bar)
  }
  return div
}

let audioContext, analyser, source, dataArray, animationId

function iniciarVisualizacao() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(player);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 32;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  animarSoundwave();
}

function animarSoundwave() {
  analyser.getByteFrequencyData(dataArray)
  const bars = document
    .querySelectorAll(".geral")
    [index]?.querySelectorAll(".soundwave .bar")
  if (bars) {
    for (let i = 0; i < bars.length; i++) {
      const valor = dataArray[i + 1] || 0
      const altura = Math.max(5, Math.min(40, valor / 15 + 10))
      bars[i].style.height = altura + "px"
    }
  }
  animationId = requestAnimationFrame(animarSoundwave)
}

// Inicie a visualização ao tocar a música
player.onplay = iniciarVisualizacao
player.onpause = () => {
  if (audioContext) audioContext.suspend()
}
player.onended = () => {
  if (audioContext) audioContext.close()
  cancelAnimationFrame(animationId)
}

const volumeControl = document.getElementById("volumeControl")
if (volumeControl) {
  volumeControl.addEventListener("input", function () {
    player.volume = this.value
  })
}
