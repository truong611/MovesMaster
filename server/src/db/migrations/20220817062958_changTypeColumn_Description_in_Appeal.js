
exports.up = async function (knex) {
  await knex.schema.alterTable('Appeal', function (table) {
    table.text('Appeal_Description').alter();
  });
};

exports.down = function (knex) {

};
