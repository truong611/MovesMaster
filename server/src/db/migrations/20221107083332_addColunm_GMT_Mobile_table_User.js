exports.up = function (knex) {
    return knex.schema.alterTable('User', table => {
        table.integer('GMT_Mobile');
    })
};

exports.down = function (knex) {

};
