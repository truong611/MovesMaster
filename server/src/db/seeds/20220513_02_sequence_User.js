
exports.seed = function(knex) {
  return knex.raw('SELECT SETVAL((pg_get_serial_sequence('+ "'" + '"User"' + "'" + "," + "'User_ID'" + ')), (SELECT (MAX("User_ID") + 1) FROM "User"), FALSE);');
};
