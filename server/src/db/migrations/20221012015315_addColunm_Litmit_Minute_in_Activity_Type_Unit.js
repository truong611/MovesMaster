
exports.up = function (knex) {
    return knex.schema.alterTable('Activity_Type_Unit', table => {
        table.integer('Limit_Minute');
    })
};

exports.down = function (knex) {

};
