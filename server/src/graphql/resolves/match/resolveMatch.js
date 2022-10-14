const db = require('../../../data/knex-db');
const authenticated = require('../../../middleware/authenticated-guard');
const { saveFile, deleteFile, downloadFile, copyFile, convertFileName } = require('../../../common/handleFile');
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const logging = require('../../../middleware/autologging');
const bcrypt = require('bcryptjs');
const changeStatus = require('../../../common/changeStatus');
const commonSystem = require('../../../common/commonSystem');
const PERCENTAGE_DISCOUNT = process.env.PERCENTAGE_DISCOUNT;

const resolvers = {
  Query: {
    getListMatchByObjectId: (async (parent, args, context) => {
      try {
        let Type = args.Type;

        if (Type == 'campaign') {
          let Campaign_ID = args.Id;
        
          let ListMatch = [];
          let IsShowButtonCreate = false;

          changeStatus.campaign();

          let campaign = await db.table('Campaign')
            .where('Campaign_ID', Campaign_ID)
            .first();

          if (!campaign) {
            return {
              message: 'Campaign not found',
              messageCode: 404
            }
          }

          let charity = await db.table('Charity')
            .where('Moves_Charity_ID', campaign.Moves_Charity_ID)
            .first();

          campaign.Charity_Name = charity?.Charity_Name;

          let User_ID = context.currentUser.User_ID;
          let User = await db.table('User').where('User_ID', User_ID).first();

          let existsMatch = await db.table('Match')
            .where('Campaign_ID', Campaign_ID)
            .where('Moves_Company_ID', User.Moves_Company_ID)
            .first();

          if (User.Moves_Company_ID != null && campaign.Campaign_Status_ID == 23 && campaign.Is_Match == true && 
            User.Moves_Company_ID != campaign.Moves_Company_ID && !existsMatch) {
            IsShowButtonCreate = true;
          }

          ListMatch = await db
            .select(
              'Match.Match_ID',
              'Match.Campaign_ID',
              'Match.Moves_Company_ID',
              'Match.Match_Date_Created',
              'Company.Company_Icon',
              'Company.Company_Name',
              'Company.Company_URL'
            )
            .orderBy('Match.Match_Date_Created', 'desc')
            .from('Match')
            .innerJoin('Company', 'Match.Moves_Company_ID', 'Company.Moves_Company_ID')
            .where('Match.Campaign_ID', Campaign_ID);

          ListMatch.forEach(item => {
            item.Company_Icon = item.Company_Icon ? URL_FOLDER + item.Company_Icon : null;
          });

          let PercentageDiscount = parseFloat(PERCENTAGE_DISCOUNT);

          return {
            ListMatch: ListMatch,
            Campaign: campaign,
            IsShowButtonCreate: IsShowButtonCreate,
            PercentageDiscount: PercentageDiscount,
            message: 'OK',
            messageCode: 200
          }
        }
        else if (Type == 'company') {
          let Moves_Company_ID = args.Id;
        
          let ListMatch = [];

          ListMatch = await db
            .select(
              'Match.Match_ID',
              'Match.Campaign_ID',
              'Match.Moves_Company_ID',
              'Match.Match_Date_Created',
              'Campaign.Campaign_Icon',
              'Campaign.Campaign_Name'
            )
            .orderBy('Match.Match_Date_Created', 'desc')
            .from('Match')
            .innerJoin('Campaign', 'Match.Campaign_ID', 'Campaign.Campaign_ID')
            .where('Match.Moves_Company_ID', Moves_Company_ID);

          ListMatch.forEach(item => {
            item.Campaign_Icon = item.Campaign_Icon ? URL_FOLDER + item.Campaign_Icon : null;
          });

          return {
            ListMatch: ListMatch,
            Campaign: null,
            IsShowButtonCreate: false,
            PercentageDiscount: 0,
            message: 'OK',
            messageCode: 200
          }
        }
      } 
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    }),
  },
  Mutation: {
    
  }
};

module.exports = resolvers;