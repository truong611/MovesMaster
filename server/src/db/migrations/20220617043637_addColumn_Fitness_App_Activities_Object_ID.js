
exports.up = function(knex) {
  return knex.schema.alterTable('Fitness_App_Activities', table => {
    table.integer('Fitness_App_Activities_Object_ID');
  })
};

exports.down = function(knex) {
  
};
