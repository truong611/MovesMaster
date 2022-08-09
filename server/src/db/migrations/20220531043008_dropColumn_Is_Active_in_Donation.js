
exports.up = function(knex) {
  return knex.schema.hasColumn('Donation', 'Is_Active').then((hasColumn) => {
    if (hasColumn) {
      return knex.schema.alterTable('Donation', table => {
        table.dropColumn('Is_Active')
      })
    } else {
      return null
    }
  })
};

exports.down = function(knex) {
  
};
