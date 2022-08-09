
exports.up = function(knex) {
    return knex.schema.alterTable('Badge_Awarded', table => {
        table.integer('Badge_Awarded_Times');
    })
};

exports.down = function(knex) {

};
