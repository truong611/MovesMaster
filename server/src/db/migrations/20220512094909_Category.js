
exports.up = function(knex) {
  return knex.schema.createTable('Category', table => {
    table.increments('Category_ID');
    table.string('Category_Name', 255).notNullable();
    table.integer('Category_Type').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Category')
};
