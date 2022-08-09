
exports.up = function(knex) {
  return knex.schema.createTable('Badge', table => {
    table.increments('Badge_ID');
    table.string('Badge_Name', 255);
    table.string('Badge_Reason', 255);
    table.string('Badge_Icon', 255);
    table.decimal('Badge_Condition', 18, 2);
    table.integer('Badge_Type');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Badge')
};
