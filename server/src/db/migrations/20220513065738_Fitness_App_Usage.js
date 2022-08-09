
exports.up = function(knex) {
  return knex.schema.createTable('Fitness_App_Usage', table => {
    table.integer('User_ID');
    table.foreign('User_ID').references('User_ID').inTable('User');
    table.integer('Fitness_App_ID');
    table.foreign('Fitness_App_ID').references('Fitness_App_ID').inTable('Fitness_App');
    table.timestamp('Fitness_App_Date_Connected');
    table.integer('Fitness_App_Access_User_ID');
    table.foreign('Fitness_App_Access_User_ID').references('User_ID').inTable('User');
    table.string('Fitness_App_Access_Password', 255);
    table.string('Fitness_App_Access_other_info', 255);

    table.primary(['User_ID', 'Fitness_App_ID']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Fitness_App_Usage')
};
