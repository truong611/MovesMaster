
exports.up = function(knex) {
  return knex.schema.createTable('Activity_Type', table => {
    table.increments('Activity_Type_ID');
    table.string('Activity_Type_Name', 255);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Activity_Type')
};
