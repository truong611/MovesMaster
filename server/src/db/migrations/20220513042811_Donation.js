
exports.up = function(knex) {
  return knex.schema.createTable('Donation', table => {
    table.increments('Donation_ID');
    table.decimal('Sterling_Amount', 18, 2);
    table.decimal('Amount_Donated', 18, 2);
    table.integer('Currency_ID');
    table.foreign('Currency_ID').references('Currency_ID').inTable('Currency');
    table.decimal('Currency_Conversion_Rate', 18, 2);
    table.decimal('Moves_Donated', 18, 2);
    table.decimal('Moves_Conversion_Rate', 18, 2);
    table.integer('Appeal_ID');
    table.foreign('Appeal_ID').references('Appeal_ID').inTable('Appeal');
    table.integer('Moves_Charity_ID');
    table.foreign('Moves_Charity_ID').references('Moves_Charity_ID').inTable('Charity');
    table.integer('Campaign_ID');
    table.foreign('Campaign_ID').references('Campaign_ID').inTable('Campaign');
    table.timestamp('Created_Date').defaultTo(knex.fn.now());
    table.integer('User_ID');
    table.foreign('User_ID').references('User_ID').inTable('User');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Donation')
};
