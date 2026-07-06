/* Timesheet Generator - popup.js */

const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS_ID = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

const HOLIDAY_TRANSLATIONS = {
  "tahun baru masehi": "New Year's Day",
  "tahun baru imlek": "Chinese New Year",
  "isra mikraj nabi muhammad saw": "Isra Mi'raj of Prophet Muhammad",
  "isra' mi'raj nabi muhammad saw": "Isra Mi'raj of Prophet Muhammad",
  "hari suci nyepi": "Nyepi (Balinese Day of Silence)",
  "wafat isa al-masih": "Good Friday",
  "wafat yesus kristus": "Good Friday",
  "kenaikan yesus kristus": "Ascension of Jesus Christ",
  "kenaikan isa al-masih": "Ascension of Jesus Christ",
  "hari paskah": "Easter Sunday",
  "hari buruh internasional": "International Labor Day",
  "hari raya waisak": "Vesak Day",
  "hari lahir pancasila": "Pancasila Day",
  "hari raya idul fitri": "Eid al-Fitr",
  "hari raya idul adha": "Eid al-Adha",
  "tahun baru islam": "Islamic New Year",
  "hari kemerdekaan ri": "Independence Day",
  "proklamasi kemerdekaan ri": "Independence Day",
  "hari kemerdekaan": "Independence Day",
  "maulid nabi muhammad saw": "Prophet Muhammad's Birthday",
  "hari raya natal": "Christmas Day",
  "cuti bersama": "Collective Leave"
};

function translateHoliday(desc) {
  if (!desc) return "";
  let normalized = desc.toLowerCase().trim();
  if (HOLIDAY_TRANSLATIONS[normalized]) {
    return HOLIDAY_TRANSLATIONS[normalized];
  }
  let temp = normalized;
  temp = temp.replace(/cuti bersama/g, "Collective Leave");
  temp = temp.replace(/tahun baru masehi/g, "New Year's Day");
  temp = temp.replace(/tahun baru imlek/g, "Chinese New Year");
  temp = temp.replace(/isra'?\s*mi'raj\s*nabi\s*muhammad\s*saw/g, "Isra Mi'raj of Prophet Muhammad");
  temp = temp.replace(/hari\s*suci\s*nyepi/g, "Nyepi (Balinese Day of Silence)");
  temp = temp.replace(/wafat\s*(isa\s*al-masih|yesus\s*kristus)/g, "Good Friday");
  temp = temp.replace(/kenaikan\s*(isa\s*al-masih|yesus\s*kristus)/g, "Ascension of Jesus Christ");
  temp = temp.replace(/hari\s*paskah/g, "Easter Sunday");
  temp = temp.replace(/hari\s*buruh\s*internasional/g, "International Labor Day");
  temp = temp.replace(/hari\s*raya\s*waisak/g, "Vesak Day");
  temp = temp.replace(/hari\s*lahir\s*pancasila/g, "Pancasila Day");
  temp = temp.replace(/hari\s*raya\s*idul\s*fitri/g, "Eid al-Fitr");
  temp = temp.replace(/hari\s*raya\s*idul\s*adha/g, "Eid al-Adha");
  temp = temp.replace(/tahun\s*baru\s*islam/g, "Islamic New Year");
  temp = temp.replace(/hari\s*kemerdekaan\s*(ri)?/g, "Independence Day");
  temp = temp.replace(/maulid\s*nabi\s*muhammad\s*saw/g, "Prophet Muhammad's Birthday");
  temp = temp.replace(/hari\s*raya\s*natal/g, "Christmas Day");

  if (temp !== normalized) {
    return temp.replace(/\b[a-z]/g, (match) => match.toUpperCase());
  }
  return desc;
}

function getHolidayDescription(desc, lang) {
  if (lang === "en") {
    return translateHoliday(desc);
  }
  return desc;
}

const monthSelect = document.getElementById("month");
const yearInput = document.getElementById("year");
const langSelect = document.getElementById("lang");
const btnHolidays = document.getElementById("btnHolidays");
const holidayListEl = document.getElementById("holidayList");
const templateFileInput = document.getElementById("templateFile");
const templateListEl = document.getElementById("templateList");
const btnGenerate = document.getElementById("btnGenerate");
const statusEl = document.getElementById("status");
const holidayColorInput = document.getElementById("holidayColor");

let currentHolidays = null;   // { "2026-01-01": "description", ... }
let currentHolidaysKey = null; // "year-month"

// ---------- init ----------
function populateMonths() {
  const currentVal = monthSelect.value;
  monthSelect.innerHTML = "";
  const isEn = langSelect.value === "en";
  const months = isEn ? MONTHS_EN : MONTHS_ID;
  months.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i + 1;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  });
  if (currentVal) {
    monthSelect.value = currentVal;
  } else {
    monthSelect.value = new Date().getMonth() + 1;
  }
}

populateMonths();
// Pre-fetch holidays in the background when popup opens
fetchHolidays(false);

monthSelect.addEventListener("change", () => {
  fetchHolidays(false);
});

yearInput.addEventListener("change", () => {
  fetchHolidays(false);
});

langSelect.addEventListener("change", () => {
  populateMonths();
  if (currentHolidays) {
    renderHolidayList(currentHolidays);
  }
});

chrome.storage.local.get(["holidayColor"], (res) => {
  if (res.holidayColor) {
    holidayColorInput.value = res.holidayColor;
  }
});

holidayColorInput.addEventListener("change", (e) => {
  chrome.storage.local.set({ holidayColor: e.target.value });
});

renderTemplateList();

function renderTemplateList() {
  chrome.storage.local.get(["templates", "activeTemplateId"], (res) => {
    const templates = res.templates || [];
    const activeId = res.activeTemplateId;

    if (templates.length === 0) {
      templateListEl.innerHTML = `<div class="muted">Belum ada template tersimpan.</div>`;
      btnGenerate.disabled = true;
      return;
    }

    templateListEl.innerHTML = templates
      .map((t) => {
        const checked = t.id === activeId ? "checked" : "";
        const dateStr = new Date(t.addedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
        return `
          <div class="template-item">
            <input type="radio" name="templateChoice" value="${t.id}" ${checked} />
            <div class="info">
              <div class="name" title="${escapeHtml(t.name)}">${escapeHtml(t.name)}</div>
              <div class="date">Diupload ${dateStr}</div>
            </div>
            <button class="del" data-id="${t.id}" title="Hapus template ini">✕</button>
          </div>`;
      })
      .join("");

    btnGenerate.disabled = !activeId;

    templateListEl.querySelectorAll('input[name="templateChoice"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        chrome.storage.local.set({ activeTemplateId: e.target.value }, renderTemplateList);
      });
    });

    templateListEl.querySelectorAll(".del").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        chrome.storage.local.get(["templates", "activeTemplateId"], (res2) => {
          const remaining = (res2.templates || []).filter((t) => t.id !== id);
          let newActive = res2.activeTemplateId;
          if (newActive === id) {
            newActive = remaining.length ? remaining[remaining.length - 1].id : null;
          }
          chrome.storage.local.set({ templates: remaining, activeTemplateId: newActive }, renderTemplateList);
        });
      });
    });
  });
}

// ---------- holidays ----------
btnHolidays.addEventListener("click", () => fetchHolidays(true));

async function fetchHolidays(renderList) {
  const year = Number(yearInput.value);
  const month = Number(monthSelect.value);
  const key = `${year}-${month}`;

  if (currentHolidaysKey === key && currentHolidays) {
    if (renderList) renderHolidayList(currentHolidays);
    return currentHolidays;
  }

  if (renderList) {
    holidayListEl.innerHTML = `<div class="muted">Memuat data hari libur...</div>`;
  }

  // Check storage cache first to make operations instantaneous
  const cacheKey = `holidays_${key}`;
  try {
    const res = await chrome.storage.local.get([cacheKey]);
    if (res[cacheKey]) {
      const map = res[cacheKey];
      currentHolidays = map;
      currentHolidaysKey = key;
      if (renderList) renderHolidayList(map);
      return map;
    }
  } catch (err) {
    console.error("Gagal membaca cache hari libur:", err);
  }

  try {
    const url = `https://api-hari-libur.vercel.app/api?year=${year}&month=${month}`;
    const resp = await fetch(url);
    const json = await resp.json();
    const map = {};
    if (json && json.data) {
      json.data.forEach((h) => { map[h.date] = h.description; });
    }
    currentHolidays = map;
    currentHolidaysKey = key;

    // Save to cache
    chrome.storage.local.set({ [cacheKey]: map });

    if (renderList) renderHolidayList(map);
    return map;
  } catch (err) {
    if (renderList) {
      holidayListEl.innerHTML = `<div class="muted">Gagal mengambil data hari libur (${err.message}). Cek koneksi internet.</div>`;
    }
    currentHolidays = {};
    currentHolidaysKey = key;
    return {};
  }
}

function renderHolidayList(map) {
  const entries = Object.entries(map);
  const lang = langSelect.value;
  if (entries.length === 0) {
    holidayListEl.innerHTML = `<div class="muted">${lang === "en" ? "No national holidays this month." : "Tidak ada hari libur nasional di bulan ini."}</div>`;
    return;
  }
  holidayListEl.innerHTML = entries
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, desc]) => {
      const displayDesc = getHolidayDescription(desc, lang);
      return `<div class="holiday-item"><span class="d">${date.slice(8, 10)}</span><span class="t">${escapeHtml(displayDesc)}</span></div>`;
    })
    .join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- template upload ----------
templateFileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const defaultName = file.name.replace(/\.xlsx$/i, "");
  const label = window.prompt("Nama untuk template ini:", defaultName) || defaultName;

  const buf = await file.arrayBuffer();
  const base64 = arrayBufferToBase64(buf);
  const id = `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  chrome.storage.local.get(["templates"], (res) => {
    const templates = res.templates || [];
    templates.push({ id, name: label, base64, addedAt: Date.now() });
    chrome.storage.local.set({ templates, activeTemplateId: id }, () => {
      templateFileInput.value = "";
      renderTemplateList();
    });
  });
});

// ---------- generate ----------
btnGenerate.addEventListener("click", async () => {
  statusEl.textContent = "Memproses...";
  btnGenerate.disabled = true;
  try {
    const { templates, activeTemplateId } = await chrome.storage.local.get(["templates", "activeTemplateId"]);
    const activeTemplate = (templates || []).find((t) => t.id === activeTemplateId);
    if (!activeTemplate) throw new Error("Pilih template terlebih dahulu.");
    const templateBase64 = activeTemplate.base64;

    const year = Number(yearInput.value);
    const month = Number(monthSelect.value);
    const lang = langSelect.value;
    const holidays = await fetchHolidays(false);

    const buf = base64ToArrayBuffer(templateBase64);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buf);
    const worksheet = workbook.worksheets[0];

    generateTimesheet(worksheet, year, month, holidays, lang, holidayColorInput.value);

    const outBuf = await workbook.xlsx.writeBuffer();
    const blob = new Blob([outBuf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const monthsList = lang === "en" ? MONTHS_EN : MONTHS_ID;
    a.download = `Timesheet_${monthsList[month - 1]}_${year}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    statusEl.textContent = "Selesai! File timesheet sudah didownload.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Gagal: ${err.message}`;
  } finally {
    btnGenerate.disabled = false;
  }
});

// ---------- core generation logic ----------

const HEADER_ALIASES = {
  date: "date",
  clockin: "clockIn",
  clockout: "clockOut",
  totalhour: "totalHour",
  statusattendance: "statusAttendance",
  projectname: "projectName",
  wfowfh: "wfoWfh",
  overtime: "overtime",
  workdetail: "workDetail",
  remarks: "remarks",
};

function normalizeHeader(v) {
  if (v === null || v === undefined) return "";
  return v.toString().trim().toLowerCase().replace(/[^a-z]/g, "");
}

function colLetter(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - m) / 26);
  }
  return s;
}

function findHeaderRow(worksheet) {
  for (let r = 1; r <= 20; r++) {
    const row = worksheet.getRow(r);
    const map = {};
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const norm = normalizeHeader(cell.value);
      if (norm && HEADER_ALIASES[norm]) map[HEADER_ALIASES[norm]] = colNumber;
    });
    if (map.date) return { rowNumber: r, map };
  }
  throw new Error("Kolom 'Date' tidak ditemukan di template. Pastikan template sesuai format.");
}

function findDataRange(worksheet, headerRowNumber, dateCol) {
  const start = headerRowNumber + 1;
  let r = start;
  while (r - start < 200) {
    const v = worksheet.getRow(r).getCell(dateCol).value;
    if (v === null || v === undefined || v === "") break;
    if (/total/i.test(v.toString())) break;
    r++;
  }
  return { start, end: r - 1 };
}

function cloneFill(fill) {
  return fill ? JSON.parse(JSON.stringify(fill)) : null;
}

function findRowContaining(worksheet, pattern, fromRow, toRow) {
  for (let r = fromRow; r <= toRow; r++) {
    const row = worksheet.getRow(r);
    let found = null;
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      if (!found && cell.value && pattern.test(cell.value.toString())) {
        found = { rowNumber: r, colNumber };
      }
    });
    if (found) return found;
  }
  return null;
}

function generateTimesheet(worksheet, year, month, holidays, lang, holidayHex) {
  const { rowNumber: headerRow, map } = findHeaderRow(worksheet);
  const dateCol = map.date;
  const lastCol = Math.max(...Object.values(map));

  const { start, end } = findDataRange(worksheet, headerRow, dateCol);
  const templateRowCount = end - start + 1;

  const isEn = lang === "en";
  const monthsList = isEn ? MONTHS_EN : MONTHS_ID;
  const daysList = isEn ? DAYS_EN : DAYS_ID;

  // Use user-defined holiday color or fallback to soft pink
  const hex = (holidayHex || "#fce7f3").replace("#", "").toUpperCase();
  const argb = hex.length === 6 ? "FF" + hex : hex;
  const PINK_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: argb } };
  const NO_FILL = { type: "pattern", pattern: "none" };

  let weekdayFill = null;
  for (let r = start; r <= end; r++) {
    const text = (worksheet.getRow(r).getCell(dateCol).value || "").toString();
    const isWeekendRow = /saturday|sunday|sabtu|minggu/i.test(text);
    const fill = worksheet.getRow(r).getCell(dateCol).fill;
    if (!isWeekendRow && !weekdayFill) {
      weekdayFill = cloneFill(fill);
      break;
    }
  }
  if (!weekdayFill) weekdayFill = NO_FILL;

  const daysInMonth = new Date(year, month, 0).getDate();

  // Adjust row count to match days in this month
  if (daysInMonth > templateRowCount) {
    worksheet.duplicateRow(end, daysInMonth - templateRowCount, true);
  } else if (daysInMonth < templateRowCount) {
    worksheet.spliceRows(start + daysInMonth, templateRowCount - daysInMonth);
  }

  // Fill in each date row
  for (let i = 0; i < daysInMonth; i++) {
    const rowNum = start + i;
    const dateNum = i + 1;
    const dateObj = new Date(year, month - 1, dateNum);
    const dayName = daysList[dateObj.getDay()];
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;
    const holidayDesc = holidays ? holidays[iso] : undefined;
    const isDayOff = isWeekend || !!holidayDesc;

    const row = worksheet.getRow(rowNum);

    // Clear all column cell values to ensure we only take the columns (headers) of the template
    // Keep Excel formulas if they exist (e.g. for Total Hour calculation)
    for (let c = 1; c <= lastCol; c++) {
      const cell = row.getCell(c);
      if (cell.value && typeof cell.value === "object" && cell.value.formula) {
        cell.value = { formula: cell.value.formula };
      } else {
        cell.value = null;
      }
    }

    // Populate date
    row.getCell(dateCol).value = `${dayName}, ${String(dateNum).padStart(2, "0")} ${monthsList[month - 1]} ${year}`;

    // Populate workDetail if holiday (as requested by user)
    const workDetailCol = map.workDetail;
    if (workDetailCol && holidayDesc) {
      row.getCell(workDetailCol).value = getHolidayDescription(holidayDesc, lang);
    }

    // Apply background color to the row cells by setting style object to avoid shared references
    for (let c = 1; c <= lastCol; c++) {
      const cell = row.getCell(c);
      cell.style = {
        ...cell.style,
        fill: isDayOff ? PINK_FILL : weekdayFill
      };
    }
  }

  // Update "Total Mandays" formula if present
  const totalRowInfo = findRowContaining(worksheet, /total\s*mandays/i, start + daysInMonth, start + daysInMonth + 10);
  if (totalRowInfo) {
    const statusCol = map.statusAttendance;
    if (statusCol) {
      const letter = colLetter(statusCol);
      const valueCell = worksheet.getRow(totalRowInfo.rowNumber).getCell(totalRowInfo.colNumber + 1);
      valueCell.value = { formula: `COUNTIF(${letter}${start}:${letter}${start + daysInMonth - 1},"P")` };
    }
  }

  // Update title cell (e.g. "Timesheet ... - June 2026") if present
  const titleInfo = findRowContaining(worksheet, /timesheet/i, 1, headerRow - 1);
  if (titleInfo) {
    const cell = worksheet.getRow(titleInfo.rowNumber).getCell(titleInfo.colNumber);
    const original = cell.value ? cell.value.toString() : "";
    if (/-\s*\S/.test(original)) {
      cell.value = original.replace(/-\s*.*$/, `- ${monthsList[month - 1]} ${year}`);
    } else {
      cell.value = `${original} - ${monthsList[month - 1]} ${year}`;
    }
  }
}

// ---------- helpers ----------
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
