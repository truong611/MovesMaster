exports.seed = function (knex) {
  return knex('Category').insert([
    /* Geographic Scope */
    { Category_ID: 1, Category_Name: 'Local', Category_Type: 1 },
    { Category_ID: 2, Category_Name: 'National', Category_Type: 1 },
    { Category_ID: 3, Category_Name: 'International', Category_Type: 1 },

    /* Income Band */
    { Category_ID: 4, Category_Name: 'Less than £100k', Category_Type: 2 },
    { Category_ID: 5, Category_Name: 'Between £100k and £1M', Category_Type: 2 },
    { Category_ID: 6, Category_Name: 'Over £1M', Category_Type: 2 },

    /* Charity Sector */
    { Category_ID: 7, Category_Name: 'Education and Youth', Category_Type: 3 },
    { Category_ID: 8, Category_Name: 'Environment and Animals', Category_Type: 3 },
    { Category_ID: 9, Category_Name: 'Equality and Diversity', Category_Type: 3 },
    { Category_ID: 10, Category_Name: 'Faith and Spirituality', Category_Type: 3 },
    { Category_ID: 11, Category_Name: 'Healthcare and Medical Research', Category_Type: 3 },
    { Category_ID: 12, Category_Name: 'Homeless and Refuge', Category_Type: 3 },
    { Category_ID: 13, Category_Name: 'International', Category_Type: 3 },
    { Category_ID: 14, Category_Name: 'Welfare', Category_Type: 3 },

    /* Appeal Status */
    { Category_ID: 15, Category_Name: 'Published', Category_Type: 4 },
    { Category_ID: 16, Category_Name: 'Live', Category_Type: 4 },
    { Category_ID: 17, Category_Name: 'Complete', Category_Type: 4 },
    { Category_ID: 18, Category_Name: 'Abandoned', Category_Type: 4 },

    /* Campaign Status */
    { Category_ID: 19, Category_Name: 'For Company Review', Category_Type: 5 },
    { Category_ID: 20, Category_Name: 'Declined', Category_Type: 5 },
    { Category_ID: 21, Category_Name: 'Approved', Category_Type: 5 },
    { Category_ID: 22, Category_Name: 'Published', Category_Type: 5 },
    { Category_ID: 23, Category_Name: 'Live', Category_Type: 5 },
    { Category_ID: 24, Category_Name: 'Complete', Category_Type: 5 },

    /* News Status */
    { Category_ID: 25, Category_Name: 'Pending', Category_Type: 6 },
    { Category_ID: 26, Category_Name: 'Live', Category_Type: 6 },
    { Category_ID: 27, Category_Name: 'Withdrawn', Category_Type: 6 },

    /* Appeal Status */
    { Category_ID: 28, Category_Name: 'Draft', Category_Type: 4 },

    /* Charity Sector */
    { Category_ID: 29, Category_Name: 'Culture and Heritage', Category_Type: 3 },
  ]).onConflict('Category_ID').ignore();
};