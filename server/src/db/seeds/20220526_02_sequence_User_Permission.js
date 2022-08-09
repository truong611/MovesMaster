
exports.seed = function(knex) {
  return knex.raw('SELECT SETVAL((pg_get_serial_sequence('+ "'" + '"User_Permission"' + "'" + "," + "'User_Permission_ID'" + ')), (SELECT (MAX("User_Permission_ID") + 1) FROM "User_Permission"), FALSE);');
};
