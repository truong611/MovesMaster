
exports.up = function(knex) {
  return knex.schema.createTable('Activity_Unit', table => {
    table.increments('Activity_Unit_ID');
    table.string('Activity_Unit_Name', 255);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Activity_Unit')
};
