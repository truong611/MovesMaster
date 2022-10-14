
exports.seed = function(knex) {
  return knex.raw('SELECT SETVAL((pg_get_serial_sequence('+ "'" + '"Activity_Unit"' + "'" + "," + "'Activity_Unit_ID'" + ')), (SELECT (MAX("Activity_Unit_ID") + 1) FROM "Activity_Unit"), FALSE);');
};
