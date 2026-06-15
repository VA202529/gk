const APP_NAME = "Glans & Klasse Backoffice";
const DEFAULT_ADMIN_USER = "admin";
const DEFAULT_ADMIN_PASSCODE = "123456";
const SESSION_TTL_SECONDS = 21600;
const SETUP_PROPERTY_KEY = "GK_BACKOFFICE_SETUP_COMPLETE";

const SCHEMA = {
  Leads: [
    "id",
    "created_at",
    "updated_at",
    "name",
    "email",
    "phone",
    "source",
    "lead_type",
    "status",
    "priority",
    "next_follow_up",
    "last_contact_at",
    "quote_request_id",
    "contact_message_id",
    "review_id",
    "assigned_to",
    "employee_id",
    "value",
    "internal_note",
  ],
  QuoteRequests: [
    "id",
    "created_at",
    "updated_at",
    "name",
    "email",
    "phone",
    "space_type",
    "frequency",
    "address_area",
    "size",
    "preferred_date",
    "message",
    "consent",
    "status",
    "quote_amount",
    "follow_up_date",
    "assigned_to",
    "internal_note",
  ],
  ContactMessages: [
    "id",
    "created_at",
    "updated_at",
    "name",
    "email",
    "phone",
    "subject",
    "message",
    "consent",
    "status",
    "assigned_to",
    "internal_note",
  ],
  Reviews: [
    "id",
    "created_at",
    "updated_at",
    "name",
    "email",
    "rating",
    "message",
    "approved",
    "featured",
    "image_url",
    "image_drive_file_id",
    "image_alt",
    "source",
    "status",
    "internal_note",
  ],
  Employees: [
    "id",
    "created_at",
    "updated_at",
    "name",
    "email",
    "role",
    "active",
    "lead_count",
    "internal_note",
  ],
  Services: [
    "id",
    "created_at",
    "updated_at",
    "title",
    "subtitle",
    "description",
    "bullets",
    "icon",
    "sort_order",
    "active",
    "featured",
  ],
  WebsiteContent: ["id", "created_at", "updated_at", "page", "section", "key", "value", "active"],
  Portfolio: [
    "id",
    "created_at",
    "updated_at",
    "title",
    "category",
    "location",
    "description",
    "image_url",
    "before_image_url",
    "after_image_url",
    "featured",
    "active",
    "sort_order",
  ],
  Settings: ["key", "value", "type", "public", "group", "updated_at"],
  Admins: ["id", "username", "passcode_hash", "role", "active", "last_login_at", "created_at"],
  ActivityLogs: ["id", "created_at", "actor", "action", "table", "record_id", "details", "result"],
};

const ADMIN_TABLES = Object.keys(SCHEMA);
const PUBLIC_TABLES = ["Reviews", "Services", "WebsiteContent", "Portfolio", "Settings"];

function doGet(e) {
  const action = String((e.parameter && e.parameter.action) || "health");

  try {
    if (action === "health") {
      return jsonResponse({ ok: true, app: APP_NAME, time: new Date().toISOString() });
    }
    if (action === "setup") {
      const result = setupSpreadsheet();
      return jsonResponse({ ok: true, data: result });
    }
    ensureInitialized();
    if (action === "publicReviews") return jsonResponse({ ok: true, data: publicReviews() });
    if (action === "publicServices")
      return jsonResponse({ ok: true, data: publicActive("Services") });
    if (action === "publicSettings") return jsonResponse({ ok: true, data: publicSettings() });
    if (action === "publicContent")
      return jsonResponse({ ok: true, data: publicActive("WebsiteContent") });

    return errorResponse("Unknown GET action", "UNKNOWN_ACTION");
  } catch (err) {
    return errorResponse(err.message || String(err), "SERVER_ERROR");
  }
}

function doPost(e) {
  try {
    const payload = parsePayload(e);
    const action = String(payload.action || "");

    if (action === "setup") return jsonResponse({ ok: true, data: setupSpreadsheet() });
    ensureInitialized();

    if (action === "login") return jsonResponse(login(payload));
    if (action === "submitQuote") return jsonResponse(submitQuote(payload));
    if (action === "submitContact") return jsonResponse(submitContact(payload));
    if (action === "submitReview") return jsonResponse(submitReview(payload));

    const session = requireAuth(payload);

    if (action === "dashboard") return jsonResponse({ ok: true, data: dashboardData() });
    if (action === "list")
      return jsonResponse({ ok: true, data: listRecords(payload.table, payload) });
    if (action === "get")
      return jsonResponse({ ok: true, data: getRecord(payload.table, payload.id) });
    if (action === "create")
      return jsonResponse({
        ok: true,
        data: createRecord(payload.table, payload.data || {}, session.username),
      });
    if (action === "update")
      return jsonResponse({
        ok: true,
        data: updateRecord(payload.table, payload.id, payload.data || {}, session.username),
      });
    if (action === "delete")
      return jsonResponse({
        ok: true,
        data: archiveRecord(payload.table, payload.id, session.username),
      });
    if (action === "export") return jsonResponse({ ok: true, data: exportRecords(payload.table) });
    if (action === "uploadReviewImage")
      return jsonResponse({ ok: true, data: uploadReviewImage(payload) });
    return errorResponse("Unknown POST action", "UNKNOWN_ACTION");
  } catch (err) {
    return errorResponse(err.message || String(err), err.code || "SERVER_ERROR");
  }
}

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const created = [];

  Object.keys(SCHEMA).forEach(function (name) {
    const sheet = ensureSheet(ss, name, SCHEMA[name]);
    if (sheet.getLastRow() === 1) created.push(name);
  });

  seedDefaults();
  PropertiesService.getScriptProperties().setProperty(SETUP_PROPERTY_KEY, "true");
  return { spreadsheetId: ss.getId(), sheets: Object.keys(SCHEMA), initialized: created };
}

function ensureInitialized() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty(SETUP_PROPERTY_KEY) === "true") return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ready = Object.keys(SCHEMA).every(function (name) {
    const sheet = ss.getSheetByName(name);
    return sheet && sheet.getLastRow() > 0;
  });

  if (ready) {
    props.setProperty(SETUP_PROPERTY_KEY, "true");
    return;
  }

  setupSpreadsheet();
}

function ensureSheet(ss, name, columns) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(columns);
    sheet.setFrozenRows(1);
    return sheet;
  }

  ensureColumns(sheet, columns);
  sheet.setFrozenRows(1);
  return sheet;
}

function ensureColumns(sheet, columns) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].filter(String);
  if (!headers.length) {
    sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
    return;
  }

  const missing = columns.filter(function (col) {
    return headers.indexOf(col) === -1;
  });
  if (missing.length) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
  }
}

function seedDefaults() {
  const admins = getSheet("Admins");
  if (admins.getLastRow() < 2) {
    admins.appendRow([
      generateId("adm"),
      DEFAULT_ADMIN_USER,
      hashPasscode(DEFAULT_ADMIN_PASSCODE),
      "owner",
      true,
      "",
      now(),
    ]);
  }

  const settings = getSheet("Settings");
  if (settings.getLastRow() < 2) {
    [
      ["company_name", "Glans & Klasse", "text", true, "company", now()],
      ["contact_email", "glans.klasse@gmail.com", "email", true, "contact", now()],
      ["phone_primary", "+31638937378", "phone", true, "contact", now()],
      [
        "admin_notice",
        "Wijzig de standaard admin toegangscode direct na setup.",
        "text",
        false,
        "security",
        now(),
      ],
    ].forEach(function (row) {
      settings.appendRow(row);
    });
  }

  const employees = getSheet("Employees");
  if (employees.getLastRow() < 2) {
    employees.appendRow([
      generateId("emp"),
      now(),
      now(),
      "Lead verantwoordelijke",
      "",
      "Lead verantwoordelijke",
      true,
      0,
      "Standaard medewerkerrol voor opvolging van leads.",
    ]);
  }
}

function login(payload) {
  const username = clean(payload.username);
  const passcode = clean(payload.passcode);
  if (!username || !passcode) throw appError("Username and passcode are required", "AUTH_REQUIRED");

  const admins = listRecords("Admins", {});
  const admin = admins.find(function (row) {
    return (
      row.username === username &&
      truthy(row.active) &&
      row.passcode_hash === hashPasscode(passcode)
    );
  });

  if (!admin) {
    appendLog("login", "Admins", "", { username: username }, "error");
    throw appError("Invalid login", "AUTH_INVALID");
  }

  const token = generateId("tok") + "_" + Utilities.getUuid();
  CacheService.getScriptCache().put(
    "session:" + token,
    JSON.stringify({
      username: admin.username,
      role: admin.role,
      issued_at: now(),
    }),
    SESSION_TTL_SECONDS,
  );

  updateRecord("Admins", admin.id, { last_login_at: now() }, "system");
  appendLog("login", "Admins", admin.id, { username: username }, "success");
  return { ok: true, token: token, user: { username: admin.username, role: admin.role } };
}

function requireAuth(payload) {
  const token = clean(payload.token);
  if (!token) throw appError("Missing token", "AUTH_REQUIRED");

  const raw = CacheService.getScriptCache().get("session:" + token);
  if (!raw) throw appError("Session expired", "AUTH_EXPIRED");
  return JSON.parse(raw);
}

function submitQuote(payload) {
  validatePublicWrite(payload);
  const data = payload.data || payload;
  const record = createRecord(
    "QuoteRequests",
    {
      name: clean(data.name),
      email: clean(data.email),
      phone: clean(data.phone),
      space_type: clean(data.space_type),
      frequency: clean(data.frequency),
      address_area: clean(data.address_area),
      size: clean(data.size),
      preferred_date: clean(data.preferred_date),
      message: clean(data.message),
      consent: boolValue(data.consent),
      status: "new",
      source: "website",
    },
    "website",
  );

  createRecord(
    "Leads",
    {
      name: record.name,
      email: record.email,
      phone: record.phone,
      source: "website",
      lead_type: "quote",
      status: "new",
      priority: "normal",
      quote_request_id: record.id,
      assigned_to: clean(data.assigned_to),
      value: record.quote_amount || "",
      internal_note: "",
    },
    "website",
  );

  appendLog("submitQuote", "QuoteRequests", record.id, { name: record.name }, "success");
  return { ok: true, data: publicAck(record.id) };
}

function submitContact(payload) {
  validatePublicWrite(payload);
  const data = payload.data || payload;
  const record = createRecord(
    "ContactMessages",
    {
      name: clean(data.name),
      email: clean(data.email),
      phone: clean(data.phone),
      subject: clean(data.subject) || "Website bericht",
      message: clean(data.message),
      consent: boolValue(data.consent),
      status: "new",
    },
    "website",
  );

  createRecord(
    "Leads",
    {
      name: record.name,
      email: record.email,
      phone: record.phone,
      source: "website",
      lead_type: "message",
      status: "new",
      priority: "normal",
      contact_message_id: record.id,
      assigned_to: clean(data.assigned_to),
    },
    "website",
  );

  appendLog("submitContact", "ContactMessages", record.id, { name: record.name }, "success");
  return { ok: true, data: publicAck(record.id) };
}

function submitReview(payload) {
  validatePublicWrite(payload);
  const data = payload.data || payload;
  const rating = Number(data.rating);
  if (!rating || rating < 1 || rating > 5) throw appError("Invalid rating", "VALIDATION_ERROR");

  const record = createRecord(
    "Reviews",
    {
      name: clean(data.name),
      email: clean(data.email),
      rating: rating,
      message: clean(data.message),
      approved: false,
      featured: false,
      image_url: clean(data.image_url),
      image_drive_file_id: clean(data.image_drive_file_id),
      image_alt: clean(data.image_alt),
      source: "website",
      status: "new",
    },
    "website",
  );

  appendLog("submitReview", "Reviews", record.id, { name: record.name, rating: rating }, "success");
  return { ok: true, data: publicAck(record.id) };
}

function validatePublicWrite(payload) {
  const data = payload.data || payload;
  if (clean(data.website)) throw appError("Spam detected", "SPAM");
  if (data.started_at && Date.now() - Number(data.started_at) < 1500) {
    throw appError("Form submitted too quickly", "SPAM");
  }
}

function listRecords(table, options) {
  assertTable(table);
  const sheet = getSheet(table);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  let rows = values.slice(1).map(function (row) {
    return toObject(headers, row);
  });

  if (options && options.status)
    rows = rows.filter(function (r) {
      return String(r.status) === String(options.status);
    });
  if (options && options.search) {
    const q = String(options.search).toLowerCase();
    rows = rows.filter(function (r) {
      return JSON.stringify(r).toLowerCase().indexOf(q) !== -1;
    });
  }

  rows.sort(function (a, b) {
    return String(b.created_at || b.updated_at || "").localeCompare(
      String(a.created_at || a.updated_at || ""),
    );
  });

  const limit = Math.max(1, Math.min(Number(options && options.limit) || 250, 1000));
  const offset = Math.max(0, Number(options && options.offset) || 0);
  rows = rows.slice(offset, offset + limit);

  return rows;
}

function dashboardData() {
  const tables = [
    "Leads",
    "QuoteRequests",
    "ContactMessages",
    "Reviews",
    "Employees",
    "ActivityLogs",
  ];
  const data = {};
  tables.forEach(function (table) {
    data[table] = listRecords(table, { limit: table === "ActivityLogs" ? 50 : 250 });
  });
  return data;
}

function getRecord(table, id) {
  const rows = listRecords(table, {});
  const record = rows.find(function (row) {
    return String(row.id || row.key) === String(id);
  });
  if (!record) throw appError("Record not found", "NOT_FOUND");
  return record;
}

function createRecord(table, data, actor) {
  assertTable(table);
  const sheet = getSheet(table);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const record = {};

  headers.forEach(function (header) {
    if (header === "id")
      record[header] = clean(data.id) || generateId(table.slice(0, 3).toLowerCase());
    else if (header === "created_at") record[header] = clean(data.created_at) || now();
    else if (header === "updated_at") record[header] = clean(data.updated_at) || now();
    else record[header] = data[header] !== undefined ? data[header] : "";
  });

  if (table === "Settings" && !record.key) record.key = clean(data.key);
  sheet.appendRow(
    headers.map(function (h) {
      return record[h];
    }),
  );
  appendLog("create", table, record.id || record.key || "", { actor: actor || "admin" }, "success");
  return record;
}

function updateRecord(table, id, data, actor) {
  assertTable(table);
  const sheet = getSheet(table);
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values[0].map(String);
  const idCol = headers.indexOf("id") >= 0 ? headers.indexOf("id") : headers.indexOf("key");
  if (idCol < 0) throw appError("No id/key column", "BAD_SCHEMA");

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      headers.forEach(function (header, col) {
        if (header === "id" || header === "key" || header === "created_at") return;
        if (header === "updated_at") values[i][col] = now();
        else if (data[header] !== undefined) values[i][col] = data[header];
      });
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([values[i]]);
      appendLog("update", table, id, { actor: actor || "admin" }, "success");
      return toObject(headers, values[i]);
    }
  }

  throw appError("Record not found", "NOT_FOUND");
}

function archiveRecord(table, id, actor) {
  const record = getRecord(table, id);
  const updates = {};
  if (record.status !== undefined) updates.status = "archived";
  else updates.active = false;
  const updated = updateRecord(table, id, updates, actor);
  appendLog("archive", table, id, { actor: actor || "admin" }, "success");
  return updated;
}

function exportRecords(table) {
  const rows = listRecords(table, {});
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")].concat(
    rows.map(function (row) {
      return headers
        .map(function (h) {
          return csvCell(row[h]);
        })
        .join(",");
    }),
  );
  return lines.join("\n");
}

function publicReviews() {
  return listRecords("Reviews", {})
    .filter(function (r) {
      return truthy(r.approved) && String(r.status || "approved") !== "archived";
    })
    .map(function (r) {
      return {
        id: r.id,
        name: r.name,
        rating: Number(r.rating),
        message: r.message,
        featured: truthy(r.featured),
        image_url: r.image_url,
        image_alt: r.image_alt || "Reviewfoto van Glans & Klasse klant",
        created_at: r.created_at,
      };
    });
}

function uploadReviewImage(payload) {
  const reviewId = clean(payload.id);
  const fileName = clean(payload.fileName) || "review-image.jpg";
  const mimeType = clean(payload.mimeType) || "image/jpeg";
  const base64 = clean(payload.base64);
  const reviewName = clean(payload.reviewName) || reviewId || "review";
  if (!reviewId) throw appError("Review id is required", "VALIDATION_ERROR");
  if (!base64) throw appError("Image data is required", "VALIDATION_ERROR");

  const folder = ensureDriveFolderPath([
    "Glans & Klasse Website",
    "Reviews",
    safeFolderName(reviewName),
  ]);
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const imageUrl = "https://drive.google.com/uc?export=view&id=" + file.getId();

  const updated = updateRecord(
    "Reviews",
    reviewId,
    {
      image_url: imageUrl,
      image_drive_file_id: file.getId(),
      image_alt: "Reviewfoto van " + reviewName + " voor Glans & Klasse",
    },
    "admin",
  );

  appendLog("uploadReviewImage", "Reviews", reviewId, { fileId: file.getId() }, "success");
  return { id: reviewId, image_url: imageUrl, file_id: file.getId(), record: updated };
}

function ensureDriveFolderPath(parts) {
  let parent = DriveApp.getRootFolder();
  parts.forEach(function (part) {
    const name = safeFolderName(part);
    const folders = parent.getFoldersByName(name);
    parent = folders.hasNext() ? folders.next() : parent.createFolder(name);
  });
  return parent;
}

function safeFolderName(value) {
  return (
    clean(value)
      .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
      .slice(0, 80) || "review"
  );
}

function publicActive(table) {
  if (PUBLIC_TABLES.indexOf(table) === -1) throw appError("Table is not public", "FORBIDDEN");
  return listRecords(table, {})
    .filter(function (row) {
      return row.active === undefined || truthy(row.active);
    })
    .map(function (row) {
      delete row.email;
      delete row.internal_note;
      return row;
    });
}

function publicSettings() {
  return listRecords("Settings", {})
    .filter(function (row) {
      return truthy(row.public);
    })
    .reduce(function (acc, row) {
      acc[row.key] = row.value;
      return acc;
    }, {});
}

function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    throw appError("Invalid JSON payload", "BAD_JSON");
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function errorResponse(message, code) {
  return jsonResponse({ ok: false, error: message, code: code || "ERROR" });
}

function appError(message, code) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function assertTable(table) {
  if (ADMIN_TABLES.indexOf(table) === -1) throw appError("Table is not allowed", "FORBIDDEN");
}

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function toObject(headers, row) {
  const obj = {};
  headers.forEach(function (header, i) {
    obj[header] = row[i];
  });
  return obj;
}

function now() {
  return new Date().toISOString();
}

function clean(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function boolValue(value) {
  return (
    value === true ||
    value === "true" ||
    value === "TRUE" ||
    value === "on" ||
    value === 1 ||
    value === "1"
  );
}

function truthy(value) {
  return boolValue(value);
}

function hashPasscode(passcode) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    clean(passcode),
    Utilities.Charset.UTF_8,
  );
  return bytes
    .map(function (byte) {
      const value = byte < 0 ? byte + 256 : byte;
      return ("0" + value.toString(16)).slice(-2);
    })
    .join("");
}

function generateId(prefix) {
  return prefix + "_" + Utilities.getUuid().replace(/-/g, "").slice(0, 16);
}

function appendLog(action, table, recordId, details, result) {
  try {
    const sheet = getSheet("ActivityLogs");
    sheet.appendRow([
      generateId("log"),
      now(),
      "system",
      action,
      table || "",
      recordId || "",
      JSON.stringify(details || {}),
      result || "success",
    ]);
  } catch (err) {
    // Avoid failing user actions because logging failed.
  }
}

function csvCell(value) {
  const text = String(value === undefined || value === null ? "" : value);
  if (/[",\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

function publicAck(id) {
  return { id: id, received_at: now() };
}
