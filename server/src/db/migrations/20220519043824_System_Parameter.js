
exports.up = function(knex) {
  return knex.schema.createTable('System_Parameter', table => {
    table.increments('Id');
    table.string('Key', 255);
    table.string('KeyName', 255);
    table.string('Value', 50);
    table.boolean('BoolValue', 255);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('System_Parameter')
};
