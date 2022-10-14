const db = require('../data/knex-db');
const logging = require('../middleware/autologging');
const commonSystem = require('./commonSystem');

const changeStatus = {
  appeal: async () => {
    try {
      let currentTime = (new Date().toISOString());

      let trx_result = await db.transaction(async trx => {
        let listAppealIdLive = await trx.table('Appeal')
          .where(builder => {
            //status publish
            builder.where('Appeal_Status_ID', 15);

            builder.whereNotNull('Appeal_End_Date');

            builder.whereRaw('??::date <= ?::date', ['Appeal_Start_Date', currentTime]);

            builder.whereRaw('??::date >= ?::date', ['Appeal_End_Date', currentTime]);
          })
          .orWhere(builder => {
            //status publish
            builder.where('Appeal_Status_ID', 15);

            builder.whereNull('Appeal_End_Date');

            builder.whereRaw('??::date <= ?::date', ['Appeal_Start_Date', currentTime]);
          })
          .returning('Appeal_ID')
          .update({
            //change status publish => live
            Appeal_Status_ID: 16
          });

        //Tạo news khi có appeal chuyển trạng thái => Live
        if (listAppealIdLive.length) {
          for (let i = 0; i < listAppealIdLive.length; i++) {
            let _appeal_ID = listAppealIdLive[i];
            let _appeal = await trx.table('Appeal')
              .where('Appeal_ID', _appeal_ID)
              .first();

            let _charity = await trx.table('Charity')
              .where('Moves_Charity_ID', _appeal.Moves_Charity_ID)
              .first();

            await trx.table('News_Item')
              .insert({
                News_Image: _appeal.Appeal_Icon ?? _charity.Charity_icon,
                News_Title: `NEW APPEAL. ${_charity.Charity_Name} has launched the ${_appeal.Appeal_Name}`,
                News_Content: `<p>${_appeal.Appeal_Description ?? ''}</p>
                <p>Launch date: ${commonSystem.convertDateToString(_appeal.Appeal_Start_Date)}</p>
                ${_appeal.Appeal_End_Date ? '<p>End date: ' + commonSystem.convertDateToString(_appeal.Appeal_End_Date) + '</p>' : '' }
                ${_appeal.Appeal_Target_Amount ? '<p>Target donation amount: ' + new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: 'GBP',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(_appeal.Appeal_Target_Amount) + '</p>' : ''}`,
                Appeal_ID: _appeal_ID,
                Moves_Charity_ID: _appeal.Moves_Charity_ID,
                News_Status_ID: 26,
                News_Url: _appeal.Appeal_URL,
                Is_Manual: false,
                News_Publish_Date: new Date()
              });
          }
        }

        await trx.table('Appeal')
          .whereNotNull('Appeal_End_Date')
          .andWhereRaw('??::date < ?::date', ['Appeal_End_Date', currentTime])
          .where(builder => {
            //status publish
            builder.where('Appeal_Status_ID', 15);

            //status live
            builder.orWhere('Appeal_Status_ID', 16);
          })
          .update({
            //change status publish, live => complete
            Appeal_Status_ID: 17
          });
      });
    }
    catch (e) {
      throw new Error(e);
    }
  },
  campaign: async () => {
    try {
      let listCampaignIdComplete = [];
      let trx_result = await db.transaction(async trx => {
        let listCampaignIdLive = await trx.table('Campaign')
          .where(builder => {
            //status publish
            builder.where('Campaign_Status_ID', 22);

            builder.where('Campaign_Launch_Date', '<=', new Date());
          })
          .returning('Campaign_ID')
          .update({
            //change status publish => live
            Campaign_Status_ID: 23
          });

        //Tạo news khi có campaign chuyển trạng thái => Live
        if (listCampaignIdLive.length) {
          for (let i = 0; i < listCampaignIdLive.length; i++) {
            let _campaign_ID = listCampaignIdLive[i];
            let _campaign = await trx.table('Campaign')
              .where('Campaign_ID', _campaign_ID)
              .first();

            let _charity = await trx.table('Charity')
              .where('Moves_Charity_ID', _campaign.Moves_Charity_ID)
              .first();

            let _company = await trx.table('Company')
              .where('Moves_Company_ID', _campaign.Moves_Company_ID)
              .first();

            let icon_new = _campaign.Campaign_Icon ?? _charity.Charity_icon;

            await trx.table('News_Item')
              .insert({
                News_Image: icon_new,
                News_Title: `NEW CAMPAIGN. ${_charity.Charity_Name} and ${_company.Company_Name} have launched the ${_campaign.Campaign_Name} Campaign`,
                News_Content: `<p>${_campaign.Campaign_Description ?? ''}</p>
                <p>Launch date: ${commonSystem.convertDateToString(_campaign.Campaign_Launch_Date)}</p>
                ${_campaign.End_Date_Target == false ? '' : '<p>End date: ' + commonSystem.convertDateToString(_campaign.Campaign_End_Date) + '</p>'}
                ${_campaign.End_Date_Target == false ? '<p>Target donation amount: ' + new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: 'GBP',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(_campaign.Campaign_Target_Value) + '</p>' : ''}
                <p>Price per move: £${_campaign.Campaign_Price_Per_Move.toFixed(2)}</p>`,
                Campaign_ID: _campaign_ID,
                Moves_Charity_ID: _campaign.Moves_Charity_ID,
                Moves_Company_ID: _campaign.Moves_Company_ID,
                Appeal_ID: _campaign.Appeal_ID,
                News_Status_ID: 26,
                News_Url: _campaign.Campaign_URL,
                Is_Manual: false,
                News_Publish_Date: new Date()
              });
          }
        }

        //get list Campaign have status = publish or live, End_Date_Target = true
        let listCampaignIdComplete1 = await trx.table('Campaign')
          .andWhere('Campaign_End_Date', '<', new Date())
          .andWhere('End_Date_Target', true)
          .where(builder => {
            //status publish
            builder.where('Campaign_Status_ID', 22);

            //status live
            builder.orWhere('Campaign_Status_ID', 23);
          })
          .returning('Campaign_ID')
          .update({
            //change status publish => Complete
            Campaign_Status_ID: 24
          });

        //get list Campaign have status = publish or live, End_Date_Target = false
        let listCampaignCompleteAmount = await trx.table('Campaign')
          .where('End_Date_Target', false)
          .where(builder => {
            //status publish
            builder.where('Campaign_Status_ID', 22);

            //status live
            builder.orWhere('Campaign_Status_ID', 23);
          });

        let listCampaignCompleteAmountId = listCampaignCompleteAmount.map(x => x.Campaign_ID);

        let _listDonationCampaign = await db.table('Donation')
          .whereIn('Campaign_ID', listCampaignCompleteAmountId)
          .whereNull('Appeal_ID')
          .whereNull('Moves_Charity_ID')
          .select('Campaign_ID')
          .groupBy('Campaign_ID')
          .sum('Sterling_Amount as Sterling_Amount');
        
        let listCampaignCompleteUpdateId = [];
        listCampaignCompleteAmount.forEach(item => {
          let donation = _listDonationCampaign.find(x => x.Campaign_ID == item.Campaign_ID)?.Sterling_Amount ?? 0;

          if (donation >= item.Campaign_Target_Value) {
            listCampaignCompleteUpdateId.push(item.Campaign_ID);
          }
        });

        let listCampaignIdComplete2 = [];
        if (listCampaignCompleteUpdateId.length > 0) {
          listCampaignIdComplete2 = await trx.table('Campaign')
            .whereIn('Campaign_ID', listCampaignCompleteUpdateId)
            .returning('Campaign_ID')
            .update({
              //change status => complete
              Campaign_Status_ID: 24
            });
        }
        listCampaignIdComplete = [...listCampaignIdComplete1, ...listCampaignIdComplete2];

        //Tạo news khi có campaign chuyển trạng thái => Complete
        if (listCampaignIdComplete.length) {
          for (let i = 0; i < listCampaignIdComplete.length; i++) {
            let _campaign_ID = listCampaignIdComplete[i];
            let _campaign = await trx.table('Campaign')
              .where('Campaign_ID', _campaign_ID)
              .first();

              let _charity = await trx.table('Charity')
              .where('Moves_Charity_ID', _campaign.Moves_Charity_ID)
              .first();

            await trx.table('News_Item')
              .insert({
                News_Image: _campaign.Campaign_Icon ?? _charity.Charity_icon,
                News_Title: `OVER THE LINE! The ${_campaign.Campaign_Name} campaign is fully funded!`,
                News_Content: `<p>${_campaign.Campaign_Description ?? ''}</p>
                <p>Launch date: ${commonSystem.convertDateToString(_campaign.Campaign_Launch_Date)}</p>
                ${_campaign.End_Date_Target == false ? '' : '<p>End date: ' + commonSystem.convertDateToString(_campaign.Campaign_End_Date) + '</p>'}
                ${_campaign.End_Date_Target == false ? '<p>Target donation amount: ' + new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: 'GBP',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(_campaign.Campaign_Target_Value) + '</p>' : ''}
                <p>Price per move: £${_campaign.Campaign_Price_Per_Move.toFixed(2)}</p>`,
                Campaign_ID: _campaign_ID,
                Moves_Charity_ID: _campaign.Moves_Charity_ID,
                Moves_Company_ID: _campaign.Moves_Company_ID,
                Appeal_ID: _campaign.Appeal_ID,
                News_Status_ID: 26,
                News_Url: _campaign.Campaign_URL,
                Is_Manual: false,
                News_Publish_Date: new Date()
              });
          }
        }
      });
      
      return listCampaignIdComplete;
    }
    catch (e) {
      throw new Error(e);
    }
  }
}

module.exports = changeStatus;