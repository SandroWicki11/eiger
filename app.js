/* ============================================
   EIGER ULTRA TRAINING - MAIN SCRIPT
   ============================================ */

// ── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  raceDate: new Date('2026-07-18T07:00:00'),
  athlete: {
    name: 'Athlete',
    age: 27,
    weight: 78,
    height: 181,
    maxHR: 207,
    z2MaxHR: 165,
    currentZ2Pace: '7:30',
    weeklyVolume: [20, 40],
    longestRun: 35,
  },
  race: {
    name: 'Eiger Ultra E51',
    distance: 51,
    elevation: 3100,
    elevationLoss: 3100,
    cutoff: 13,
    location: 'Grindelwald, Switzerland',
    maxAlt: 2680,
  }
};

// ── HR ZONES (based on max HR 207, Z2 cap 165) ──────────────────────────────
const HR_ZONES = [
  { zone: 1, name: 'Recovery',   min: 104, max: 145, pct: '50–70%', desc: 'Active recovery, easy walks', color: '#88c0a8', usage: '10%' },
  { zone: 2, name: 'Aerobic Base', min: 145, max: 165, pct: '70–80%', desc: '80% of all runs — your primary zone', color: '#5a9fd4', usage: '80%' },
  { zone: 3, name: 'Tempo',      min: 165, max: 178, pct: '80–86%', desc: 'Limited use, avoid for now', color: '#e8a73a', usage: '5%' },
  { zone: 4, name: 'Threshold',  min: 178, max: 193, pct: '86–93%', desc: 'Race-day surges only', color: '#e06b3a', usage: '3%' },
  { zone: 5, name: 'Maximal',    min: 193, max: 207, pct: '93–100%', desc: 'Not relevant to plan', color: '#c4422d', usage: '2%' },
];

// ── TRAINING PHASES ──────────────────────────────────────────────────────────
const PHASES = [
  {
    id: 1, name: 'Base Building',
    start: 'Mar 2026', end: 'Apr 2026',
    weeks: 7, status: 'active',
    weeklyKm: '30–40 km',
    longRun: '18–25 km',
    elevation: 'Flat / gentle',
    desc: 'Build aerobic base with consistent Z2 running. Keep strength 2×/week. Focus on getting Z2 pace faster through volume.',
    chips: ['30–40 km/week', '2× Strength', 'Z2 focus', 'Flat terrain']
  },
  {
    id: 2, name: 'Elevation Development',
    start: 'May 2026', end: 'Jun 2026',
    weeks: 6, status: 'upcoming',
    weeklyKm: '40–50 km',
    longRun: '25–32 km',
    elevation: 'Trail weekends +800m+',
    desc: 'Introduce consistent hill and trail work. Back-to-back long runs on weekends to simulate race fatigue. Strength reduced to 1× maintenance.',
    chips: ['40–50 km/week', '1× Strength', 'Trail Sat+Sun', '800–1500m+ per long run']
  },
  {
    id: 3, name: 'Race-Specific Peak',
    start: 'Late Jun 2026', end: 'Early Jul 2026',
    weeks: 4, status: 'upcoming',
    weeklyKm: '45–55 km',
    longRun: '30–35 km',
    elevation: 'Trail +1500–2000m+',
    desc: 'Maximum specificity — long trail days with high vert. Simulate race conditions. Include 1–2 runs approaching 35 km max. Nutrition practice every long run.',
    chips: ['45–55 km/week', '1× Maintenance', '1500–2000m+', 'Fueling practice']
  },
  {
    id: 4, name: 'Taper',
    start: 'Jul 2026', end: 'Jul 18',
    weeks: 2, status: 'upcoming',
    weeklyKm: '20–25 km',
    longRun: '14–18 km easy',
    elevation: 'Minimal',
    desc: 'Sharp volume reduction. Keep frequency, cut distance 40–50%. Legs stay fresh. Nutrition carb-loading last 3 days. Light strength 1× first week, none second.',
    chips: ['20–25 km/week', 'Easy only', 'Carb load', 'Race prep']
  },
];

// ── WEEKLY PLAN TEMPLATE (per phase) ────────────────────────────────────────
const WEEKLY_TEMPLATES = {
  base: [
    { day: 'Mon', type: 'strength', tag: 'tag-strength', workout: 'Strength A', detail: 'Upper body focus', distance: null },
    { day: 'Tue', type: 'run', tag: 'tag-run', workout: 'Z2 Run', detail: 'Easy aerobic', distance: '8–10 km' },
    { day: 'Wed', type: 'run', tag: 'tag-run', workout: 'Z2 Run', detail: 'Easy aerobic', distance: '8–10 km' },
    { day: 'Thu', type: 'strength', tag: 'tag-strength', workout: 'Strength B', detail: 'Lower body focus', distance: null },
    { day: 'Fri', type: 'run', tag: 'tag-run', workout: 'Z2 Run', detail: 'Easy aerobic', distance: '6–8 km' },
    { day: 'Sat', type: 'long', tag: 'tag-long', workout: 'Long Run', detail: 'Z2 — hilly if possible', distance: '18–25 km' },
    { day: 'Sun', type: 'rest', tag: 'tag-rest', workout: 'Rest', detail: 'Full recovery', distance: null },
  ],
  elevation: [
    { day: 'Mon', type: 'rest', tag: 'tag-rest', workout: 'Rest', detail: 'Recovery from weekend', distance: null },
    { day: 'Tue', type: 'run', tag: 'tag-run', workout: 'Z2 Run', detail: 'Easy aerobic', distance: '10 km' },
    { day: 'Wed', type: 'strength', tag: 'tag-strength', workout: 'Strength A', detail: 'Maintain upper/lower', distance: null },
    { day: 'Thu', type: 'run', tag: 'tag-run', workout: 'Z2 Run', detail: 'Easy aerobic', distance: '10 km' },
    { day: 'Fri', type: 'run', tag: 'tag-run', workout: 'Z2 Run', detail: 'Easy shorter', distance: '6–8 km' },
    { day: 'Sat', type: 'trail', tag: 'tag-trail', workout: 'Trail Long', detail: 'Elevation focus', distance: '25–30 km' },
    { day: 'Sun', type: 'trail', tag: 'tag-trail', workout: 'Trail Back-to-Back', detail: 'Tired legs training', distance: '15–20 km' },
  ],
  peak: [
    { day: 'Mon', type: 'rest', tag: 'tag-rest', workout: 'Rest', detail: 'Full recovery', distance: null },
    { day: 'Tue', type: 'run', tag: 'tag-run', workout: 'Z2 Run', detail: 'Aerobic flush', distance: '10–12 km' },
    { day: 'Wed', type: 'strength', tag: 'tag-strength', workout: 'Strength (light)', detail: 'Maintenance only', distance: null },
    { day: 'Thu', type: 'run', tag: 'tag-run', workout: 'Z2 Run', detail: 'Steady easy', distance: '10 km' },
    { day: 'Fri', type: 'run', tag: 'tag-run', workout: 'Easy', detail: 'Pre-long-run prep', distance: '6 km' },
    { day: 'Sat', type: 'trail', tag: 'tag-trail', workout: 'Peak Long Run', detail: 'Race simulation', distance: '30–35 km' },
    { day: 'Sun', type: 'trail', tag: 'tag-trail', workout: 'Vert Back-to-Back', detail: 'Alpine terrain', distance: '14–18 km' },
  ],
  taper: [
    { day: 'Mon', type: 'rest', tag: 'tag-rest', workout: 'Rest', detail: 'Recovery', distance: null },
    { day: 'Tue', type: 'run', tag: 'tag-run', workout: 'Easy Run', detail: 'Keep legs moving', distance: '5–6 km' },
    { day: 'Wed', type: 'strength', tag: 'tag-strength', workout: 'Strength (light)', detail: 'Week 1 only', distance: null },
    { day: 'Thu', type: 'run', tag: 'tag-run', workout: 'Easy Run', detail: 'Z1–Z2 only', distance: '5–6 km' },
    { day: 'Fri', type: 'rest', tag: 'tag-rest', workout: 'Rest', detail: 'Fresh legs', distance: null },
    { day: 'Sat', type: 'run', tag: 'tag-run', workout: 'Short Easy', detail: 'Shakeout', distance: '8–10 km' },
    { day: 'Sun', type: 'rest', tag: 'tag-rest', workout: 'Rest', detail: 'Rest & prep', distance: null },
  ]
};

// ── STRENGTH PLAN ────────────────────────────────────────────────────────────
const STRENGTH_A = {
  title: 'Session A — Upper Emphasis',
  day: 'Monday',
  exercises: [
    { name: 'Pull-Ups', sets: '4', reps: '6–10', note: 'Weighted if >10 reps easy', tag: 'ex-key' },
    { name: 'Overhead Shoulder Press', sets: '4', reps: '8–12', note: 'Dumbbell or barbell', tag: 'ex-key' },
    { name: 'Lateral Raises', sets: '3', reps: '12–15', note: 'Controlled eccentric', tag: 'ex-key' },
    { name: 'Bulgarian Split Squat', sets: '3', reps: '8–10 each', note: 'Primary lower body compound', tag: 'ex-key' },
    { name: 'Single-Leg Calf Raise', sets: '3', reps: '15–20 each', note: 'Essential for descents', tag: 'ex-core' },
    { name: 'Plank / Side Plank', sets: '3', reps: '30–45s each', note: 'Core stability', tag: 'ex-core' },
  ]
};

const STRENGTH_B = {
  title: 'Session B — Lower & Pull Emphasis',
  day: 'Thursday',
  exercises: [
    { name: 'Lunges (Walking or Reverse)', sets: '4', reps: '10–12 each', note: 'Hip extension, trail power', tag: 'ex-key' },
    { name: 'Pull-Ups', sets: '3', reps: '5–8', note: 'Maintenance volume', tag: 'ex-maintain' },
    { name: 'Lateral Raises', sets: '3', reps: '12–15', note: 'Same as Session A', tag: 'ex-maintain' },
    { name: 'Step-Ups (High Box)', sets: '3', reps: '10 each', note: 'Mimics climbing', tag: 'ex-key' },
    { name: 'Hip Thrust / Glute Bridge', sets: '3', reps: '12–15', note: 'Uphill drive power', tag: 'ex-key' },
    { name: 'Dead Bug', sets: '3', reps: '8 each side', note: 'Anti-rotation core', tag: 'ex-core' },
  ]
};

// ── NUTRITION GUIDE ──────────────────────────────────────────────────────────
const NUTRITION = {
  beforeLong: [
    { time: '3h before', item: 'Oats + banana + honey', carbs: '80–100g', notes: 'Main fuel load' },
    { time: '1h before', item: 'Ripe banana or toast', carbs: '30–40g', notes: 'Top up glycogen' },
    { time: '15min before', item: 'Water 400–500ml', carbs: '—', notes: 'Hydration prime' },
  ],
  during: [
    { rule: 'Carbs per hour', value: '60–90g after 60 min', icon: '⚡' },
    { rule: 'Gel / chews', value: 'Every 45 min from km 20', icon: '🧃' },
    { rule: 'Hydration', value: '400–600ml/h (adjust for heat)', icon: '💧' },
    { rule: 'Electrolytes', value: 'Sodium tab every 60–90 min on race day', icon: '🧂' },
    { rule: 'Real food', value: 'Aid stations — broth, banana, potato', icon: '🥔' },
  ],
  recovery: [
    { window: 'Within 30 min', item: 'Recovery shake or milk + banana', ratio: '3:1 carb:protein' },
    { window: '1–2 hours', item: 'Full meal — rice, chicken, veg', ratio: 'High carb, moderate protein' },
    { window: 'Day after long run', item: 'Extra carbs + sleep priority', ratio: 'Glycogen rebuild' },
  ]
};

// ── RACE DAY TIPS ────────────────────────────────────────────────────────────
const RACE_TIPS = [
  { icon: '🐢', title: 'Start conservative', text: 'First 10 km should feel embarrassingly easy. The elevation comes later.' },
  { icon: '⛰️', title: 'Hike the steep climbs', text: 'Power hiking with poles on 15%+ gradients is faster and saves your legs for the flats.' },
  { icon: '💧', title: 'Eat before you\'re hungry', text: 'Start fueling at 45 min in. Never let glycogen crash — it\'s hard to recover mid-race.' },
  { icon: '📉', title: 'Descents are costly', text: 'Control your speed on the 3100m of descent. Quad damage accumulates fast.' },
  { icon: '🌡️', title: 'Alpine weather', text: 'Grindelwald weather changes fast. Pack a light layer even if it\'s warm at the start.' },
  { icon: '🎽', title: 'Nothing new on race day', text: 'Gear, shoes, nutrition — only use items you\'ve trained with.' },
];

// ── GEAR LIST ────────────────────────────────────────────────────────────────
const GEAR = [
  { icon: '👟', item: 'Trail running shoes' },
  { icon: '🎒', item: 'Race vest (1.5–2L water)' },
  { icon: '🥢', item: 'Trekking poles (mandatory)' },
  { icon: '🧥', item: 'Emergency foil blanket' },
  { icon: '📱', item: 'Charged phone' },
  { icon: '💊', item: 'Blister kit & pain relief' },
  { icon: '🕶️', item: 'Sunglasses & sun cream' },
  { icon: '🧃', item: 'Race nutrition (gels/bars)' },
  { icon: '🧦', item: 'Compression socks' },
  { icon: '🧂', item: 'Electrolyte tabs' },
  { icon: '🌧️', item: 'Lightweight rain jacket' },
  { icon: '🔦', item: 'Headlamp (just in case)' },
];

// ── STATE ────────────────────────────────────────────────────────────────────
let currentSection = 'dashboard';
let currentWeekOffset = 0; // relative to current week

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCountdown();
  renderDashboard();
  renderHRZones();
  renderPhaseTimeline();
  renderCalendar();
  renderStrength();
  renderNutrition();
  renderRaceDay();
  renderVolumeBars();
});

function renderVolumeBars() {
  const container = document.getElementById('volume-bars');
  if (!container) return;
  // Weekly km values representing progression over 19 weeks
  const weeks = [
    30, 32, 35, 33, 38, 36, 40, // Base (7 weeks)
    42, 45, 44, 48, 46, 50,     // Elevation (6 weeks)
    50, 52, 55, 50,              // Peak (4 weeks)
    28, 22                       // Taper (2 weeks)
  ];
  const maxKm = Math.max(...weeks);
  const colors = [
    ...Array(7).fill('var(--accent)'),
    ...Array(6).fill('var(--mountain)'),
    ...Array(4).fill('var(--green)'),
    ...Array(2).fill('var(--amber)'),
  ];
  container.innerHTML = weeks.map((km, i) => {
    const h = Math.round((km / maxKm) * 100);
    return `<div class="elev-bar" style="height:${h}%;background:${colors[i]};opacity:0.75" title="Week ${i+1}: ~${km} km"></div>`;
  }).join('');
}

// ── NAVIGATION ───────────────────────────────────────────────────────────────
function initNav() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      setSection(section);
    });
  });

  const prevBtn = document.getElementById('week-prev');
  const nextBtn = document.getElementById('week-next');
  if (prevBtn) prevBtn.addEventListener('click', () => changeWeek(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeWeek(1));
}

function setSection(section) {
  currentSection = section;

  // Update nav items
  document.querySelectorAll('.nav-item[data-section]').forEach(el => {
    el.classList.toggle('active', el.dataset.section === section);
  });

  // Update sections
  document.querySelectorAll('.section').forEach(el => {
    el.classList.toggle('active', el.id === `section-${section}`);
  });
}

// ── COUNTDOWN ────────────────────────────────────────────────────────────────
function initCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 60000);
}

function updateCountdown() {
  const now = new Date();
  const diff = CONFIG.raceDate - now;

  if (diff <= 0) {
    setCountdownDisplay('Race Day!', '0', '0', '0', '0');
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const weeks = Math.floor(days / 7);
  const remDays = days % 7;

  // Sidebar mini
  const cdDays = document.getElementById('cd-days');
  const cdSub = document.getElementById('cd-sub');
  if (cdDays) cdDays.textContent = days;
  if (cdSub) cdSub.textContent = `${weeks}w ${remDays}d until race`;

  // Hero countdown
  const cdWks = document.getElementById('cd-weeks');
  const cdD = document.getElementById('cd-rdays');
  const cdH = document.getElementById('cd-hours');
  const cdM = document.getElementById('cd-mins');
  if (cdWks) cdWks.textContent = String(weeks).padStart(2, '0');
  if (cdD) cdD.textContent = String(remDays).padStart(2, '0');
  if (cdH) cdH.textContent = String(hours).padStart(2, '0');
  if (cdM) cdM.textContent = String(minutes).padStart(2, '0');
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function renderDashboard() {
  // Progress bars are static via HTML, just animate on load
  setTimeout(() => {
    document.querySelectorAll('.progress-fill').forEach(el => {
      const target = el.dataset.width;
      if (target) el.style.width = target;
    });
  }, 200);
}

// ── HR ZONES ─────────────────────────────────────────────────────────────────
function renderHRZones() {
  const tableBody = document.getElementById('zone-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = HR_ZONES.map(z => `
    <tr>
      <td><span class="zone-dot" style="background:${z.color}"></span>Z${z.zone}</td>
      <td><strong>${z.name}</strong></td>
      <td style="font-family:var(--font-mono);font-size:12px">${z.min}–${z.max} bpm</td>
      <td style="font-family:var(--font-mono);font-size:12px;color:var(--text-muted)">${z.pct}</td>
      <td style="font-family:var(--font-mono);font-size:12px;color:var(--accent);font-weight:600">${z.usage}</td>
      <td style="font-size:12px;color:var(--text-muted)">${z.desc}</td>
    </tr>
  `).join('');
}

// ── PHASE TIMELINE ────────────────────────────────────────────────────────────
function renderPhaseTimeline() {
  const container = document.getElementById('phase-timeline');
  if (!container) return;

  container.innerHTML = PHASES.map(p => `
    <div class="phase-item">
      <div class="phase-dot ${p.status === 'active' ? 'active' : p.status === 'done' ? 'done' : ''}"></div>
      <div class="phase-content">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <div class="phase-name">${p.name}</div>
          ${p.status === 'active' ? '<span class="badge badge-accent">Current</span>' : ''}
        </div>
        <div class="phase-dates">${p.start} → ${p.end} · ${p.weeks} weeks</div>
        <div class="phase-desc">${p.desc}</div>
        <div class="phase-vol">
          ${p.chips.map(c => `<span class="phase-chip">${c}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// ── CALENDAR ─────────────────────────────────────────────────────────────────
function renderCalendar() {
  const template = getCurrentTemplate();
  renderWeekView(template);
  updateWeekLabel();
}

function getCurrentTemplate() {
  // Simple phase logic: base for now (March 2026)
  const now = new Date();
  const month = now.getMonth(); // 0=Jan
  if (month < 4) return WEEKLY_TEMPLATES.base;       // Jan–Apr
  if (month < 6) return WEEKLY_TEMPLATES.elevation;  // May–Jun
  if (month < 7) return WEEKLY_TEMPLATES.peak;       // Jul (early)
  return WEEKLY_TEMPLATES.taper;
}

function getPhaseForOffset(offset) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + offset * 7);
  const month = targetDate.getMonth();
  if (month < 4) return { template: WEEKLY_TEMPLATES.base, label: 'Base Building' };
  if (month < 6) return { template: WEEKLY_TEMPLATES.elevation, label: 'Elevation Dev' };
  if (month < 7) return { template: WEEKLY_TEMPLATES.peak, label: 'Race-Specific Peak' };
  return { template: WEEKLY_TEMPLATES.taper, label: 'Taper' };
}

function renderWeekView(template) {
  const container = document.getElementById('calendar-grid');
  if (!container) return;

  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + mondayOffset + (currentWeekOffset * 7));

  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const phase = getPhaseForOffset(currentWeekOffset);
  const tmpl = phase.template;

  // Update phase tag
  const phaseTag = document.getElementById('week-phase-tag');
  if (phaseTag) phaseTag.textContent = phase.label;

  container.innerHTML = tmpl.map((d, i) => {
    const dateObj = new Date(startOfWeek);
    dateObj.setDate(startOfWeek.getDate() + i);
    const isToday = dateObj.toDateString() === today.toDateString();

    return `
      <div class="day-card ${d.type === 'rest' ? 'rest-day' : 'active-day'} ${isToday ? 'today' : ''}">
        <div class="day-name">${d.day}</div>
        <div class="day-num">${dateObj.getDate()}</div>
        <span class="day-tag ${d.tag}">${d.type}</span>
        <div class="day-workout">${d.workout}</div>
        <div class="day-workout" style="color:var(--text-muted);font-size:10.5px">${d.detail}</div>
        ${d.distance ? `<div class="day-distance">${d.distance}</div>` : ''}
        ${isToday ? '<div style="position:absolute;top:8px;right:8px;width:6px;height:6px;border-radius:50%;background:var(--accent)"></div>' : ''}
      </div>
    `;
  }).join('');
}

function updateWeekLabel() {
  const label = document.getElementById('week-label');
  if (!label) return;

  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + mondayOffset + currentWeekOffset * 7);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  if (currentWeekOffset === 0) {
    label.textContent = `This Week · ${fmt(startOfWeek)} – ${fmt(endOfWeek)}`;
  } else if (currentWeekOffset === 1) {
    label.textContent = `Next Week · ${fmt(startOfWeek)} – ${fmt(endOfWeek)}`;
  } else if (currentWeekOffset === -1) {
    label.textContent = `Last Week · ${fmt(startOfWeek)} – ${fmt(endOfWeek)}`;
  } else {
    label.textContent = `${fmt(startOfWeek)} – ${fmt(endOfWeek)}`;
  }
}

function changeWeek(delta) {
  currentWeekOffset += delta;
  const phase = getPhaseForOffset(currentWeekOffset);
  renderWeekView(phase.template);
  updateWeekLabel();
}

// ── STRENGTH ─────────────────────────────────────────────────────────────────
function renderStrength() {
  renderStrengthSession('strength-a', STRENGTH_A);
  renderStrengthSession('strength-b', STRENGTH_B);
}

function renderStrengthSession(id, session) {
  const container = document.getElementById(id);
  if (!container) return;

  container.innerHTML = `
    <div class="exercise-row" style="background:var(--bg-muted);font-weight:600;font-size:11px;font-family:var(--font-mono);padding:6px 14px;color:var(--text-muted)">
      <div>EXERCISE</div>
      <div style="text-align:center">SETS</div>
      <div style="text-align:center">REPS</div>
      <div style="text-align:center">PRIORITY</div>
    </div>
    ${session.exercises.map(ex => `
      <div class="exercise-row">
        <div>
          <div class="exercise-name">${ex.name}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:1px">${ex.note}</div>
        </div>
        <div class="exercise-meta">${ex.sets}</div>
        <div class="exercise-meta">${ex.reps}</div>
        <div><span class="exercise-tag ${ex.tag}">${ex.tag === 'ex-key' ? 'Key' : ex.tag === 'ex-maintain' ? 'Keep' : 'Core'}</span></div>
      </div>
    `).join('')}
  `;
}

// ── NUTRITION ────────────────────────────────────────────────────────────────
function renderNutrition() {
  // Pre-long-run timing table
  const preTable = document.getElementById('pre-run-table');
  if (preTable) {
    preTable.innerHTML = `
      <table class="zone-table">
        <thead>
          <tr>
            <th>Timing</th>
            <th>Food</th>
            <th>Carbs</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${NUTRITION.beforeLong.map(r => `
            <tr>
              <td style="font-family:var(--font-mono);font-size:12px;color:var(--accent)">${r.time}</td>
              <td style="font-weight:500">${r.item}</td>
              <td style="font-family:var(--font-mono);font-size:12px">${r.carbs}</td>
              <td style="color:var(--text-muted);font-size:12px">${r.notes}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // During run rules
  const duringList = document.getElementById('during-run-list');
  if (duringList) {
    duringList.innerHTML = NUTRITION.during.map(r => `
      <div class="tip-item">
        <div class="tip-icon">${r.icon}</div>
        <div class="tip-content">
          <strong>${r.rule}</strong>
          <span>${r.value}</span>
        </div>
      </div>
    `).join('');
  }
}

// ── RACE DAY ─────────────────────────────────────────────────────────────────
function renderRaceDay() {
  // Tips
  const tipsList = document.getElementById('race-tips-list');
  if (tipsList) {
    tipsList.innerHTML = RACE_TIPS.map(t => `
      <li class="tip-item">
        <div class="tip-icon">${t.icon}</div>
        <div class="tip-content">
          <strong>${t.title}</strong>
          <span>${t.text}</span>
        </div>
      </li>
    `).join('');
  }

  // Gear
  const gearGrid = document.getElementById('gear-grid');
  if (gearGrid) {
    gearGrid.innerHTML = GEAR.map(g => `
      <div class="gear-item">
        <span class="gear-icon">${g.icon}</span>
        <span>${g.item}</span>
      </div>
    `).join('');
  }
}
