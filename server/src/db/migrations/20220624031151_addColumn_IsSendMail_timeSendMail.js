
exports.up = function(knex) {
  return knex.schema.alterTable('Campaign', table => {
    table.boolean('Is_Send_Mail').defaultTo(false);
    table.timestamp('Send_Mail_Company_Date');
  })
};

exports.down = function(knex) {
  
};
