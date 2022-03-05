const mainButton = document.getElementById('main-btn');
const modeButtons = document.querySelector('#mode-buttons')
const buttonSound = new Audio('button-sound.mp3');

const timer = {
    pomodoro: 20,
    shortBreak: 1,
    longBreak: 10,
    longBreakInterval: 6,
    sessions: 0,
};

let interval;
mainButton.addEventListener('click', () => {
  buttonSound.play();
  const { action } = mainButton.dataset;
  if (action === 'start') {
    startTimer();
  } else {
      stopTimer();
  }
});

modeButtons.addEventListener('click', handleMode)

function handleMode(event) {
    const { mode } = event.target.dataset;

    if(!mode) return;

    switchMode(mode);
    stopTimer();
}

function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
      total: timer[mode] * 60,
      minutes: timer[mode],
      seconds: 0,
    };
  
    document
      .querySelectorAll('button[data-mode]')
      .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.querySelector('.pomodoro').style.backgroundColor = `var(--${mode})`;
  
    updateClock();
}

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;
  
    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);
  
    return {
      total,
      minutes,
      seconds,
    };
}

function startTimer() {
    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    if (timer.mode === 'pomodoro') timer.sessions++;

    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    mainButton.classList.add('active');
    mainButton.style.color = '#C8B9B9';
    mainButton.style.background = 'rgb(0, 0, 0, 0.683)' 
  
    interval = setInterval(function() {
      timer.remainingTime = getRemainingTime(endTime);
      updateClock();
  
      total = timer.remainingTime.total;
      if (total <= 0) {
        clearInterval(interval);

        /* a long break should be triggered after four consecutive pomodoro sessions */
        switch (timer.mode) {
            case 'pomodoro':
              if (timer.sessions % timer.longBreakInterval === 0) {
                switchMode('longBreak');
              } else {
                switchMode('shortBreak');
              }
              break;
            default:
              switchMode('pomodoro');
           }
           document.querySelector(`[data-sound="${timer.mode}"]`).play();

           startTimer();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(interval);

    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove('active');
    mainButton.style.background = '#C8B9B9';
    mainButton.style.color = 'rgb(0, 0, 0, 0.683)'
}

function updateClock() {
    const { remainingTime } = timer;
    /* padStart will make single digit numbers 2, ex. 8 would be 08 */
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('minutes');
    const sec = document.getElementById('seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

    /* updates the countdown in the page's title */
    const text = timer.mode === 'pomodoro' ? 'Gotta start working!' : 'You earned a break!';
    document.title = `${minutes}:${seconds} — ${text}`;
}