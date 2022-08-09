
exports.up = function(knex) {
  return knex.schema.alterTable('News_Item', table => {
    table.boolean('Is_Manual');
  })
};

exports.down = function(knex) {
  
};
