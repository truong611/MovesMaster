
exports.seed = function(knex) {
    return knex('Badge').insert([
        {
            Badge_ID: 1,
            Badge_Name: 'Super-Mover',
            Badge_Reason: 'You are earned your Super-Mover badge. You have completed 50,000 moves donated',
            Badge_Icon: '/badge/1.png',
            Badge_Condition: 50000,
            Badge_Type: 0,
        },
        {
            Badge_ID: 2,
            Badge_Name: 'Mega-Mover',
            Badge_Reason: 'You are earned your Mega-Mover badge. You have completed 1,000,000 moves donated',
            Badge_Icon: '/badge/2.png',
            Badge_Condition: 1000000,
            Badge_Type: 0,
        },
        {
            Badge_ID: 3,
            Badge_Name: 'Ultra-Mover',
            Badge_Reason: 'You are earned your Ultra-Mover badge. You have completed 5,000,000 moves donated',
            Badge_Icon: '/badge/3.png',
            Badge_Condition: 5000000,
            Badge_Type: 0,
        },
        {
            Badge_ID: 4,
            Badge_Name: 'Super-donor',
            Badge_Reason: 'You are earned your Super-donor badge. You have completed £50 donated via Moves',
            Badge_Icon: '/badge/4.png',
            Badge_Condition: 50,
            Badge_Type: 1,
        },
        {
            Badge_ID: 5,
            Badge_Name: 'Mega-donor',
            Badge_Reason: 'You are earned your Mega-donor badge. You have completed £1,000 donated via Moves',
            Badge_Icon: '/badge/5.png',
            Badge_Condition: 1000,
            Badge_Type: 1,
        },
        {
            Badge_ID: 6,
            Badge_Name: 'Ultra-donor',
            Badge_Reason: 'You are earned your Ultra-donor badge. You have completed £5,000 donated via Moves',
            Badge_Icon: '/badge/6.png',
            Badge_Condition: 5000,
            Badge_Type: 1,
        },
        {
            Badge_ID: 7,
            Badge_Name: 'Super-giver',
            Badge_Reason: 'You are earned your Super-giver badge. You have completed £50 donated via, cash Donation',
            Badge_Icon: '/badge/7.png',
            Badge_Condition: 50,
            Badge_Type: 2,
        },
        {
            Badge_ID: 8,
            Badge_Name: 'Mega-giver',
            Badge_Reason: 'You are earned your Mega-giver badge. You have completed £1,000 donated via, cash Donation',
            Badge_Icon: '/badge/8.png',
            Badge_Condition: 1000,
            Badge_Type: 2,
        },
        {
            Badge_ID: 9,
            Badge_Name: 'Ultra-giver',
            Badge_Reason: 'You are earned your Ultra-giver badge. You have completed £5,000 donated via, cash Donation',
            Badge_Icon: '/badge/9.png',
            Badge_Condition: 5000,
            Badge_Type: 2,
        },
    ]).onConflict('Badge_ID').ignore();
};
