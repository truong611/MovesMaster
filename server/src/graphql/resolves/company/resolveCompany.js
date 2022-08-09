const db = require('../../../data/knex-db');
const authenticated = require('../../../middleware/authenticated-guard');
const { saveFile, deleteFile, downloadFile } = require('../../../common/handleFile');
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const CLIENT = process.env.CLIENT;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../../common/sendEmail');
const emailTemp = require('../../../common/emailTemp');
const logging = require('../../../middleware/autologging');
const exportPDF = require('../../../common/exportPdf');
const history = require('../../../common/history');

const resolvers = {
  Query: {
    getListCompanyNotActive: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        if (!User.IsAdmin) {
          return {
            message: 'User is not admin',
            messageCode: 409
          }
        }

        let ListCompany = await db.table('Company')
          .where('Is_Active', null)
          .orderBy('Created_Date', 'desc');

        let listCreatedBy = [...new Set([...ListCompany.map(x => x.Created_By)])];

        if (listCreatedBy.length) {
          let listUser = await db.table('User')
            .whereIn('User_ID', listCreatedBy);
          
          let listCharityId = listUser.map(x => x.Moves_Charity_ID);

          let listCharity = await db.table('Charity')
            .whereIn('Moves_Charity_ID', listCharityId);

          ListCompany.forEach(item => {
            let user = listUser.find(x => x.User_ID == item.Created_By);
            let charity = listCharity.find(x => x.Moves_Charity_ID == user.Moves_Charity_ID);
            item.CharityInfor = charity;
          });
        }

        return {
          ListCompany: ListCompany,
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
    createCompany: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let CompanyInfor = args.CreateCompanyInput;

        let exists_company_number = await db.table('Company')
          .where('Company_Number', CompanyInfor.Company_Number)
          .first();
        if (exists_company_number) {
          return {
            message: 'There is already a Company on Moves with this Company Number. Please check',
            messageCode: 406
          }
        }

        let exists_company_name = await db.table('Company')
          .where('Company_Name', CompanyInfor.Company_Name.trim())
          .first();
        if (exists_company_name) {
          return {
            message: 'There is already a Company on Moves with this Company Name. Please check',
            messageCode: 406
          }
        }

        let exists_email = await db.table('User')
          .where('User_Email', 'ilike', CompanyInfor.Contact_Email.trim())
          .first();
        if (exists_email) {
          return {
            message: 'There is already a Account on Moves Matter with this Email',
            messageCode: 406
          }
        }

        let trx_result = await db.transaction(async trx => {
          //Create Company
          let CompanyResult = await trx.table('Company')
            .returning('Moves_Company_ID')
            .insert({
              Company_Name: CompanyInfor.Company_Name.trim(),
              Company_Number: CompanyInfor.Company_Number,
              Contact_Name: CompanyInfor.Contact_Name.trim(),
              Contact_Email: CompanyInfor.Contact_Email.trim(),
              Contact_Phone_Number: CompanyInfor.Contact_Phone_Number.trim(),
              Is_Active: null,
              Created_By: User_ID
            });

          await history.updateHistory({
            'Object_Id': CompanyResult[0],
            'Object_Type': 'Company',
            'Action': 'Created on Moves',
          }, User_ID)

          return {
            message: 'Thank you for introducing ' + CompanyInfor.Company_Name.trim() + ' company to Moves Matter. We will carry out the necessary checks and get back to ' + CompanyInfor.Company_Name.trim() + ' company at this email address.',
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
    approveCompany: authenticated(async (parent, args, context) => {
      try {
        let Moves_Company_ID = args.Id;
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        if (!User.IsAdmin) {
          return {
            message: 'User is not admin',
            messageCode: 409
          }
        }

        let company = await db.table('Company')
          .where('Moves_Company_ID', Moves_Company_ID)
          .first();

        if (!company) {
          return {
            message: 'Company not found',
            messageCode: 404
          }
        }

        if (company.Is_Active != null) {
          return {
            message: 'Company has been activated',
            messageCode: 409
          }
        }

        let existsUser = await db.table('User')
          .where('User_Email', 'ilike', company.Contact_Email.trim())
          .first();

        if (existsUser) {
          return {
            message: 'Company contact email has been exists',
            messageCode: 409
          }
        }

        let trx_result = await db.transaction(async trx => {
          //Update Is_Active => true
          await trx.table('Company')
            .where('Moves_Company_ID', Moves_Company_ID)
            .update({
              Is_Active: true,
              Date_Active: new Date
            });

          //Create user of Company and have role admin

          const tokenReset = jwt.sign(
            {
              User_Email: company.Contact_Email.trim()
            },
            'secret-reset-email',
            { expiresIn: 60 * 60 * 24 } //60 * 60 * 24 = 24h
          );

          let UserResult = await trx.table('User')
            .returning(['User_ID'])
            .insert({
              Surname: company.Company_Name.trim(),
              Forename: '',
              User_Email: company.Contact_Email.trim(),
              User_Phone_Number: company.Contact_Phone_Number.trim(),
              Is_Web_App_User: true,
              IsAdmin: false,
              Moves_Company_ID: Moves_Company_ID,
              Token_Forgot_Password: tokenReset
            });

          let User_Result_ID = UserResult[0].User_ID;

          //Create User Permission
          let listPermissionType = await trx.table('Permission_Type')
            .where('Type', 1)
            .orWhere('Type', 3)
            .orWhere('Type', 5)

          let list_item = [];
          listPermissionType.forEach(item => {
            list_item.push({
              Permission_Type_ID: item.Permission_Type_ID,
              User_ID: User_Result_ID,
              Is_Active: true,
              Last_Modify_Date: new Date(),
              Last_Modify_By: context.currentUser.User_ID
            });
          });

          await trx.table('User_Permission')
            .insert(list_item);

          await history.updateHistory({
            'Object_Id': Moves_Company_ID,
            'Object_Type': 'Company',
            'Action': 'Authorised',
          }, User_ID);

          //Create News
					await trx.table('News_Item')
          .insert({
            News_Image: company.Company_Icon,
            News_Title: `NEW COMPANY. ${company.Company_Name} joins Moves! Welcome ${company.Company_Name}!`,
            News_Content: `We welcome ${company.Company_Name} to the Moves Matter world`,
            Moves_Company_ID: company.Moves_Company_ID,
            News_Status_ID: 26,
            News_Url: company.Company_URL,
            Is_Manual: false,
            News_Publish_Date: new Date()
          });

          const url = `${CLIENT}/reset-password;id=${tokenReset}`;
          const urlTerm = `${CLIENT}/terms-and-conditions`;
          const urlPolicy = `${CLIENT}/policy`;

          await sendEmail.sendEmail(company.Contact_Email.trim(),
            company.Company_Name + ' - Request to join Moves Matter ' + company.Company_Number,
            emailTemp.templateAcceptRequestCompany(url, urlTerm, urlPolicy, company.Contact_Name),
            [],
            'stream'
          ).catch(err => {
            throw new Error(err);
          });

          return {
            message: 'The company registration request has been approved successfully!',
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
    denyCompany: authenticated(async (parent, args, context) => {
      try {
        let Moves_Company_ID = args.Id;
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        if (!User.IsAdmin) {
          return {
            message: 'User is not admin',
            messageCode: 409
          }
        }

        let company = await db.table('Company')
          .where('Moves_Company_ID', Moves_Company_ID)
          .first();

        if (!company) {
          return {
            message: 'Company not found',
            messageCode: 404
          }
        }

        if (company.Is_Active != null) {
          return {
            message: 'Company has been activated',
            messageCode: 409
          }
        }

        let trx_result = await db.transaction(async trx => {
          //Update Is_Active => false
          await trx.table('Company')
            .where('Moves_Company_ID', Moves_Company_ID)
            .update({
              Is_Active: false,
            });

          const url = `${CLIENT}/home`;

          await sendEmail.sendEmail(company.Contact_Email.trim(),
            company.Company_Name + ' - Request to join Moves Matter ' + company.Company_Number,
            emailTemp.templateDenyCompany(company.Contact_Name, url),
            [], 'stream'
          ).catch(err => {
            throw new Error(err);
          });

          return {
            message: 'The company registration request has been rejected successfullly!',
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
    })
  }
};

module.exports = resolvers