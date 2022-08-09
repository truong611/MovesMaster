exports.seed = function (knex) {
  return knex('Currency').insert([
    { Currency_ID: 1, Currency_Name: '£', Exchange_Rate: 1},
    { Currency_ID: 2, Currency_Name: '$', Exchange_Rate: 1},
    { Currency_ID: 3, Currency_Name: '€', Exchange_Rate: 1}
  ]).onConflict('Currency_ID').ignore();
};