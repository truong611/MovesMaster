
exports.up = async function(knex) {
  await knex.schema.alterTable('Fitness_App_Activities', function (table) {
    table.string('Fitness_App_Activities_Object_ID', 255).alter();
    table.string('Fitness_App_Activities_Usage_ID', 255).alter();
  });

  await knex.schema.alterTable('Fitness_App_Usage', function (table) {
    table.string('Fitness_App_Usage_ID', 255).alter();
  });
};

exports.down = function(knex) {
  
};
