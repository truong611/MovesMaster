
exports.up = function(knex) {
  return knex.schema.createTable('Match', table => {
    table.increments('Match_ID');
    table.integer('Campaign_ID');
    table.foreign('Campaign_ID').references('Campaign_ID').inTable('Campaign');
    table.integer('Moves_Company_ID');
    table.foreign('Moves_Company_ID').references('Moves_Company_ID').inTable('Company');
    table.timestamp('Match_Date_Created').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Match')
};
