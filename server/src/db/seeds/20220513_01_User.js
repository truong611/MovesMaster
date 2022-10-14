
exports.seed = function(knex) {
  return knex('User').insert([
    {
      User_ID: 1, 
      User_Email: 'admin@gmail.com',
      User_Phone_Number: '0123456789',
      Surname: 'admin',
      Forename: '',
      User_Password: '$2a$12$yldsDuEXL6GSzMGufr0S.eGNmpOURcadvBi19IqCzecHWz6s.kJmO',
      IsAdmin: true,
      Is_Web_App_User: true,
      Is_Mobile_App_User: true
    },
    {
      User_ID: 2, 
      User_Email: 'charity@gmail.com',
      User_Phone_Number: '333',
      Surname: 'charity',
      Forename: '',
      User_Password: '$2a$12$yldsDuEXL6GSzMGufr0S.eGNmpOURcadvBi19IqCzecHWz6s.kJmO',
      IsAdmin: false,
      Is_Web_App_User: true,
      Is_Mobile_App_User: true,
      Moves_Charity_ID: 1
    },
  ]).onConflict('User_ID').ignore();
};
