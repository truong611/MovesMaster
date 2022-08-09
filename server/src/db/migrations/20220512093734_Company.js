
exports.up = function (knex) {
  return knex.schema.createTable('Company', table => {
    table.increments('Moves_Company_ID');
    table.string('Company_Name', 255).notNullable();
    table.decimal('Company_Number', 18, 2).notNullable();
    table.string('Company_URL', 255);
    table.string('Company_Icon', 255);
    table.text('Company_CSR_Statement');
    table.string('Contact_Name', 255);
    table.string('Contact_Email', 255);
    table.string('Contact_Phone_Number', 255);
    table.boolean('Is_Active').defaultTo(false);
    table.timestamp('Date_Active');
    table.boolean('Is_Deleted').defaultTo(false);
    table.timestamp('Created_Date').defaultTo(knex.fn.now());
    table.integer('Created_By');
    table.timestamp('Last_Modify_Date');
    table.integer('Last_Modify_By');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('Company')
};
