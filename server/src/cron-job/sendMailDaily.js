const db = require('../data/knex-db');
const cron = require('node-cron');
const sendEmail = require('../common/sendEmail');
const emailTemp = require('../common/emailTemp');
const logging = require('../middleware/autologging');
const dashboardHelper = require('../common/dashboardHelper');
const exportPDF = require('../common/exportPdf');
const { saveFile, deleteFile, downloadFile } = require('../common/handleFile');

var task = cron.schedule('0 0 * * *', async () => {
  try {
    let listCompany = await db.table('Company')
      .where('Is_Active', true);

    let listCampaign = await db.table('Campaign')
      .where('Campaign_Status_ID', 24)
      .andWhere('Is_Send_Mail', false);

    let listMatch = await db.table('Match');

    for (let i = 0; i < listCampaign.length; i++) {
      let campaign = listCampaign[i];

      //Nếu campaign có cấu hình phần trăm chiết khấu cho moves matter
      if (campaign.Percentage_Discount > 0) {
        let existsSendMail = await db.table('Send_Mail_History')
          .where('Campaign_ID', campaign.Campaign_ID)
          .first();

        let listCompanyIdMatch = [];

        //Nếu chưa gửi mail bao giờ
        if (!existsSendMail) {
          //Lấy list company đã match với campaign
          let listCompanyMatch = listMatch.filter(x => x.Campaign_ID == campaign.Campaign_ID);
          listCompanyIdMatch = listCompanyMatch.map(x => x.Moves_Company_ID);
          listCompanyIdMatch.push(campaign.Moves_Company_ID);

          //Thêm vào bảng Send_Mail_History
          for (let k = 0; k < listCompanyIdMatch.length; k++) {
            await db.table('Send_Mail_History')
              .insert({
                Campaign_ID: campaign.Campaign_ID,
                Moves_Company_ID: listCompanyIdMatch[k],
              });
          }
        }
        //Nếu đã gửi mail nhưng chưa gửi hết
        else {
          let listNotSend = await db.table('Send_Mail_History')
            .where('Campaign_ID', campaign.Campaign_ID)
            .andWhere('Is_Send_Mail', false);

          if (listNotSend.length) {
            listCompanyIdMatch = listNotSend.map(x => x.Moves_Company_ID);
          }
        }

        let listCompanySendMail = [];
        listCompanySendMail = listCompany.filter(x => listCompanyIdMatch.includes(x.Moves_Company_ID));

        let Donation = 0;
        if (campaign.End_Date_Target) {
          let _result = await dashboardHelper.getDonationCampaign(campaign.Campaign_ID);
          Donation = _result.Sterling_Amount;
        }
        else {
          Donation = campaign.Campaign_Target_Value;
        }

        //Gửi mail
        for (let j = 0; j < listCompanySendMail.length; j++) {
          let company = listCompanySendMail[j];
          company.invoice_amount = Donation;
          let fileNamePdf = await exportPDF.companyInvoice('invoiceCompany', company);
					let filePdf = 'temp/' + fileNamePdf;
          let isSendSuccess = true;
          await sendEmail.sendEmail(company.Contact_Email.trim(),
            `${campaign.Campaign_Name} is Complete on Moves Matter`,
            emailTemp.templateSendMailToCompany(campaign.Campaign_Name, campaign.Percentage_Discount, Donation),
            [
              {
								filename: fileNamePdf,
								content: filePdf
							}
            ],
            'stream'
          ).catch(err => {
            logging(null, err);
            isSendSuccess = false;
          });

          //Xóa file vật lý
					deleteFile([filePdf]);

          //Update trong bảng mapping: đã gửi email thành công cho cpmpany
          if (isSendSuccess) {
            await db.table('Send_Mail_History')
              .where('Campaign_ID', campaign.Campaign_ID)
              .andWhere('Moves_Company_ID', company.Moves_Company_ID)
              .update({
                Is_Send_Mail: true,
              });
          }
        }

        //Kiểm tra 
        let listMailNotSend = await db.table('Send_Mail_History')
          .where('Campaign_ID', campaign.Campaign_ID)
          .andWhere('Is_Send_Mail', false);

        //Nếu tất cả mail đều được gửi
        if (listMailNotSend.length == 0) {
          //Đổi trạng thái campaign thành đã gửi email
          await db.table('Campaign')
            .where('Campaign_ID', campaign.Campaign_ID)
            .update({
              Is_Send_Mail: true,
              Send_Mail_Company_Date: new Date
            });

          //Xóa dữ liệu trong bảng mapping khi campaign đã gửi thành công tất cả các mail
          await db.table('Send_Mail_History')
            .where('Campaign_ID', campaign.Campaign_ID)
            .del();
        }
      }
    }
  }
  catch (e) {
    logging(null, e);
  }
}, {
  scheduled: false
});

module.exports = task;