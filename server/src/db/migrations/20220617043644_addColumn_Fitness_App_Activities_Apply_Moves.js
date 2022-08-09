
exports.up = function(knex) {
  return knex.schema.alterTable('Fitness_App_Activities', table => {
    table.boolean('Fitness_App_Activities_Apply_Moves').defaultTo(false);
  })
};

exports.down = function(knex) {
  
};
