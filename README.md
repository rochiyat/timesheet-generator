<p align="center">
  <img src="https://raw.githubusercontent.com/rochiyat/timesheet-generator/master/icons/icon128.png" alt="Timesheet Generator" width="80" />
</p>

<h1 align="center">Timesheet Generator</h1>

<p align="center">
  <strong>Chrome extension to auto-generate monthly timesheets from your own Excel templates.</strong><br />
  Dates are filled in, weekends &amp; national holidays are color-coded, and holiday descriptions are fetched automatically.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/manifest-v3-blue?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/version-1.0.0-green?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-orange?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/platform-Chrome-yellow?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome" />
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| **Template-based** | Upload your own `.xlsx` template — supports multiple templates per client or project |
| **Auto-fill dates** | Every day of the selected month is populated with the correct date and day name |
| **Holiday detection** | Fetches Indonesian national holidays via [`api-hari-libur.vercel.app`](https://api-hari-libur.vercel.app) |
| **Color coding** | Weekends and holidays are highlighted with a customizable background color |
| **Bilingual** | Supports both **Bahasa Indonesia** and **English** output |
| **Smart formulas** | `Total Mandays` is auto-calculated using a `COUNTIF` formula on the Status column |
| **Persistent storage** | Templates are saved in Chrome local storage — no re-upload needed |
| **Offline-resilient** | If the holiday API is unreachable, generation proceeds with weekends only |

---

## 🚀 Installation

> This extension is not published on the Chrome Web Store. Install it manually via **Load Unpacked**.

1. **Clone or download** this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the project folder.
5. The extension icon will appear in the Chrome toolbar — you're ready to go.

---

## 📖 Usage

### 1 &mdash; Select Month & Year

Open the extension popup, pick the desired **month**, **year**, and **language**. You can also customize the **highlight color** for weekends/holidays.

### 2 &mdash; Check Holidays *(optional)*

Click **Cek Hari Libur** to preview the list of national holidays for the selected month. Data is cached locally for instant re-access.

### 3 &mdash; Upload a Template

Upload one or more `.xlsx` template files. Each upload prompts for a **label** (e.g., `Client A`, `Project X`). Templates are stored persistently — upload once, reuse anytime.

> **Template requirement:** The template must contain a header row with the following columns (order is flexible):
>
> `Date` · `Clock In` · `Clock Out` · `Total Hour` · `Status Attendance` · `Project Name` · `WFO/WFH` · `Overtime` · `Work Detail` · `Remarks`

### 4 &mdash; Generate

Select a saved template via the radio button, then click **Generate Timesheet**. A new `.xlsx` file downloads instantly with:

- ✅ All dates filled for the selected month
- 🎨 Weekend & holiday rows color-coded
- 📝 Holiday descriptions auto-filled in the Remarks column
- 📊 `Total Mandays` formula ready (counts `"P"` entries in Status Attendance)
- 🕐 Clock In/Out, Status, Project, WFO/WFH left blank for manual entry

---

## 🗂 Project Structure

```
timesheet-generator/
├── manifest.json        # Chrome Extension manifest (v3)
├── popup.html           # Extension popup UI
├── popup.css            # Popup styles
├── popup.js             # Core logic — holiday fetch, template management, generation
├── lib/
│   └── exceljs.min.js   # ExcelJS library for reading/writing .xlsx
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── LICENSE              # MIT License
└── README.md
```

---

## ⚙️ How It Works

```
┌──────────────┐     ┌─────────────────────┐     ┌────────────────┐
│  User picks  │────▶│  Fetch holidays via  │────▶│  Load template │
│  month/year  │     │  public API + cache  │     │  from storage  │
└──────────────┘     └─────────────────────┘     └───────┬────────┘
                                                         │
                                                         ▼
                                                ┌────────────────┐
                                                │  ExcelJS parses│
                                                │  .xlsx template│
                                                └───────┬────────┘
                                                        │
                          ┌─────────────────────────────┘
                          ▼
               ┌─────────────────────┐
               │  Fill dates, apply  │
               │  colors, set formulas│
               └──────────┬──────────┘
                          │
                          ▼
               ┌─────────────────────┐
               │  Download generated │
               │  .xlsx timesheet    │
               └─────────────────────┘
```

---

## 🔒 Permissions

| Permission | Reason |
|---|---|
| `storage` | Persist uploaded templates, active selection, holiday cache, and color preference |
| `downloads` | Trigger the generated `.xlsx` file download |
| `host_permissions` | Access `api-hari-libur.vercel.app` for national holiday data |

---

## 📝 Notes

- The holiday API covers **Indonesian national holidays** only. For other countries, the Remarks column will remain empty (weekends are still detected).
- If the API is down, generation proceeds normally — only weekends will be color-coded.
- Template header matching is **case-insensitive** and ignores special characters, so minor variations like `clock_in` or `ClockIn` are accepted.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<p align="center">
  <sub>Made with ☕ by <strong>Rochiyat</strong></sub>
</p>
