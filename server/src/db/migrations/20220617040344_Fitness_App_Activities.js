
exports.up = function(knex) {
  return knex.schema.createTable('Fitness_App_Activities', table => {
    table.increments('Fitness_App_Activities_ID');
    table.float('Fitness_App_Distance', 14, 4);
    table.float('Fitness_App_Moving_Time', 14, 4);
    table.string('Fitness_App_Type', 1000);
    table.integer('User_ID');
    table.integer('Fitness_App_Activities_Usage_ID');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Fitness_App_Activities')
};
