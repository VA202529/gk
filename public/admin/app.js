const DEFAULT_API_URL =
  "https://script.google.com/macros/s/AKfycbzzi1KpAgcQ3Om5GAohLnXnBF5IDl1OySMkJFha7yORABl32xRrNrd6Mz-NBIauGdgR5Q/exec";
const REFRESH_INTERVAL_MS = 15000;
const CACHE_KEY = "gk_admin_cache_v2";

const TABLES = {
  Dashboard: { label: "Dashboard" },
  Leads: {
    label: "Leads",
    fields: [
      "name",
      "email",
      "phone",
      "lead_type",
      "source",
      "assigned_to",
      "status",
      "priority",
      "next_follow_up",
      "value",
      "internal_note",
    ],
    columns: [
      "created_at",
      "name",
      "phone",
      "email",
      "lead_type",
      "assigned_to",
      "status",
      "next_follow_up",
      "value",
    ],
  },
  QuoteRequests: {
    label: "Offertes",
    fields: [
      "name",
      "email",
      "phone",
      "space_type",
      "frequency",
      "address_area",
      "size",
      "preferred_date",
      "message",
      "assigned_to",
      "status",
      "quote_amount",
      "follow_up_date",
      "internal_note",
    ],
    columns: [
      "created_at",
      "name",
      "phone",
      "email",
      "space_type",
      "frequency",
      "assigned_to",
      "status",
      "follow_up_date",
      "quote_amount",
    ],
  },
  ContactMessages: {
    label: "Berichten",
    fields: [
      "name",
      "email",
      "phone",
      "subject",
      "message",
      "assigned_to",
      "status",
      "internal_note",
    ],
    columns: ["created_at", "name", "email", "phone", "subject", "assigned_to", "status"],
  },
  Reviews: {
    label: "Reviews",
    fields: [
      "name",
      "email",
      "rating",
      "message",
      "approved",
      "featured",
      "image_url",
      "image_alt",
      "status",
      "internal_note",
    ],
    columns: [
      "created_at",
      "name",
      "rating",
      "message",
      "approved",
      "featured",
      "image_url",
      "status",
    ],
  },
  Employees: {
    label: "Medewerkers",
    fields: ["name", "email", "role", "active", "internal_note"],
    columns: ["created_at", "name", "email", "role", "active", "lead_count"],
  },
  ActivityLogs: {
    label: "Logs",
    fields: ["actor", "action", "table", "record_id", "details", "result"],
    columns: ["created_at", "action", "table", "record_id", "details", "result"],
    readonly: true,
  },
};

const state = {
  apiUrl: localStorage.getItem("gk_api_url") || DEFAULT_API_URL,
  token: sessionStorage.getItem("gk_token") || "",
  user: JSON.parse(sessionStorage.getItem("gk_user") || "null"),
  current: "Dashboard",
  rows: {},
  filters: { search: "", status: "", type: "" },
  refreshing: false,
};

const el = {
  loginScreen: document.getElementById("loginScreen"),
  appScreen: document.getElementById("appScreen"),
  loginForm: document.getElementById("loginForm"),
  loginBtn: document.getElementById("loginBtn"),
  loginError: document.getElementById("loginError"),
  apiUrl: document.getElementById("apiUrl"),
  nav: document.getElementById("nav"),
  pageTitle: document.getElementById("pageTitle"),
  currentUser: document.getElementById("currentUser"),
  content: document.getElementById("content"),
  modal: document.getElementById("modal"),
  toast: document.getElementById("toast"),
  refreshBtn: document.getElementById("refreshBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
};

el.apiUrl.value = state.apiUrl;
el.loginForm.addEventListener("submit", onLogin);
el.refreshBtn.addEventListener("click", () => refreshCurrent({ force: true }));
el.logoutBtn.addEventListener("click", logout);

hydrateCache();
renderNav();
if (state.token) showApp();
setInterval(backgroundRefresh, REFRESH_INTERVAL_MS);

async function onLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.apiUrl = String(form.get("apiUrl") || "").trim();
  localStorage.setItem("gk_api_url", state.apiUrl);
  el.loginError.textContent = "";
  setButton(el.loginBtn, true, "Inloggen...");

  try {
    const result = await api(
      "login",
      {
        username: form.get("username"),
        passcode: form.get("passcode"),
      },
      false,
    );
    state.token = result.token;
    state.user = result.user;
    sessionStorage.setItem("gk_token", state.token);
    sessionStorage.setItem("gk_user", JSON.stringify(state.user));
    showApp();
    toast("Ingelogd");
  } catch (error) {
    el.loginError.textContent = error.message;
  } finally {
    setButton(el.loginBtn, false, "Inloggen");
  }
}

function showApp() {
  el.loginScreen.classList.add("hidden");
  el.appScreen.classList.remove("hidden");
  el.currentUser.textContent = state.user ? state.user.username : "admin";
  refreshCurrent();
}

function logout() {
  sessionStorage.removeItem("gk_token");
  sessionStorage.removeItem("gk_user");
  state.token = "";
  state.user = null;
  el.appScreen.classList.add("hidden");
  el.loginScreen.classList.remove("hidden");
}

function renderNav() {
  el.nav.innerHTML = Object.keys(TABLES)
    .map(
      (key) =>
        `<button class="${state.current === key ? "active" : ""}" data-view="${key}">${TABLES[key].label}</button>`,
    )
    .join("");
  el.nav.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.current = button.dataset.view;
      state.filters = { search: "", status: "", type: "" };
      renderNav();
      refreshCurrent();
    });
  });
}

async function refreshCurrent({ force = false } = {}) {
  renderNav();
  el.pageTitle.textContent = TABLES[state.current].label;
  if (state.current === "Dashboard") return renderDashboard(force);
  return renderTableView(state.current, force);
}

async function renderDashboard(force = false) {
  if (hasDashboardCache()) renderDashboardContent(true);
  else el.content.innerHTML = panel("Gegevens laden...");

  if (!force && hasDashboardCache()) {
    backgroundRefresh();
    return;
  }

  try {
    Object.assign(state.rows, await api("dashboard"));
    saveCache();
    renderDashboardContent(false);
  } catch (error) {
    if (!hasDashboardCache()) el.content.innerHTML = errorPanel(error.message);
    else toast("Kon data niet verversen: " + error.message);
  }
}

function renderDashboardContent(fromCache) {
  const leads = state.rows.Leads || [];
  const quotes = state.rows.QuoteRequests || [];
  const messages = state.rows.ContactMessages || [];
  const reviews = state.rows.Reviews || [];
  const employees = state.rows.Employees || [];
  const logs = state.rows.ActivityLogs || [];
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  el.content.innerHTML = `
    <div class="cards">
      ${card("Nieuwe leads", countStatus(leads, "new"))}
      ${card("Nieuwe offertes", countStatus(quotes, "new"))}
      ${card("Nieuwe berichten", countStatus(messages, "new"))}
      ${card("Reviews wachten", reviews.filter((row) => !isTrue(row.approved) && row.status !== "archived").length)}
      ${card("Leads deze week", leads.filter((row) => new Date(row.created_at).getTime() >= weekAgo).length)}
      ${card("Medewerkers", employees.filter((row) => row.status !== "archived" && !isFalse(row.active)).length)}
      ${card("Gewonnen", countStatus(quotes, "won"))}
      ${card("Open opvolgingen", leads.filter((row) => row.next_follow_up && row.status !== "archived").length)}
    </div>
    <div class="panel">
      <div class="panel-head">
        <div>
          <h2>Snelle acties</h2>
          <p>${fromCache ? "Direct zichtbaar vanuit cache. Verversing loopt stil op de achtergrond." : "Actuele data geladen."}</p>
        </div>
        <div class="row">
          <button class="btn small primary" onclick="openCreate('QuoteRequests')">Nieuwe offerte</button>
          <button class="btn small" onclick="openCreate('Leads')">Nieuwe lead</button>
          <button class="btn small" onclick="openCreate('Employees')">Medewerker toevoegen</button>
          <button class="btn small" onclick="goTo('Reviews')">Reviews controleren</button>
        </div>
      </div>
    </div>
    ${miniPanel("Laatste leads", "Leads", leads.slice(0, 5))}
    ${miniPanel("Laatste offertes", "QuoteRequests", quotes.slice(0, 5))}
    ${miniPanel("Laatste berichten", "ContactMessages", messages.slice(0, 5))}
    ${miniPanel("Medewerkers", "Employees", employees.slice(0, 5))}
    ${miniPanel("Laatste logs", "ActivityLogs", logs.slice(0, 5))}
  `;
}

async function renderTableView(table, force = false) {
  const cached = state.rows[table];
  if (cached) renderTableContent(table, cached, true);
  else el.content.innerHTML = panel("Gegevens laden...");

  if (!force && cached) {
    backgroundRefresh();
    return;
  }

  try {
    await loadTable(table);
    saveCache();
    renderTableContent(table, state.rows[table] || [], false);
  } catch (error) {
    if (!cached) el.content.innerHTML = errorPanel(error.message);
    else toast("Kon data niet verversen: " + error.message);
  }
}

function renderTableContent(table, sourceRows, fromCache) {
  const config = TABLES[table];
  const rows = filterRows(sourceRows || []);
  el.content.innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <label>Zoeken<input id="searchInput" value="${escapeHtml(state.filters.search)}" placeholder="Naam, e-mail, telefoon"></label>
        <label>Status<input id="statusInput" value="${escapeHtml(state.filters.status)}" placeholder="new, won, approved"></label>
        <label>Filter<input id="typeInput" value="${escapeHtml(state.filters.type)}" placeholder="woning, quote"></label>
        <button id="filterBtn" class="btn">Filter</button>
        <button id="exportBtn" class="btn">Export CSV</button>
      </div>
      <div class="panel-head">
        <p>${rows.length} records${fromCache ? " - cache, achtergrond refresh actief" : ""}</p>
        ${config.readonly ? "" : `<button id="createBtn" class="btn primary">Nieuw item</button>`}
      </div>
      ${renderTable(table, rows)}
    </div>
  `;
  document.getElementById("filterBtn").addEventListener("click", () => {
    state.filters.search = document.getElementById("searchInput").value;
    state.filters.status = document.getElementById("statusInput").value;
    state.filters.type = document.getElementById("typeInput").value;
    renderTableContent(table, state.rows[table] || [], true);
  });
  document.getElementById("exportBtn").addEventListener("click", () => downloadCsv(table));
  const createBtn = document.getElementById("createBtn");
  if (createBtn) createBtn.addEventListener("click", () => openCreate(table));
}

function renderTable(table, rows) {
  const config = TABLES[table];
  if (!rows.length) return `<div class="empty">Nog geen records gevonden.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${config.columns.map((col) => `<th>${label(col)}</th>`).join("")}<th>Acties</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  ${config.columns.map((col) => `<td class="${isLong(col) ? "wrap" : ""}">${formatCell(col, row[col])}</td>`).join("")}
                  <td>
                    <button class="btn small" onclick="openEdit('${table}', '${escapeAttr(row.id || row.key)}')">Bekijken</button>
                    ${quickReviewButtons(table, row)}
                    ${config.readonly ? "" : `<button class="btn small danger" onclick="archiveItem('${table}', '${escapeAttr(row.id || row.key)}')">Archiveren</button>`}
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function quickReviewButtons(table, row) {
  if (table !== "Reviews" || isTrue(row.approved)) return "";
  return `<button class="btn small" onclick="approveReview('${escapeAttr(row.id)}')">Goedkeuren</button>`;
}

function openCreate(table) {
  openEditor(table, {});
}

function openEdit(table, id) {
  const row = (state.rows[table] || []).find((item) => String(item.id || item.key) === String(id));
  openEditor(table, row || {});
}

function openEditor(table, row) {
  const config = TABLES[table];
  const isNew = !(row.id || row.key);
  el.modal.classList.remove("hidden");
  el.modal.innerHTML = `
    <div class="modal-card">
      <div class="panel-head">
        <div>
          <h2>${isNew ? "Nieuw" : "Bewerken"}: ${config.label}</h2>
          <p>${isNew ? "Voeg een record toe." : "Bekijk of wijzig dit record."}</p>
        </div>
        <button class="btn" onclick="closeModal()">Sluiten</button>
      </div>
      <form id="editorForm" class="form-grid">
        ${config.fields.map((field) => renderField(field, row[field])).join("")}
        ${table === "Reviews" && !isNew ? renderReviewUpload(row) : ""}
        <div class="full row">
          ${config.readonly ? "" : `<button class="btn primary" type="submit">Opslaan</button>`}
          <button class="btn" type="button" onclick="closeModal()">Annuleren</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById("editorForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      if (isNew) await api("create", { table, data });
      else await api("update", { table, id: row.id || row.key, data });
      toast("Opgeslagen");
      closeModal();
      await loadTable(table);
      saveCache();
      renderTableContent(table, state.rows[table] || [], false);
    } catch (error) {
      toast(error.message);
    }
  });
}

function renderField(field, value) {
  const full = ["message", "description", "bullets", "value", "internal_note", "details"].includes(
    field,
  );
  if (full)
    return `<label class="full">${label(field)}<textarea name="${field}">${escapeHtml(value || "")}</textarea></label>`;
  if (field === "status")
    return `<label>${label(field)}<select name="${field}">${statusOptions(value)}</select></label>`;
  if (field === "role")
    return `<label>${label(field)}<select name="${field}"><option value="Lead verantwoordelijke" selected>Lead verantwoordelijke</option></select></label>`;
  if (field === "assigned_to") return renderEmployeeSelect(value);
  if (["approved", "featured", "active", "public", "consent"].includes(field)) {
    return `<label>${label(field)}<select name="${field}">
      <option value="false" ${!isTrue(value) ? "selected" : ""}>FALSE</option>
      <option value="true" ${isTrue(value) ? "selected" : ""}>TRUE</option>
    </select></label>`;
  }
  return `<label>${label(field)}<input name="${field}" value="${escapeHtml(value || "")}"></label>`;
}

function renderEmployeeSelect(value) {
  const employees = (state.rows.Employees || []).filter(
    (employee) => employee.status !== "archived",
  );
  return `<label>verantwoordelijke<select name="assigned_to">
    <option value="">Niet toegewezen</option>
    ${employees
      .map(
        (employee) =>
          `<option value="${escapeAttr(employee.name)}" ${String(value || "") === String(employee.name) ? "selected" : ""}>${escapeHtml(employee.name || employee.email || employee.id)}</option>`,
      )
      .join("")}
  </select></label>`;
}

function renderReviewUpload(row) {
  return `
    <div class="full upload-box">
      <label>Review afbeelding
        <input id="reviewImageInput" type="file" accept="image/*">
      </label>
      <div class="row">
        <button class="btn small" type="button" onclick="uploadReviewImage('${escapeAttr(row.id)}', '${escapeAttr(row.name || "review")}')">Afbeelding uploaden</button>
        ${row.image_url ? `<a class="btn small" href="${escapeAttr(row.image_url)}" target="_blank" rel="noopener noreferrer">Bekijk foto</a>` : ""}
      </div>
      <p>Optioneel. Opslag in Google Drive: Glans & Klasse Website / Reviews / reviewnaam.</p>
    </div>
  `;
}

function statusOptions(value) {
  const statuses = [
    "new",
    "contacted",
    "quoted",
    "won",
    "lost",
    "read",
    "replied",
    "approved",
    "rejected",
    "archived",
  ];
  return statuses
    .map(
      (status) =>
        `<option value="${status}" ${String(value || "new") === status ? "selected" : ""}>${status}</option>`,
    )
    .join("");
}

async function approveReview(id) {
  try {
    await api("update", {
      table: "Reviews",
      id,
      data: { approved: "true", featured: "false", status: "approved" },
    });
    toast("Review goedgekeurd");
    await loadTable("Reviews");
    saveCache();
    renderTableContent("Reviews", state.rows.Reviews || [], false);
  } catch (error) {
    toast(error.message);
  }
}

async function archiveItem(table, id) {
  if (!confirm("Weet je zeker dat je dit item wilt archiveren?")) return;
  try {
    await api("delete", { table, id });
    toast("Gearchiveerd");
    await loadTable(table);
    saveCache();
    renderTableContent(table, state.rows[table] || [], false);
  } catch (error) {
    toast(error.message);
  }
}

async function loadTable(table) {
  state.rows[table] = await api("list", { table, limit: 300 });
}

async function backgroundRefresh() {
  if (!state.token || state.refreshing) return;
  state.refreshing = true;
  try {
    if (state.current === "Dashboard") {
      Object.assign(state.rows, await api("dashboard"));
      saveCache();
      renderDashboardContent(false);
    } else {
      await loadTable(state.current);
      saveCache();
      renderTableContent(state.current, state.rows[state.current] || [], false);
    }
  } catch (error) {
    console.warn("Background refresh failed", error);
  } finally {
    state.refreshing = false;
  }
}

async function uploadReviewImage(id, reviewName) {
  const input = document.getElementById("reviewImageInput");
  const file = input && input.files ? input.files[0] : null;
  if (!file) return toast("Kies eerst een afbeelding.");
  if (file.size > 4 * 1024 * 1024) return toast("Afbeelding is te groot. Gebruik maximaal 4 MB.");

  try {
    const base64 = await fileToBase64(file);
    await api("uploadReviewImage", {
      id,
      reviewName,
      fileName: file.name,
      mimeType: file.type || "image/jpeg",
      base64,
    });
    toast("Afbeelding opgeslagen");
    closeModal();
    await loadTable("Reviews");
    saveCache();
    renderTableContent("Reviews", state.rows.Reviews || [], false);
  } catch (error) {
    toast(error.message);
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Kon afbeelding niet lezen."));
    reader.readAsDataURL(file);
  });
}

async function downloadCsv(table) {
  try {
    const csv = await api("export", { table });
    const blob = new Blob([csv || ""], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${table}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    toast(error.message);
  }
}

async function api(action, payload = {}, includeToken = true) {
  const response = await fetch(state.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...(includeToken ? { token: state.token } : {}), ...payload }),
  });
  const json = await response.json();
  if (!json.ok) throw new Error(json.error || "Actie mislukt.");
  return json.data !== undefined ? json.data : json;
}

function filterRows(rows) {
  const q = state.filters.search.toLowerCase();
  const status = state.filters.status.toLowerCase();
  const type = state.filters.type.toLowerCase();
  return rows.filter((row) => {
    const text = JSON.stringify(row).toLowerCase();
    return (
      (!q || text.includes(q)) &&
      (!status ||
        String(row.status || "")
          .toLowerCase()
          .includes(status)) &&
      (!type || text.includes(type))
    );
  });
}

function card(title, value) {
  return `<article class="card"><span>${title}</span><strong>${value}</strong></article>`;
}

function miniPanel(title, table, rows) {
  return `
    <div class="panel">
      <div class="panel-head"><h2>${title}</h2><button class="btn small" onclick="goTo('${table}')">Openen</button></div>
      ${
        rows.length
          ? `<div class="table-wrap"><table><tbody>${rows.map((row) => `<tr><td>${formatCell("created_at", row.created_at)}</td><td>${escapeHtml(row.name || row.action || "")}</td><td>${formatCell("status", row.status || row.result || row.role || "")}</td></tr>`).join("")}</tbody></table></div>`
          : `<div class="empty">Nog geen gegevens.</div>`
      }
    </div>
  `;
}

function goTo(table) {
  state.current = table;
  refreshCurrent();
}

function countStatus(rows, status) {
  return rows.filter((row) => String(row.status) === status).length;
}

function formatCell(col, value) {
  if (value === undefined || value === null || value === "") return "";
  if (col === "status")
    return `<span class="badge ${escapeAttr(value)}">${escapeHtml(value)}</span>`;
  if (col === "image_url")
    return value
      ? `<a href="${escapeAttr(value)}" target="_blank" rel="noopener noreferrer">Foto</a>`
      : "";
  if (["approved", "featured", "active", "public"].includes(col))
    return isTrue(value) ? "TRUE" : "FALSE";
  if (String(col).includes("created_at") || String(col).includes("updated_at"))
    return escapeHtml(String(value).slice(0, 16).replace("T", " "));
  return escapeHtml(String(value));
}

function panel(text) {
  return `<div class="panel">${escapeHtml(text)}</div>`;
}

function errorPanel(message) {
  return `<div class="panel"><h2>Er ging iets mis</h2><p class="error">${escapeHtml(message)}</p><button class="btn" onclick="refreshCurrent({ force: true })">Opnieuw proberen</button></div>`;
}

function label(value) {
  return String(value).replace(/_/g, " ");
}

function isLong(col) {
  return ["message", "description", "value", "details", "internal_note"].includes(col);
}

function isTrue(value) {
  return value === true || value === "true" || value === "TRUE" || value === 1 || value === "1";
}

function isFalse(value) {
  return value === false || value === "false" || value === "FALSE" || value === 0 || value === "0";
}

function closeModal() {
  el.modal.classList.add("hidden");
  el.modal.innerHTML = "";
}

function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.remove("hidden");
  setTimeout(() => el.toast.classList.add("hidden"), 3500);
}

function setButton(button, loading, text) {
  button.disabled = loading;
  button.textContent = text;
}

function hydrateCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const cached = JSON.parse(raw);
    if (cached && cached.rows) state.rows = cached.rows;
  } catch (error) {
    console.warn("Cache could not be read", error);
  }
}

function saveCache() {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ rows: state.rows, saved_at: new Date().toISOString() }),
    );
  } catch (error) {
    console.warn("Cache could not be saved", error);
  }
}

function hasDashboardCache() {
  return ["Leads", "QuoteRequests", "ContactMessages", "Reviews", "Employees"].some(
    (table) => Array.isArray(state.rows[table]) && state.rows[table].length,
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

window.openCreate = openCreate;
window.openEdit = openEdit;
window.archiveItem = archiveItem;
window.approveReview = approveReview;
window.uploadReviewImage = uploadReviewImage;
window.closeModal = closeModal;
window.downloadCsv = downloadCsv;
window.goTo = goTo;
window.refreshCurrent = refreshCurrent;
