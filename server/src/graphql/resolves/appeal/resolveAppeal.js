const db = require('../../../data/knex-db');
const authenticated = require('../../../middleware/authenticated-guard');
const { saveFile, deleteFile, downloadFile, copyFile, convertFileName } = require('../../../common/handleFile');
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const CLIENT = process.env.CLIENT;
const logging = require('../../../middleware/autologging');
const changeStatus = require('../../../common/changeStatus');
const commonSystem = require('../../../common/commonSystem');
const dashboardHelper = require('../../../common/dashboardHelper');

const resolvers = {
  Query: {
    getDetailAppeal: authenticated(async (parent, args, context) => {
      try {
        let _appeal = await db.table('Appeal')
          .where("Appeal_ID", args.Appeal_ID)
          .first();

        if (!_appeal) {
          return {
            messageCode: 404,
            message: 'Appeal does not exists'
          }
        }

        await changeStatus.appeal();

        let appeal = await db.table('Appeal')
          .where("Appeal_ID", args.Appeal_ID)
          .first();

        let status = await db.table('Category')
          .where('Category_ID', appeal.Appeal_Status_ID)
          .first();

        let charity = await db.table('Charity')
          .where('Moves_Charity_ID', appeal.Moves_Charity_ID)
          .first();

        appeal.Appeal_Status_Name = status.Category_Name;
        appeal.Appeal_Icon = appeal.Appeal_Icon ? URL_FOLDER + appeal.Appeal_Icon : null;
        appeal.Charity_Name = charity.Charity_Name;
        appeal.Charity_icon = charity.Charity_icon ? URL_FOLDER + charity.Charity_icon : null;
        appeal.Charity_URL = charity.Charity_URL;
        appeal.Payment_Site_Url = charity.Payment_Site_Url
        appeal.Member_Payment_Site_Url = charity.Member_Payment_Site_Url
        appeal.Amount_Raised = 0;

        let _result = await dashboardHelper.getDonationAppeal(appeal.Appeal_ID);
        appeal.TotalCampaign = _result.TotalCampaign;
        appeal.Amount_Raised = _result.TotalDonation;
        appeal.TotalMove = _result.TotalMove;

        let isShowButtonCreateCampaign = false;
        let isShowButtonEdit = false;
        let isShowButtonPublish = false;
        let isShowButtonAbandon = false;

        //Live, Publish
        if (appeal.Appeal_Status_ID == 15 || appeal.Appeal_Status_ID == 16) {
          isShowButtonCreateCampaign = true;
        }

        //Draft, Publish, Live
        if (appeal.Appeal_Status_ID == 28 || appeal.Appeal_Status_ID == 15 || appeal.Appeal_Status_ID == 16) {
          isShowButtonEdit = true;
          isShowButtonAbandon = true;
        }

        //Draft
        if (appeal.Appeal_Status_ID == 28) {
          isShowButtonPublish = true;
        }

        let isFavourite = await db.table('Favorites')
          .where('User_ID', context.currentUser.User_ID)
          .where('Appeal_ID', args.Appeal_ID)
          .first();
        isFavourite = !!isFavourite;

        return {
          Appeal: appeal,
          isShowButtonCreateCampaign: isShowButtonCreateCampaign,
          isShowButtonEdit: isShowButtonEdit,
          isShowButtonPublish: isShowButtonPublish,
          isShowButtonAbandon: isShowButtonAbandon,
          isFavourite,
          messageCode: 200,
          message: 'Success',
        }
      }
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Internal Server Error'
        }
      }
    }),
    getListAppeal: (async (parent, args, context) => {
      try {
        let User_ID = context.currentUser?.User_ID ?? null;
        let User = await db.table('User').where('User_ID', User_ID).first();
        let Moves_Charity_ID = args.Moves_Charity_ID;

        await changeStatus.appeal();

        let ListAppeal = await db.table('Appeal')
          .select(
            'Appeal.Appeal_ID',
            'Appeal.Appeal_Icon',
            'Appeal.Appeal_Name',
            'Category.Category_Name AS Appeal_Status_Name',
            'Appeal.Appeal_Start_Date',
            'Appeal.Appeal_End_Date',
            'Appeal.Created_Date',
            'Appeal.Appeal_Status_ID',
            'Appeal.Moves_Charity_ID'
          )
          .orderBy('Appeal.Created_Date', 'desc')
          .innerJoin('Category', 'Category.Category_ID', 'Appeal.Appeal_Status_ID')
          .where(builder => {
            builder.where('Moves_Charity_ID', Moves_Charity_ID);
          });

        let listAppealId = ListAppeal.map(x => x.Appeal_ID);
        let listCampaign = await db.table('Campaign')
          .whereIn('Appeal_ID', listAppealId);

        let charity = await db.table('Charity')
          .where('Moves_Charity_ID', Moves_Charity_ID)
          .first();

        let statusCampaignLive = await db.table('Category')
          .where('Category_ID', 23)
          .where('Category_Type', 5)
          .first();

        for (let i = 0; i < ListAppeal.length; i++) {
          let item = ListAppeal[i];

          let _listCampaign = listCampaign.filter(x => x.Appeal_ID == item.Appeal_ID);

          let _result = await dashboardHelper.getDonationAppeal(item.Appeal_ID);
          item.Amount_Raised = _result.TotalDonation;

          let countStatusLive = _listCampaign.filter(x => x.Campaign_Status_ID == statusCampaignLive.Category_ID);
          if (countStatusLive.length > 0) item.Live_Campaign = 'Y';
          else item.Live_Campaign = 'N';

          item.Appeal_Icon = item.Appeal_Icon ? URL_FOLDER + item.Appeal_Icon : (charity.Charity_icon ? URL_FOLDER + charity.Charity_icon : null);
        }

        let ListStatus = await db.table('Category')
          .where('Category_Type', 4);

        return {
          ListStatus: ListStatus,
          Total: ListAppeal.length,
          ListAppeal: ListAppeal,
          message: 'OK',
          messageCode: 200
        }
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    })
  },

  Mutation: {
    createAppeal: authenticated(async (parent, args, context) => {
      try {
        let trx_result = await db.transaction(async trx => {
          let bodyData = args.bodyData;
          let status = await trx.select().table('Category')
            .where("Category_Type", 4)
            .where("Category_ID", 28)
            .first();

          let result = await trx.table('Appeal')
            .returning(['Appeal_ID'])
            .insert({
              Moves_Charity_ID: bodyData.Moves_Charity_ID,
              Appeal_Status_ID: status.Category_ID,
              Appeal_Name: bodyData.Appeal_Name,
              Appeal_URL: bodyData.Appeal_URL ? bodyData.Appeal_URL.replace(/ /g, '') : null,
              Appeal_Description: bodyData.Appeal_Description,
              Appeal_Start_Date: bodyData.Appeal_Start_Date,
              Appeal_End_Date: bodyData.Appeal_End_Date,
              Appeal_Target_Amount: bodyData.Appeal_Target_Amount,
            });

          let Appeal_ID = result[0].Appeal_ID;

          //Upload image
          let url_icon = null;
          let file = bodyData.Appeal_Icon_File;
          if (file) {
            let { filename, mimetype, createReadStream } = await file;

            //Save url to db
            let _fileNameIndex = filename.lastIndexOf('.');
            let _fileName = filename.substring(0, _fileNameIndex) + Appeal_ID;
            let _fileType = filename.substring(_fileNameIndex);
            url_icon = '/appeal/' + _fileName + _fileType;
            await trx.table('Appeal')
              .where('Appeal_ID', Appeal_ID)
              .update({
                Appeal_Icon: url_icon,
              });

            //save file to directory
            await saveFile([file], 'appeal', _fileName + _fileType);
          }

          return {
            Appeal_ID: Appeal_ID,
            messageCode: 200,
            message: "Create a Appeal Success!",
          };
        });

        return trx_result;
      }
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Internal Server Error',
        }
      }
    }),
    updateAppeal: authenticated(async (parent, args, context) => {
      try {
        let trx_result = await db.transaction(async trx => {
          let bodyData = args.bodyData;
          let appeal = await trx.table('Appeal')
            .where('Appeal_ID', bodyData.Appeal_ID)
            .first();

          if (!appeal) {
            return {
              message: 'Appeal does not exists'
            }
          }

          if (appeal.Appeal_Status_ID == 16) {
            await trx.table('Appeal')
              .where('Appeal_ID', bodyData.Appeal_ID)
              .update({
                Appeal_Name: bodyData.Appeal_Name,
                Appeal_URL: bodyData.Appeal_URL ? bodyData.Appeal_URL.replace(/ /g, '') : null,
                Appeal_Description: bodyData.Appeal_Description,
                Appeal_End_Date: bodyData.Appeal_End_Date,
                Appeal_Target_Amount: bodyData.Appeal_Target_Amount,
                Appeal_Status_ID: 28,
                Last_Modify_Date: new Date,
                Last_Modify_By: context.currentUser.User_ID
              });
          }
          else {
            await trx.table('Appeal')
              .where('Appeal_ID', bodyData.Appeal_ID)
              .update({
                Appeal_Name: bodyData.Appeal_Name,
                Appeal_URL: bodyData.Appeal_URL ? bodyData.Appeal_URL.replace(/ /g, '') : null,
                Appeal_Description: bodyData.Appeal_Description,
                Appeal_Start_Date: bodyData.Appeal_Start_Date,
                Appeal_End_Date: bodyData.Appeal_End_Date,
                Appeal_Target_Amount: bodyData.Appeal_Target_Amount,
                Appeal_Status_ID: 28,
                Last_Modify_Date: new Date,
                Last_Modify_By: context.currentUser.User_ID
              });
          }

          //Upload image
          let url_icon = null;
          let file = bodyData.Appeal_Icon_File;
          if (file) {
            let { filename, mimetype, createReadStream } = await file;

            //Save url to db
            let _fileNameIndex = filename.lastIndexOf('.');
            let _fileName = filename.substring(0, _fileNameIndex) + bodyData.Appeal_ID;
            let _fileType = filename.substring(_fileNameIndex);
            url_icon = '/appeal/' + _fileName + _fileType;
            await trx.table('Appeal')
              .where('Appeal_ID', bodyData.Appeal_ID)
              .update({
                Appeal_Icon: url_icon,
                Last_Modify_Date: new Date,
                Last_Modify_By: context.currentUser.User_ID
              });

            //save file to directory
            await saveFile([file], 'appeal', _fileName + _fileType);
          }

          return {
            messageCode: 200,
            message: 'Save appeal success'
          }
        });

        return trx_result;
      }
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Internal Server Error'
        }
      }
    }),
    publishAppeal: authenticated(async (parent, args, context) => {
      try {
        let trx_result = await db.transaction(async trx => {
          let Appeal_ID = args.Appeal_ID;
          let appeal = await trx.table('Appeal')
            .where('Appeal_ID', Appeal_ID)
            .first();

          if (!appeal) {
            return {
              messageCode: 404,
              message: 'Appeal does not exists'
            }
          }

          //update status => publish
          await trx.table('Appeal')
            .where('Appeal_ID', Appeal_ID)
            .update({
              Appeal_Status_ID: 15,
              Last_Modify_Date: new Date,
              Last_Modify_By: context.currentUser.User_ID
            });

          await changeStatus.appeal();

          //create news => Giang comment: Khách hàng thay đổi yêu cầu
          // let returnNews = await trx.table('News_Item')
          //   .returning(['News_Item_ID'])
          //   .insert({
          //     News_Item_Author_ID: context.currentUser.User_ID,
          //     News_Title: 'We launch the ' + appeal.Appeal_Name,
          //     News_Content: `<p>${appeal.Appeal_Description}</p>
          //       <p>Launch date: ${commonSystem.convertDateToString(appeal.Appeal_Start_Date)}</p>
          //       <p>End date: ${commonSystem.convertDateToString(appeal.Appeal_End_Date)}</p>
          //       <p>Target donation amount: ${appeal.Appeal_Target_Amount}</p>`,
          //     Appeal_ID: Appeal_ID,
          //     Moves_Charity_ID: appeal.Moves_Charity_ID,
          //     News_Status_ID: 26,
          //     Is_Manual: false,
          //     News_Publish_Date: new Date,
          //     Created_By: context.currentUser.User_ID,
          //     News_Url: appeal.Appeal_URL,
          //   });

          // let News_Item_ID = returnNews[0].News_Item_ID;

          // if (appeal.Appeal_Icon) {
          //   let srcPath = appeal.Appeal_Icon;

          //   let index1 = appeal.Appeal_Icon.lastIndexOf('/');
          //   let index2 = appeal.Appeal_Icon.lastIndexOf('_');
          //   let index3 = appeal.Appeal_Icon.lastIndexOf('.');

          //   let fileNameOld = appeal.Appeal_Icon.substring(index1 + 1, index2);
          //   let fileType = appeal.Appeal_Icon.substring(index3);

          //   let fileNameConvert = convertFileName(fileNameOld);

          //   let url_icon = '/news/' + fileNameConvert + News_Item_ID + fileType;
          //   await trx.table('News_Item')
          //     .where('News_Item_ID', News_Item_ID)
          //     .update({
          //       News_Image: url_icon,
          //     });

          //   let destPath = '/news/' + fileNameConvert + News_Item_ID + fileType;
          //   copyFile(srcPath, destPath);
          // }

          return {
            messageCode: 200,
            message: 'Publish appeal success'
          }
        });

        return trx_result;
      }
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Internal Server Error'
        }
      }
    }),
    abandonAppeal: authenticated(async (parent, args, context) => {
      try {
        let Appeal_ID = args.Appeal_ID;
        let appeal = await db.table('Appeal')
          .where('Appeal_ID', Appeal_ID)
          .first();

        if (!appeal) {
          return {
            messageCode: 404,
            message: 'Appeal does not exists'
          }
        }

        //update status => publish
        await db.table('Appeal')
          .where('Appeal_ID', Appeal_ID)
          .update({
            Appeal_Status_ID: 18,
            Last_Modify_Date: new Date,
            Last_Modify_By: context.currentUser.User_ID
          });

        return {
          messageCode: 200,
          message: 'Abandon appeal success'
        }
      }
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Internal Server Error'
        }
      }
    })
  }
};

module.exports = resolvers;
