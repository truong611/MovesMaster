
exports.up = function(knex) {
  return knex.schema.createTable('User_Permission', table => {
    table.increments('User_Permission_ID');
    table.integer('Permission_Type_ID');
    table.foreign('Permission_Type_ID').references('Permission_Type_ID').inTable('Permission_Type');
    table.integer('User_ID');
    table.foreign('User_ID').references('User_ID').inTable('User');
    table.boolean('Is_Active').defaultTo(false);
    table.timestamp('Last_Modify_Date');
    table.integer('Last_Modify_By');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('User_Permission')
};
