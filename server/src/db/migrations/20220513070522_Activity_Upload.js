
exports.up = function(knex) {
  return knex.schema.createTable('Activity_Upload', table => {
    table.increments('Activity_Upload_ID');
    table.integer('User_ID');
    table.foreign('User_ID').references('User_ID').inTable('User');
    table.timestamp('Activity_Upload_Datetime');
    table.timestamp('Upload_Period_Start_Time');
    table.timestamp('Upload_Period_End_Time');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Activity_Upload')
};
