
exports.seed = function(knex) {
  return knex.raw('SELECT SETVAL((pg_get_serial_sequence('+ "'" + '"Category"' + "'" + "," + "'Category_ID'" + ')), (SELECT (MAX("Category_ID") + 1) FROM "Category"), FALSE);');
};
