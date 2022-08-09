
exports.up = function(knex) {
  return knex.schema.createTable('Appeal', table => {
    table.increments('Appeal_ID');
    table.integer('Moves_Charity_ID').notNullable();
    table.foreign('Moves_Charity_ID').references('Moves_Charity_ID').inTable('Charity');
    table.string('Appeal_Name', 255);
    table.string('Appeal_URL', 255);
    table.string('Appeal_Icon', 255);
    table.string('Appeal_Description', 1024);
    table.timestamp('Appeal_Start_Date');
    table.timestamp('Appeal_End_Date');
    table.decimal('Appeal_Target_Amount', 18, 2);
    table.boolean('Is_Active').defaultTo(true);
    table.timestamp('Created_Date').defaultTo(knex.fn.now());
    table.integer('Created_By');
    table.timestamp('Last_Modify_Date');
    table.integer('Last_Modify_By');
    table.integer('Appeal_Status_ID').notNullable();
    table.foreign('Appeal_Status_ID').references('Category_ID').inTable('Category');
    table.boolean('Appeal_Publish').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Appeal')
};
