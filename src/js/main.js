const timerBtnEl = document.querySelector(".btn--timer");
const timerEl = document.querySelector(".timer");
const progressBarEl = document.getElementById("progress-bar");

const modeMenuEl = document.querySelector(".menu");
const modeBtns = modeMenuEl.querySelectorAll(".btn");

const openModalBtn = document.querySelector(".btn--settings");
const closeModalBtn = document.querySelector(".modal__btn");
const modalEl = document.querySelector(".modal-backdrop");
const settingsFormEl = modalEl.querySelector(".modal__form");

const SECONDS_IN_MINUTE = 60;
const STORAGE_NAME = "pomoConfig";
const MAX_SHORT_BREAKS = 3;

const config = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  fontFamily: "Kumbh Sans",
  color: "red",
};

let currentMode = "pomodoro";
let currentShortBreak = 0;
let currentTime = 0;
let isPaused = true;
let timer;
let audioIsPlaying = false;

timerBtnEl.addEventListener("click", () => {
  handleTimer();
});

function handleTimer() {
  if (isPaused) {
    startTimer();
    playTickingSound();
    timerBtnEl.innerText = "pause";
  } else {
    pauseTimer();
    timerBtnEl.innerText = "start";
  }
}

function startTimer() {
  isPaused = false;
  timer = setInterval(countdown, 1000);
}
function pauseTimer() {
  isPaused = true;
  clearInterval(timer);
}

function countdown() {
  currentTime += 1;
  updateTimer();
}

function resetTimer() {
  currentTime = 0;
  timerBtnEl.innerText = "start";
}

function getTimerDuration() {
  return config[currentMode] * SECONDS_IN_MINUTE;
}

function updateTimer() {
  const duration = getTimerDuration();
  const timeleft = duration - currentTime;

  let minutes = Math.floor(timeleft / SECONDS_IN_MINUTE);
  let seconds = timeleft % SECONDS_IN_MINUTE;
  if (currentTime >= duration) {
    minutes = 0;
    seconds = 0;
    pauseTimer();
    playTimesUpSound();
    if (currentMode === "shortBreak" || currentMode === "longBreak") {
      currentMode = "pomodoro";
      showNotification("Break ended. Let's get back to work");
      switchMode("pomodoro");
      return;
    } else if (
      currentMode === "pomodoro" &&
      currentShortBreak < MAX_SHORT_BREAKS
    ) {
      switchMode("shortBreak");
      showNotification("Good work! Time to take a short break.");
      currentShortBreak++;
      return;
    } else {
      switchMode("longBreak");
      showNotification("Good work! Time to take a long break.");
      currentShortBreak = 0;
      return;
    }
  }
  const minutesString = minutes < 10 ? "0" + minutes : minutes;
  const secondsString = seconds < 10 ? "0" + seconds : seconds;
  timerEl.querySelector(".minutes").innerText = `${minutesString}`;
  timerEl.querySelector(".seconds").innerText = `${secondsString}`;
  updateProgressBar(duration);
}

function updateProgressBar(duration) {
  const radius = Number(progressBarEl.attributes.r.value);
  const circumference = (2 * Math.PI * radius).toFixed(2);
  const progress = (currentTime * circumference) / duration;

  progressBarEl.attributes["stroke-dasharray"].value = `${
    circumference - progress
  } ${progress}`;
}

modeMenuEl.addEventListener("click", (e) => {
  handleModeSelection(e);
});

function handleModeSelection(e) {
  if (
    e.target.classList.contains("btn--active") ||
    !e.target.classList.contains("btn")
  )
    return;
  deleteActiveBtnStatus();
  setActiveBtnStatus(e.target);
  switchMode(e.target.dataset.mode);
}

function switchMode(mode) {
  currentMode = mode;
  resetTimer();
  pauseTimer();
  updateTimer();
  deleteActiveBtnStatus();
  setActiveBtnStatus(modeMenuEl.querySelector(`[data-mode='${currentMode}']`));
}

function setActiveBtnStatus(btn) {
  btn.classList.add("btn--active");
}

function deleteActiveBtnStatus() {
  modeBtns.forEach((btn) => {
    btn.classList.remove("btn--active");
  });
}

function getConfigFromStorage() {
  return (storageData = JSON.parse(localStorage.getItem(STORAGE_NAME)));
}
function saveConfigToLocalStorage() {
  window.localStorage.setItem(STORAGE_NAME, JSON.stringify(config));
}

function saveStorageConfigAsConfig() {
  const storageConfig = getConfigFromStorage();
  if (storageConfig) {
    for (let key in config) {
      config[key] = storageData[key];
    }
  }
  updateDisplay();
  updateTimer();
}

openModalBtn.addEventListener("click", () => {
  openModal();
});
closeModalBtn.addEventListener("click", () => {
  closeModal();
});
settingsFormEl.addEventListener("submit", (e) => {
  submitSettingsForm(e);
});

function openModal() {
  modalEl.classList.add("modal-backdrop--active");
  document.body.classList.add("has-modal");
  setFormValues();
}

function closeModal() {
  modalEl.classList.remove("modal-backdrop--active");
  document.body.classList.remove("has-modal");
}
function setFormValues() {
  settingsFormEl.elements["pomodoro"].value = config.pomodoro;
  settingsFormEl.elements["shortBreak"].value = config.shortBreak;
  settingsFormEl.elements["longBreak"].value = config.longBreak;
  settingsFormEl.elements["fontFamily"].value = config.fontFamily;
  settingsFormEl.elements["color"].value = config.color;
}
function submitSettingsForm(e) {
  e.preventDefault();
  config.pomodoro = Number(settingsFormEl.elements["pomodoro"].value);
  config.longBreak = Number(settingsFormEl.elements["longBreak"].value);
  config.shortBreak = Number(settingsFormEl.elements["shortBreak"].value);
  config.fontFamily = settingsFormEl.elements["fontFamily"].value;
  config.color = settingsFormEl.elements["color"].value;

  updateDisplay();
  updateTimer();
  saveConfigToLocalStorage();
  closeModal();
}
function updateDisplay() {
  document.documentElement.dataset.color = config.color;
  document.documentElement.dataset.font = config.fontFamily;
}

function initNotifications() {
  if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      console.log(permission);
    });
  }
}

function showNotification(text) {
  const notification = new Notification(text, {
    icon: "../assets/notification.png",
  });
}
function playTickingSound() {
  const audio = new Audio("./sounds/clock-ticking.mp3");
  if (audioIsPlaying) return;
  audio.play();
  audioIsPlaying = true;
  audio.addEventListener("ended", () => {
    audioIsPlaying = false;
  });
}

function playTimesUpSound() {
  const audio = new Audio("./sounds/times-up.mp3");
  audio.play();
}

initNotifications();
saveStorageConfigAsConfig();
