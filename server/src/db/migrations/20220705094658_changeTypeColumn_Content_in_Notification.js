
exports.up = async function (knex) {
  await knex.schema.alterTable('Notification', function (table) {
    table.text('Content').alter();
  });
};

exports.down = function (knex) {

};
