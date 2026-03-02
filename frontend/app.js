/* ================= CONFIG ================= */

const START = new Date("2026-03-03");
const END = new Date("2026-03-10");

const GOALS = [
  { name: "Slept by 9:30", icon: "🛌" },
  { name: "Woke at 4:00", icon: "⏰" },
  { name: "Exercise", icon: "🏋️" },
  { name: "UX/UI 5–6 AM", icon: "🎨" }
];

/* ================= ELEMENTS ================= */

const goalsSection = document.getElementById("goalsSection");
const heatmap = document.getElementById("heatmap");

const overallRing = document.getElementById("overallRing");
const overallPercent = document.getElementById("overallPercent");

const gradeText = document.getElementById("gradeText");
const gradeBar = document.getElementById("gradeBar");
const gradeNext = document.getElementById("gradeNext");

const streakNow = document.getElementById("streakNow");
const streakBest = document.getElementById("streakBest");

/* ================= STATE ================= */

let dates = [];
let entries = [];

/* ================= DATE GENERATION ================= */

for (let d = new Date(START); d <= END; d.setDate(d.getDate() + 1)) {
  dates.push({
    iso: d.toISOString().split("T")[0],
    label: d.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric"
    })
  });
}

/* ================= STORAGE ================= */

function load() {
  const stored = localStorage.getItem("entries");
  entries = stored ? JSON.parse(stored) : [];
  render();
}

function saveToStorage() {
  localStorage.setItem("entries", JSON.stringify(entries));
}

/* ================= RENDER ALL ================= */

function render() {
  renderGoals();
  renderHeatmap();
  renderOverall();
  renderGrade();
  renderStreaks();
}

/* ================= GOALS ================= */

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

      const existing = entries.find(e =>
        e.habit === goal.name &&
        e.date === date.iso &&
        e.done
      );

      if (existing) cell.classList.add("active");

      cell.onclick = () => {
        const active = cell.classList.toggle("active");

        const idx = entries.findIndex(e =>
          e.habit === goal.name &&
          e.date === date.iso
        );

        if (idx >= 0) {
          entries[idx].done = active;
        } else {
          entries.push({
            habit: goal.name,
            date: date.iso,
            done: active
          });
        }

        saveToStorage();
        render();
      };

      grid.appendChild(cell);
    });

    goalsSection.appendChild(row);
  });
}

/* ================= HEATMAP ================= */

function renderHeatmap() {
  heatmap.innerHTML = "";

  dates.forEach(date => {
    const doneCount = entries.filter(e =>
      e.date === date.iso && e.done
    ).length;

    const percent = (doneCount / GOALS.length) * 100;

    let cls = "";
    if (percent === 100) cls = "perfect";
    else if (percent >= 67) cls = "strong";
    else if (percent >= 34) cls = "ok";
    else if (percent > 0) cls = "weak";

    const box = document.createElement("div");
    box.className = `day-box ${cls}`;
    heatmap.appendChild(box);
  });
}

/* ================= OVERALL CIRCLE ================= */

function renderOverall() {
  const total = GOALS.length * dates.length;
  const done = entries.filter(e => e.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  overallRing.style.background =
    `conic-gradient(#111 ${percent}%, #E5E7EB 0%)`;

  overallPercent.textContent = `${percent}%`;
}

/* ================= GRADE ================= */

function renderGrade() {
  const total = GOALS.length * dates.length;
  const done = entries.filter(e => e.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  let grade = "D";
  if (percent >= 90) grade = "S";
  else if (percent >= 80) grade = "A";
  else if (percent >= 70) grade = "B";
  else if (percent >= 60) grade = "C";

  gradeText.textContent = `Grade ${grade} — ${percent}%`;

  gradeBar.className = `grade-fill ${grade}`;
  gradeBar.style.width = `${percent}%`;

  const nextTier = { D: 60, C: 70, B: 80, A: 90 };

  gradeNext.textContent =
    grade === "S"
      ? "Elite tier reached"
      : `${Math.max(0, nextTier[grade] - percent)}% to next rank`;
}

/* ================= STREAKS ================= */

function renderStreaks() {
  let current = 0;
  let best = 0;

  dates.forEach(date => {
    const full = entries.filter(e =>
      e.date === date.iso && e.done
    ).length === GOALS.length;

    if (full) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  });

  streakNow.textContent = current;
  streakBest.textContent = best;
}

function goalStreak(goalName) {
  let streak = 0;

  for (let i = dates.length - 1; i >= 0; i--) {
    const entry = entries.find(e =>
      e.habit === goalName &&
      e.date === dates[i].iso &&
      e.done
    );

    if (entry) streak++;
    else break;
  }

  return streak;
}

/* ================= START ================= */

load();
