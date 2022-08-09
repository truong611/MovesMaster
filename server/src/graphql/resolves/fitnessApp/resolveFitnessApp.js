const db = require('../../../data/knex-db');
const messages = require('../../../messages/auth');
const authenticated = require('../../../middleware/authenticated-guard');
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const logging = require('../../../middleware/autologging');
const {saveFile, deleteFile, downloadFile, copyFile, convertFileName} = require('../../../common/handleFile');

const resolvers = {
    //QUERY
    Query: {
        getFitnessAppUsage: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context.currentUser.User_ID;

                let FitnessApp = await db.table('Fitness_App');
                let FitnessAppUsage = await db.table('Fitness_App_Usage')
                    .where('User_ID', User_ID);

                FitnessApp?.length && FitnessApp.map(item => {
                    item.Fitness_App_Icon = item.Fitness_App_Icon ? URL_FOLDER + item.Fitness_App_Icon : null;
                });

                return {
                    FitnessApp,
                    FitnessAppUsage,
                    message: messages.success,
                    messageCode: 200
                }
            } catch (err) {
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
    },
    FitnessAppUsageModel: {
        FitnessApp: async (parent, args, context) => {
            let Fitness_App = await db.table('Fitness_App')
                .where('Fitness_App_ID', parent?.Fitness_App_ID)
                .first();

            Fitness_App.Fitness_App_Icon = Fitness_App.Fitness_App_Icon ? URL_FOLDER + Fitness_App.Fitness_App_Icon : null;

            return Fitness_App
        },
    },
    Mutation: {
        removeFitnessAppUsage: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context?.currentUser?.User_ID;
                let bodyData = args?.bodyData;

                if (bodyData?.isRemove) {
                    await db.table('Fitness_App_Usage')
                        .where('User_ID', User_ID)
                        .where('Fitness_App_ID', bodyData?.Fitness_App_ID)
                        .del();
                    return {
                        messageCode: 200,
                        message: 'remove successful'
                    };
                } else {
                    let find = await db.table('Fitness_App_Usage')
                        .where('Fitness_App_Usage_ID', bodyData?.Fitness_App_Usage_ID)
                        .first();

                    if (find) {
                        return {
                            messageCode: 400,
                            message: 'fitness app account has been linked to another account'
                        };
                    } else {
                        await db.table('Fitness_App_Usage')
                            .insert({
                                User_ID: User_ID,
                                Fitness_App_ID: bodyData?.Fitness_App_ID,
                                Fitness_App_Usage_ID: bodyData?.Fitness_App_Usage_ID,
                                Fitness_App_Usage_Access_Token: bodyData?.Fitness_App_Usage_Access_Token,
                                Fitness_App_Usage_Refresh_Token: bodyData?.Fitness_App_Usage_Refresh_Token,
                                Fitness_App_Usage_Expires_At: bodyData?.Fitness_App_Usage_Expires_At,
                            });
                        return {
                            messageCode: 200,
                            message: 'connection successful'
                        };
                    }
                }
            } catch (e) {
                logging(context, e);
                return {
                    messageCode: 500,
                    message: 'Internal Server Error',
                }
            }
        }),
    }
};

module.exports = resolvers;
