
exports.up = function (knex) {
    return knex.schema.alterTable('User', table => {
        table.boolean('Is_Reset_Pass_From_Mobile');
    })
};

exports.down = function (knex) {

};
