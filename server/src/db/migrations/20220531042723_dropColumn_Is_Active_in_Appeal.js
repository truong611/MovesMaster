
exports.up = function(knex) {
  return knex.schema.hasColumn('Appeal', 'Is_Active').then((hasColumn) => {
    if (hasColumn) {
      return knex.schema.alterTable('Appeal', table => {
        table.dropColumn('Is_Active')
      })
    } else {
      return null
    }
  })
};

exports.down = function(knex) {
  
};
