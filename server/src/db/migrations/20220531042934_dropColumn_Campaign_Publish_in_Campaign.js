
exports.up = function(knex) {
  return knex.schema.hasColumn('Campaign', 'Campaign_Publish').then((hasColumn) => {
    if (hasColumn) {
      return knex.schema.alterTable('Campaign', table => {
        table.dropColumn('Campaign_Publish')
      })
    } else {
      return null
    }
  })
};

exports.down = function(knex) {
  
};
