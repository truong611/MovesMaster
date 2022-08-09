
exports.up = function(knex) {
  return knex.schema.alterTable('Permission_Type', table => {
    table.string('Permission_Type_Code', 10);
    table.integer('Type');
    //Type: 
    // 1-Charity+Company+Admin
    // 2-Charity
    // 3-Company
    // 4-Admin
    // 5-Charity+Company
  })
};

exports.down = function(knex) {
  
};
