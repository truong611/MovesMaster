exports.up = function (knex) {
    return knex.schema.alterTable('Fitness_App_Usage', table => {
        table.string('Fitness_App_Usage_Access_Token');
        table.string('Fitness_App_Usage_Refresh_Token');
        table.timestamp('Fitness_App_Usage_Expires_At');
    })
};

exports.down = function (knex) {

};
