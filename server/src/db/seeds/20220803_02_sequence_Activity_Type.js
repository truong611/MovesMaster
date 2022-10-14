
exports.seed = function(knex) {
  return knex.raw('SELECT SETVAL((pg_get_serial_sequence('+ "'" + '"Activity_Type"' + "'" + "," + "'Activity_Type_ID'" + ')), (SELECT (MAX("Activity_Type_ID") + 1) FROM "Activity_Type"), FALSE);');
};
