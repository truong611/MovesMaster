
exports.up = function(knex) {
  return knex.schema.alterTable('Campaign', table => {
    /* 
    * 
    * Trường này sẽ nhận các giá trị và được mô tả như sau:
    *   null: Chưa tạo news
    *   1: Đã tạo news cho mốc donation 50%
    *   2: Đã tạo news cho mốc donation 50% và 90%
    *   3: Đã tạo news cho mốc donation 50%, 90% và 100%
    * 
    */
    table.integer('Type_Of_Create_News');
  })
};

exports.down = function(knex) {
  
};
