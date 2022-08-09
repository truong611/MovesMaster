
exports.up = function(knex) {
  return knex.schema.createTable('Charity', table => {
    table.increments('Moves_Charity_ID');
    table.string('Charity_Name', 255);
    table.string('Charity_Commission_No', 255);
    table.string('Contact_Name', 255);
    table.string('Contact_Email', 255);
    table.string('Contact_Phone_Number', 255);
    table.string('Charity_URL', 255);
    table.text('Charity_Aims');
    table.string('Charity_icon', 255);
    table.integer('Charity_Geographical_Scope');
    table.foreign('Charity_Geographical_Scope').references('Category_ID').inTable('Category');
    table.integer('Charity_Income_Band_ID');
    table.foreign('Charity_Income_Band_ID').references('Category_ID').inTable('Category');
    table.timestamp('Charity_Date_Founded');
    table.boolean('Is_Active').defaultTo(true);
    table.timestamp('Date_Active');
    table.boolean('Is_Deleted').defaultTo(false);
    table.timestamp('Created_Date').defaultTo(knex.fn.now());
    table.integer('Created_By');
    table.timestamp('Last_Modify_Date');
    table.integer('Last_Modify_By');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Charity')
};
