
exports.up = function(knex) {
  return knex.schema.createTable('Favorites', table => {
    table.increments('Favorites_ID');
    table.integer('User_ID');
    table.foreign('User_ID').references('User_ID').inTable('User');
    table.integer('Moves_Charity_ID');
    table.foreign('Moves_Charity_ID').references('Moves_Charity_ID').inTable('Charity');
    table.integer('Appeal_ID');
    table.foreign('Appeal_ID').references('Appeal_ID').inTable('Appeal');
    table.integer('Campaign_ID');
    table.foreign('Campaign_ID').references('Campaign_ID').inTable('Campaign');
    table.integer('Favorite_Type');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Favorites')
};
