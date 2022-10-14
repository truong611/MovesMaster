
exports.up = function (knex) {
    return knex.schema.alterTable('Activity_Type', table => {
        table.string('Strava_Activity_Type_Name', 255);
        table.string('AppleHealth_Activity_Type_Name', 255);
    });
};

exports.down = function (knex) {

};
