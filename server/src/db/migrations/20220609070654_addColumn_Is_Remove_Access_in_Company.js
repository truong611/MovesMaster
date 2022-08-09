
exports.up = function(knex) {
  return knex.schema.alterTable('Company', table => {
    table.boolean('Is_Remove_Access').defaultTo(false);
  })
};

exports.down = function(knex) {
  
};
