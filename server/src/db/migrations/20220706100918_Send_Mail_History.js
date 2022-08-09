
exports.up = function(knex) {
  return knex.schema.createTable('Send_Mail_History', table => {
    table.increments('Send_Mail_History_ID');
    table.integer('Campaign_ID');
    table.integer('Moves_Company_ID');
    table.boolean('Is_Send_Mail').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Send_Mail_History')
};
