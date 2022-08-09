
exports.up = function(knex) {
  return knex.schema.alterTable('Charity', table => {
    table.string('Address_For_Invoice', 255);
    table.string('Payment_Site_Url', 255);
    table.string('Account_Name', 255);
    table.string('Account_No', 255);
    table.string('Sort_Code', 255);
    table.string('Member_Payment_Site_Url', 255);
    table.string('Member_Account_Name', 255);
    table.string('Member_Account_No', 255);
    table.string('Member_Sort_Code', 255);
    table.timestamp('Renewal_Date')
  })
};

exports.down = function(knex) {
  
};
