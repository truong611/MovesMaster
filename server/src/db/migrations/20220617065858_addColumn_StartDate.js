
exports.up = function(knex) {
  return knex.schema.alterTable('Fitness_App_Activities', table => {
    table.timestamp('Fitness_App_Activities_Start_Date');
    table.timestamp('Fitness_App_Activities_Start_Date_Local');
  })
};

exports.down = function(knex) {
  
};
