
exports.up = function(knex) {
  return knex.schema.hasColumn('News_Item', 'News_Publish').then((hasColumn) => {
    if (hasColumn) {
      return knex.schema.alterTable('News_Item', table => {
        table.dropColumn('News_Publish')
      })
    } else {
      return null
    }
  })
};

exports.down = function(knex) {
  
};
