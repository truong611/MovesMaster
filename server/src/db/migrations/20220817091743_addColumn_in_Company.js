
exports.up = function(knex) {
  return knex.schema.alterTable('Company', table => {
    table.string('Contact_Forename', 255);
    table.string('Contact_Surname', 255);
  })
};

exports.down = function(knex) {
  
};
