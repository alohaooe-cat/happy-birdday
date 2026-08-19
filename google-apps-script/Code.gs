const SHEET_NAME = 'Responses';
// Отдельная вкладка: кто как отвечал на вопросы теста.
const ANSWERS_SHEET_NAME = 'Answers';

const HEADERS = [
  'responseId',
  'guestName',
  'answersJson',
  'score',
  'testResult',
  'selectedFlock',
  'attendance',
  'dressPledge',
  'excursionConfirmed',
  'excursionPartySize',
  'guestMessage',
  'createdAt',
  'updatedAt',
  'receivedAt',
];

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents);
    if (!payload.responseId) throw new Error('responseId is required');

    // Пропуск. Если свойство FORM_TOKEN не задано, проверка не выполняется
    // и приём ответов работает как раньше.
    const expectedToken = PropertiesService.getScriptProperties().getProperty('FORM_TOKEN');
    if (expectedToken && payload.token !== expectedToken) {
      return json_({ ok: false, error: 'forbidden' });
    }

    const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) throw new Error('SPREADSHEET_ID is not configured');

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
    ensureHeaders_(sheet);

    const row = [
      payload.responseId,
      payload.guestName || '',
      JSON.stringify(payload.answers || []),
      Number(payload.score || 0),
      payload.testResult || '',
      payload.selectedFlock || '',
      payload.attendance || '',
      Boolean(payload.dressPledge),
      payload.excursionConfirmed === null ? '' : Boolean(payload.excursionConfirmed),
      Number(payload.excursionPartySize || 0),
      payload.guestMessage || '',
      payload.createdAt || '',
      payload.updatedAt || '',
      new Date().toISOString(),
    ];

    const existingRow = findResponseRow_(sheet, payload.responseId);
    if (existingRow) {
      sheet.getRange(existingRow, 1, 1, HEADERS.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    // Расшифровка ответов — во вторую вкладку. Ошибка здесь не должна
    // ломать приём основного ответа, поэтому отдельный try.
    try {
      writeAnswers_(spreadsheet, payload);
    } catch (answersError) {
      console.error('answers sheet: ' + answersError);
    }

    return json_({ ok: true, responseId: payload.responseId, updated: Boolean(existingRow) });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

/**
 * Матрица ответов: строка — гость, столбец — вопрос, в клетке выбранный ответ.
 * Порядок вопросов берётся из присланной расшифровки, поэтому шапка
 * переписывается, когда набор вопросов меняется.
 */
function writeAnswers_(spreadsheet, payload) {
  const pairs = payload.answerLabels;
  if (!pairs || !pairs.length) return;

  const sheet = spreadsheet.getSheetByName(ANSWERS_SHEET_NAME)
    || spreadsheet.insertSheet(ANSWERS_SHEET_NAME);

  const headers = ['responseId', 'guestName', 'testResult']
    .concat(pairs.map(function (pair) { return pair.question; }));

  const currentHeaders = sheet.getLastRow() === 0
    ? []
    : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  if (String(currentHeaders) !== String(headers)) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  const row = [payload.responseId, payload.guestName || '', payload.testResult || '']
    .concat(pairs.map(function (pair) { return pair.answer; }));

  const existingRow = findResponseRow_(sheet, payload.responseId);
  if (existingRow) {
    sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).createFilter();
  }
}

function findResponseRow_(sheet, responseId) {
  if (sheet.getLastRow() < 2) return 0;
  const match = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, 1)
    .createTextFinder(responseId)
    .matchEntireCell(true)
    .findNext();
  return match ? match.getRow() : 0;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

