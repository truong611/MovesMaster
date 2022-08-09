
exports.up = function(knex) {
  return knex.schema.createTable('Notification', table => {
    table.increments('Notification_ID');
    table.integer('Notification_From_User_ID');
    table.integer('Notification_From_Charity_ID');
    table.integer('Notification_To_Charity_ID');
    table.integer('Notification_From_Company_ID');
    table.integer('Notification_To_Company_ID');
    table.string('Content', 500);
    table.timestamp('Created_Date').defaultTo(knex.fn.now());
    table.boolean('Is_Seen').defaultTo(false);
    table.string('URL', 255);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Notification')
};
