
exports.up = function(knex) {
  return knex.schema.createTable('News_Item', table => {
    table.increments('News_Item_ID');
    table.integer('News_Item_Author_ID');
    table.foreign('News_Item_Author_ID').references('User_ID').inTable('User');
    table.string('News_Image', 255);
    table.string('News_Title', 255);
    table.text('News_Content');
    table.integer('Campaign_ID');
    table.foreign('Campaign_ID').references('Campaign_ID').inTable('Campaign');
    table.integer('Appeal_ID');
    table.foreign('Appeal_ID').references('Appeal_ID').inTable('Appeal');
    table.integer('Moves_Charity_ID');
    table.foreign('Moves_Charity_ID').references('Moves_Charity_ID').inTable('Charity');
    table.integer('Moves_Company_ID');
    table.foreign('Moves_Company_ID').references('Moves_Company_ID').inTable('Company');
    table.integer('News_Status_ID');
    table.foreign('News_Status_ID').references('Category_ID').inTable('Category');
    table.boolean('Is_Active').notNullable();
    table.boolean('News_Publish').notNullable();
    table.timestamp('News_Publish_Date');
    table.timestamp('Created_Date').defaultTo(knex.fn.now());
    table.integer('Created_By');
    table.timestamp('Last_Modify_Date');
    table.integer('Last_Modify_By');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('News_Item')
};
