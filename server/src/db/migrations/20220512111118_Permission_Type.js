
exports.up = function(knex) {
  return knex.schema.createTable('Permission_Type', table => {
    table.increments('Permission_Type_ID');
    table.string('Permission_Type_Name', 255).notNullable();
    table.string('Charity_Company_Admin', 50).notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Permission_Type')
};
