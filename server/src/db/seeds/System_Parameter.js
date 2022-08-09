
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('System_Parameter').del()
    .then(function () {
      return knex('System_Parameter').insert([
        { Id: 1, Key: 'EMAIL_HOST', KeyName: 'Email Host', Value: 'smtp.gmail.com', BoolValue: null },
        { Id: 2, Key: 'EMAIL_PORT', KeyName: 'Email Port', Value: '587', BoolValue: null },
        { Id: 3, Key: 'EMAIL_SECURE', KeyName: 'Email Secure', Value: null, BoolValue: false },
        { Id: 4, Key: 'EMAIL_ACCOUNT', KeyName: 'Email Account', Value: 'truonggiangdev1992@gmail.com', BoolValue: null },
        { Id: 5, Key: 'EMAIL_PASS', KeyName: 'Email Account Pass', Value: '123456aA@123', BoolValue: null },
        { Id: 6, Key: 'EMAIL_RECEIPT_DEFAUT', KeyName: 'Email Receipt default', Value: null, BoolValue: true },
        { Id: 7, Key: 'EMAIL_RECEIPT_ACCOUNT', KeyName: 'Email Receipt Account', Value: 'anhgiangtg@gmail.com', BoolValue: null },
      ]);
    });
};
