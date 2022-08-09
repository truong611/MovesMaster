const fs = require('fs');
const pdf = require('html-pdf');
const path = require('path');
const { saveFile, deleteFile, downloadFile, copyFile, convertFileName } = require('../common/handleFile');
const commonSystem = require('./commonSystem');
const INVOICE_AMOUNT = process.env.INVOICE_AMOUNT;
const VAT_RATE = process.env.VAT_RATE;
const BANK_NAME = process.env.BANK_NAME;
const ALISAM_SORT_CODE = process.env.ALISAM_SORT_CODE;
const ALISAM_ACCOUNT_CODE = process.env.ALISAM_ACCOUNT_CODE;
const ALISAM_MOVES_ADDRESS = process.env.ALISAM_MOVES_ADDRESS;

const exportPDF = {
  charityInvoice: (fileNameHtml, dataInput) => {
    let html = fs.readFileSync(path.join(__dirname, `../upload/temp/${fileNameHtml}.html`), 'utf8');

    //replace
    html = html.replace(new RegExp('{Charity_Name}', 'g'), dataInput.Charity_Name);

    html = html.replace(new RegExp('{Charity_Contact_Name}', 'g'), dataInput.Contact_Name);

    html = html.replace(new RegExp('{Charity_Invoice_Address}', 'g'), '');

    let _ALISAM_MOVES_ADDRESS = ALISAM_MOVES_ADDRESS == 'null' ? '' : ALISAM_MOVES_ADDRESS;
    html = html.replace(new RegExp('{Alisam_Moves_Address}', 'g'), _ALISAM_MOVES_ADDRESS);

    let now = new Date();
    let todays = [
      now.getFullYear(),
      commonSystem.padTo2Digits(now.getMonth() + 1),
      commonSystem.padTo2Digits(now.getDate()),
    ].join("-");

    let now_extend_days = commonSystem.addDays(now, 30);
    now_extend_days = [
      now_extend_days.getFullYear(),
      commonSystem.padTo2Digits(now_extend_days.getMonth() + 1),
      commonSystem.padTo2Digits(now_extend_days.getDate()),
    ].join("-");

    html = html.replace(new RegExp('{todays_date}', 'g'), todays);

    html = html.replace(new RegExp('{Moves_Charity_ID}', 'g'), dataInput.Moves_Charity_ID);

    html = html.replace(new RegExp('{now_extend_days}', 'g'), now_extend_days);

    html = html.replace(new RegExp('{invoice_amount}', 'g'), INVOICE_AMOUNT);

    html = html.replace(new RegExp('{VAT_Rate}', 'g'), VAT_RATE);

    let VAT_Amount = commonSystem.roundNumber((parseFloat(INVOICE_AMOUNT) * parseFloat(VAT_RATE))/100, 2); 

    html = html.replace(new RegExp('{VAT_Amount}', 'g'), VAT_Amount.toString());

    let invoice_amount_VAT_Amount = parseFloat(INVOICE_AMOUNT) + VAT_Amount;

    html = html.replace(new RegExp('{invoice_amount_VAT_Amount}', 'g'), invoice_amount_VAT_Amount.toString());

    let _BANK_NAME = BANK_NAME == 'null' ? '' : BANK_NAME;
    html = html.replace(new RegExp('{Bank_Name}', 'g'), _BANK_NAME);

    let _ALISAM_SORT_CODE = ALISAM_SORT_CODE == 'null' ? '' : ALISAM_SORT_CODE;
    html = html.replace(new RegExp('{Alisam_Sort_Code}', 'g'), _ALISAM_SORT_CODE);

    let _ALISAM_ACCOUNT_CODE = ALISAM_ACCOUNT_CODE == 'null' ? '' : ALISAM_ACCOUNT_CODE;
    html = html.replace(new RegExp('{Alisam_Account_Code}', 'g'), _ALISAM_ACCOUNT_CODE);

    let output = convertFileName(fileNameHtml);
    return new Promise((resolve, reject) => {
      pdf.create(html, { format: "A4" }).toFile(path.join(__dirname, `../upload/temp/${output}.pdf`), function (err, res) {
        if (err) reject(err);
        else resolve(`${output}.pdf`);
      });
    });
  },
  companyInvoice: (fileNameHtml, dataInput) => {
    let html = fs.readFileSync(path.join(__dirname, `../upload/temp/${fileNameHtml}.html`), 'utf8');

    //replace
    html = html.replace(new RegExp('{Company_Name}', 'g'), dataInput.Company_Name);

    html = html.replace(new RegExp('{Company_Contact_Name}', 'g'), dataInput.Contact_Name);

    let _ALISAM_MOVES_ADDRESS = ALISAM_MOVES_ADDRESS == 'null' ? '' : ALISAM_MOVES_ADDRESS;
    html = html.replace(new RegExp('{Alisam_Moves_Address}', 'g'), _ALISAM_MOVES_ADDRESS);

    let now = new Date();
    let todays = [
      now.getFullYear(),
      commonSystem.padTo2Digits(now.getMonth() + 1),
      commonSystem.padTo2Digits(now.getDate()),
    ].join("-");

    let now_extend_days = commonSystem.addDays(now, 30);
    now_extend_days = [
      now_extend_days.getFullYear(),
      commonSystem.padTo2Digits(now_extend_days.getMonth() + 1),
      commonSystem.padTo2Digits(now_extend_days.getDate()),
    ].join("-");

    html = html.replace(new RegExp('{todays_date}', 'g'), todays);

    html = html.replace(new RegExp('{Moves_Company_ID}', 'g'), dataInput.Moves_Company_ID);

    html = html.replace(new RegExp('{now_extend_days}', 'g'), now_extend_days);

    let invoice_amount = dataInput.invoice_amount;

    html = html.replace(new RegExp('{invoice_amount}', 'g'), invoice_amount);

    html = html.replace(new RegExp('{VAT_Rate}', 'g'), VAT_RATE);

    let VAT_Amount = commonSystem.roundNumber((parseFloat(invoice_amount) * parseFloat(VAT_RATE))/100, 2); 

    html = html.replace(new RegExp('{VAT_Amount}', 'g'), VAT_Amount.toString());

    let invoice_amount_VAT_Amount = parseFloat(invoice_amount) + VAT_Amount;

    html = html.replace(new RegExp('{invoice_amount_VAT_Amount}', 'g'), invoice_amount_VAT_Amount.toString());

    let _BANK_NAME = BANK_NAME == 'null' ? '' : BANK_NAME;
    html = html.replace(new RegExp('{Bank_Name}', 'g'), _BANK_NAME);

    let _ALISAM_SORT_CODE = ALISAM_SORT_CODE == 'null' ? '' : ALISAM_SORT_CODE;
    html = html.replace(new RegExp('{Alisam_Sort_Code}', 'g'), _ALISAM_SORT_CODE);

    let _ALISAM_ACCOUNT_CODE = ALISAM_ACCOUNT_CODE == 'null' ? '' : ALISAM_ACCOUNT_CODE;
    html = html.replace(new RegExp('{Alisam_Account_Code}', 'g'), _ALISAM_ACCOUNT_CODE);

    let output = convertFileName(fileNameHtml);
    return new Promise((resolve, reject) => {
      pdf.create(html, { format: "A4" }).toFile(path.join(__dirname, `../upload/temp/${output}.pdf`), function (err, res) {
        if (err) reject(err);
        else resolve(`${output}.pdf`);
      });
    });
  }
}

module.exports = exportPDF;

