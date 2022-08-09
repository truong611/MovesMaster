
exports.up = function(knex) {
  return knex.schema.hasColumn('Appeal', 'Appeal_Publish').then((hasColumn) => {
    if (hasColumn) {
      return knex.schema.alterTable('Appeal', table => {
        table.dropColumn('Appeal_Publish')
      })
    } else {
      return null
    }
  })
};

exports.down = function(knex) {
  
};
