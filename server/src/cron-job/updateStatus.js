const cron = require('node-cron');
const changeStatus = require('../common/changeStatus');
const logging = require('../middleware/autologging');
const resolveNotification = require('../graphql/resolves/notification/resolveNotification');
const dashboardHelper = require('../common/dashboardHelper');
const notificationTemp = require('../common/notificationTemp');
const db = require('../data/knex-db');

var task = cron.schedule('*/2 * * * *', async () => {
  try {
    await changeStatus.appeal();
    let listCampaignIdComplete = await changeStatus.campaign();

    let parent = null;
    let context = {
      currentUser: {
        User_ID: null
      }
    };

    //Gửi thông báo cho charity và company
    if (listCampaignIdComplete.length) {
      let listCampaign = await db.table('Campaign').whereIn('Campaign_ID', listCampaignIdComplete);

      let listCharity = await db.table('Charity')
      .select(
        'Moves_Charity_ID',
        'Charity_Name',
        'Payment_Site_Url',
        'Account_Name',
        'Account_No',
        'Sort_Code',
        'Member_Payment_Site_Url',
        'Member_Account_Name',
        'Member_Account_No',
        'Member_Sort_Code'
      )
      .whereIn('Moves_Charity_ID', listCampaign.map(x => x.Moves_Charity_ID));
      
      let listCompany = await db.table('Company')
      .select(
        'Moves_Company_ID',
        'Company_Name'
      )
      .whereIn('Moves_Company_ID', listCampaign.map(x => x.Moves_Company_ID));

      let listCompanyMatch = await db.table('Company')
      .select(
        'Company.Moves_Company_ID',
        'Company.Company_Name',
        'Match.Campaign_ID'
      )
      .innerJoin('Match', 'Match.Moves_Company_ID', 'Company.Moves_Company_ID')
      .whereIn('Match.Campaign_ID', listCampaignIdComplete);

      for(let i = 0; i < listCampaign.length; i++) {
        let campaign = listCampaign[i];
        campaign.Campaign_Launch_Date = new Date(campaign.Campaign_Launch_Date).toLocaleDateString('en-GB');
        campaign.Campaign_End_Date = new Date(campaign.Campaign_End_Date).toLocaleDateString('en-GB');

        let charity = listCharity.find(x => x.Moves_Charity_ID == campaign.Moves_Charity_ID);
        let company = listCompany.find(x => x.Moves_Company_ID == campaign.Moves_Company_ID);
        let lstCompanyMatch = listCompanyMatch.filter(x => x.Campaign_ID == campaign.Campaign_ID);

        let donationCampaign = await dashboardHelper.getDonationCampaign(campaign.Campaign_ID);
        let sterling_Amount = donationCampaign.Sterling_Amount;

        let temp1 = notificationTemp.temp1(campaign, company, sterling_Amount);
        let temp3 = notificationTemp.temp3(campaign, charity, sterling_Amount);

        //Gửi thông báo đến Charity của campaign đó 
        let args1 = {
          bodyData: {
            Notification_To_Charity_ID: charity.Moves_Charity_ID,
            Notification_To_Company_ID: null,
            Content: temp1
          }
        };
        resolveNotification.Mutation.createNotification(parent, args1, context);

        //Gửi thông báo đến Company được gán với Campaign đó
        let args3 = {
          bodyData: {
            Notification_To_Charity_ID: null,
            Notification_To_Company_ID: company.Moves_Company_ID,
            Content: temp3
          }
        };
        resolveNotification.Mutation.createNotification(parent, args3, context);

        lstCompanyMatch.forEach(companyMatch => {
          let temp2 = notificationTemp.temp2(campaign, companyMatch, sterling_Amount);
          let temp4 = notificationTemp.temp4(campaign, charity, sterling_Amount);

          //Gửi thông báo về các company match với campaign đó đến Charity của campaign
          let args2 = {
            bodyData: {
              Notification_To_Charity_ID: charity.Moves_Charity_ID,
              Notification_To_Company_ID: null,
              Content: temp2
            }
          };
          resolveNotification.Mutation.createNotification(parent, args2, context);
  
          //Gửi thông báo đến các Company match với Campaign đó
          let args4 = {
            bodyData: {
              Notification_To_Charity_ID: null,
              Notification_To_Company_ID: companyMatch.Moves_Company_ID,
              Content: temp4
            }
          };
          resolveNotification.Mutation.createNotification(parent, args4, context);
        })
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