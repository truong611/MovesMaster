
exports.seed = function(knex) {
  return knex('Fitness_App').insert([
    {
      Fitness_App_ID: 1, 
      Fitness_App_Name: 'Apple Health',
      Fitness_App_Icon: '/fitness_app/apple_health.png'
    },
    {
      Fitness_App_ID: 2, 
      Fitness_App_Name: 'Strava',
      Fitness_App_Icon: '/fitness_app/strava.png'
    },
    {
      Fitness_App_ID: 3, 
      Fitness_App_Name: 'Garmin',
      Fitness_App_Icon: '/fitness_app/garmin_icon.png'
    },
    {
      Fitness_App_ID: 4, 
      Fitness_App_Name: 'MySwimPro',
      Fitness_App_Icon: ''
    },
    {
      Fitness_App_ID: 5, 
      Fitness_App_Name: 'Map My Ride',
      Fitness_App_Icon: ''
    },
    {
      Fitness_App_ID: 6, 
      Fitness_App_Name: 'Nike Training Club',
      Fitness_App_Icon: ''
    },
  ]).onConflict('Fitness_App_ID').ignore();
};
