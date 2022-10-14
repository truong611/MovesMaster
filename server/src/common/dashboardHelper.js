const db = require('../data/knex-db');

const dashboardHelper = {
  getTotal: async (User, type, objectId = null) => {
    //Charity
    if (type == 1 || type == 4) {
      let Moves_Charity_ID = null;
      let Moves_Company_ID = User?.Moves_Company_ID;

      if (type == 1) Moves_Charity_ID = User?.Moves_Charity_ID;
      else Moves_Charity_ID = objectId;

      //if user charity/admin
      if (Moves_Company_ID == null) {
        let listAppeal = await db.table('Appeal')
          .where('Moves_Charity_ID', Moves_Charity_ID);

        let listCampaign = await db.table('Campaign')
          .where('Moves_Charity_ID', Moves_Charity_ID);

        let listAppealId = listAppeal.map(x => x.Appeal_ID);
        let listCampaignId = listCampaign.map(x => x.Campaign_ID);

        let totalDonation = 0;

        let donationCharity = await db.table('Donation')
          .where('Moves_Charity_ID', Moves_Charity_ID)
          .whereNull('Appeal_ID')
          .whereNull('Campaign_ID')
          .sum('Sterling_Amount')
          .first();
        totalDonation = donationCharity.sum ?? 0;

        let donationAppeal = await db.table('Donation')
          .whereIn('Appeal_ID', listAppealId)
          .whereNull('Moves_Charity_ID')
          .whereNull('Campaign_ID')
          .sum('Sterling_Amount')
          .first();
        totalDonation += (donationAppeal.sum ?? 0);

        let listDonationCampaign = await db.table('Donation')
          .whereIn('Campaign_ID', listCampaignId)
          .whereNull('Appeal_ID')
          .whereNull('Moves_Charity_ID')
          .select('Campaign_ID')
          .groupBy('Campaign_ID')
          .sum('Sterling_Amount as Sterling_Amount');

        listDonationCampaign.forEach(item => {
          totalDonation += (item.Sterling_Amount ?? 0);
        });
        
        let totalMove = 0;
        let donationMoveCharity = await db.table('Donation')
          .where('Moves_Charity_ID', Moves_Charity_ID)
          .whereNull('Appeal_ID')
          .whereNull('Campaign_ID')
          .sum('Moves_Donated')
          .first();
        totalMove = donationMoveCharity.sum ?? 0;

        let donationMoveAppeal = await db.table('Donation')
          .whereIn('Appeal_ID', listAppealId)
          .whereNull('Moves_Charity_ID')
          .whereNull('Campaign_ID')
          .sum('Moves_Donated')
          .first();
        totalMove += (donationMoveAppeal.sum ?? 0);

        return {
          totalAppeal: listAppeal.length,
          totalCampaign: listCampaign.length,
          totalDonation: totalDonation,
          totalMove: totalMove
        }
      }
      //if user company
      else {
        let listAppeal = await db.table('Appeal')
          .where('Moves_Charity_ID', Moves_Charity_ID);

        let listCampaign = await db.table('Campaign')
          .where('Moves_Charity_ID', Moves_Charity_ID);

        let listAppealId = listAppeal.map(x => x.Appeal_ID);
        let listCampaignId = listCampaign.map(x => x.Campaign_ID);

        let totalDonation = 0;

        let donationCharity = await db.table('Donation')
          .where('Moves_Charity_ID', Moves_Charity_ID)
          .whereNull('Appeal_ID')
          .whereNull('Campaign_ID')
          .sum('Sterling_Amount')
          .first();
        totalDonation = donationCharity.sum ?? 0;

        let donationAppeal = await db.table('Donation')
          .whereIn('Appeal_ID', listAppealId)
          .whereNull('Moves_Charity_ID')
          .whereNull('Campaign_ID')
          .sum('Sterling_Amount')
          .first();
        totalDonation += (donationAppeal.sum ?? 0);

        let listDonationCampaign = await db.table('Donation')
          .whereIn('Campaign_ID', listCampaignId)
          .whereNull('Appeal_ID')
          .whereNull('Moves_Charity_ID')
          .select('Campaign_ID')
          .groupBy('Campaign_ID')
          .sum('Sterling_Amount as Sterling_Amount');

        listDonationCampaign.forEach(item => {
          totalDonation += (item.Sterling_Amount ?? 0);
        });

        //total campaign:
        let listTotalCampaign1 = await db.table('Campaign')
          .where('Moves_Charity_ID', Moves_Charity_ID)
          .where('Moves_Company_ID', Moves_Company_ID)
          .whereNot('Campaign_Status_ID', 20);

        let listTotalCampaign1_Campaign_ID = listTotalCampaign1.map(x => x.Campaign_ID);

        let _listCampaign = await db.table('Campaign')
          .where('Moves_Charity_ID', Moves_Charity_ID)
          .where('Moves_Company_ID', Moves_Company_ID);

        let _listCampaignId = _listCampaign.map(x => x.Campaign_ID);

        let listTotalCampaign2 = await db.table('Match')
          .where('Moves_Company_ID', Moves_Company_ID)
          .whereIn('Campaign_ID', _listCampaignId);

        let listTotalCampaign2_Campaign_ID = listTotalCampaign2.map(x => x.Campaign_ID);

        let listDistinctId = [...new Set([...listTotalCampaign2_Campaign_ID, ...listTotalCampaign1_Campaign_ID])];

        let listTotalCampaign3 = await db.table('Campaign')
          .where('Moves_Charity_ID', Moves_Charity_ID)
          .where('Campaign_Status_ID', 23)
          .whereNotIn('Campaign_ID', listDistinctId);

        let totalCampaign = listTotalCampaign1.length + listTotalCampaign2.length + listTotalCampaign3.length;
        
        let totalMove = 0;
        let donationMoveCharity = await db.table('Donation')
          .where('Moves_Charity_ID', Moves_Charity_ID)
          .whereNull('Appeal_ID')
          .whereNull('Campaign_ID')
          .sum('Moves_Donated')
          .first();
        totalMove = donationMoveCharity.sum ?? 0;

        let donationMoveAppeal = await db.table('Donation')
          .whereIn('Appeal_ID', listAppealId)
          .whereNull('Moves_Charity_ID')
          .whereNull('Campaign_ID')
          .sum('Moves_Donated')
          .first();
        totalMove += (donationMoveAppeal.sum ?? 0);

        return {
          totalAppeal: listAppeal.length,
          totalCampaign: totalCampaign,
          totalDonation: totalDonation,
          totalMove: totalMove
        }
      }
    }
    //Company
    else if (type == 2 || type == 5) {
      let Moves_Company_ID = null;

      if (type == 2) Moves_Company_ID = User?.Moves_Company_ID;
      else Moves_Company_ID = objectId;

      let listCampaign = [];
      if (type == 2 || User?.Moves_Company_ID == Moves_Company_ID) {
        listCampaign = await db.table('Campaign')
          .where('Moves_Company_ID', Moves_Company_ID)
          .whereNot('Campaign_Status_ID', 20)
          .select('Campaign_ID');
      }
      else {
        listCampaign = await db.table('Campaign')
          .where('Moves_Company_ID', Moves_Company_ID)
          .whereNotIn('Campaign_Status_ID', [19, 20, 21])
          .select('Campaign_ID');
      }

      let listMapCampaignId = await db.table('Match')
        .where('Moves_Company_ID', Moves_Company_ID)
        .select('Campaign_ID');

      let listCampaignId = [...listCampaign.map(x => x.Campaign_ID), ...listMapCampaignId.map(x => x.Campaign_ID)];
      let listAllCampaign = await db.table('Campaign')
        .whereIn('Campaign_ID', listCampaignId);

      let listDonationCampaign = await db.table('Donation')
        .whereIn('Campaign_ID', listCampaignId)
        .whereNull('Appeal_ID')
        .whereNull('Moves_Charity_ID')
        .select('Campaign_ID')
        .groupBy('Campaign_ID')
        .sum('Sterling_Amount as Sterling_Amount');

      let totalDonation = 0;
      listDonationCampaign.forEach(item => {
        totalDonation += (item.Sterling_Amount ?? 0);
      });

      return {
        totalAppeal: 0,
        totalCampaign: listCampaignId.length,
        totalDonation: totalDonation
      };
    }
  },
  getDonationAppeal: async (Appeal_ID) => {
    let listDonationAppeal = await db.table('Donation')
      .where('Appeal_ID', Appeal_ID)
      .whereNull('Campaign_ID');

    let listCampaign = await db.table('Campaign')
      .where('Appeal_ID', Appeal_ID);
    let listCampaignId = listCampaign.map(x => x.Campaign_ID);

    let TotalCampaign = listCampaign.length;

    let listDonationCampaign = await db.table('Donation')
      .whereIn('Campaign_ID', listCampaignId)
      .whereNull('Appeal_ID')
      .select('Campaign_ID')
      .groupBy('Campaign_ID')
      .sum('Sterling_Amount as Sterling_Amount');

    let TotalDonation = 0;
    let TotalMove = 0;
    listDonationAppeal.forEach(item => {
      TotalDonation += (item?.Sterling_Amount ?? 0);
      TotalMove += (item?.Moves_Donated ?? 0)
    });

    listDonationCampaign.forEach(item => {
      TotalDonation += (item?.Sterling_Amount ?? 0);
    });

    return {
      TotalCampaign: TotalCampaign,
      TotalDonation: TotalDonation,
      TotalMove: TotalMove
    }
  },
  getDonationCampaign: async (Campaign_ID) => {
    let Sterling_Amount = await db.table('Donation')
      .where('Campaign_ID', Campaign_ID)
      .sum('Sterling_Amount')
      .first();

    let _Amount = (Sterling_Amount.sum ?? 0);

    let listMatch = await db.table('Match')
      .where('Campaign_ID', Campaign_ID);
    let Number_Matches = listMatch.length;

    let TotalDonation = 0;
    TotalDonation = _Amount;

    return {
      Sterling_Amount: _Amount,
      Number_Matches: Number_Matches,
      TotalDonation: TotalDonation
    }
  }
}

module.exports = dashboardHelper;