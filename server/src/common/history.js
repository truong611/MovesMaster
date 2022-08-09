const db = require('../data/knex-db');
const logging = require('../middleware/autologging');

const history = {
  updateHistory: async (data, User_ID) => {
    try {
      let action = await db.table('Action_History')
        .where('Object_Id', data.Object_Id)
        .andWhere('Object_Type', data.Object_Type)
        .andWhere('Action', data.Action)
        .first();

      if (action) {
        await db.table('Action_History')
          .where('Id', action.Id)
          .update({
            'Action_Date': new Date(),
            'By': User_ID
          });
      } else {
        await db.table('Action_History')
          .insert({
            'Object_Id': data.Object_Id,
            'Object_Type': data.Object_Type,
            'Action': data.Action,
            'Action_Date': new Date(),
            'By': User_ID
          });
      }

      return {
        message: 'Success',
        messageCode: 200
      }
    }
    catch (e) {
      logging(null, e);
      return {
        message: 'Internal Server Error',
        messageCode: 500
      }
    }
  }
}

module.exports = history;