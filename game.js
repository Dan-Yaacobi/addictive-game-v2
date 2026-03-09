const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const bestEl = document.getElementById('best');
const tempoEl = document.getElementById('tempo');
const queueEl = document.getElementById('queue');

const COLORS = {
  plus: '#2ff6d0',
  minus: '#ff4f9a',
  heat: '#ff9f1c',
  shell: '#263863',
  back: '#0a1122',
};

const NODE_COUNT = 8;
const MAX_HEAT = 12;
const QUEUE_LEN = 4;

const bestScore = Number(localStorage.getItem('pulse-best') || 0);
bestEl.textContent = bestScore.toString();

let state;

function randPolarity() {
  return Math.random() < 0.5 ? 'plus' : 'minus';
}

function makePulse() {
  return { polarity: randPolarity(), power: 1 + Math.floor(Math.random() * 3) };
}

function newNode() {
  return { polarity: randPolarity(), heat: Math.random() * 3 };
}

function reset() {
  state = {
    nodes: Array.from({ length: NODE_COUNT }, newNode),
    queue: Array.from({ length: QUEUE_LEN }, makePulse),
    score: 0,
    combo: 0,
    timeToPulse: 1.05,
    pulseDuration: 1.05,
    runTime: 0,
    gameOver: false,
    flash: 0,
    message: 'Align the top node!',
  };
  syncStats();
  renderQueue();
}

function syncStats() {
  scoreEl.textContent = Math.floor(state.score).toString();
  comboEl.textContent = state.combo.toString();
  tempoEl.textContent = `${(1.05 / state.pulseDuration).toFixed(2)}x`;
}

function renderQueue() {
  queueEl.innerHTML = '';
  state.queue.forEach((pulse, i) => {
    const chip = document.createElement('div');
    chip.className = 'pulse-chip';
    chip.style.color = COLORS[pulse.polarity];
    chip.style.borderColor = COLORS[pulse.polarity];
    chip.style.background = i === 0 ? '#172646' : '#101a33';
    chip.textContent = `${pulse.polarity === 'plus' ? '+' : '−'}${pulse.power}`;
    queueEl.appendChild(chip);
  });
}

function rotate(direction) {
  if (state.gameOver) return;
  if (direction > 0) {
    state.nodes.unshift(state.nodes.pop());
  } else {
    state.nodes.push(state.nodes.shift());
  }
  for (const n of state.nodes) n.heat = Math.min(MAX_HEAT, n.heat + 0.15);
}

function flipTop() {
  if (state.gameOver) return;
  const top = state.nodes[0];
  top.polarity = top.polarity === 'plus' ? 'minus' : 'plus';
  top.heat = Math.min(MAX_HEAT, top.heat + 1.4);
}

function resolvePulse() {
  const pulse = state.queue.shift();
  const top = state.nodes[0];
  const hit = top.polarity === pulse.polarity;

  if (hit) {
    state.combo += 1;
    const gain = 8 + pulse.power * 5 + state.combo * 2 + top.heat * 2;
    state.score += gain;
    top.heat = Math.max(0, top.heat - (2.2 + pulse.power * 0.4));
    state.message = `Perfect channel +${Math.floor(gain)}`;
    state.flash = 0.8;
  } else {
    state.combo = 0;
    top.heat += 2.6 + pulse.power;
    state.message = 'MISMATCH!';
    state.flash = -0.8;
  }

  for (let i = 1; i < state.nodes.length; i++) {
    state.nodes[i].heat = Math.min(MAX_HEAT, state.nodes[i].heat + 0.4 + pulse.power * 0.08);
  }

  state.queue.push(makePulse());
  state.pulseDuration = Math.max(0.34, 1.05 - state.score / 2200);
  state.timeToPulse = state.pulseDuration;

  if (state.nodes.some((n) => n.heat >= MAX_HEAT)) {
    state.gameOver = true;
    state.message = 'Circuit melted — press R';
    const best = Math.max(bestScore, Math.floor(state.score));
    if (best > bestScore) localStorage.setItem('pulse-best', String(best));
    bestEl.textContent = String(best);
  }

  syncStats();
  renderQueue();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const ringRadius = 230;

  ctx.fillStyle = COLORS.back;
  ctx.beginPath();
  ctx.arc(cx, cy, 330, 0, Math.PI * 2);
  ctx.fill();

  const progress = 1 - state.timeToPulse / state.pulseDuration;
  const pulse = state.queue[0];
  ctx.strokeStyle = COLORS[pulse.polarity];
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, 290, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
  ctx.stroke();

  for (let i = 0; i < NODE_COUNT; i++) {
    const node = state.nodes[i];
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / NODE_COUNT;
    const x = cx + Math.cos(a) * ringRadius;
    const y = cy + Math.sin(a) * ringRadius;

    ctx.fillStyle = COLORS.shell;
    ctx.beginPath();
    ctx.arc(x, y, 48, 0, Math.PI * 2);
    ctx.fill();

    const heatRatio = Math.min(1, node.heat / MAX_HEAT);
    ctx.fillStyle = node.polarity === 'plus' ? COLORS.plus : COLORS.minus;
    ctx.beginPath();
    ctx.arc(x, y, 33, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(7,11,22,0.8)';
    ctx.beginPath();
    ctx.arc(x, y, 33 * (1 - heatRatio), 0, Math.PI * 2);
    ctx.fill();

    if (i === 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, 53, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.fillStyle = '#d8e5ff';
  ctx.font = '700 30px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.message, cx, cy + 8);

  if (state.gameOver) {
    ctx.fillStyle = 'rgba(6, 8, 15, 0.65)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 56px Inter, sans-serif';
    ctx.fillText('OVERHEAT', cx, cy - 20);
    ctx.font = '600 26px Inter, sans-serif';
    ctx.fillText(`Score ${Math.floor(state.score)}`, cx, cy + 30);
  }

  if (state.flash !== 0) {
    const alpha = Math.min(0.2, Math.abs(state.flash) * 0.13);
    ctx.fillStyle = state.flash > 0 ? `rgba(47,246,208,${alpha})` : `rgba(255,79,154,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

let last = performance.now();
function tick(now) {
  const dt = Math.min(0.032, (now - last) / 1000);
  last = now;

  if (!state.gameOver) {
    state.runTime += dt;
    state.timeToPulse -= dt;
    if (state.timeToPulse <= 0) resolvePulse();
  }
  state.flash *= 0.9;
  draw();
  requestAnimationFrame(tick);
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') rotate(-1);
  if (e.code === 'ArrowRight' || e.code === 'KeyD') rotate(1);
  if (e.code === 'Space') {
    e.preventDefault();
    flipTop();
  }
  if (e.code === 'KeyR') reset();
});

reset();
requestAnimationFrame(tick);
