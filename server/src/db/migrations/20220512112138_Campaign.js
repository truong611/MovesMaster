
exports.up = function(knex) {
  return knex.schema.createTable('Campaign', table => {
    table.increments('Campaign_ID');
    table.integer('Appeal_ID');
    table.foreign('Appeal_ID').references('Appeal_ID').inTable('Appeal');
    table.integer('Moves_Charity_ID').notNullable();
    table.foreign('Moves_Charity_ID').references('Moves_Charity_ID').inTable('Charity');
    table.string('Campaign_Name', 255);
    table.string('Campaign_URL', 255);
    table.string('Campaign_Icon', 255);
    table.timestamp('Campaign_Launch_Date');
    table.timestamp('Campaign_End_Date');
    table.decimal('Campaign_Target_Value', 18, 2);
    table.decimal('Campaign_Price_Per_Move', 18, 2);
    table.integer('Moves_Company_ID');
    table.foreign('Moves_Company_ID').references('Moves_Company_ID').inTable('Company');
    table.boolean('Is_Active').defaultTo(true);
    table.timestamp('Created_Date').defaultTo(knex.fn.now());
    table.integer('Created_By');
    table.timestamp('Last_Modify_Date');
    table.integer('Last_Modify_By');
    table.boolean('End_Date_Target').defaultTo(true); //decimal: 0, date: 1
    table.integer('Campaign_Status_ID');
    table.foreign('Campaign_Status_ID').references('Category_ID').inTable('Category');
    table.boolean('Campaign_Publish').defaultTo(false);
    table.boolean('Public_Private').defaultTo(false); //public: 1, private: 0
    table.boolean('Is_Match').defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Campaign')
};
