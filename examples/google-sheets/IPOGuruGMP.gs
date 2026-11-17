/**
 * IPO GMP in Google Sheets, using the IPO Guru API. Works on the Free plan.
 *
 * Setup (5 minutes):
 *  1. Open a Google Sheet → Extensions → Apps Script. Paste this whole file and save.
 *  2. In Apps Script: Project Settings (gear icon) → Script properties → Add property
 *       Property: IPOGURU_API_KEY    Value: your key
 *     The key stays in the script's properties, not in the sheet, so sharing
 *     the sheet does not share your key.
 *  3. Reload the sheet. A new menu "IPO Guru" appears → "Refresh GMP".
 *     The first run asks you to authorise the script.
 *
 * Auto-refresh: Apps Script → Triggers → Add trigger → refreshGmp → Time-driven.
 * Mind your quota: the Free plan allows 10 requests a day, so refresh every
 * 2–3 hours at most; paid plans allow far more.
 *
 * Attribution is required: the sheet keeps an "IPO data by IPO Guru" link in
 * row 1. Please leave it in place on every sheet that shows the data.
 */

var BASE_URL = 'https://www.ipoguru.in/api/v2';
var SHEET_NAME = 'IPO GMP';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('IPO Guru')
    .addItem('Refresh GMP', 'refreshGmp')
    .addToUi();
}

function ipoguruGet_(path) {
  var key = PropertiesService.getScriptProperties().getProperty('IPOGURU_API_KEY');
  if (!key) {
    throw new Error('Add IPOGURU_API_KEY under Project Settings → Script properties. Get a free key at https://www.ipoguru.in/developer/login');
  }

  var res = UrlFetchApp.fetch(BASE_URL + path, {
    headers: { 'X-API-KEY': key, Accept: 'application/json' },
    muteHttpExceptions: true,
  });

  var body = {};
  try {
    body = JSON.parse(res.getContentText());
  } catch (e) {}

  if (res.getResponseCode() !== 200) {
    throw new Error('IPO Guru API ' + res.getResponseCode() + ' ' + (body.error || '') + ': ' + (body.message || 'request failed'));
  }
  return body;
}

function refreshGmp() {
  var result = ipoguruGet_('/gmp');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  sheet.clear();

  // Row 1: required attribution link + when the sheet was refreshed.
  sheet.getRange('A1').setFormula('=HYPERLINK("https://www.ipoguru.in/", "IPO data by IPO Guru")');
  sheet.getRange('C1').setValue('Refreshed ' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a') + ' IST');
  sheet.getRange('F1').setValue('GMP is an unofficial grey-market indicator, not investment advice.');

  var header = ['IPO', 'Board', 'Status', 'Price band', 'GMP (₹)', 'GMP %', 'Est. listing (₹)', 'GMP updated', 'IPO page'];
  var rows = result.data.map(function (ipo) {
    var g = ipo.gmp || {};
    return [
      ipo.name,
      ipo.type,
      ipo.status,
      ipo.price_band || 'TBA',
      g.price != null ? Number(g.price) : '',
      g.percentage != null ? Number(g.percentage) / 100 : '',
      g.estimated_listing_price != null ? g.estimated_listing_price : '',
      g.updated_at_label || '',
      'https://www.ipoguru.in/ipo/' + ipo.slug,
    ];
  });

  sheet.getRange(3, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  if (rows.length) {
    sheet.getRange(4, 1, rows.length, header.length).setValues(rows);
    sheet.getRange(4, 6, rows.length, 1).setNumberFormat('0.00%');
  }
  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, header.length);
}
