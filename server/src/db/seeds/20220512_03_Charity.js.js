
exports.seed = function(knex) {
  return knex('Charity').insert([
    {
      Moves_Charity_ID: 1, 
      Charity_Name: 'My Charity',
      Charity_Commission_No: '999',
      Contact_Name: 'charity',
      Contact_Email: 'charity@gmail.com',
      Contact_Phone_Number: '0999',
      Charity_URL: 'https://charity.kn',
      Charity_Aims: 'my charity',
      Charity_Geographical_Scope: 1,
      Charity_Income_Band_ID: 4,
      Charity_Date_Founded: new Date(),
      Is_Active: true,
      Is_Deleted: false
    },
  ]).onConflict('Moves_Charity_ID').ignore();
};
