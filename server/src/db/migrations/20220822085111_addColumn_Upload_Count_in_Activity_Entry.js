
exports.up = function(knex) {
    return knex.schema.alterTable('Activity_Entry', table => {
        table.integer('Upload_Count');
      })
};

exports.down = function(knex) {
  
};
