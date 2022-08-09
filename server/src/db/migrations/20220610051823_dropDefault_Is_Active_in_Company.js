
exports.up = async function(knex) {
  await knex.schema.alterTable('Company', function (table) {
    table.boolean('Is_Active').defaultTo(null).alter();
  });
};

exports.down = function(knex) {
  
};
