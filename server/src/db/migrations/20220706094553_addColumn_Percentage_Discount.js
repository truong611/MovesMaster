
exports.up = function(knex) {
  return knex.schema.alterTable('Campaign', table => {
    table.decimal('Percentage_Discount', 10, 4).defaultTo(0);
  })
};

exports.down = function(knex) {
  
};
