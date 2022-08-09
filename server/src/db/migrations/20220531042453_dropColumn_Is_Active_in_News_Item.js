
exports.up = function(knex) {
  return knex.schema.hasColumn('News_Item', 'Is_Active').then((hasColumn) => {
    if (hasColumn) {
      return knex.schema.alterTable('News_Item', table => {
        table.dropColumn('Is_Active')
      })
    } else {
      return null
    }
  })
};

exports.down = function(knex) {
  
};
