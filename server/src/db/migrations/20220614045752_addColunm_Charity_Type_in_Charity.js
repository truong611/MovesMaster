exports.up = function (knex) {
    return knex.schema.alterTable('Charity', table => {
        /*
        *
        * Mô tả:
        *   0: Charity được tạo ra khi người dùng Mời
        *   1: Charity được tạo ra khi người dùng Đăng ký 
        *
        */
        table.integer('Charity_Type').defaultTo(1);
    })
};

exports.down = function (knex) {

};
