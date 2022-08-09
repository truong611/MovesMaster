
exports.up = function(knex) {
  return knex.schema.createTable('Activity_Type_Unit', table => {
    table.increments('Activity_Type_Unit_ID');
    table.integer('Activity_Type_ID');
    table.foreign('Activity_Type_ID').references('Activity_Type_ID').inTable('Activity_Type');
    table.integer('Activity_Unit_ID');
    table.foreign('Activity_Unit_ID').references('Activity_Unit_ID').inTable('Activity_Unit');
    table.decimal('Conversation_To_Moves_Rate', 18, 2);
    table.timestamp('Date_Introduced');
    table.timestamp('Date_Retired');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Activity_Type_Unit')
};
