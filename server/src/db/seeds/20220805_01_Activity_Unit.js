
exports.seed = function(knex) {
  return knex('Activity_Unit').insert([
    {
      Activity_Unit_ID: 1,
      Activity_Unit_Name: 'minute'
    },
  ]).onConflict('Activity_Unit_ID').ignore();
};
