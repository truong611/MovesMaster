
exports.up = function(knex) {
  return knex.schema.createTable('Device', table => {
    table.increments('Device_ID');
    table.string('Device_Name', 255);
    table.boolean('Device_Currently_Linked');
    table.integer('User_ID');
    table.foreign('User_ID').references('User_ID').inTable('User');
    table.string('Device_Key', 255);
    table.timestamp('Device_Date_Connected');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Device')
};
