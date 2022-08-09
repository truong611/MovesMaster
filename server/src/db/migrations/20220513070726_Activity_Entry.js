
exports.up = function(knex) {
  return knex.schema.createTable('Activity_Entry', table => {
    table.increments('Activity_Entry_ID');
    table.timestamp('Activity_Start_Time');
    table.timestamp('Activity_End_Time');
    table.integer('Object_Source_ID');
    table.integer('Object_Source_Type');
    table.integer('Activity_Type_Unit_ID');
    table.foreign('Activity_Type_Unit_ID').references('Activity_Type_Unit_ID').inTable('Activity_Type_Unit');
    table.decimal('Moves_Arising', 18, 2);
    table.decimal('Conversion_Rate', 18, 2);
    table.decimal('Number_Units', 18, 2);
    table.boolean('Include_YN');
    table.integer('Activity_Upload_ID');
    table.foreign('Activity_Upload_ID').references('Activity_Upload_ID').inTable('Activity_Upload');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Activity_Entry')
};
