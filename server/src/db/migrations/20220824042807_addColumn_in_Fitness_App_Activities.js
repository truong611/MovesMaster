
exports.up = function(knex) {
  return knex.schema.alterTable('Fitness_App_Activities', table => {
    table.integer('Activity_Type_ID');
    table.foreign('Activity_Type_ID').references('Activity_Type_ID').inTable('Activity_Type');
  })
};

exports.down = function(knex) {
  
};
