exports.seed = function (knex) {
  return knex('Permission_Type').insert([
    { Permission_Type_ID: 1, Permission_Type_Name: 'Can Publish News', Permission_Type_Code: 'CPN', Type: 1 },
    { Permission_Type_ID: 2, Permission_Type_Name: 'Can maintain users', Permission_Type_Code: 'CMU', Type: 1 },
    { Permission_Type_ID: 3, Permission_Type_Name: 'Can initiate Campaigns', Permission_Type_Code: 'CIC', Type: 2 },
    { Permission_Type_ID: 4, Permission_Type_Name: 'Can Authorise Campaigns', Permission_Type_Code: 'CAC', Type: 3 },
    { Permission_Type_ID: 5, Permission_Type_Name: 'Can Match Campaigns', Permission_Type_Code: 'CMC', Type: 3 },
    { Permission_Type_ID: 6, Permission_Type_Name: 'Can create an Appeal', Permission_Type_Code: 'CCAA', Type: 2 },
    { Permission_Type_ID: 7, Permission_Type_Name: 'Approve Charity', Permission_Type_Code: 'AC', Type: 4 },
    { Permission_Type_ID: 8, Permission_Type_Name: 'Reject Charity', Permission_Type_Code: 'RC', Type: 4 },
    { Permission_Type_ID: 9, Permission_Type_Name: 'Approve Company', Permission_Type_Code: 'ACO', Type: 4 },
    { Permission_Type_ID: 10, Permission_Type_Name: 'Reject Company', Permission_Type_Code: 'RCO', Type: 4 },
    { Permission_Type_ID: 11, Permission_Type_Name: 'Charity Privileges', Permission_Type_Code: 'CP', Type: 4 },
    { Permission_Type_ID: 12, Permission_Type_Name: 'Charity Access', Permission_Type_Code: 'CA', Type: 4 },
    { Permission_Type_ID: 13, Permission_Type_Name: 'Company Privileges', Permission_Type_Code: 'CPR', Type: 4 },
    { Permission_Type_ID: 14, Permission_Type_Name: 'Company Access', Permission_Type_Code: 'CAS', Type: 4 },
    { Permission_Type_ID: 15, Permission_Type_Name: 'Can administer', Permission_Type_Code: 'CAR', Type: 5 },
    { Permission_Type_ID: 16, Permission_Type_Name: 'Can Introduce Company', Permission_Type_Code: 'CICY', Type: 2 },
  ]).onConflict('Permission_Type_ID').ignore();
};