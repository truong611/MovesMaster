
exports.up = function(knex) {
  return knex.schema.alterTable('Campaign', table => {
    table.text('Campaign_Description');
  })
};

exports.down = function(knex) {
  
};
