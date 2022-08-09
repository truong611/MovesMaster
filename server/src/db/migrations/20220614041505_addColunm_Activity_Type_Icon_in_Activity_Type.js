exports.up = function (knex) {
    return knex.schema.alterTable('Activity_Type', table => {
        table.string('Activity_Type_Icon', 255);
    })
};

exports.down = function (knex) {

};
