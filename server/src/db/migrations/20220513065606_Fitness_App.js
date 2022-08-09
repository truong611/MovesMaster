
exports.up = function(knex) {
  return knex.schema.createTable('Fitness_App', table => {
    table.increments('Fitness_App_ID');
    table.string('Fitness_App_Name');
    table.string('Fitness_App_Icon');
    table.timestamp('Available_to_Moves_Users');
    table.timestamp('Removed_from_Moves_Users');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Fitness_App')
};
