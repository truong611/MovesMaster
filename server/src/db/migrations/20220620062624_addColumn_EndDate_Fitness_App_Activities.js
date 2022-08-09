
exports.up = function(knex) {
  return knex.schema.alterTable('Fitness_App_Activities', table => {
    table.timestamp('Fitness_App_Activities_End_Date_Local');
  })
};

exports.down = function(knex) {
  
};
