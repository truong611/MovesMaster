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

const resolvers = {
  Query: {
    getListUser: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();
        let ListUser = [];

        if (User.Moves_Charity_ID) {
          ListUser = await db.table('User')
            .where('Moves_Charity_ID', User.Moves_Charity_ID)
            .andWhere('Is_Deleted', false)
            .orderBy('Created_Date', 'desc');
        }
        else if (User.Moves_Company_ID) {
          ListUser = await db.table('User')
            .where('Moves_Company_ID', User.Moves_Company_ID)
            .andWhere('Is_Deleted', false)
            .orderBy('Created_Date', 'desc');
        }
        else if (User.IsAdmin) {
          ListUser = await db.table('User')
            .where('IsAdmin', true)
            .andWhere('Is_Deleted', false)
            .orderBy('Created_Date', 'desc');
        }

        return {
          ListUser: ListUser,
          messageCode: 200,
          message: 'OK',
        }
      }
      catch (e) {
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    }),
    getUserInfor: authenticated(async (parent, args, context) => {
      try {
        let User = await db.table('User').where('User_ID', args.User_ID).first();

        if (!User) {
          return {
            message: 'User is not exists',
            messageCode: 404
          }
        }

        User.User_Avatar = User.User_Avatar ? URL_FOLDER + User.User_Avatar : null;

        let List_Permission_Type = [];
        let List_User_Permission = [];

        //Admin
        if (User.IsAdmin) {
          List_Permission_Type = await db.table('Permission_Type')
            .where('Type', 1)
            .orWhere('Type', 4)
            .orderBy('Permission_Type_ID');
        }
        //Charity
        else if (User.Moves_Charity_ID) {
          List_Permission_Type = await db.table('Permission_Type')
            .where('Type', 1)
            .orWhere('Type', 2)
            .orWhere('Type', 5)
            .orderBy('Permission_Type_ID');
        }
        //Company
        else if (User.Moves_Company_ID) {
          List_Permission_Type = await db.table('Permission_Type')
            .where('Type', 1)
            .orWhere('Type', 3)
            .orWhere('Type', 5)
            .orderBy('Permission_Type_ID');
        }

        List_User_Permission = await db.table('User_Permission')
          .where('User_ID', User.User_ID)
          .orderBy('Permission_Type_ID');

        return {
          User: User,
          List_Permission_Type: List_Permission_Type,
          List_User_Permission: List_User_Permission,
          message: 'OK',
          messageCode: 200
        }
      }
      catch (e) {
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    }),
    getUserPermission: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let List_Permission_Type = await db.table('Permission_Type')
          .select('Permission_Type.*', 'User_Permission.Is_Active')
          .join('User_Permission', 'User_Permission.Permission_Type_ID', 'Permission_Type.Permission_Type_ID')
          .where('User_Permission.User_ID', User_ID);

        return {
          List_Permission: List_Permission_Type,
          messageCode: 200,
          message: 'OK',
        }
      }
      catch (e) {
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    }),
  },
  Mutation: {
    changeUserPassword: authenticated(async (parent, args, context) => {
      try {
        let User = await db.table('User').where('User_ID', args.User_ID).first();

        if (!User) {
          return {
            message: 'User is not exists',
            messageCode: 404
          }
        }

        const isEqual = await bcrypt.compare(args.Current_Password, User.User_Password);
        if (!isEqual) {
          return {
            message: 'Current password is incorrect',
            messageCode: 404
          }
        }

        const hashedPassword = await bcrypt.hash(args.New_Password, 12);

        await db.table('User').where('User_ID', args.User_ID).update({
          User_Password: hashedPassword,
          Last_Modify_Date: new Date(),
          Last_Modify_By: context.currentUser.User_ID
        });

        return {
          message: 'Your Password has been changed!',
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
    updateUserInfor: authenticated(async (parent, args, context) => {
      try {
        let UserInfor = args.UpdateUserInforInput;
        let User = await db.table('User').where('User_ID', UserInfor.User_ID).first();

        if (!User) {
          return {
            message: 'User is not exists',
            messageCode: 404
          }
        }

        let trx_result = await db.transaction(async trx => {
          //Upload image
          let url_icon = null;
          if (UserInfor.User_Avatar_File) {
            let { filename, mimetype, createReadStream } = await UserInfor.User_Avatar_File;

            //Save url to db
            let _fileNameIndex = filename.lastIndexOf('.');
            let _fileName = filename.substring(0, _fileNameIndex) + User.User_ID;
            let _fileType = filename.substring(_fileNameIndex);
            url_icon = '/user/' + _fileName + _fileType;
            await trx.table('User')
              .where('User_ID', User.User_ID)
              .update({
                User_Avatar: url_icon,
              });

            //save file to directory
            await saveFile([UserInfor.User_Avatar_File], 'user', _fileName + _fileType);
          }

          await trx.table('User')
            .where('User_ID', User.User_ID)
            .update({
              Surname: UserInfor.Surname,
              Forename: UserInfor.Forename,
              User_Job_Roll: UserInfor.User_Job_Roll,
              User_Phone_Number: UserInfor.User_Phone_Number,
            });

          let List_User_Permission = UserInfor.List_User_Permission;
          for (let i = 0; i < List_User_Permission.length; i++) {
            let item = List_User_Permission[i];

            let exists = await trx.table('User_Permission')
              .where('User_Permission_ID', item.User_Permission_ID)
              .first();

            //change user permission
            if (exists && exists.Is_Active != item.Is_Active) {
              await trx.table('User_Permission')
                .where('User_Permission_ID', item.User_Permission_ID)
                .update({
                  Is_Active: item.Is_Active,
                  Last_Modify_Date: new Date(),
                  Last_Modify_By: context.currentUser.User_ID
                });
            }
            //create user permission
            else if (!exists) {
              await trx.table('User_Permission')
                .insert({
                  Permission_Type_ID: item.Permission_Type_ID,
                  User_ID: item.User_ID,
                  Is_Active: item.Is_Active,
                  Last_Modify_Date: new Date(),
                  Last_Modify_By: context.currentUser.User_ID
                });
            }
          }

          return {
            message: 'User profile has been updated!',
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
    createUser: authenticated(async (parent, args, context) => {
      try {
        let UserInfor = args.CreateUserInput;
        let List_User_Permission = UserInfor.List_User_Permission;

        let User = await db.table('User').where('User_ID', context.currentUser.User_ID).first();

        let type = 0;
        let objectName = null;
        if (User.IsAdmin) {
          type = 1;
          objectName = 'Moves Matter Admin';
        }
        else if (User.Moves_Charity_ID) {
          type = 2;
          let charity = await db.table('Charity')
            .where('Moves_Charity_ID', User.Moves_Charity_ID)
            .first();

          objectName = charity.Charity_Name;
        }
        else if (User.Moves_Company_ID) {
          type = 3;
          let company = await db.table('Company')
            .where('Moves_Company_ID', User.Moves_Company_ID)
            .first();
          objectName = company.Company_Name;
        }

        let exists_user_web = await db.table('User')
          .where('User_Email', 'ilike', UserInfor.User_Email.trim())
          .andWhere('Is_Web_App_User', true)
          .first();

        if (exists_user_web) {
          return {
            message: `A user with this email address already exists on Moves Matter registered to and display the ${objectName}`,
            messageCode: 406
          }
        }

        let exists_user_mobile = await db.table('User')
          .where('User_Email', 'ilike', UserInfor.User_Email.trim())
          .andWhere('Is_Web_App_User', false)
          .andWhere('Is_Mobile_App_User', true)
          .first();

        let trx_result = await db.transaction(async trx => {
          if (exists_user_mobile) {
            await trx.table('User')
              .where('User_Email', 'ilike', UserInfor.User_Email.trim())
              .andWhere('Is_Web_App_User', false)
              .andWhere('Is_Mobile_App_User', true)
              .update({
                Is_Web_App_User: true,
                Created_Date: new Date
              })

            let _url = `${CLIENT}/login`;
            await sendEmail.sendEmail(UserInfor.User_Email,
              'Welcome to Moves Matter',
              emailTemp.templateUserExists(_url, objectName),
              [], 'stream'
            ).catch(err => {
              throw new Error(err);
            });

            return {
              User_ID: exists_user_mobile.User_ID,
              message: 'Create a New Account Success!',
              messageCode: 200
            }
          }

          const tokenReset = jwt.sign(
            {
              User_Email: UserInfor.User_Email
            },
            'secret-reset-email',
            { expiresIn: 60 * 60 * 24 } //60 * 60 * 24 = 24h
          );

          //Create User
          let result = await trx.table('User')
            .returning(['User_ID'])
            .insert({
              Surname: UserInfor.Surname,
              Forename: UserInfor.Forename,
              User_Job_Roll: UserInfor.User_Job_Roll,
              User_Email: UserInfor.User_Email,
              User_Phone_Number: UserInfor.User_Phone_Number,
              Is_Web_App_User: true,
              IsAdmin: type == 1 ? true : false,
              Moves_Charity_ID: type == 2 ? User.Moves_Charity_ID : null,
              Moves_Company_ID: type == 3 ? User.Moves_Company_ID : null,
              Token_Forgot_Password: tokenReset
            });
          let User_ID = result[0].User_ID;

          //Create User Permission
          let list_item = [];
          List_User_Permission.forEach(item => {
            list_item.push({
              Permission_Type_ID: item.Permission_Type_ID,
              User_ID: User_ID,
              Is_Active: item.Is_Active,
              Last_Modify_Date: new Date(),
              Last_Modify_By: User.User_ID
            });
          });

          await trx.table('User_Permission')
            .insert(list_item);

          //Upload image
          if (UserInfor.User_Avatar_File) {
            let url_icon = null;
            let { filename, mimetype, createReadStream } = await UserInfor.User_Avatar_File;

            //Save url to db
            let _fileNameIndex = filename.lastIndexOf('.');
            let _fileName = filename.substring(0, _fileNameIndex) + User_ID;
            let _fileType = filename.substring(_fileNameIndex);
            url_icon = '/user/' + _fileName + _fileType;
            await trx.table('User')
              .where('User_ID', User_ID)
              .update({
                User_Avatar: url_icon,
              });

            //save file to directory
            await saveFile([UserInfor.User_Avatar_File], 'user', _fileName + _fileType);
          }

          const url = `${CLIENT}/reset-password;id=${tokenReset}`;

          await sendEmail.sendEmail(UserInfor.User_Email,
            'Welcome to Moves Matter',
            emailTemp.templateCreatePassword(url, objectName, UserInfor.User_Email),
            [], 'stream'
          ).catch(err => {
            throw new Error(err);
          });

          return {
            User_ID: User_ID,
            message: 'Create a New Account Success!',
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