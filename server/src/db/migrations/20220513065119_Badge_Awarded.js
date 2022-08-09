
exports.up = function(knex) {
  return knex.schema.createTable('Badge_Awarded', table => {
    table.integer('Badge_ID');
    table.foreign('Badge_ID').references('Badge_ID').inTable('Badge');
    table.integer('User_ID');
    table.foreign('User_ID').references('User_ID').inTable('User');
    table.timestamp('Badge_Awarded_Date');

    table.primary(['Badge_ID', 'User_ID']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Badge_Awarded')
};
