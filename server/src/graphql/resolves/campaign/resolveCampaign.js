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
const dashboardHelper = require('../../../common/dashboardHelper');
const PERCENTAGE_DISCOUNT = process.env.PERCENTAGE_DISCOUNT;

const resolvers = {
  Query: {
    getMasterDataCreateCampaign: authenticated(async (parent, args, context) => {
      try {
        let listAppeal = [];

        if (args.ObjectType == 'charity') {
          let _listAppeal = await db.table('Appeal')
            .where(builder => {
              builder.where('Moves_Charity_ID', args.ObjectId)
            })
            .orderBy('Appeal_Name');

          let listAppealId = _listAppeal.map(x => x.Appeal_ID);
          await changeStatus.appeal();

          //Live, Publish
          listAppeal = await db.table('Appeal')
            .where('Moves_Charity_ID', args.ObjectId)
            .andWhere(builder => {
              builder.where('Appeal_Status_ID', 15)

              builder.orWhere('Appeal_Status_ID', 16)
            })
            .orderBy('Appeal_Name');
        }
        else if (args.ObjectType == 'appeal') {
          let _listAppeal = await db.table('Appeal')
            .where('Appeal_ID', args.ObjectId)

          let listAppealId = _listAppeal.map(x => x.Appeal_ID);
          await changeStatus.appeal();

          //Live, Publish
          listAppeal = await db.table('Appeal')
            .where('Appeal_ID', args.ObjectId)
            .andWhere(builder => {
              builder.where('Appeal_Status_ID', 15)

              builder.orWhere('Appeal_Status_ID', 16)
            })
            .orderBy('Appeal_Name');
        }

        let listCompany = await db.table('Company')
          .andWhere('Is_Active', true)
          .orderBy('Company_Name');

        listCompany.forEach(item => {
          item.Company_Name = item.Company_Number + ' - ' + item.Company_Name;
        });

        listAppeal.forEach(item => {
          item.Appeal_Icon = item.Appeal_Icon ? URL_FOLDER + item.Appeal_Icon : null;
        });

        listCompany.forEach(item => {
          item.Company_Icon = item.Company_Icon ? URL_FOLDER + item.Company_Icon : null;
        });

        // let listCurrency = await db.table('Currency');

        return {
          ListAppeal: listAppeal,
          ListCompany: listCompany,
          // ListCurrency: listCurrency,
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
    }),
    getDetailCampaign: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        let _campaign = await db.table('Campaign')
          .where('Campaign_ID', args.Campaign_ID)
          .first();

        if (!_campaign) {
          return {
            message: 'Campaign is not found',
            messageCode: 404
          }
        }

        await changeStatus.campaign();

        let campaign = await db.table('Campaign')
          .where('Campaign_ID', args.Campaign_ID)
          .first();

        campaign.Campaign_Icon = campaign.Campaign_Icon ? URL_FOLDER + campaign.Campaign_Icon : null;

        let listUserDonation = await db.table('Donation')
          .where('Campaign_ID', campaign.Campaign_ID)
          .distinct('User_ID');

        campaign.Progress_Donations = listUserDonation.length;

        let Moves_Donated = await db.table('Donation')
          .where('Campaign_ID', campaign.Campaign_ID)
          .sum('Moves_Donated')
          .first();

        campaign.Progress_Moves = (Moves_Donated.sum ?? 0);

        let _result = await dashboardHelper.getDonationCampaign(campaign.Campaign_ID);
        campaign.Sterling_Amount = _result.Sterling_Amount;
        campaign.Number_Matches = _result.Number_Matches;
        campaign.Amount_Raised = _result.TotalDonation;

        let status = await db.table('Category')
          .where('Category_ID', campaign.Campaign_Status_ID)
          .first();

        campaign.Campaign_Status_Name = status?.Category_Name;

        let charity = await db.table('Charity')
          .where('Moves_Charity_ID', campaign.Moves_Charity_ID)
          .first();

        let company = await db.table('Company')
          .where('Moves_Company_ID', campaign.Moves_Company_ID)
          .first();

        campaign.Charity_Name = charity?.Charity_Name;
        campaign.Charity_icon = charity?.Charity_icon ? URL_FOLDER + charity.Charity_icon : null;
        campaign.Charity_URL = charity?.Charity_URL;
        campaign.Company_Name = company?.Company_Name;
        campaign.Company_URL = company?.Company_URL;

        await changeStatus.appeal();

        let listAppeal = await db.table('Appeal')
          .where('Moves_Charity_ID', campaign.Moves_Charity_ID)
          .andWhere(builder => {
            builder.where('Appeal_Status_ID', 15)

            builder.orWhere('Appeal_Status_ID', 16)
          });

        if (campaign.Appeal_ID != null) {
          let existsAppeal = listAppeal.find(x => x.Appeal_ID == campaign.Appeal_ID);

          if (!existsAppeal) {
            let extendAppeal = await db.table('Appeal')
              .where('Appeal_ID', campaign.Appeal_ID)
              .first();

            if (extendAppeal) listAppeal.push(extendAppeal);
          }
        }

        let listCompany = await db.table('Company')
          .andWhere('Is_Active', true)
          .orderBy('Company_Name');

        let existsCompany = listCompany.find(x => x.Moves_Company_ID == campaign.Moves_Company_ID);

        if (!existsCompany) {
          let extendCompany = await db.table('Company')
            .where('Moves_Company_ID', campaign.Moves_Company_ID)
            .first();
          if (extendCompany) {
            listCompany.push(extendCompany);
          } 
        }

        listCompany.forEach(item => {
          item.Company_Name = item.Company_Number + ' - ' + item.Company_Name;
          item.Company_Icon = item.Company_Icon ? URL_FOLDER + item.Company_Icon : null;
        });

        listAppeal.forEach(item => {
          item.Appeal_Icon = item.Appeal_Icon ? URL_FOLDER + item.Appeal_Icon : null;
        });

        let IsShowButtonEdit = false;
        let IsShowButtonPublish = false;
        let IsShowButtonApprove = false;
        let IsShowButtonDecline = false;
        let IsShowButtonCreateMatch = false;
        let PercentageDiscount = parseFloat(PERCENTAGE_DISCOUNT);

        if (campaign.Moves_Charity_ID == User.Moves_Charity_ID && User.Moves_Charity_ID != null &&
          (campaign.Campaign_Status_ID == 19 || campaign.Campaign_Status_ID == 20 || campaign.Campaign_Status_ID == 21)) {
          IsShowButtonEdit = true;
        }

        if (campaign.Moves_Charity_ID == User.Moves_Charity_ID && User.Moves_Charity_ID != null &&
          campaign.Campaign_Status_ID == 21) {
          IsShowButtonPublish = true;
        }

        if (campaign.Moves_Company_ID == User.Moves_Company_ID && User.Moves_Company_ID != null &&
          campaign.Campaign_Status_ID == 19) {
          IsShowButtonApprove = true;
          IsShowButtonDecline = true;
        }

        if (campaign.Moves_Company_ID != User.Moves_Company_ID && User.Moves_Company_ID != null &&
          campaign.Is_Match == true && campaign.Campaign_Status_ID == 23) {
          let existsMatch = await db.table('Match')
            .where('Campaign_ID', campaign.Campaign_ID)
            .where('Moves_Company_ID', User.Moves_Company_ID)
            .first();
          if (!existsMatch) IsShowButtonCreateMatch = true;
        }

        let isFavourite = await db.table('Favorites')
          .where('User_ID', context.currentUser.User_ID)
          .where('Campaign_ID', args.Campaign_ID)
          .first();
        isFavourite = !!isFavourite;

        // let listCurrency = await db.table('Currency');

        return {
          Campaign: campaign,
          ListAppeal: listAppeal,
          ListCompany: listCompany,
          // ListCurrency: listCurrency,
          IsShowButtonEdit: IsShowButtonEdit,
          IsShowButtonPublish: IsShowButtonPublish,
          IsShowButtonApprove: IsShowButtonApprove,
          IsShowButtonDecline: IsShowButtonDecline,
          IsShowButtonCreateMatch: IsShowButtonCreateMatch,
          PercentageDiscount: PercentageDiscount,
          isFavourite,
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
    }),
    getListCampaign: (async (parent, args, context) => {
      try {
        let User_ID = context.currentUser?.User_ID ?? null;
        let User = await db.table('User').where('User_ID', User_ID).first();

        let ObjectType = args.ObjectType;
        let ObjectId = args.ObjectId;
        let ListCampaign = [];

        await changeStatus.campaign();

        let listStatus = await db.table('Category')
          .where('Category_Type', 5);
        let statusLive = listStatus.find(x => x.Category_ID == 23);

        let isShowButtonCreateCampaign = true;

        //Charity dashboard && user is charity && charity dashboard is my user charity / admin
        if (ObjectType == 'a') {
          let charity = await db.table('Charity')
            .where('Moves_Charity_ID', ObjectId)
            .first();

          if (!charity) {
            return {
              message: 'Charity not found',
              messageCode: 404
            }
          }

          ListCampaign = await db.table('Campaign')
            .where('Moves_Charity_ID', ObjectId)
            .orderBy('Created_Date', 'desc');

          if(User?.IsAmin || User?.Moves_Charity_ID != ObjectId) {
            isShowButtonCreateCampaign = false;
          }
        }
        //Company dashboard
        else if (ObjectType == 'b') {
          let company = await db.table('Company')
            .where('Moves_Company_ID', ObjectId)
            .first();

          if (!company) {
            return {
              message: 'Company not found',
              messageCode: 404
            }
          }

          //List campaign match with company
          let listCampaignMatch = await db.table('Match')
            .where('Moves_Company_ID', ObjectId)
            .distinct('Campaign_ID')

          let listCampaignMatchId = listCampaignMatch.map(x => x.Campaign_ID);

          //my company
          if (company.Moves_Company_ID == User?.Moves_Company_ID) {
            ListCampaign = await db.table('Campaign')
              .where(builder => {
                builder.where('Moves_Company_ID', ObjectId);

                builder.whereNot('Campaign_Status_ID', 20);
              })
              .orWhereIn('Campaign_ID', listCampaignMatchId)
              .orderBy('Created_Date', 'desc');
          }
          //other company
          else {
            ListCampaign = await db.table('Campaign')
              .where(builder => {
                builder.where('Moves_Company_ID', ObjectId);

                builder.whereNotIn('Campaign_Status_ID', [19, 20, 21]);
              })
              .orWhereIn('Campaign_ID', listCampaignMatchId)
              .orderBy('Created_Date', 'desc');
          }

          if(!User?.Moves_Company_ID) {
            isShowButtonCreateCampaign = false;
          }
        }
        //Appeal
        else if (ObjectType == 'c') {
          let appeal = await db.table('Appeal')
            .where('Appeal_ID', ObjectId)
            .first();

          if (!appeal) {
            return {
              message: 'Appeal not found',
              messageCode: 404
            }
          }

          //Appeal khác trạng thái Live, Publish thì ẩn nút tạo Campaign
          if (appeal.Appeal_Status_ID != 15 && appeal.Appeal_Status_ID != 16) {
            isShowButtonCreateCampaign = false;
          }

          ListCampaign = await db.table('Campaign')
            .where('Appeal_ID', ObjectId)
            .orderBy('Created_Date', 'desc');
        }
        //Charity dashboard && user is company
        else if (ObjectType == 'd') {
          let charity = await db.table('Charity')
            .where('Moves_Charity_ID', ObjectId)
            .first();

          if (!charity) {
            return {
              message: 'Charity not found',
              messageCode: 404
            }
          }

          let company = await db.table('Company')
            .where('Moves_Company_ID', User?.Moves_Company_ID)
            .first();

          if (!company) {
            return {
              message: 'User not associated with the company',
              messageCode: 404
            }
          }

          let listTotalCampaign1 = await db.table('Campaign')
            .where('Moves_Charity_ID', charity.Moves_Charity_ID)
            .where('Moves_Company_ID', company.Moves_Company_ID)
            .whereNot('Campaign_Status_ID', 20);

          let listTotalCampaign1_Campaign_ID = listTotalCampaign1.map(x => x.Campaign_ID);

          let _listCampaign = await db.table('Campaign')
            .where('Moves_Charity_ID', charity.Moves_Charity_ID)
            .where('Moves_Company_ID', company.Moves_Company_ID);

          let _listCampaignId = _listCampaign.map(x => x.Campaign_ID);

          let listTotalCampaign2 = await db.table('Match')
            .where('Moves_Company_ID', company.Moves_Company_ID)
            .whereIn('Campaign_ID', _listCampaignId);

          let listTotalCampaign2_Campaign_ID = listTotalCampaign2.map(x => x.Campaign_ID);

          let listDistinctId = [...new Set([...listTotalCampaign2_Campaign_ID, ...listTotalCampaign1_Campaign_ID])];

          let listTotalCampaign3 = await db.table('Campaign')
            .where('Moves_Charity_ID', charity.Moves_Charity_ID)
            .where('Campaign_Status_ID', 23)
            .whereNotIn('Campaign_ID', listDistinctId);

          let listTotalCampaign3_Campaign_ID = listTotalCampaign3.map(x => x.Campaign_ID);

          let listFinal_Campaign_ID = [...new Set([...listTotalCampaign2_Campaign_ID, ...listTotalCampaign1_Campaign_ID, ...listTotalCampaign3_Campaign_ID])];

          ListCampaign = await db.table('Campaign')
            .whereIn('Campaign_ID', listFinal_Campaign_ID)
            .orderBy('Created_Date', 'desc');
        }

        let listCampaignId = ListCampaign.map(x => x.Campaign_ID);

        let listCharityId = ListCampaign.map(x => x.Moves_Charity_ID);
        let listCharity = await db.table('Charity')
          .whereIn('Moves_Charity_ID', listCharityId);

        let listAppealId = ListCampaign.map(x => x.Appeal_ID);
        let listAppeal = await db.table('Appeal')
          .whereIn('Appeal_ID', listAppealId);

        let listCompanyId = ListCampaign.map(x => x.Moves_Company_ID);
        let listCompany = await db.table('Company')
          .whereIn('Moves_Company_ID', listCompanyId);

        let listMatch = await db.table('Match')
          .whereIn('Campaign_ID', listCampaignId);

        let listDonation = await db.table('Donation')
          .whereIn('Campaign_ID', listCampaignId);

        ListCampaign.forEach(item => {

          let status = listStatus.find(x => x.Category_ID == item.Campaign_Status_ID);
          item.Campaign_Status_Name = status?.Category_Name;

          let charity = listCharity.find(x => x.Moves_Charity_ID == item.Moves_Charity_ID);
          item.Charity_Name = charity?.Charity_Name;

          let company = listCompany.find(x => x.Moves_Company_ID == item.Moves_Company_ID);
          item.Company_Name = company?.Company_Name;

          let appeal = listAppeal.find(x => x.Appeal_ID == item.Appeal_ID);
          item.Appeal_Name = appeal?.Appeal_Name;
          
          item.Campaign_Icon = item.Campaign_Icon ? URL_FOLDER + item.Campaign_Icon : (appeal?.Appeal_Icon ? URL_FOLDER + appeal?.Appeal_Icon : (charity?.Charity_icon ? URL_FOLDER + charity?.Charity_icon : null));

          let _listMatch = listMatch.filter(x => x.Campaign_ID == item.Campaign_ID);
          item.Number_Matches = _listMatch?.length ?? 0;

          let Sterling_Amount = listDonation.filter(x => x.Campaign_ID == item.Campaign_ID).map(x => x.Sterling_Amount).reduce((a, b) => a + b, 0);
          item.Amount_Raised = Sterling_Amount; //* (item.Number_Matches + 1);

          //Date
          if (item.End_Date_Target) {
            let Progress_Date = commonSystem.getRemainDay(item.Campaign_Launch_Date, new Date);
            if (Progress_Date) item.Progress_Date = Progress_Date;
          }
          //Decimal
          else {
            item.Progress_Number = commonSystem.roundNumber((Sterling_Amount / item.Campaign_Target_Value) * 100, 0);
          }
        });

        return {
          ListCampaign: ListCampaign,
          ListStatus: listStatus,
          IsShowButtonCreateCampaign: isShowButtonCreateCampaign,
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
    createCampaign: authenticated(async (parent, args, context) => {
      try {
        let CampaignInfor = args.CreateCampaignInput;
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        // const isEqual = await bcrypt.compare(CampaignInfor.Password, User.User_Password);
        // if (!isEqual) {
        //   return {
        //     messageCode: 404,
        //     message: 'Password is incorrect',
        //   };
        // }


        let Campaign_Icon = CampaignInfor.Campaign_Icon ? CampaignInfor.Campaign_Icon.replace(URL_FOLDER, '') : null;

        let trx_result = await db.transaction(async trx => {
          let campaignResult = await trx.table('Campaign')
            .returning(['Campaign_ID'])
            .insert({
              Appeal_ID: CampaignInfor.Appeal_ID,
              Moves_Charity_ID: CampaignInfor.Moves_Charity_ID,
              Campaign_Name: CampaignInfor.Campaign_Name,
              Campaign_Icon: Campaign_Icon,
              Campaign_URL: CampaignInfor.Campaign_URL ? CampaignInfor.Campaign_URL.replace(/ /g, '') : null,
              Campaign_Description: CampaignInfor.Campaign_Description,
              Campaign_Launch_Date: CampaignInfor.Campaign_Launch_Date,
              Campaign_End_Date: CampaignInfor.Campaign_End_Date,
              Campaign_Target_Value: CampaignInfor.Campaign_Target_Value,
              Campaign_Price_Per_Move: CampaignInfor.Campaign_Price_Per_Move,
              Moves_Company_ID: CampaignInfor.Moves_Company_ID,
              End_Date_Target: CampaignInfor.End_Date_Target,
              Campaign_Status_ID: 19,
              Public_Private: CampaignInfor.Public_Private,
              Is_Match: CampaignInfor.Is_Match,
              // Currency_ID: CampaignInfor.Currency_ID,
              Created_By: User_ID,
            });

          let Campaign_ID = campaignResult[0].Campaign_ID;

          //Upload image
          let url_icon = null;
          let file = CampaignInfor.Campaign_Icon_File;
          if (file) {
            let { filename, mimetype, createReadStream } = await file;

            //Save url to db
            let _fileNameIndex = filename.lastIndexOf('.');
            let _fileName = filename.substring(0, _fileNameIndex) + Campaign_ID;
            let _fileType = filename.substring(_fileNameIndex);
            url_icon = '/campaign/' + _fileName + _fileType;
            await trx.table('Campaign')
              .where('Campaign_ID', Campaign_ID)
              .update({
                Campaign_Icon: url_icon,
              });

            //save file to directory
            await saveFile([file], 'campaign', _fileName + _fileType);
          }

          return {
            Campaign_ID: Campaign_ID,
            message: 'The Campaign has been saved and will be reviewed by the Company',
            messageCode: 200
          }
        });

        return trx_result;
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    }),
    approveCampaign: authenticated(async (parent, args, context) => {
      try {
        let Campaign_ID = args.Id;
        let Password = args.Password;
        let Mode = args.Mode;

        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        const isEqual = await bcrypt.compare(Password, User.User_Password);
        if (!isEqual) {
          return {
            messageCode: 404,
            message: 'Password is incorrect',
          };
        }

        let campaign = await db.table('Campaign')
          .where('Campaign_ID', Campaign_ID)
          .first();

        if (!campaign) {
          return {
            message: 'Campaign not found',
            messageCode: 404
          }
        }

        //update status of campaign => Approved
        if (Mode == 'campaign') {
          if (campaign.Campaign_Status_ID != 19) {
            return {
              message: 'Campaign status is incorrect',
              messageCode: 409
            }
          }

          await db.table('Campaign')
            .where('Campaign_ID', Campaign_ID)
            .update({
              Campaign_Status_ID: 21
            })

          return {
            message: 'Approval campaign success',
            messageCode: 200
          }
        }
        //add Company to Match of Campaign and created a News
        else if (Mode == 'match') {
          let existsMatch = await db.table('Match')
            .where('Campaign_ID', Campaign_ID)
            .where('Moves_Company_ID', User.Moves_Company_ID)
            .first();

          if (existsMatch || User.Moves_Company_ID == null || campaign.Moves_Company_ID == User.Moves_Company_ID) {
            return {
              message: 'Match is incorrect',
              messageCode: 409
            }
          }

          let trx_result = await db.transaction(async trx => {
            await trx.table('Match')
              .insert({
                Campaign_ID: Campaign_ID,
                Moves_Company_ID: User.Moves_Company_ID
              });

            //create a News
            let company = await trx.table('Company')
              .where('Moves_Company_ID', User.Moves_Company_ID)
              .first();

            let returnNews = await trx.table('News_Item')
              .returning(['News_Item_ID'])
              .insert({
                News_Item_Author_ID: context.currentUser.User_ID,
                News_Image: company.Company_Icon,
                News_Title: `CAMPAIGN MATCHED. ${company.Company_Name ?? ''} has matched the ${campaign.Campaign_Name ?? ''} Campaign. Geeat news!`,//company.Company_Name + ' - ' + campaign.Campaign_Name
                News_Content: `<p>${campaign.Campaign_Description ?? ''}</p>
                  <p>Launch date: ${commonSystem.convertDateToString(campaign.Campaign_Launch_Date)}</p>
                  ${campaign.End_Date_Target == false ? '' : '<p>End date: ' + commonSystem.convertDateToString(campaign.Campaign_End_Date) + '</p>'}
                  ${campaign.End_Date_Target == false ? '<p>Target donation amount: ' + new Intl.NumberFormat('en-GB', {
                    style: 'currency',
                    currency: 'GBP',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(campaign.Campaign_Target_Value) + '</p>' : ''}
                  <p>Price per move: £${campaign.Campaign_Price_Per_Move.toFixed(2)}</p>`,
                Moves_Company_ID: User.Moves_Company_ID,
                Campaign_ID: campaign.Campaign_ID,
                News_Status_ID: 26, //Live
                Is_Manual: false,
                News_Publish_Date: new Date,
                News_Url: campaign.Campaign_URL,
                Created_By: context.currentUser.User_ID,
              });

            let News_Item_ID = returnNews[0].News_Item_ID;

            if (campaign.Campaign_Icon) {
              let srcPath = campaign.Campaign_Icon;

              let index1 = campaign.Campaign_Icon.lastIndexOf('/');
              let index2 = campaign.Campaign_Icon.lastIndexOf('_');
              let index3 = campaign.Campaign_Icon.lastIndexOf('.');

              let fileNameOld = campaign.Campaign_Icon.substring(index1 + 1, index2);
              let fileType = campaign.Campaign_Icon.substring(index3);

              let fileNameConvert = convertFileName(fileNameOld);

              let url_icon = '/news/' + fileNameConvert + News_Item_ID + fileType;
              await trx.table('News_Item')
                .where('News_Item_ID', News_Item_ID)
                .update({
                  News_Image: url_icon,
                });

              let destPath = '/news/' + fileNameConvert + News_Item_ID + fileType;
              copyFile(srcPath, destPath);
            }

            return {
              message: 'Create match success',
              messageCode: 200
            }
          });

          return trx_result;
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
    publishCampaign: authenticated(async (parent, args, context) => {
      try {
        let trx_result = await db.transaction(async trx => {
          let Campaign_ID = args.Id;

          let User_ID = context.currentUser.User_ID;
          let User = await trx.table('User').where('User_ID', User_ID).first();

          const isEqual = await bcrypt.compare(args.Password, User.User_Password);
          if (!isEqual) {
            return {
              messageCode: 404,
              message: 'Password is incorrect',
            };
          }

          let campaign = await trx.table('Campaign')
            .where('Campaign_ID', Campaign_ID)
            .first();

          if (!campaign) {
            return {
              message: 'Campaign not found',
              messageCode: 404
            }
          }

          if (campaign.Campaign_Status_ID != 21) {
            return {
              message: 'Campaign status is incorrect',
              messageCode: 409
            }
          }

          //update status => publish
          await trx.table('Campaign')
            .where('Campaign_ID', Campaign_ID)
            .update({
              Campaign_Status_ID: 22
            })

          await changeStatus.campaign();

          //create news => Giang comment: Khách hàng thay đổi yêu cầu
          // let returnNews = await trx.table('News_Item')
          //   .returning(['News_Item_ID'])
          //   .insert({
          //     News_Item_Author_ID: context.currentUser.User_ID,
          //     News_Title: 'We launch the ' + campaign.Campaign_Name,
          //     News_Content: `<p>${campaign.Campaign_Description}</p>
          //       <p>Launch Date: ${commonSystem.convertDateToString(campaign.Campaign_Launch_Date)}</p>
          //       <p>End Date: ${commonSystem.convertDateToString(campaign.Campaign_End_Date)}</p>
          //       ${campaign.End_Date_Target ? '' : '<p>Target donation amount: ' + campaign.Campaign_Target_Value + '</p>'}
          //       <p>Price per move: ${campaign.Campaign_Price_Per_Move}</p>`,
          //     Appeal_ID: campaign.Appeal_ID,
          //     Moves_Charity_ID: campaign.Moves_Charity_ID,
          //     Moves_Company_ID: campaign.Moves_Company_ID,
          //     Campaign_ID: campaign.Campaign_ID,
          //     News_Status_ID: 26, //Live
          //     Is_Manual: false,
          //     News_Publish_Date: new Date,
          //     News_Url: campaign.Campaign_URL,
          //     Created_By: context.currentUser.User_ID,
          //   });

          // let News_Item_ID = returnNews[0].News_Item_ID;

          // if (campaign.Campaign_Icon) {
          //   let srcPath = campaign.Campaign_Icon;

          //   let index1 = campaign.Campaign_Icon.lastIndexOf('/');
          //   let index2 = campaign.Campaign_Icon.lastIndexOf('_');
          //   let index3 = campaign.Campaign_Icon.lastIndexOf('.');

          //   let fileNameOld = campaign.Campaign_Icon.substring(index1 + 1, index2);
          //   let fileType = campaign.Campaign_Icon.substring(index3);

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
            message: 'Publish campaign success'
          }
        });

        return trx_result;
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    }),
    declineCampaign: authenticated(async (parent, args, context) => {
      try {
        let trx_result = await db.transaction(async trx => {
          let Campaign_ID = args.Id;

          let User_ID = context.currentUser.User_ID;
          let User = await trx.table('User').where('User_ID', User_ID).first();

          let campaign = await trx.table('Campaign')
            .where('Campaign_ID', Campaign_ID)
            .first();

          if (!campaign) {
            return {
              message: 'Campaign not found',
              messageCode: 404
            }
          }

          if (campaign.Campaign_Status_ID != 19) {
            return {
              message: 'Campaign status is incorrect',
              messageCode: 409
            }
          }

          //update status => Declined
          await trx.table('Campaign')
            .where('Campaign_ID', Campaign_ID)
            .update({
              Campaign_Status_ID: 20
            })


          return {
            messageCode: 200,
            message: 'Decline campaign success'
          }
        });

        return trx_result;
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    }),
    updateCampaign: authenticated(async (parent, args, context) => {
      try {
        let trx_result = await db.transaction(async trx => {
          let bodyData = args.bodyData;

          let User_ID = context.currentUser.User_ID;
          let User = await trx.table('User').where('User_ID', User_ID).first();

          //thay đổi yêu cầu không cần nhập mật khẩu khi update campaign
          // const isEqual = await bcrypt.compare(bodyData.Password, User.User_Password);
          // if (!isEqual) {
          //   return {
          //     messageCode: 404,
          //     message: 'Password is incorrect',
          //   };
          // }

          let campaign = await trx.table('Campaign')
            .where('Campaign_ID', bodyData.Campaign_ID)
            .first();

          if (!campaign) {
            return {
              message: 'Campaign not found',
              messageCode: 404
            }
          }

          if (campaign.Campaign_Status_ID != 19 && campaign.Campaign_Status_ID != 20 && campaign.Campaign_Status_ID != 21) {
            return {
              message: 'Campaign status is incorrect',
              messageCode: 409
            }
          }

          let Campaign_Icon = bodyData.Campaign_Icon ? bodyData.Campaign_Icon.replace(URL_FOLDER, '') : null;

          await trx.table('Campaign')
            .where('Campaign_ID', bodyData.Campaign_ID)
            .update({
              Campaign_Name: bodyData.Campaign_Name.trim(),
              Campaign_Icon: Campaign_Icon,
              Campaign_URL: bodyData.Campaign_URL ? bodyData.Campaign_URL.replace(/ /g, '') : null,
              Campaign_Description: bodyData.Campaign_Description ? bodyData.Campaign_Description.trim() : null,
              Campaign_Launch_Date: bodyData.Campaign_Launch_Date,
              Campaign_End_Date: bodyData.Campaign_End_Date,
              End_Date_Target: bodyData.End_Date_Target,
              Campaign_Target_Value: bodyData.Campaign_Target_Value,
              Campaign_Price_Per_Move: bodyData.Campaign_Price_Per_Move,
              Public_Private: bodyData.Public_Private,
              Is_Match: bodyData.Is_Match,
              Appeal_ID: bodyData.Appeal_ID,
              Moves_Company_ID: bodyData.Moves_Company_ID,
              Campaign_Status_ID: 19,
              // Currency_ID: bodyData.Currency_ID,
              Last_Modify_Date: new Date,
              Last_Modify_By: User_ID
            })

          //Upload image
          let url_icon = null;
          let file = bodyData.Campaign_Icon_File;
          if (file) {
            let { filename, mimetype, createReadStream } = await file;

            //Save url to db
            let _fileNameIndex = filename.lastIndexOf('.');
            let _fileName = filename.substring(0, _fileNameIndex) + bodyData.Campaign_ID;
            let _fileType = filename.substring(_fileNameIndex);
            url_icon = '/campaign/' + _fileName + _fileType;
            await trx.table('Campaign')
              .where('Campaign_ID', bodyData.Campaign_ID)
              .update({
                Campaign_Icon: url_icon,
                Last_Modify_Date: new Date,
                Last_Modify_By: User_ID
              });

            //save file to directory
            await saveFile([file], 'campaign', _fileName + _fileType);
          }

          return {
            messageCode: 200,
            message: 'The Campaign has been saved and will be reviewed by the Company'
          }
        });

        return trx_result;
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    })
  }
};

module.exports = resolvers;
