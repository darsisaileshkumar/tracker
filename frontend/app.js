const API = null;

const START = new Date("2026-03-03");
const END = new Date("2026-03-10");

const GOALS = [
  { name: "Slept by 9:30", icon: "🛌" },
  { name: "Woke at 4:00", icon: "⏰" },
  { name: "Exercise", icon: "🏋️" },
  { name: "UX/UI 5–6 AM", icon: "🎨" }
];

const goalsSection = document.getElementById("goalsSection");
const heatmap = document.getElementById("heatmap");

const overallRing = document.getElementById("overallRing");
const overallPercent = document.getElementById("overallPercent");

const gradeText = document.getElementById("gradeText");
const gradeBar = document.getElementById("gradeBar");
const gradeNext = document.getElementById("gradeNext");

const streakNow = document.getElementById("streakNow");
const streakBest = document.getElementById("streakBest");

let dates = [];
let entries = [];

/* Generate Dates */
for (let d = new Date(START); d <= END; d.setDate(d.getDate() + 1)) {
  dates.push({
    iso: d.toISOString().split("T")[0],
    label: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })
  });
}

/* Load */
async function load() {
  const res = await fetch(`${API}/entries`);
  entries = await res.json();
  render();
}

/* Render All */
function render() {
  renderGoals();
  renderHeatmap();
  renderOverall();
  renderGrade();
  renderStreaks();
}

/* Goals */
function renderGoals() {
  goalsSection.innerHTML = "";

  GOALS.forEach(goal => {
    const row = document.createElement("div");
    row.className = "goal-row";

    row.innerHTML = `
      <div class="goal-header">
        <span>${goal.icon} ${goal.name}</span>
        <span class="streak">${goalStreak(goal.name)}d</span>
      </div>
      <div class="date-header">
        ${dates.map(d => `<div>${d.label}</div>`).join("")}
      </div>
      <div class="goal-grid"></div>
    `;

    const grid = row.querySelector(".goal-grid");

    dates.forEach(date => {
      const cell = document.createElement("div");
      cell.className = "goal-cell";

      if (entries.find(e => e.habit === goal.name && e.date === date.iso && e.done)) {
        cell.classList.add("active");
      }

      cell.onclick = async () => {
        const active = cell.classList.toggle("active");

        const idx = entries.findIndex(e => e.habit === goal.name && e.date === date.iso);
        if (idx >= 0) entries[idx].done = active;
        else entries.push({ habit: goal.name, date: date.iso, done: active });

        render();
        await save(goal.name, date.iso, active);
      };

      grid.appendChild(cell);
    });

    goalsSection.appendChild(row);
  });
}

/* Heatmap */
function renderHeatmap() {
  heatmap.innerHTML = "";

  dates.forEach(date => {
    const done = entries.filter(e => e.date === date.iso && e.done).length;
    const pct = (done / GOALS.length) * 100;

    let cls = "";
    if (pct === 100) cls = "perfect";
    else if (pct >= 67) cls = "strong";
    else if (pct >= 34) cls = "ok";
    else if (pct > 0) cls = "weak";

    const box = document.createElement("div");
    box.className = `day-box ${cls}`;
    heatmap.appendChild(box);
  });
}

/* Overall Circle */
function renderOverall() {
  const total = GOALS.length * dates.length;
  const done = entries.filter(e => e.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  overallRing.style.background =
    `conic-gradient(#111 ${pct}%, #E5E7EB 0%)`;

  overallPercent.textContent = `${pct}%`;
}

/* Grade */
function renderGrade() {
  const total = dates.length * GOALS.length;
  const done = entries.filter(e => e.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  let grade = "D";
  if (pct >= 90) grade = "S";
  else if (pct >= 80) grade = "A";
  else if (pct >= 70) grade = "B";
  else if (pct >= 60) grade = "C";

  gradeText.textContent = `Grade ${grade} — ${pct}%`;
  gradeBar.className = `grade-fill ${grade}`;
  gradeBar.style.width = `${pct}%`;

  const nextMap = { D: 60, C: 70, B: 80, A: 90 };
  gradeNext.textContent =
    grade === "S"
      ? "Elite tier reached"
      : `${nextMap[grade] - pct}% to reach next rank`;
}

/* Streaks */
function renderStreaks() {
  let current = 0, best = 0;

  dates.forEach(d => {
    const full = entries.filter(e => e.date === d.iso && e.done).length === GOALS.length;
    if (full) {
      current++;
      best = Math.max(best, current);
    } else current = 0;
  });

  streakNow.textContent = current;
  streakBest.textContent = best;
}

function goalStreak(name) {
  let s = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    if (entries.find(e => e.habit === name && e.date === dates[i].iso && e.done)) s++;
    else break;
  }
  return s;
}

async function save(habit, date, done) {
  await fetch(`${API}/entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ habit, date, done })
  });
}

load();
