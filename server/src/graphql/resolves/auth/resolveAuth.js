const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../../data/knex-db');
const messages = require('../../../messages/auth');
const Timestamp = require('../../scalarType/Timestamp');
const JWTSECRET = process.env.JWTSECRET;
const sendEmail = require('../../../common/sendEmail');
const authenticated = require('../../../middleware/authenticated-guard');
const { saveFileBase64, deleteFile } = require('../../../common/handleFile');
const logging = require('../../../middleware/autologging');
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const emailTemp = require('../../../common/emailTemp');

const generate = (user, refresh = false) => {
  let expiresIn = refresh ? (60 * (60 * 24) * 7) : (60 * (60 * 24));
  return jwt.sign(
    {
      User_ID: user.User_ID,
      User_Email: user.User_Email,
      Surname: user.Surname,
      Forename: user.Forename,
      IsAdmin: user.IsAdmin,
      Is_Deleted: user.Is_Deleted,
      Moves_Company_ID: user.Moves_Company_ID,
      Moves_Charity_ID: user.Moves_Charity_ID,
    },
    process.env.JWTSECRET,
    {
      expiresIn
    }
  )
};

const setUserType = (user) => {
  if (user.Moves_Charity_ID) {
    return 1;
  }
  else if (user.Moves_Company_ID) {
    return 2;
  }
  else if (user.IsAdmin) {
    return 3;
  }

  return 0;
}

const resolvers = {
  Timestamp,
  //QUERY
  Query: {
    login: async (parent, args, context) => {
      try {
        let user;
        if (args?.type == 'mobile') {
          user = await db.table('User')
            .where('User_Email', 'ilike', args.email.trim())
            .where('Is_Mobile_App_User', true)
            .first();
        }
        else {
          user = await db.table('User')
            .where('User_Email', 'ilike', args.email.trim())
            .andWhere(builder => {
              builder.where('Is_Web_App_User', true)
              builder.orWhere('Is_Mobile_App_User', true)
            })
            .first();
        }

        if (!user && args?.type == 'mobile') {
          let existsUser = await db.table('User')
            .where('User_Email', 'ilike', args.email.trim())
            .where('Is_Mobile_App_User', false)
            .where('Is_Web_App_User', true)
            .first();

          //Nếu không kích hoạt tài khoản mobile
          if (args.isActiveMobile == false) {
            //Nếu không có tài khoản trên web và cả trên mobile
            if (!existsUser) {
              return {
                messageCode: 404,
                message: messages.login.error,
              };
            }
            
            //Nếu có tài khoản trên web nhưng chưa có trên mobile
            return {
              messageCode: 404,
              message: "user web is exists",
              isExistsWeb: true,
            }
          }
          //Nếu kích hoạt tài khoản mobile
          else {
            user = existsUser;
          }
        }
        else if (!user && args?.type != 'mobile') {
          return {
            messageCode: 404,
            message: messages.login.error,
          };
        }

        if (args?.type == 'mobile') {
          if (user.Moves_Charity_ID) {
            let charity = await db.table('Charity')
              .where('Moves_Charity_ID', user.Moves_Charity_ID)
              .first();

            if (charity && charity.Is_Remove_Access == true) {
              return {
                messageCode: 404,
                message: 'Access to your Charity has been removed. Please contact Moves Matter Admin to discuss '
              }
            }
          }

          if (user.Moves_Company_ID) {
            let company = await db.table('Company')
              .where('Moves_Company_ID', user.Moves_Company_ID)
              .first();

            if (company && company.Is_Remove_Access == true) {
              return {
                messageCode: 404,
                message: 'Access to your Company has been removed. Please contact Moves Matter Admin to discuss '
              }
            }
          }
        }

        if (!user.User_Password) {
          return {
            messageCode: 404,
            message: messages.login.error,
          };
        }

        const isEqual = await bcrypt.compare(args.password, user.User_Password);

        if (!isEqual) {
          return {
            messageCode: 404,
            message: messages.login.error,
          };
        }

        //set type
        user.Type = setUserType(user);

        if (user.Moves_Charity_ID) {
          let charity = await db.table('Charity').where('Moves_Charity_ID', user.Moves_Charity_ID).first();
          user.Charity_Name = charity?.Charity_Name;
          user.Charity_icon = charity.Charity_icon ? URL_FOLDER + charity.Charity_icon : null;
          user.Charity_URL = charity?.Charity_URL;
          user.Is_Remove_Privileges = charity.Is_Remove_Privileges;
          user.Is_Remove_Access = charity.Is_Remove_Access;

          if (user.Is_Remove_Access) {
            return {
              messageCode: 409,
              message: 'Access to your Charity has been removed. Please contact Moves Matter Admin to discuss',
            }
          }
        }
        else if (user.Moves_Company_ID) {
          let company = await db.table('Company').where('Moves_Company_ID', user.Moves_Company_ID).first();
          user.Company_Name = company?.Company_Name;
          user.Is_Remove_Privileges = company.Is_Remove_Privileges;
          user.Is_Remove_Access = company.Is_Remove_Access;

          if (user.Is_Remove_Access) {
            return {
              messageCode: 409,
              message: 'Access to your Company has been removed. Please contact Moves Matter Admin to discuss',
            }
          }
        }

        user.token = jwt.sign(
          {
            User_ID: user.User_ID,
            User_Email: user.User_Email,
            Surname: user.Surname,
            Forename: user.Forename,
            IsAdmin: user.IsAdmin,
            Is_Deleted: user.Is_Deleted,
            Moves_Company_ID: user.Moves_Company_ID,
            Moves_Charity_ID: user.Moves_Charity_ID,
            Is_Remove_Privileges: user.Is_Remove_Privileges,
            Is_Mobile_App_User: user.Is_Mobile_App_User,
            Is_Web_App_User: user.Is_Web_App_User
          },
          process.env.JWTSECRET,
          {
            expiresIn: 60 * (60 * 24) // 1 day
          }
        );

        user.refreshToken = jwt.sign(
          {
            User_ID: user.User_ID,
            User_Email: user.User_Email,
            Surname: user.Surname,
            Forename: user.Forename,
            IsAdmin: user.IsAdmin,
            Is_Deleted: user.Is_Deleted,
            Moves_Company_ID: user.Moves_Company_ID,
            Moves_Charity_ID: user.Moves_Charity_ID,
            Is_Remove_Privileges: user.Is_Remove_Privileges,
            Is_Mobile_App_User: user.Is_Mobile_App_User,
            Is_Web_App_User: user.Is_Web_App_User
          },
          process.env.JWTSECRET,
          {
            expiresIn: 60 * (60 * 24) * 3 // 3 day
          }
        );

        user.tokenExpiration = 24;
        user.User_Avatar = user.User_Avatar ? URL_FOLDER + user.User_Avatar : null;

        //Admin
        if (user.Type == 3) {
          user.Is_Remove_Privileges = false;
          user.Is_Remove_Access = false;
        }

        //Nếu kích hoạt tài khoản mobile
        if (args?.type == 'mobile' && args.isActiveMobile == true) {
          await db.table('User')
            .where('User_ID', user.User_ID)
            .update({
              Is_Mobile_App_User: true
            });
        }

        return {
          user,
          messageCode: 200,
          message: messages.login.success,
        };
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    },
    refreshToken: async (parent, args, context) => {
      try {
        const verificationResponse = jwt.verify(args.refreshToken, JWTSECRET);
        if (!verificationResponse) {
          return {
            messageCode: 400,
            message: messages.login.error,
          };
        }
        // @ts-ignore
        const user = await db.table('User').where('User_Email', verificationResponse.User_Email).first();
        if (!user) {
          return {
            messageCode: 400,
            message: messages.login.error,
          };
        }

        //set type
        user.Type = setUserType(user);

        if (user.Moves_Charity_ID) {
          let charity = await db.table('Charity').where('Moves_Charity_ID', user.Moves_Charity_ID).first();
          user.Charity_Name = charity?.Charity_Name;
          user.Charity_icon = charity.Charity_icon ? URL_FOLDER + charity.Charity_icon : null;
          user.Charity_URL = charity?.Charity_URL;
          user.Is_Remove_Privileges = charity.Is_Remove_Privileges;
          user.Is_Remove_Access = charity.Is_Remove_Access;
        }
        else if (user.Moves_Company_ID) {
          let company = await db.table('Company').where('Moves_Company_ID', user.Moves_Company_ID).first();
          user.Company_Name = company?.Company_Name;
          user.Is_Remove_Privileges = company.Is_Remove_Privileges;
          user.Is_Remove_Access = company.Is_Remove_Access;
        }

        user.token = jwt.sign(
          {
            User_ID: user.User_ID,
            User_Email: user.User_Email,
            Surname: user.Surname,
            Forename: user.Forename,
            IsAdmin: user.IsAdmin,
            Is_Deleted: user.Is_Deleted,
            Moves_Company_ID: user.Moves_Company_ID,
            Moves_Charity_ID: user.Moves_Charity_ID,
            Is_Remove_Privileges: user.Is_Remove_Privileges,
            Is_Mobile_App_User: user.Is_Mobile_App_User,
            Is_Web_App_User: user.Is_Web_App_User
          },
          process.env.JWTSECRET,
          {
            expiresIn: 60 * (60 * 24) // 1 day
          }
        );

        user.refreshToken = jwt.sign(
          {
            User_ID: user.User_ID,
            User_Email: user.User_Email,
            Surname: user.Surname,
            Forename: user.Forename,
            IsAdmin: user.IsAdmin,
            Is_Deleted: user.Is_Deleted,
            Moves_Company_ID: user.Moves_Company_ID,
            Moves_Charity_ID: user.Moves_Charity_ID,
            Is_Remove_Privileges: user.Is_Remove_Privileges,
            Is_Mobile_App_User: user.Is_Mobile_App_User,
            Is_Web_App_User: user.Is_Web_App_User
          },
          process.env.JWTSECRET,
          {
            expiresIn: 60 * (60 * 24) * 3 // 3 day
          }
        );

        user.tokenExpiration = 24;
        user.User_Avatar = user.User_Avatar ? URL_FOLDER + user.User_Avatar : null;

        //Admin
        if (user.Type == 3) {
          user.Is_Remove_Privileges = false;
          user.Is_Remove_Access = false;
        }

        return {
          user,
          messageCode: 200,
          message: messages.login.success,
        };
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    },
    getProfile: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let user = await db.table('User')
          .where('User_ID', User_ID)
          .where('Is_Mobile_App_User', true)
          .first();
        user.User_Avatar = user.User_Avatar ? URL_FOLDER + user.User_Avatar : null;
        return {
          user,
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
    getSystemParameter: async (parent, args, context) => {
      try {
        let SystemParameter = await db.table('System_Parameter')
          .where('Key', args?.key)
          .first();
        return {
          SystemParameter,
          message: messages.success,
          messageCode: 200
        }
      } catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    },
  },
  Mutation: {
    signResetPassWord: async (parent, args, context) => {
      try {
        const user = await db.table('User').where('User_Email', args.Email).first();
        if (!user) {
          return {
            messageCode: 404,
            message: 'If the email address entered is found to match a Moves Matter account, you will be sent a password reset link via email.',
          };
        }

        const tokenReset = jwt.sign(
          {
            User_Email: args.Email
          },
          'secret-reset-email',
          { expiresIn: 60 * 60 * 24 } //60 * 60 * 24 = 24h
        );

        await db.table('User').where({ User_Email: args.Email }).update({
          Token_Forgot_Password: tokenReset,
        });

        const url = `${args.url};id=${tokenReset}`;

        await sendEmail.sendEmail(args.Email, 'Reset your password on Moves Matter', emailTemp.templateForgotPassword(url), [], 'stream')
          .catch(err => {
            throw new Error(err);
          })

        return {
          messageCode: 200,
          message: 'If the email address entered is found to match a Moves Matter account, you will be sent a password reset link via email.',
        };
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        }
      }
    },
    checkCodeResetPassword: async (parent, args, context) => {
      try {
        let user = await db.table('User').where('Token_Forgot_Password', args.hashCode).first();

        if (!user) {
          return {
            messageCode: 404,
            message: 'This link does not exist',
          };
        }

        await jwt.verify(args.hashCode, 'secret-reset-email');

        return {
          messageCode: 200,
          message: 'Success',
        };
      }
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'This link has expired',
        };
      }
    },
    changeResetPassword: async (parent, args, context) => {
      try {
        var tokenEmail = await jwt.verify(args.hashCode, 'secret-reset-email')
        const hashedPassword = await bcrypt.hash(args.Password, 12);

        // @ts-ignore
        await db.table('User').where({ User_Email: tokenEmail.User_Email }).update({
          User_Password: hashedPassword,
          Token_Forgot_Password: null,
        });

        return {
          messageCode: 200,
          message: 'Change password success',
        };
      }
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Expires Token',
        };
      }
    },
    register: async (parent, args, context) => {
      try {
        // validate body
        if (!args.forename || !args.surname || !args.email || !args.phone || !args.password) {
          return {
            message: messages.error,
            messageCode: 400
          }
        }

        // check update or create
        let isUpdate = false;

        // check email
        let find = await db.table('User')
          .where('User_Email', args.email)
          .first();

        if (find) {
          if (find?.Is_Mobile_App_User) {
            return {
              message: 'You appear to already be a moves matter user. Please use login, or sign up with a different email address', //messages.register.exists_email,
              messageCode: 400,
            };
          } 
          else {
            isUpdate = true;

            //Nếu chưa có mật khẩu
            if (!find.User_Password) {
              // hash password
              const hashedPassword = await bcrypt.hash(args.password, 12);

              await db.table('User')
                .where({ User_Email: args.email })
                .update({
                  User_Password: hashedPassword,
                  Token_Forgot_Password: null,
                  Is_Mobile_App_User: true,
                });
            }
            //Nếu đã có mật khẩu
            else {
              const isEqual = await bcrypt.compare(args.password, find.User_Password);
              if (isEqual) {
                await db.table('User')
                  .where({ User_Email: args.email })
                  .update({
                    Is_Mobile_App_User: true,
                  });
              } 
              else {
                return {
                  message: messages.register.pass_no_match,
                  messageCode: 400
                }
              }
            }
          }
        } 
        else {
          // check exists phone
          find = await db.table('User')
            .where('User_Phone_Number', args.phone)
            .first();

          if (find) {
            return {
              message: messages.register.exists_phone,
              messageCode: 400
            }
          }

          // hash password
          const hashedPassword = await bcrypt.hash(args.password, 12);

          // create user
          await db.table('User').insert({
            Surname: args.surname,
            Forename: args.forename,
            User_Email: args.email,
            User_Phone_Number: args.phone,
            User_Password: hashedPassword,
            Is_Web_App_User: false,
            Is_Mobile_App_User: true
          });
        }

        // get user
        let user = await db.table('User')
          .where('User_Email', args.email)
          .where('Is_Mobile_App_User', true)
          .first();
        user.User_Avatar = user.User_Avatar ? URL_FOLDER + user.User_Avatar : null;

        // generate token
        user.token = generate(user);
        user.refreshToken = generate(user, true);

        return {
          user,
          messageCode: 200,
          message: isUpdate ? messages.register.linked : messages.register.success,
        };
      }
      catch (e) {
        logging(context, e);
        return {
          message: 'Internal Server Error',
          messageCode: 500
        };
      }
    },
    updateProfile: authenticated(async (parent, args, context) => {
      try {
        // validate body
        if (!args.surname || !args.forename || !args.email || !args.phone) {
          return {
            message: messages.error,
            messageCode: 400
          }
        }

        let User_ID = context.currentUser.User_ID;

        // check exists email
        let find = await db.table('User')
          .where('User_Email', args.email)
          .whereNot('User_ID', User_ID)
          .first();
        if (find) {
          return {
            message: messages.profile.exists_email,
            messageCode: 400
          }
        }

        // check exists phone
        find = await db.table('User')
          .where('User_Phone_Number', args.phone)
          .whereNot('User_ID', User_ID)
          .first();
        if (find) {
          return {
            message: messages.profile.exists_phone,
            messageCode: 400
          }
        }

        // update user
        await db.table('User')
          .where('User_ID', User_ID)
          .where('Is_Mobile_App_User', true)
          .update({
            Surname: args.surname,
            Forename: args.forename,
            User_Email: args.email,
            User_Phone_Number: args.phone,
          });

        // get user
        let user = await db.table('User')
          .where('User_ID', User_ID)
          .where('Is_Mobile_App_User', true)
          .first();

        if (args.fileName) {
          try {
            await deleteFile([user.User_Avatar]);
          } catch (e) { }
          let fileName = Math.floor(Date.now() / 1000) + '-' + args.fileName;
          let path = '/user/' + fileName;
          await saveFileBase64(args.avatar, 'user', fileName);
          await db.table('User')
            .where('User_ID', User_ID)
            .where('Is_Mobile_App_User', true)
            .update({
              User_Avatar: path
            });
          user.User_Avatar = URL_FOLDER + path
        } else {
          user.User_Avatar = user.User_Avatar ? URL_FOLDER + user.User_Avatar : null;
        }

        return {
          user,
          message: messages.profile.update_success,
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
    changePassword: authenticated(async (parent, args, context) => {
      try {
        // validate body
        if (!args.passwordOld || !args.passwordNew) {
          return {
            message: messages.error,
            messageCode: 400
          }
        }

        let User_ID = context.currentUser.User_ID;

        // check exists email
        let user = await db.table('User')
          .where('User_ID', User_ID)
          .first();
        if (!user) {
          return {
            message: messages.profile.does_not_exist,
            messageCode: 400
          }
        }

        // check current password
        const isEqual = await bcrypt.compare(args.passwordOld, user.User_Password);
        if (!isEqual) {
          return {
            messageCode: 400,
            message: messages.profile.password_is_incorrect,
          };
        }

        // hash password
        const hashedPassword = await bcrypt.hash(args.passwordNew, 12);

        // update user
        await db.table('User')
          .where('User_ID', User_ID)
          .where('Is_Mobile_App_User', true)
          .update({
            User_Password: hashedPassword,
          });

        return {
          message: messages.profile.update_success,
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
  }
};

module.exports = resolvers;
