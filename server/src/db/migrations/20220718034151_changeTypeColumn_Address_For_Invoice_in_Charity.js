
exports.up = async function (knex) {
  await knex.schema.alterTable('Charity', function (table) {
    table.text('Address_For_Invoice').alter();
  });
};

exports.down = function (knex) {

};
