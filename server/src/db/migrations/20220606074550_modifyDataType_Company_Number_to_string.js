
exports.up = async function (knex) {
  await knex.schema.alterTable('Company', function (table) {
    table.string('Company_Number', 255).notNullable().alter();
  });
};

exports.down = function (knex) {

};
