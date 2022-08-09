exports.up = function (knex) {
    return knex.schema.alterTable('Fitness_App_Usage', table => {
        table.integer('Fitness_App_Usage_ID');
    })
};

exports.down = function (knex) {

};
