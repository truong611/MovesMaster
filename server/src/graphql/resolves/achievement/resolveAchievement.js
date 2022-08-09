const db = require('../../../data/knex-db');
const authenticated = require('../../../middleware/authenticated-guard');
const messages = require('../../../messages/charity');
const logging = require('../../../middleware/autologging');
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const dashboardHelper = require('../../../common/dashboardHelper');

const resolvers = {
    Query: {
        getBadgeAwarded: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context?.currentUser?.User_ID;

                let Badge = await db.table('Badge')
                    .orderBy('Badge_Condition', 'ASC');

                Badge?.length && Badge.map(item => {
                    item.Badge_Icon = item.Badge_Icon ? URL_FOLDER + item.Badge_Icon : null;
                });

                let BadgeAwarded = await db.table('Badge_Awarded')
                    .where('User_ID', User_ID);

                return {
                    Badge,
                    BadgeAwarded,
                    messageCode: 200,
                    message: messages.success
                }
            } catch (e) {
                logging(context, e);
                return {
                    messageCode: 500,
                    message: 'Internal Server Error'
                }
            }
        }),
    },
    BadgeAwarded: {
        Badge: async (parent, args, context) => {
            let Badge = await db.table('Badge')
                .where('Badge_ID', parent.Badge_ID)
                .first();

            Badge.Badge_Icon = Badge.Badge_Icon ? URL_FOLDER + Badge.Badge_Icon : null;

            return Badge
        },
    },
    // Mutation: {},
};

module.exports = resolvers;
