exports.seed = function (knex) {
  return knex('User_Permission').insert([
    /* Admin */
    { User_Permission_ID: 1, Permission_Type_ID: 1, User_ID: 1, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 2, Permission_Type_ID: 2, User_ID: 1, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 3, Permission_Type_ID: 7, User_ID: 1, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 4, Permission_Type_ID: 8, User_ID: 1, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 5, Permission_Type_ID: 9, User_ID: 1, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 6, Permission_Type_ID: 10, User_ID: 1, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 7, Permission_Type_ID: 11, User_ID: 1, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 8, Permission_Type_ID: 12, User_ID: 1, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 9, Permission_Type_ID: 13, User_ID: 1, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 10, Permission_Type_ID: 14, User_ID: 1, Is_Active: true, Last_Modify_Date: new Date() },

    /* Charity */
    { User_Permission_ID: 11, Permission_Type_ID: 1, User_ID: 2, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 12, Permission_Type_ID: 2, User_ID: 2, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 13, Permission_Type_ID: 3, User_ID: 2, Is_Active: true, Last_Modify_Date: new Date() },
    { User_Permission_ID: 14, Permission_Type_ID: 6, User_ID: 2, Is_Active: true, Last_Modify_Date: new Date() },

  ]).onConflict('User_Permission_ID').ignore();
};