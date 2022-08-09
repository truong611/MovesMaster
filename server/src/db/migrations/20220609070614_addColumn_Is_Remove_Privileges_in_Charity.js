
exports.up = function(knex) {
  return knex.schema.alterTable('Charity', table => {
    table.boolean('Is_Remove_Privileges').defaultTo(false);
  })
};

exports.down = function(knex) {
  
};
