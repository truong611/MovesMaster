
exports.up = function(knex) {
  return knex.schema
    .alterTable('Campaign', (table) => {
      table.integer('Appeal_ID').nullable().alter();
    });
};

exports.down = function(knex) {
  
};
