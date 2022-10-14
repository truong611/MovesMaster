const db = require('../../../data/knex-db');
const authenticated = require('../../../middleware/authenticated-guard');
const { saveFile, deleteFile, downloadFile, copyFile, convertFileName } = require('../../../common/handleFile');
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const CLIENT = process.env.CLIENT;
const logging = require('../../../middleware/autologging');
const { NOTIFICATION } = require('../../subscription/const-subscription');
const { PubSub, withFilter } = require('graphql-subscriptions');
const pubsub = new PubSub();

const resolvers = {
  Query: {
    getTotalNotification: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        let total = 0;
        if (User.Moves_Charity_ID) {
          let listNoti = await db.table('Notification')
            .where('Notification_To_Charity_ID', User.Moves_Charity_ID)
            .where('Is_Seen', false);

          total = listNoti.length;
        }
        else if (User.Moves_Company_ID) {
          let listNoti = await db.table('Notification')
            .where('Notification_To_Company_ID', User.Moves_Company_ID)
            .where('Is_Seen', false);

          total = listNoti.length;
        }

        return {
          Total: total,
          messageCode: 200,
          message: 'OK',
        }
      } 
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Internal Server Error',
        }
      }
    }),
    getListNotification: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        let listNotification = [];
        if (User.Moves_Charity_ID) {
          listNotification = await db.table('Notification')
            .where('Notification_To_Charity_ID', User.Moves_Charity_ID)
            .orderBy('Created_Date', 'desc')
            .limit(10);
        }
        else if (User.Moves_Company_ID) {
          listNotification = await db.table('Notification')
            .where('Notification_To_Company_ID', User.Moves_Company_ID)
            .orderBy('Created_Date', 'desc')
            .limit(10);
        }

        let listUser = await db.table('User');
        let listCharity = await db.table('Charity');
        let listCompany = await db.table('Company');

        listNotification.forEach(item => {
          if (item.Notification_From_Charity_ID) {
            let charity = listCharity.find(x => x.Moves_Charity_ID == item.Notification_From_Charity_ID);
            item.Name = charity?.Charity_Name;
          }
          else if (item.Notification_From_Company_ID) {
            let company = listCompany.find(x => x.Moves_Company_ID == item.Notification_From_Company_ID);
            item.Name = company?.Company_Name;
          }
          else {
            item.Name = 'System';
          }

          let _userCreate = listUser.find(x => x.User_ID == item.Notification_From_User_ID);
          item.Email = _userCreate?.User_Email ?? 'System';
        });

        return {
          ListNotification: listNotification,
          messageCode: 200,
          message: 'OK',
        }
      }
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Internal Server Error',
        }
      }
    }),
    getDetailNotification: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        let notification = await db.table('Notification')
          .where('Notification_ID', args.Id)
          .first();

        if (!notification) {
          return {
            messageCode: 404,
            message: 'Notification is not exists',
          }
        }

        return {
          Notification: notification,
          messageCode: 200,
          message: 'OK',
        }
      } 
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Internal Server Error',
        }
      }
    }),
    getListAllNotification: authenticated(async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();

        let listNotification = [];
        if (User.Moves_Charity_ID) {
          listNotification = await db.table('Notification')
            .where('Notification_To_Charity_ID', User.Moves_Charity_ID)
            .orderBy('Created_Date', 'desc');
        }
        else if (User.Moves_Company_ID) {
          listNotification = await db.table('Notification')
            .where('Notification_To_Company_ID', User.Moves_Company_ID)
            .orderBy('Created_Date', 'desc');
        }

        let listUser = await db.table('User');
        let listCharity = await db.table('Charity');
        let listCompany = await db.table('Company');

        listNotification.forEach(item => {
          if (item.Notification_From_Charity_ID) {
            let charity = listCharity.find(x => x.Moves_Charity_ID == item.Notification_From_Charity_ID);
            item.Name = charity?.Charity_Name;
          }
          else if (item.Notification_From_Company_ID) {
            let company = listCompany.find(x => x.Moves_Company_ID == item.Notification_From_Company_ID);
            item.Name = company?.Company_Name;
          }
          else {
            item.Name = 'System';
          }

          let _userCreate = listUser.find(x => x.User_ID == item.Notification_From_User_ID);
          item.Email = _userCreate?.User_Email ?? 'System';
        });

        return {
          ListNotification: listNotification,
          messageCode: 200,
          message: 'OK',
        }
      } 
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Internal Server Error',
        }
      }
    }),
  },

  Mutation: {
    createNotification: (async (parent, args, context) => {
      try {
        let User_ID = context.currentUser.User_ID;
        let User = await db.table('User').where('User_ID', User_ID).first();
        let bodyData = args.bodyData;

        if (bodyData.Notification_To_Charity_ID && !bodyData.Notification_To_Company_ID) {
          await db.table('Notification')
            .insert({
              Notification_From_User_ID: User_ID,
              Notification_From_Charity_ID: User?.Moves_Charity_ID,
              Notification_From_Company_ID: User?.Moves_Company_ID,
              Notification_To_Charity_ID: bodyData.Notification_To_Charity_ID,
              Content: bodyData.Content,
            });
        }
        else if (!bodyData.Notification_To_Charity_ID && bodyData.Notification_To_Company_ID) {
          await db.table('Notification')
            .insert({
              Notification_From_User_ID: User_ID,
              Notification_From_Charity_ID: User?.Moves_Charity_ID,
              Notification_From_Company_ID: User?.Moves_Company_ID,
              Notification_To_Company_ID: bodyData.Notification_To_Company_ID,
              Content: bodyData.Content,
            });
        }
        else {
          return {
            messageCode: 400,
            message: 'Charity Id and Company Id of user is invalid',
          }
        }

        //push to client
        pubsub.publish(NOTIFICATION, { RefreshNotificationCount: true });

        return {
          messageCode: 200,
          message: 'Notification sent successfully',
        }
      } 
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Internal Server Error',
        }
      }
    }),
    updateIsSeenNotification: authenticated(async (parent, args, context) => {
      try {
        let notification = await db.table('Notification')
          .where('Notification_ID', args.Id)
          .first();

        if (!notification) {
          return {
            messageCode: 404,
            message: 'Notification is not exists',
          }
        }

        await db.table('Notification')
          .where('Notification_ID', args.Id)
          .update({
            Is_Seen: true
          })

        //push to client
        pubsub.publish(NOTIFICATION, { RefreshNotificationCount: true });

        return {
          messageCode: 200,
          message: 'OK',
        }
      } 
      catch (e) {
        logging(context, e);
        return {
          messageCode: 500,
          message: 'Internal Server Error',
        }
      }
    })
  },

  Subscription: {
    RefreshNotificationCount: {
      // More on pubsub below
      subscribe: withFilter(
        () => pubsub.asyncIterator(NOTIFICATION),
        (payload, variables) => {
          // Only push an update if the comment is on
          // the correct repository for this operation

          return true;
        },
      ),
    },
  },
}

module.exports = resolvers;