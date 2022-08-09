
exports.up = function(knex) {
  return knex.schema.createTable('Charity_Sector', table => {
    table.increments('Charity_Sector_ID');
    table.integer('Moves_Charity_ID').notNullable();
    table.foreign('Moves_Charity_ID').references('Moves_Charity_ID').inTable('Charity');
    table.integer('Category_ID').notNullable();
    table.foreign('Category_ID').references('Category_ID').inTable('Category');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Charity_Sector')
};
