const transcriptEl = document.querySelector('#transcript');
const statusEl = document.querySelector('#status');
const dotEl = document.querySelector('#dot');
const toggleBtn = document.querySelector('#toggle');
const clearBtn = document.querySelector('#clear');
const copyBtn = document.querySelector('#copy');
const downloadBtn = document.querySelector('#download');
const langSel = document.querySelector('#language');
const wcEl = document.querySelector('#wordCount');
const ccEl = document.querySelector('#charCount');
const timerEl = document.querySelector('#timer');

let recognition;
let listening = false;
let finalTranscript = '';
let timerId;
let startTs;

function setStatus(text, mode) {
  statusEl.textContent = text;
  dotEl.className = 'status-dot';
  if (mode === 'live') dotEl.classList.add('live');
  if (mode === 'warn') dotEl.classList.add('warn');
}

function updateCounts() {
  const text = transcriptEl.innerText.trim();
  wcEl.textContent = text ? text.split(/\s+/).length : 0;
  ccEl.textContent = text.length;
}

function formatTime(ms) {
  const sec = Math.floor(ms / 1000);
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function startTimer() {
  startTs = Date.now();
  timerId = setInterval(() => {
    timerEl.textContent = '⏱ ' + formatTime(Date.now() - startTs);
  }, 500);
}

function stopTimer() {
  clearInterval(timerId);
}

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setStatus('Speech Recognition not supported in this browser', 'warn');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = langSel.value;

  recognition.onstart = () => {
    listening = true;
    toggleBtn.textContent = '⏹ Stop Listening';
    setStatus('Listening…', 'live');
    startTimer();
  };

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (res.isFinal) finalTranscript += res[0].transcript;
      else interim += res[0].transcript;
    }
    transcriptEl.innerText = finalTranscript + interim;
    updateCounts();
  };

  recognition.onend = () => {
    listening = false;
    toggleBtn.textContent = '▶️ Start Listening';
    setStatus('Stopped');
    stopTimer();
  };

  recognition.start();
}

function stopListening() {
  if (recognition && listening) recognition.stop();
}

function toggleListening() {
  listening ? stopListening() : startListening();
}

function clearTranscript() {
  finalTranscript = '';
  transcriptEl.innerText = '';
  updateCounts();
  setStatus('Cleared');
}

async function copyTranscript() {
  try {
    await navigator.clipboard.writeText(transcriptEl.innerText);
    setStatus('Copied!');
  } catch {
    setStatus('Copy failed', 'warn');
  }
}

function downloadTranscript() {
  const text = transcriptEl.innerText;
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'transcript.txt';
  a.click();
}

// Event bindings
toggleBtn.addEventListener('click', toggleListening);
clearBtn.addEventListener('click', clearTranscript);
copyBtn.addEventListener('click', copyTranscript);
downloadBtn.addEventListener('click', downloadTranscript);
transcriptEl.addEventListener('input', updateCounts);
