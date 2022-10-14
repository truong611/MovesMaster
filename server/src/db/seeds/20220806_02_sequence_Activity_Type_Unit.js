
exports.seed = function(knex) {
  return knex.raw('SELECT SETVAL((pg_get_serial_sequence('+ "'" + '"Activity_Type_Unit"' + "'" + "," + "'Activity_Type_Unit_ID'" + ')), (SELECT (MAX("Activity_Type_Unit_ID") + 1) FROM "Activity_Type_Unit"), FALSE);');
};
