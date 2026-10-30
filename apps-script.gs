// 白大象報名表後台：貼到 Google 試算表的「擴充功能 → Apps Script」
const SHEET_NAME = '報名';
const HEADERS = ['時間', '稱呼', 'LINE 名稱', '會來嗎', '帶伴人數', '飲食禁忌', '想說的話'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.website) return ok_(); // 機器人陷阱欄位有值就丟掉

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
    }
    sh.appendRow([
      new Date(),
      clean_(d.name, 40),
      clean_(d.line, 60),
      clean_(d.status, 20),
      Math.max(0, Math.min(3, Number(d.plus) || 0)),
      clean_(d.diet, 100),
      clean_(d.message, 1000)
    ]);
    return ok_();
  } finally {
    lock.releaseLock();
  }
}

// 擋掉 =、+、-、@ 開頭的公式注入，並限制長度
function clean_(v, max) {
  let s = String(v == null ? '' : v).slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function ok_() {
  return ContentService.createTextOutput('{"ok":true}').setMimeType(ContentService.MimeType.JSON);
}
