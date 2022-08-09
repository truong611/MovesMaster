
exports.up = function(knex) {
  return knex.schema.alterTable('Company', table => {
    table.boolean('Is_Remove_Privileges').defaultTo(false);
  })
};

exports.down = function(knex) {
  
};
