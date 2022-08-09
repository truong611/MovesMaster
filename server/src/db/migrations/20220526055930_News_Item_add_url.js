exports.up = function(knex) {
    return knex.schema.alterTable('News_Item', table => {
        table.string('News_Url', 255);
    })
};

exports.down = function(knex) {

};
