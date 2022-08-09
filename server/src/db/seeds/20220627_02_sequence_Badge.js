
exports.seed = function(knex) {
    return knex.raw('SELECT SETVAL((pg_get_serial_sequence('+ "'" + '"Badge"' + "'" + "," + "'Badge_ID'" + ')), (SELECT (MAX("Badge_ID") + 1) FROM "Badge"), FALSE);');
};
