
exports.seed = function(knex) {
  return knex.raw('SELECT SETVAL((pg_get_serial_sequence('+ "'" + '"Fitness_App"' + "'" + "," + "'Fitness_App_ID'" + ')), (SELECT (MAX("Fitness_App_ID") + 1) FROM "Fitness_App"), FALSE);');
};
