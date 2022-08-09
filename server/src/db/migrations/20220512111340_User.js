
exports.up = function(knex) {
  return knex.schema.createTable('User', table => {
    table.increments('User_ID');
    table.string('User_Email', 255);
    table.string('User_Phone_Number', 255);
    table.string('Surname', 255);
    table.string('Forename', 255);
    table.string('User_Job_Roll', 255);
    table.string('User_Avatar', 255);
    table.string('User_Password', 1024);
    table.boolean('IsAdmin').defaultTo(false);
    table.string('Token_Forgot_Password', 1024);
    table.boolean('Is_Mobile_App_User').defaultTo(false);
    table.boolean('Is_Web_App_User').defaultTo(false);
    table.integer('Moves_Company_ID');
    table.foreign('Moves_Company_ID').references('Moves_Company_ID').inTable('Company');
    table.integer('Moves_Charity_ID');
    table.foreign('Moves_Charity_ID').references('Moves_Charity_ID').inTable('Charity');
    table.boolean('Is_Deleted').defaultTo(false);
    table.timestamp('Created_Date').defaultTo(knex.fn.now());
    table.integer('Created_By');
    table.timestamp('Last_Modify_Date');
    table.integer('Last_Modify_By');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('User')
};
