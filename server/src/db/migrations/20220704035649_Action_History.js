
exports.up = function(knex) {
  return knex.schema.createTable('Action_History', table => {
    table.increments('Id');
    table.integer('Object_Id');
    table.string('Object_Type', 10); // Charity / Company
    table.string('Action', 50);
    table.timestamp('Action_Date');
    table.integer('By');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Action_History')
};
