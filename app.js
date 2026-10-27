const STORAGE_KEY = "vivabem-data";
const defaultHabits = [
  { id: "water", name: "Beber água", icon: "💧", goal: 7, time: "09:00", reminder: true },
  { id: "walk", name: "Caminhar", icon: "☀", goal: 5, time: "17:30", reminder: true },
  { id: "sleep", name: "Dormir bem", icon: "◌", goal: 7, time: "22:00", reminder: true },
  { id: "mind", name: "Pausa consciente", icon: "♡", goal: 4, time: "12:00", reminder: false }
];
let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || { user: null, habits: defaultHabits, completed: {}, notifications: [] };
let authMode = "login";
const $ = (selector) => document.querySelector(selector);
const todayKey = () => new Date().toISOString().slice(0, 10);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const initials = (name) => (name || "V").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const dateLabel = () => new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2800); }
function completed(habitId, day = todayKey()) { return Boolean(state.completed[day]?.includes(habitId)); }
function toggleHabit(id) { const day = todayKey(); state.completed[day] ||= []; const index = state.completed[day].indexOf(id); index >= 0 ? state.completed[day].splice(index, 1) : state.completed[day].push(id); save(); render(); showToast(index >= 0 ? "Hábito desmarcado." : "Muito bem! Hábito concluído."); }
function renderHabitCard(habit) { const done = completed(habit.id); return `<article class="habit-card ${done ? "done" : ""}"><div class="habit-icon">${habit.icon}</div><div class="habit-name">${habit.name}</div><div class="habit-meta"><span>${done ? "Concluído hoje" : `Meta: ${habit.goal}x/semana`}</span><button class="check-btn" data-check="${habit.id}" aria-label="Marcar ${habit.name}">${done ? "✓" : ""}</button></div></article>`; }
function daysBack(amount) { return Array.from({ length: amount }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (amount - index - 1)); return date.toISOString().slice(0, 10); }); }
function dayName(key) { return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(new Date(`${key}T12:00:00`)).replace(".", ""); }
function chartMarkup(amount, large = false) { const days = daysBack(amount), max = Math.max(...days.map((day) => state.completed[day]?.length || 0), 1); return days.map((day, i) => { const value = state.completed[day]?.length || 0; return `<div class="bar ${i === days.length - 1 ? "today" : ""}" style="height:${Math.max(7, value / max * 100)}%" title="${value} concluídos"><span>${large ? value : ""}</span></div>`; }).join(""); }
function render() {
  if (!state.user) return;
  $(".user-name").textContent = state.user.name.split(" ")[0]; $("#avatar").textContent = initials(state.user.name); $("#todayLabel").textContent = dateLabel(); $("#welcomeDate").textContent = dateLabel();
  const doneCount = state.habits.filter((habit) => completed(habit.id)).length; $("#daySummary").textContent = `${doneCount} de ${state.habits.length} hábitos concluídos`;
  $("#habitGrid").innerHTML = state.habits.slice(0, 4).map(renderHabitCard).join("");
  $("#allHabitsList").innerHTML = state.habits.map((habit) => `<div class="habit-row"><div class="habit-icon">${habit.icon}</div><div class="row-info"><strong>${habit.name}</strong><span>Meta: ${habit.goal} vezes por semana · Lembrete às ${habit.time}</span></div><div class="row-actions"><button class="small-btn" data-check="${habit.id}">${completed(habit.id) ? "Concluído ✓" : "Concluir"}</button><button class="danger-btn" data-delete="${habit.id}">Excluir</button></div></div>`).join("");
  $("#miniChart").innerHTML = chartMarkup(7); $("#chartDays").innerHTML = daysBack(7).map(dayName).map((day) => `<span>${day}</span>`).join("");
  const streak = calculateStreak(); $("#streakNumber").textContent = streak; $("#streakMessage").textContent = streak ? "Você está mantendo o ritmo. Continue!" : "Complete um hábito para começar!";
  const range = Number($("#progressRange").value); const days = daysBack(range); const total = days.reduce((sum, day) => sum + (state.completed[day]?.length || 0), 0); $("#totalCompleted").textContent = total; $("#completionRate").textContent = `${Math.round(total / Math.max(1, range * state.habits.length) * 100)}%`; $("#bestStreak").textContent = `${Math.max(streak, calculateBestStreak())} dias`; $("#largeChart").innerHTML = chartMarkup(range, true);
  $("#goalsList").innerHTML = state.habits.map((habit) => { const count = days.filter((day) => state.completed[day]?.includes(habit.id)).length; const percent = Math.min(100, Math.round(count / habit.goal * 100)); return `<div class="goal-row"><div class="goal-top"><strong>${habit.icon} &nbsp;${habit.name}</strong><span>${count}/${habit.goal} vezes</span></div><div class="goal-track"><span style="width:${percent}%"></span></div><small>${percent >= 100 ? "Meta da semana alcançada! ✦" : `${habit.goal - count} ${habit.goal - count === 1 ? "vez" : "vezes"} para alcançar sua meta`}</small></div>`; }).join("");
  $("#remindersList").innerHTML = state.habits.map((habit) => `<div class="reminder-row"><div class="habit-icon">${habit.icon}</div><div class="row-info"><strong>${habit.name}</strong><span>Lembrar todos os dias</span></div><div class="reminder-time">${habit.time}</div><button class="toggle ${habit.reminder ? "on" : ""}" data-reminder="${habit.id}" aria-label="Alternar lembrete"></button></div>`).join("");
}
function calculateStreak() { let streak = 0, date = new Date(); while (state.completed[date.toISOString().slice(0, 10)]?.length) { streak++; date.setDate(date.getDate() - 1); } return streak; }
function calculateBestStreak() {
  const activeDays = Object.keys(state.completed).filter((day) => state.completed[day].length).sort();
  let best = 0, current = 0, previous = null;
  activeDays.forEach((day) => {
    const date = new Date(`${day}T12:00:00`);
    const isNextDay = previous && (date - previous) / 86400000 === 1;
    current = isNextDay ? current + 1 : 1;
    best = Math.max(best, current);
    previous = date;
  });
  return best;
}
function showApp() { $("#authView").classList.add("hidden"); $("#appView").classList.remove("hidden"); render(); }
function switchView(view) { document.querySelectorAll(".view").forEach((el) => el.classList.remove("active-view")); $(`#${view}View`).classList.add("active-view"); document.querySelectorAll(".nav-item").forEach((el) => el.classList.toggle("active", el.dataset.view === view)); const titles = { dashboard: `Bom dia, <span class="user-name">${state.user.name.split(" ")[0]}</span> <span class="wave">✦</span>`, habits: "Meus hábitos", progress: "Meu progresso", goals: "Metas", reminders: "Lembretes" }; $("#pageTitle").innerHTML = titles[view]; $(".sidebar").classList.remove("open"); }
document.querySelectorAll("[data-auth-tab]").forEach((tab) => tab.addEventListener("click", () => { authMode = tab.dataset.authTab; document.querySelectorAll(".auth-tab").forEach((item) => item.classList.toggle("active", item === tab)); $("#nameField").classList.toggle("hidden", authMode === "login"); $("#authSubmitText").textContent = authMode === "login" ? "Entrar na minha conta" : "Criar minha conta"; $("#authError").textContent = ""; }));
$("#authForm").addEventListener("submit", (event) => { event.preventDefault(); const email = $("#emailInput").value.trim().toLowerCase(), password = $("#passwordInput").value; const users = JSON.parse(localStorage.getItem("vivabem-users") || "{}"); if (authMode === "signup") { if (!$("#nameInput").value.trim()) return $("#authError").textContent = "Informe seu nome."; users[email] = { name: $("#nameInput").value.trim(), password }; localStorage.setItem("vivabem-users", JSON.stringify(users)); state.user = users[email]; } else { if (!users[email] || users[email].password !== password) return $("#authError").textContent = "E-mail ou senha incorretos."; state.user = users[email]; } save(); showApp(); });
document.addEventListener("click", (event) => { const check = event.target.closest("[data-check]"); if (check) toggleHabit(check.dataset.check); const nav = event.target.closest("[data-view], [data-view-target]"); if (nav) switchView(nav.dataset.view || nav.dataset.viewTarget); const del = event.target.closest("[data-delete]"); if (del && confirm("Excluir este hábito?")) { state.habits = state.habits.filter((habit) => habit.id !== del.dataset.delete); save(); render(); showToast("Hábito excluído."); } const reminder = event.target.closest("[data-reminder]"); if (reminder) { const habit = state.habits.find((item) => item.id === reminder.dataset.reminder); habit.reminder = !habit.reminder; save(); render(); } });
$("#logoutBtn").addEventListener("click", () => { state.user = null; save(); $("#appView").classList.add("hidden"); $("#authView").classList.remove("hidden"); });
$("#mobileMenu").addEventListener("click", () => $(".sidebar").classList.toggle("open")); $("#progressRange").addEventListener("change", render);
$("#addHabitBtn").addEventListener("click", () => $("#modal").classList.remove("hidden")); $("#modalClose").addEventListener("click", () => $("#modal").classList.add("hidden"));
$("#habitForm").addEventListener("submit", (event) => { event.preventDefault(); state.habits.push({ id: `habit-${Date.now()}`, name: $("#habitName").value.trim(), icon: $("#habitIcon").value, goal: Number($("#habitGoal").value), time: $("#habitTime").value, reminder: true }); save(); $("#modal").classList.add("hidden"); event.target.reset(); render(); showToast("Novo hábito adicionado!"); });
$("#permissionBtn").addEventListener("click", async () => { if (!("Notification" in window)) return showToast("Seu navegador não suporta notificações."); const result = await Notification.requestPermission(); showToast(result === "granted" ? "Notificações ativadas!" : "Notificações não foram ativadas."); });
if (state.user) showApp();
