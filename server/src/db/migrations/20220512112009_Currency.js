
exports.up = function(knex) {
  return knex.schema.createTable('Currency', table => {
    table.increments('Currency_ID');
    table.string('Currency_Name', 255).notNullable();
    table.decimal('Exchange_Rate', 18, 2);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Currency')
};
