
exports.up = function(knex) {
  return knex.schema.hasColumn('Campaign', 'Is_Active').then((hasColumn) => {
    if (hasColumn) {
      return knex.schema.alterTable('Campaign', table => {
        table.dropColumn('Is_Active')
      })
    } else {
      return null
    }
  })
};

exports.down = function(knex) {
  
};
