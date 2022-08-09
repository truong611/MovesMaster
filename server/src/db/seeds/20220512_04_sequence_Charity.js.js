
exports.seed = function(knex) {
  return knex.raw('SELECT SETVAL((pg_get_serial_sequence('+ "'" + '"Charity"' + "'" + "," + "'Moves_Charity_ID'" + ')), (SELECT (MAX("Moves_Charity_ID") + 1) FROM "Charity"), FALSE);');
};
