
exports.up = function(knex) {
  return knex.schema.hasColumn('Permission_Type', 'Charity_Company_Admin').then((hasColumn) => {
    if (hasColumn) {
      return knex.schema.alterTable('Permission_Type', table => {
        table.dropColumn('Charity_Company_Admin')
      })
    } else {
      return null
    }
  })
};

exports.down = function(knex) {
  
};
