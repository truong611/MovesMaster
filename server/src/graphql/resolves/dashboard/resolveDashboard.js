const db = require('../../../data/knex-db');
const authenticated = require('../../../middleware/authenticated-guard');
const { saveFile, deleteFile, downloadFile } = require('../../../common/handleFile');
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const logging = require('../../../middleware/autologging');
const dashboardHelper = require('../../../common/dashboardHelper');
const messages = require('../../../messages/auth');
const changeStatus = require('../../../common/changeStatus');
const commonSystem = require('../../../common/commonSystem');
const history = require('../../../common/history');

const resolvers = {
  Query: {
    getDashboardProfile: (async (parent, args, context) => {
      try {
        let User_ID = context.currentUser?.User_ID ?? null;
        let User = await db.table('User').where('User_ID', User_ID).first();

        let List_Geographical_Scope = await db.table('Category')
          .where('Category_Type', 1);
        let List_Income_Band = await db.table('Category')
          .where('Category_Type', 2);
        let List_Sector = await db.table('Category')
          .where('Category_Type', 3);

        //Charity
        if (args.type == 1 || args.type == 4) {
          let Moves_Charity_ID = null;

          if (args.type == 1) Moves_Charity_ID = User?.Moves_Charity_ID;
          else Moves_Charity_ID = args.objectId;

          if (!Moves_Charity_ID) {
            return {
              messageCode: 404,
              message: 'Charity ID is not exists',
            };
          }

          let Charity = await db.table('Charity').where('Moves_Charity_ID', Moves_Charity_ID).first();
          Charity.Contact_Name = (Charity.Contact_Forename ?? "" ) + " " + (Charity.Contact_Surname ?? "");

          let listCharitySectorID = await db.table('Charity_Sector')
            .where('Moves_Charity_ID', Moves_Charity_ID)
            .select('Category_ID');

          let listCharitySector = await db.table('Category')
            .whereIn('Category_ID', listCharitySectorID.map(x => x.Category_ID))
            .select('Category_ID', 'Category_Name');

          let Charity_Geographical_Scope = await db.table('Category')
            .where('Category_ID', Charity.Charity_Geographical_Scope).first();
          let Charity_Income_Band = await db.table('Category')
            .where('Category_ID', Charity.Charity_Income_Band_ID).first();

          let listActionHistory = await db
            .select('Action_History.*', 'User.Surname', 'User.Forename')
            .table('Action_History')
            .leftJoin('User', 'User.User_ID', 'Action_History.By')
            .where('Action_History.Object_Id', Moves_Charity_ID)
            .where('Action_History.Object_Type', 'Charity');

          return {
            Charity: {
              Moves_Charity_ID: Charity.Moves_Charity_ID,
              Charity_Name: Charity.Charity_Name,
              Charity_Commission_No: Charity.Charity_Commission_No,
              Contact_Name: Charity.Contact_Name,
              Contact_Forename: Charity.Contact_Forename,
              Contact_Surname: Charity.Contact_Surname,
              Contact_Email: Charity.Contact_Email,
              Contact_Phone_Number: Charity.Contact_Phone_Number,
              Charity_URL: Charity.Charity_URL,
              Charity_Aims: Charity.Charity_Aims,
              Charity_icon: Charity.Charity_icon ? URL_FOLDER + Charity.Charity_icon : null,
              Charity_Geographical_Scope: Charity.Charity_Geographical_Scope,
              Charity_Income_Band_ID: Charity.Charity_Income_Band_ID,
              Charity_Date_Founded: Charity.Charity_Date_Founded,
              Date_Active: Charity.Date_Active,
              Charity_Geographical_Scope_Name: Charity_Geographical_Scope?.Category_Name,
              Charity_Income_Band_Name: Charity_Income_Band?.Category_Name,
              Charity_Sector: listCharitySector.map(x => x.Category_Name).join(", "),
              List_Charity_Sector_ID: listCharitySector.map(x => x.Category_ID),
              Is_Remove_Privileges: Charity.Is_Remove_Privileges,
              Is_Remove_Access: Charity.Is_Remove_Access,
              Address_For_Invoice: Charity.Address_For_Invoice,
              Payment_Site_Url: Charity.Payment_Site_Url,
              Account_Name: Charity.Account_Name,
              Account_No: Charity.Account_No,
              Sort_Code: Charity.Sort_Code,
              Member_Payment_Site_Url: Charity.Member_Payment_Site_Url,
              Member_Account_Name: Charity.Member_Account_Name,
              Member_Account_No: Charity.Member_Account_No,
              Member_Sort_Code: Charity.Member_Sort_Code,
              Renewal_Date: Charity.Renewal_Date,
            },
            Company: null,
            List_Geographical_Scope: List_Geographical_Scope,
            List_Income_Band: List_Income_Band,
            List_Sector: List_Sector,
            List_Action_History: listActionHistory,
            messageCode: 200,
            message: 'OK',
          }
        }
        //Company
        else if (args.type == 2 || args.type == 5) {
          let Moves_Company_ID = null;

          if (args.type == 2) Moves_Company_ID = User?.Moves_Company_ID;
          else Moves_Company_ID = args.objectId;

          if (!Moves_Company_ID) {
            return {
              messageCode: 404,
              message: 'Company ID is not exists',
            };
          }

          let Company = await db.table('Company').where('Moves_Company_ID', Moves_Company_ID).first();
          Company.Contact_Name = (Company.Contact_Forename ?? "" ) + " " + (Company.Contact_Surname ?? "");

          let listActionHistory = await db
            .select('Action_History.*', 'User.Surname', 'User.Forename')
            .table('Action_History')
            .leftJoin('User', 'User.User_ID', 'Action_History.By')
            .where('Action_History.Object_Id', Moves_Company_ID)
            .where('Action_History.Object_Type', 'Company');

          return {
            Company: {
              Moves_Company_ID: Company.Moves_Company_ID,
              Company_Name: Company.Company_Name,
              Company_Number: Company.Company_Number,
              Company_URL: Company.Company_URL,
              Company_Icon: Company.Company_Icon ? URL_FOLDER + Company.Company_Icon : null,
              Company_CSR_Statement: Company.Company_CSR_Statement,
              Is_Active: Company.Is_Active,
              Date_Active: Company.Date_Active,
              Contact_Name: Company.Contact_Name,
              Contact_Forename: Company.Contact_Forename,
              Contact_Surname: Company.Contact_Surname,
              Contact_Email: Company.Contact_Email,
              Contact_Phone_Number: Company.Contact_Phone_Number,
              Is_Remove_Privileges: Company.Is_Remove_Privileges,
              Is_Remove_Access: Company.Is_Remove_Access
            },
            Charity: null,
            List_Geographical_Scope: [],
            List_Income_Band: [],
            List_Sector: [],
            List_Action_History: listActionHistory,
            messageCode: 200,
            message: 'OK',
          }
        }
        //Admin
        else if (args.type == 3 && User?.IsAdmin == true) {
          let TotalCharityNotActive = 0;
          let TotalCompanyNotActive = 0;
          let TotalCharityInvitation = 0;

          let listCharityNotActive = await db.table('Charity')
            .where('Is_Active', null)
            .where('Charity_Type', 1)
          TotalCharityNotActive = listCharityNotActive.length;

          let listCompanyNotActive = await db.table('Company')
            .where('Is_Active', null)
          TotalCompanyNotActive = listCompanyNotActive.length;

          let listCharityInvitation = await db.table('Charity')
            .where('Charity_Type', 0)
          TotalCharityInvitation = listCharityInvitation.length;

          return {
            TotalCharityNotActive: TotalCharityNotActive,
            TotalCompanyNotActive: TotalCompanyNotActive,
            TotalCharityInvitation: TotalCharityInvitation,
            List_Action_History: [],
            messageCode: 200,
            message: 'OK',
          }
        }

        return {
          messageCode: 200,
          message: 'OK',
        };
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    }),
    getDashboardAccountInfo: (async (parent, args, context) => {
      try {
        let User_ID = context.currentUser?.User_ID ?? null;
        let User = await db.table('User').where('User_ID', User_ID).first();
        let Role = '';

        //Charity
        if (args.type == 1 || args.type == 4) {
          let Moves_Charity_ID = null;

          if (args.type == 1) Moves_Charity_ID = User?.Moves_Charity_ID;
          else Moves_Charity_ID = args.objectId;

          if (!Moves_Charity_ID) {
            return {
              messageCode: 404,
              message: 'Charity ID is not exists',
            };
          }

          let Charity = await db.table('Charity').where('Moves_Charity_ID', Moves_Charity_ID).first();

          let listUser = await db
            .select(
              'User_ID',
              'User_Email',
              'Surname',
              'Forename',
              'Moves_Charity_ID'
            )
            .from('User')
            .where('Moves_Charity_ID', Moves_Charity_ID)

          let _User;
          if (args.type == 1) {
            _User = listUser.find(x => x.User_ID == User_ID);
            Role = (_User && _User.User_Email == Charity.Contact_Email) ? 'Administrator' : '';
          }
          else {
            _User = listUser.find(x => x.User_Email == Charity.Contact_Email);
            Role = _User ? 'Administrator' : '';
          }

          if (_User) User = _User;
          else if (listUser.length > 0) {
            User = listUser[0];
          }
          else {
            User = null;
          }
        }
        //Company
        else if (args.type == 2 || args.type == 5) {
          let Moves_Company_ID = null;

          if (args.type == 2) Moves_Company_ID = User?.Moves_Company_ID;
          else Moves_Company_ID = args.objectId;

          if (!Moves_Company_ID) {
            return {
              messageCode: 404,
              message: 'Company ID is not exists',
            };
          }

          let Company = await db.table('Company').where('Moves_Company_ID', Moves_Company_ID).first();

          let listUser = await db
            .select(
              'User_ID',
              'User_Email',
              'Surname',
              'Forename',
              'Moves_Company_ID'
            )
            .from('User')
            .where('Moves_Company_ID', Moves_Company_ID)

          let _User;
          if (args.type == 1) {
            _User = listUser.find(x => x.User_ID == User_ID);
            Role = (_User && _User.User_Email == Company.Contact_Email) ? 'Administrator' : '';
          }
          else {
            _User = listUser.find(x => x.User_Email == Company.Contact_Email);
            Role = _User ? 'Administrator' : '';
          }

          if (_User) User = _User;
          else if (listUser.length > 0) {
            User = listUser[0];
          }
          else {
            User = null;
          }
        }
        //Admin
        else if (args.type == 3) {

        }

        return {
          Role: Role,
          User_Id: User?.User_ID,
          Surname: User?.Surname ?? '',
          Forename: User?.Forename ?? '',
          User_Email: User?.User_Email ?? '',
          messageCode: 200,
          message: 'OK',
        };
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    }),
    getDashboardNews: (async (parent, args, context) => {
      try {
        let User_ID = context.currentUser?.User_ID ?? null;
        let User = await db.table('User').where('User_ID', User_ID).first();
        let listNew = [];

        //Charity
        if (args.type == 1 || args.type == 4) {
          let Moves_Charity_ID = null;

          if (args.type == 1) Moves_Charity_ID = User?.Moves_Charity_ID;
          else Moves_Charity_ID = args.objectId;

          if (!Moves_Charity_ID) {
            return {
              messageCode: 404,
              message: 'Charity ID is not exists',
            };
          }

          listNew = await db.table('News_Item')
            .select('News_Item_ID', 'News_Image', 'News_Title', 'News_Content')
            .andWhere('Moves_Charity_ID', Moves_Charity_ID)
            .orderBy('Created_Date', 'desc')
            .limit(3);
        }
        //Company
        else if (args.type == 2 || args.type == 5) {
          let Moves_Company_ID = null;

          if (args.type == 2) Moves_Company_ID = User?.Moves_Company_ID;
          else Moves_Company_ID = args.objectId;

          if (!Moves_Company_ID) {
            return {
              messageCode: 404,
              message: 'Company ID is not exists',
            };
          }

          listNew = await db.table('News_Item')
            .select('News_Item_ID', 'News_Image', 'News_Title', 'News_Content')
            .andWhere('Moves_Company_ID', Moves_Company_ID)
            .orderBy('Created_Date', 'desc')
            .limit(3);
        }
        //Admin
        else if (args.type == 3 && User?.IsAdmin == true) {
          let listUserAdmin = await db.table('User')
            .select('User_ID')
            .where('IsAdmin', true);
          let listUserAdminId = listUserAdmin.map(x => x.User_ID);

          listNew = await db.table('News_Item')
            .select('News_Item_ID', 'News_Image', 'News_Title', 'News_Content')
            .whereIn('Created_By', listUserAdminId)
            .andWhere('News_Status_ID', 26)
            .orderBy('Created_Date', 'desc')
            .limit(3);
        }

        listNew.forEach(item => {
          item.News_Image = item.News_Image ? URL_FOLDER + item.News_Image : null;
        });

        return {
          ListNew: listNew,
          messageCode: 200,
          message: 'OK',
        };
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    }),
    getDashboardReport: (async (parent, args, context) => {
      try {
        let User_ID = context.currentUser?.User_ID ?? null;
        let User = await db.table('User').where('User_ID', User_ID).first();

        let result = null;
        //Charity, Charity Directory
        if (args.type == 1 || args.type == 4) {
          result = await dashboardHelper.getTotal(User, args.type, args.objectId);
        }
        //Company, Company Directory
        else if (args.type == 2 || args.type == 5) {
          result = await dashboardHelper.getTotal(User, args.type, args.objectId);

          let Moves_Company_ID;
          if (args.type == 2) Moves_Company_ID = User?.Moves_Company_ID;
          else Moves_Company_ID = args.objectId;

          //Lấy số campaign được match với company
          let listMatch = await db.table('Match')
            .where('Moves_Company_ID', Moves_Company_ID);

          result.totalMatchOfCompany = listMatch.length;
        }
        //Admin
        else if (args.type == 3 && User.IsAdmin == true) {
          let TotalCharityActive = 0;
          let TotalCompanyActive = 0;
          let TotalAppeal = 0;
          let TotalCampaign = 0;
          let TotalMove = 0;
          let TotalDonation = 0;

          let listCharityActive = await db.table('Charity')
            .where('Is_Active', true)
          TotalCharityActive = listCharityActive.length;

          let listCompanyActive = await db.table('Company')
            .where('Is_Active', true)
          TotalCompanyActive = listCompanyActive.length;

          await changeStatus.appeal();
          await changeStatus.campaign();

          let listAppeal = await db.table('Appeal')
            .where('Appeal_Status_ID', 16);
          TotalAppeal = listAppeal.length;

          let listCampaign = await db.table('Campaign')
            .where('Campaign_Status_ID', 23);
          TotalCampaign = listCampaign.length;

          let donationMove = await db.table('Donation')
            .sum('Moves_Donated')
            .first();
          TotalMove = (donationMove?.sum ?? 0);

          let listDonationCharity = await db.table('Donation')
            .whereNotNull('Moves_Charity_ID')
            .sum('Sterling_Amount')
            .first();
          let totalDonationCharity = (listDonationCharity?.sum ?? 0);

          let listDonationAppeal = await db.table('Donation')
            .whereNotNull('Appeal_ID')
            .sum('Sterling_Amount')
            .first();
          let totalDonationAppeal = (listDonationAppeal?.sum ?? 0);

          let listDonationCampaign = await db.table('Donation')
            .whereNotNull('Campaign_ID');

          let listMatch = await db.table('Match');

          let listCampaignId = await db.table('Donation')
            .whereNotNull('Campaign_ID')
            .distinct('Campaign_ID');

          let totalDonationCampaign = 0;
          listCampaignId.forEach(item => {
            let count = listMatch.filter(x => x.Campaign_ID == item.Campaign_ID).length + 1;
            let sterling_amount = listDonationCampaign.filter(x => x.Campaign_ID == item.Campaign_ID)
              .map(x => x.Sterling_Amount).reduce((a, b) => a + b, 0);

            totalDonationCampaign += count * sterling_amount;
          });

          TotalDonation = commonSystem.roundNumber(totalDonationCharity + totalDonationAppeal + totalDonationCampaign, 2);

          return {
            TotalCharityActive: TotalCharityActive,
            TotalCompanyActive: TotalCompanyActive,
            TotalAppeal: TotalAppeal,
            TotalCampaign: TotalCampaign,
            TotalMove: TotalMove,
            TotalDonation: TotalDonation,
            message: 'OK',
            messageCode: 200
          }
        }

        let isFavourite = false;
        try {
          isFavourite = await db.table('Favorites')
            .where('User_ID', User_ID)
            .where('Moves_Charity_ID', args.objectId)
            .first();
          isFavourite = !!isFavourite;
        } catch (e) {
          throw new Error(e);
        }

        return {
          TotalAppeal: result?.totalAppeal,
          TotalCampaign: result?.totalCampaign,
          TotalDonation: result?.totalDonation,
          TotalMatchOfCompany: result?.totalMatchOfCompany,
          TotalMove: result?.totalMove,
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
    getDashboardMobile: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User')
          .where('User_ID', User_ID)
          .where('Is_Mobile_App_User', true)
          .first(); 
          
        // if(User){
        //   await db.table('User')
        //   .where('User_ID', User_ID)
        //   .where('Is_Mobile_App_User', true)
        //   .update({
        //       GMT_Mobile: args?.GMT_Mobile
        //   });
        // } 

        let LastUpload = commonSystem.formatDate2(new Date(User['Created_Date']), "YYYY/MM/DD-hh:mm:ss") ;
        
        let Activity_Upload = await db.table('Activity_Upload')
          .where('User_ID', User_ID)
          .orderBy('Activity_Upload_Datetime', 'desc');

        if (Activity_Upload?.length) {
          LastUpload = commonSystem.formatDate2(new Date(Activity_Upload[0]['Activity_Upload_Datetime']),"YYYY/MM/DD-hh:mm:ss")   ;
        }
        let { Donated_Moves, Amount_Donated, Moves_Avaiable } = await commonSystem.getDonate(User_ID);
        return {
          data: {
            Donated_Moves,
            Amount_Donated,
            Moves_Avaiable,
            LastUpload
          },
          message: messages.success,
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
    getDirectory: (async (parent, args, context) => {
      try {
        let listCharity = await db.table('Charity')
          .where('Is_Active', true)
          .orderBy('Charity_Name', 'asc');

        let listCharitySector = await db.table('Charity_Sector');

        listCharity.forEach(item => {
          let list = listCharitySector.filter(x => x.Moves_Charity_ID == item.Moves_Charity_ID);
          item.List_Charity_Sector_ID = list.map(x => x.Category_ID);
        });

        let listCompany = await db.table('Company')
          .where('Is_Active', true)
          .orderBy('Company_Name', 'asc');

        let ListIncomeBand = await db.table('Category')
          .where('Category_Type', 2);

        let ListGeographicScope = await db.table('Category')
          .where('Category_Type', 1);

        let ListCharitySector = await db.table('Category')
          .where('Category_Type', 3);

        return {
          ListCharity: listCharity,
          ListCompany: listCompany,
          ListIncomeBand: ListIncomeBand,
          ListGeographicScope: ListGeographicScope,
          ListCharitySector: ListCharitySector,
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
    updateDashboardCharity: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();
        let Charity = args.UpdateDashboardCharityInput;
        let ListCategoryId = args.UpdateDashboardCharityInput.ListCategoryId;

        let Moves_Charity_ID = User.Moves_Charity_ID;
        if (!Moves_Charity_ID) {
          return {
            messageCode: 404,
            message: 'Charity ID is not exists',
          };
        }

        let trx_result = await db.transaction(async trx => {
          //Upload image
          let url_icon = null;
          if (Charity.Charity_icon_file) {
            let { filename, mimetype, createReadStream } = await Charity.Charity_icon_file;

            //Save url to db
            let _fileNameIndex = filename.lastIndexOf('.');
            let _fileName = filename.substring(0, _fileNameIndex) + Moves_Charity_ID;
            let _fileType = filename.substring(_fileNameIndex);
            url_icon = '/charity/' + _fileName + _fileType;
            await trx.table('Charity')
              .where('Moves_Charity_ID', Moves_Charity_ID)
              .update({
                Charity_icon: url_icon,
              });

            //save file to directory
            await saveFile([Charity.Charity_icon_file], 'charity', _fileName + _fileType);
          }

          await trx.table('Charity')
            .where('Moves_Charity_ID', Moves_Charity_ID)
            .update({
              Charity_URL: Charity.Charity_URL.replace(/ /g, ''),
              Contact_Forename: Charity.Contact_Forename,
              Contact_Surname: Charity.Contact_Surname,
              Contact_Email: Charity.Contact_Email,
              Contact_Phone_Number: Charity.Contact_Phone_Number,
              Charity_Date_Founded: Charity.Charity_Date_Founded,
              Charity_Aims: Charity.Charity_Aims,
              Charity_Geographical_Scope: Charity.Charity_Geographical_Scope,
              Charity_Income_Band_ID: Charity.Charity_Income_Band_ID,
              Address_For_Invoice: Charity.Address_For_Invoice,
              Payment_Site_Url: Charity.Payment_Site_Url,
              Account_Name: Charity.Account_Name,
              Account_No: Charity.Account_No,
              Sort_Code: Charity.Sort_Code,
              Member_Payment_Site_Url: Charity.Member_Payment_Site_Url,
              Member_Account_Name: Charity.Member_Account_Name,
              Member_Account_No: Charity.Member_Account_No,
              Member_Sort_Code: Charity.Member_Sort_Code,
            });

          await trx.table('Charity_Sector')
            .where('Moves_Charity_ID', Moves_Charity_ID).del();

          let listCharitySector = [];
          ListCategoryId.forEach(item => {
            let new_item = {
              Moves_Charity_ID: Moves_Charity_ID,
              Category_ID: item
            };
            listCharitySector.push(new_item);
          });

          await trx.table('Charity_Sector')
            .insert(listCharitySector);

          return {
            message: 'Charity profile has been updated!',
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
    updateDashboardCompany: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();
        let Company = args.UpdateDashboardCompanyInput;

        let Moves_Company_ID = User.Moves_Company_ID;
        if (!Moves_Company_ID) {
          return {
            messageCode: 404,
            message: 'Company ID is not exists',
          };
        }

        let trx_result = await db.transaction(async trx => {
          //Upload image
          let url_icon = null;
          if (Company.Company_Icon_File) {
            let { filename, mimetype, createReadStream } = await Company.Company_Icon_File;

            //Save url to db
            let _fileNameIndex = filename.lastIndexOf('.');
            let _fileName = filename.substring(0, _fileNameIndex) + Moves_Company_ID;
            let _fileType = filename.substring(_fileNameIndex);
            url_icon = '/company/' + _fileName + _fileType;
            await trx.table('Company')
              .where('Moves_Company_ID', Moves_Company_ID)
              .update({
                Company_Icon: url_icon,
              });

            //save file to directory
            await saveFile([Company.Company_Icon_File], 'company', _fileName + _fileType);
          }

          await trx.table('Company')
            .where('Moves_Company_ID', Moves_Company_ID)
            .update({
              Company_URL: Company.Company_URL,
              Contact_Forename: Company.Contact_Forename,
              Contact_Surname: Company.Contact_Surname,
              Contact_Email: Company.Contact_Email,
              Contact_Phone_Number: Company.Contact_Phone_Number,
              Company_CSR_Statement: Company.Company_CSR_Statement,
            });

          return {
            message: 'Company profile has been updated!',
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
    updateRemovePrivileges: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        if (!User.IsAdmin) {
          return {
            message: 'User is not admin',
            messageCode: 409
          }
        }

        //Charity Directory
        if (args.type == 4) {
          let Moves_Charity_ID = args.objectId;

          let charity = await db.table('Charity')
            .where('Moves_Charity_ID', Moves_Charity_ID)
            .first();

          if (!charity) {
            return {
              message: 'Charity not found',
              messageCode: 404
            }
          }

          let status = !charity.Is_Remove_Privileges;

          await db.table('Charity')
            .where('Moves_Charity_ID', Moves_Charity_ID)
            .update('Is_Remove_Privileges', status);

          await history.updateHistory({
            'Object_Id': Moves_Charity_ID,
            'Object_Type': 'Charity',
            'Action': status ? 'Privileges Removed' : 'Privileges Restored',
          }, User_ID)

          if (status == true) {
            return {
              message: 'The Charity has been removed privileges',
              messageCode: 200
            }
          }
          else {
            return {
              message: 'The Charity has been reinstated privileges',
              messageCode: 200
            }
          }
        }
        //Company Directory
        else if (args.type == 5) {
          let Moves_Company_ID = args.objectId;

          let company = await db.table('Company')
            .where('Moves_Company_ID', Moves_Company_ID)
            .first();

          if (!company) {
            return {
              message: 'Company not found',
              messageCode: 404
            }
          }

          let status = !company.Is_Remove_Privileges;

          await db.table('Company')
            .where('Moves_Company_ID', Moves_Company_ID)
            .update('Is_Remove_Privileges', status);

          await history.updateHistory({
            'Object_Id': Moves_Company_ID,
            'Object_Type': 'Company',
            'Action': status ? 'Privileges Removed' : 'Privileges Restored',
          }, User_ID)

          if (status == true) {
            return {
              message: 'The Company has been removed privileges',
              messageCode: 200
            }
          }
          else {
            return {
              message: 'The Company has been reinstated privileges',
              messageCode: 200
            }
          }
        }
        else {
          return {
            message: 'Parameter not found',
            messageCode: 404
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
    updateRemoveAccess: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        if (!User.IsAdmin) {
          return {
            message: 'User is not admin',
            messageCode: 409
          }
        }

        //Charity Directory
        if (args.type == 4) {
          let Moves_Charity_ID = args.objectId;

          let charity = await db.table('Charity')
            .where('Moves_Charity_ID', Moves_Charity_ID)
            .first();

          if (!charity) {
            return {
              message: 'Charity not found',
              messageCode: 404
            }
          }

          let status = !charity.Is_Remove_Access;

          await db.table('Charity')
            .where('Moves_Charity_ID', Moves_Charity_ID)
            .update('Is_Remove_Access', status);

          await history.updateHistory({
            'Object_Id': Moves_Charity_ID,
            'Object_Type': 'Charity',
            'Action': status ? 'Access Removed' : 'Access Restored',
          }, User_ID)

          if (status == true) {
            return {
              message: 'The Charity has been removed access',
              messageCode: 200
            }
          }
          else {
            return {
              message: 'The Charity has been removed access',
              messageCode: 200
            }
          }
        }
        //Company Directory
        else if (args.type == 5) {
          let Moves_Company_ID = args.objectId;

          let company = await db.table('Company')
            .where('Moves_Company_ID', Moves_Company_ID)
            .first();

          if (!company) {
            return {
              message: 'Company not found',
              messageCode: 404
            }
          }

          let status = !company.Is_Remove_Access;

          await db.table('Company')
            .where('Moves_Company_ID', Moves_Company_ID)
            .update('Is_Remove_Access', status);

          await history.updateHistory({
            'Object_Id': Moves_Company_ID,
            'Object_Type': 'Company',
            'Action': status ? 'Access Removed' : 'Access Restored',
          }, User_ID)

          if (status == true) {
            return {
              message: 'The Company has been removed access',
              messageCode: 200
            }
          }
          else {
            return {
              message: 'The Company has been removed access',
              messageCode: 200
            }
          }
        }
        else {
          return {
            message: 'Parameter not found',
            messageCode: 404
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
    })
  }
};

module.exports = resolvers
