const db = require('../../../data/knex-db');
const authenticated = require('../../../middleware/authenticated-guard');
const messages = require('../../../messages/charity');
const logging = require('../../../middleware/autologging');
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const dashboardHelper = require('../../../common/dashboardHelper');
const commonSystem = require('../../../common/commonSystem');

const getCategoryByType = async (type) => {
    return await db.table('Category').where('Category_Type', type);
};

const getCategoryByTypeAndName = async (type, name) => {
    return await db.table('Category').where('Category_Type', type).where('Category_Name', name).first();
};

const calculatorBadge = async (User_ID, Donated_Moves, Badge_ID, Badge_Condition, trx = db) => {
    let id = '';
    let BadgeAwardedMoves = await trx.table('Badge_Awarded')
        .where('Badge_ID', Badge_ID)
        .where('User_ID', User_ID)
        .first();
    if (BadgeAwardedMoves) {
        let times = (Donated_Moves - Donated_Moves % Badge_Condition) / Badge_Condition;
        if (BadgeAwardedMoves?.Badge_Awarded_Times != times) {
            id = Badge_ID;
            await trx.table('Badge_Awarded')
                .where('Badge_ID', Badge_ID)
                .where('User_ID', User_ID)
                .update({
                    'Badge_Awarded_Times': times,
                    'Badge_Awarded_Date': new Date()
                })
        }
    } 
    else {
        id = Badge_ID;
        await trx.table('Badge_Awarded')
            .insert({
                'Badge_ID': Badge_ID,
                'User_ID': User_ID,
                'Badge_Awarded_Date': new Date(),
                'Badge_Awarded_Times': 1
            })
    }
    return id
};

const createNewsByType = async (type, Campaign, trx = db) => {
    let _charity = await trx.table('Charity')
        .where('Moves_Charity_ID', Campaign.Moves_Charity_ID)
        .first();

    let icon = Campaign.Campaign_Icon ? Campaign.Campaign_Icon : _charity.Charity_icon;

    //Nếu tạo news 50%
    if (type == 1) {
        await trx.table('News_Item')
            .insert({
                News_Image: icon,
                News_Title: `HALF WAY THERE! The ${Campaign.Campaign_Name} campaign is 50% funded.`,
                News_Content: `<p>${Campaign.Campaign_Description ?? ''}</p>
                <p>Launch date: ${commonSystem.convertDateToString(Campaign.Campaign_Launch_Date)}</p>
                ${Campaign.End_Date_Target == false ? '' : '<p>End date: ' + commonSystem.convertDateToString(Campaign.Campaign_End_Date) + '</p>'}
                ${Campaign.End_Date_Target == false ? '<p>Target donation amount: ' + new Intl.NumberFormat('en-GB', {
                    style: 'currency',
                    currency: 'GBP',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Campaign.Campaign_Target_Value) + '</p>' : ''}
                <p>Price per move: £${Campaign.Campaign_Price_Per_Move.toFixed(2)}</p>`,
                Moves_Charity_ID: Campaign.Moves_Charity_ID,
                Moves_Company_ID: Campaign.Moves_Company_ID,
                Appeal_ID: Campaign.Appeal_ID,
                Campaign_ID: Campaign.Campaign_ID,
                News_Status_ID: 26,
                News_Url: Campaign.Campaign_URL,
                Is_Manual: false,
                News_Publish_Date: new Date()
            });
    }
    //Nếu đã tạo news 90%
    else if (type == 2) {
        await trx.table('News_Item')
            .insert({
                News_Image: icon,
                News_Title: `NEARLY THERE! The ${Campaign.Campaign_Name} campaign has become 90% funded.`,
                News_Content: `<p>${Campaign.Campaign_Description?? ''}</p>
                <p>Launch date: ${commonSystem.convertDateToString(Campaign.Campaign_Launch_Date)}</p>
                ${Campaign.End_Date_Target == false ? '' : '<p>End date: ' + commonSystem.convertDateToString(Campaign.Campaign_End_Date) + '</p>'}
                ${Campaign.End_Date_Target == false ? '<p>Target donation amount: £' + new Intl.NumberFormat('en-GB', {
                    style: 'currency',
                    currency: 'GBP',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Campaign.Campaign_Target_Value) + '</p>' : ''}
                <p>Price per move: £${Campaign.Campaign_Price_Per_Move.toFixed(2)}</p>`,
                Moves_Charity_ID: Campaign.Moves_Charity_ID,
                Moves_Company_ID: Campaign.Moves_Company_ID,
                Appeal_ID: Campaign.Appeal_ID,
                Campaign_ID: Campaign.Campaign_ID,
                News_Status_ID: 26,
                News_Url: Campaign.Campaign_URL,
                Is_Manual: false,
                News_Publish_Date: new Date()
            });
    }
    //Nếu đã tạo news 100%
    else if (type == 3) {
        await trx.table('News_Item')
            .insert({
                News_Image: icon,
                News_Title: `OVER THE LINE! The ${Campaign.Campaign_Name} campaign is fully funded!`,
                News_Content: `<p>${Campaign.Campaign_Description ?? ''}</p>
                <p>Launch date: ${commonSystem.convertDateToString(Campaign.Campaign_Launch_Date)}</p>
                ${Campaign.End_Date_Target == false ? '' : '<p>End date: ' + commonSystem.convertDateToString(Campaign.Campaign_End_Date) + '</p>'}
                ${Campaign.End_Date_Target == false ? '<p>Target donation amount: £' + new Intl.NumberFormat('en-GB', {
                    style: 'currency',
                    currency: 'GBP',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Campaign.Campaign_Target_Value) + '</p>' : ''}
                <p>Price per move: £${Campaign.Campaign_Price_Per_Move.toFixed(2)}</p>`,
                Moves_Charity_ID: Campaign.Moves_Charity_ID,
                Moves_Company_ID: Campaign.Moves_Company_ID,
                Appeal_ID: Campaign.Appeal_ID,
                Campaign_ID: Campaign.Campaign_ID,
                News_Status_ID: 26,
                News_Url: Campaign.Campaign_URL,
                Is_Manual: false,
                News_Publish_Date: new Date()
            });
    }

    return;
};

const createNewsWhenDonationCampaign = async (bodyData, Campaign, trx = db) => {
    let { TotalDonation } = await dashboardHelper.getDonationCampaign(Campaign.Campaign_ID);

    TotalDonation += bodyData?.Moves_Conversion_Rate * bodyData?.Moves_Donated;
    let percent = (TotalDonation / Campaign.Campaign_Target_Value) * 100;
    let typeOfCreateNews = Campaign.Type_Of_Create_News;

    //phần trăm trong khoảng [50, 90) và chưa tạo news
    if (percent >= 50 && percent < 90 && typeOfCreateNews == null) {
        //Tạo news 50%
        await createNewsByType(1, Campaign, trx);

        //Update trường Type_Of_Create_News => 1
        await trx.table('Campaign')
            .where('Campaign_ID', Campaign.Campaign_ID)
            .update({
                Type_Of_Create_News: 1
            });

        return;
    }
    //phần trăm trong khoảng [50, 90) và đã tạo news 50%
    if (percent >= 50 && percent < 90 && typeOfCreateNews == 1) {
        return;
    }
    //phần trăm trong khoảng [90, 100) và chưa tạo news
    else if (percent >= 90 && percent < 100 && typeOfCreateNews == null) {
        //Tạo news 50%
        await createNewsByType(1, Campaign, trx);

        //Tạo news 90%
        await createNewsByType(2, Campaign, trx);

        //Update trường Type_Of_Create_News => 2
        await trx.table('Campaign')
            .where('Campaign_ID', Campaign.Campaign_ID)
            .update({
                Type_Of_Create_News: 2
            });

        return;
    }
    //phần trăm trong khoảng [90, 100) và đã tạo news 50% nhưng chưa tạo news 90%
    else if (percent >= 90 && percent < 100 && typeOfCreateNews == 1) {
        //Tạo news 90%
        await createNewsByType(2, Campaign, trx);

        //Update trường Type_Of_Create_News => 2
        await trx.table('Campaign')
            .where('Campaign_ID', Campaign.Campaign_ID)
            .update({
                Type_Of_Create_News: 2
            });

        return;
    }
    //phần trăm trong khoảng [90, 100) và đã tạo news 50% và news 90%
    else if (percent >= 90 && percent < 100 && typeOfCreateNews == 2) {
        return;
    }
    //phần trăm trong khoảng >= 100 và chưa tạo news
    else if (percent >= 100 && typeOfCreateNews == null) {
        //Tạo news 50%
        await createNewsByType(1, Campaign, trx);

        //Tạo news 90%
        await createNewsByType(2, Campaign, trx);

        //Tạo news 100%
        // await createNewsByType(3, Campaign, trx);

        //Update trường Type_Of_Create_News => 3
        await trx.table('Campaign')
            .where('Campaign_ID', Campaign.Campaign_ID)
            .update({
                Type_Of_Create_News: 3
            });

        return;
    }
    //phần trăm trong khoảng >= 100 và đã tạo news 50% nhưng chưa tạo news 90%
    else if (percent >= 100 && typeOfCreateNews == 1) {
        //Tạo news 90%
        await createNewsByType(2, Campaign, trx);

        //Tạo news 100%
        // await createNewsByType(3, Campaign, trx);

        //Update trường Type_Of_Create_News => 3
        await trx.table('Campaign')
            .where('Campaign_ID', Campaign.Campaign_ID)
            .update({
                Type_Of_Create_News: 3
            });

        return;
    }
    //phần trăm trong khoảng >= 100 và đã tạo news 50% và news 90%
    else if (percent >= 100 && typeOfCreateNews == 2) {
        //Tạo news 100%
        // await createNewsByType(3, Campaign, trx);

        //Update trường Type_Of_Create_News => 3
        await trx.table('Campaign')
            .where('Campaign_ID', Campaign.Campaign_ID)
            .update({
                Type_Of_Create_News: 3
            });

        return;
    }
    //phần trăm trong khoảng >= 100 và đã tạo news 50% và news 90% và news 100%
    else if (percent >= 100 && typeOfCreateNews == 3) {
        return;
    }
};

const resolvers = {
    Query: {
        getListCharity: authenticated(async (parent, args, context) => {
            try {
                let bodyData = args?.bodyData;
                let Charity = [];       
                if (bodyData['CharitySector'] || bodyData['Geographic'] || bodyData['Size'] || bodyData['Keyword']) {
                    let CharityId = [];
                    if (bodyData['CharitySector']) {
                        let CharitySector = await db.table('Charity_Sector')
                            .whereIn('Category_ID', bodyData['CharitySector']);
                        CharitySector?.length && CharitySector.map(item => {
                            CharityId = [...CharityId, item.Moves_Charity_ID]
                        });
                    }

                    Charity = await db.table('Charity').modify((queryBuilder) => {
                        queryBuilder.where('Is_Remove_Access', false)
                        queryBuilder.where('Is_Active', true);
                        if (bodyData['Keyword']) {
                            queryBuilder.where('Charity_Name', 'ILIKE', `%${bodyData['Keyword']?.toLowerCase()}%`)
                        }
                        if (bodyData['Size']) {
                            queryBuilder.whereIn('Charity_Income_Band_ID', bodyData['Size'])
                        }
                        if (bodyData['CharitySector']) {
                            queryBuilder.whereIn('Moves_Charity_ID', CharityId)
                        }
                        queryBuilder.orderBy('Created_Date', 'desc')
                    });

                    Charity?.length && Charity.map(item => {
                        item.Charity_icon = item.Charity_icon ? URL_FOLDER + item.Charity_icon : null;
                    });
                }
                let Size = await getCategoryByType(2);
                let CharitySector = await getCategoryByType(3);

                return {
                    Charity,
                    Size,
                    CharitySector,
                    messageCode: 200,
                    message: messages.success
                }
            } catch (e) {
                logging(context, e);
                return {
                    messageCode: 500,
                    message: 'Internal Server Error'
                }
            }
        }),
        getListCampaignMobile: authenticated(async (parent, args, context) => {
            try {
                let isFavourites = args?.type === 'favourite';

                let User_ID = context?.currentUser?.User_ID;
                let User = await db.table('User').where('User_ID', User_ID).first();

                let Favorites = await db.table('Favorites')
                    .where('User_ID', User_ID);

                // let Moves_Company_ID = [];
                let Moves_Charity_ID = [];
                let Appeal_ID = [];
                let Campaign_ID = [];

                if (Favorites?.length) {
                    Favorites.map(item => {
                        if (item?.Moves_Charity_ID != null) {
                            Moves_Charity_ID.push(item?.Moves_Charity_ID)
                        }
                        if (item?.Appeal_ID != null) {
                            Appeal_ID.push(item?.Appeal_ID)
                        }
                        if (item?.Campaign_ID != null) {
                            Campaign_ID.push(item?.Campaign_ID)
                        }
                        if (item?.Campaign_ID != null) {
                            Campaign_ID.push(item?.Campaign_ID)
                        }
                        // if (item?.Moves_Company_ID != null) {
                        //     Moves_Company_ID.push(item?.Moves_Company_ID)
                        // }
                    })
                }

                let Charity = await db.table('Charity').modify((queryBuilder) => {
                    queryBuilder.where('Is_Active', true)
                    queryBuilder.where('Is_Remove_Access', false);
                    if (isFavourites) {
                        queryBuilder.whereIn('Moves_Charity_ID', Moves_Charity_ID);
                    }
                    queryBuilder.orderBy('Created_Date', 'desc');
                });

                let statusLiveAppeal = await getCategoryByTypeAndName(4, 'Live');
                let _Appeal = await db.table('Appeal')
                .select(
                    "Appeal.Appeal_ID",
                    "Appeal.Moves_Charity_ID",
                    "Appeal.Appeal_Name",
                    "Appeal.Appeal_URL",
                    "Appeal.Appeal_Icon",
                    "Appeal.Appeal_Description",
                    "Appeal.Appeal_Start_Date",
                    "Appeal.Appeal_End_Date",
                    "Appeal.Appeal_Target_Amount",
                    "Appeal.Created_Date",
                    "Appeal.Created_By",
                    "Appeal.Last_Modify_Date",
                    "Appeal.Last_Modify_By",
                    "Appeal.Appeal_Status_ID",
                    "Charity.Charity_icon"
                )
                .innerJoin('Charity', 'Appeal.Moves_Charity_ID', '=', 'Charity.Moves_Charity_ID')
                .where((queryBuilder) => {
                    queryBuilder.where('Charity.Is_Remove_Access', false);
                    queryBuilder.where('Appeal.Appeal_Status_ID', statusLiveAppeal.Category_ID);
                    if (isFavourites) {
                        queryBuilder.whereIn('Appeal.Appeal_ID', Appeal_ID);
                    }
                    queryBuilder.orderBy('Appeal.Appeal_Start_Date', 'desc');
                });

                // let listAppealId = _Appeal.map(x => x.Appeal_ID);
                // let Appeal = await db.table('Appeal')
                //     .whereIn('Appeal_ID', listAppealId)
                //     .orderBy('Appeal_Start_Date', 'desc');

                let Appeal = [..._Appeal]

                let statusLiveCampaign = await getCategoryByTypeAndName(5, 'Live');
                let CampaignPublic = await db.table('Campaign').modify((queryBuilder) => {
                    queryBuilder.where('Public_Private', false);
                    queryBuilder.where('Campaign_Status_ID', statusLiveCampaign.Category_ID);
                    if (isFavourites) {
                        queryBuilder.whereIn('Campaign_ID', Campaign_ID);
                    }
                    queryBuilder.orderBy('Campaign_Launch_Date', 'desc');
                });
                let CampaignPrivate = await db.table('Campaign').modify((queryBuilder) => {
                    queryBuilder.where('Public_Private', true);
                    queryBuilder.where('Moves_Charity_ID', User.Moves_Charity_ID);
                    queryBuilder.where('Campaign_Status_ID', statusLiveCampaign.Category_ID);
                    if (isFavourites) {
                        queryBuilder.whereIn('Campaign_ID', Campaign_ID);
                    }
                    queryBuilder.orderBy('Campaign_Launch_Date', 'desc');
                });

                let Campaign = [...CampaignPublic, ...CampaignPrivate];

                let listCompanyId = Campaign.map(x => x.Moves_Company_ID);
                let listCharityId = Campaign.map(x => x.Moves_Charity_ID);
                let listAppealId = Campaign.map(x => x.Appeal_ID)

                let listCompany = await db.table('Company')
                    .whereIn('Moves_Company_ID', listCompanyId)
                    .andWhere('Is_Remove_Access', false);
                let listCharity = await db.table('Charity')
                    .whereIn('Moves_Charity_ID', listCharityId)
                    .andWhere('Is_Remove_Access', false);
                let listApeal = await db.table('Appeal')
                    .whereIn('Appeal_ID', listAppealId)

                let resultCampaign = [];
                Campaign.forEach(item => {
                    let existsCompany = listCompany.find(x => x.Moves_Company_ID == item.Moves_Company_ID);
                    let existsCharity = listCharity.find(x => x.Moves_Charity_ID == item.Moves_Charity_ID);
                    let existsAppeal = listApeal.find(x => x.Appeal_ID == item.Appeal_ID)

                    if (item.Moves_Company_ID && item.Moves_Charity_ID && existsCompany && existsCharity) {
                        item.Charity_icon = existsCharity?.Charity_icon
                        item.Appeal_Icon = existsAppeal?.Appeal_Icon
                        resultCampaign.push(item);
                    }
                });

                Charity?.length && Charity.map(item => {
                    item.Charity_icon = item.Charity_icon ? URL_FOLDER + item.Charity_icon : null;
                });
                Appeal?.length && Appeal.map(item => {
                    item.Appeal_Icon = item.Appeal_Icon ? URL_FOLDER + item.Appeal_Icon : null;
                    item.Charity_icon = item.Charity_icon ? URL_FOLDER + item.Charity_icon : null;
                });
                resultCampaign?.length && resultCampaign.map(item => {
                    item.Campaign_Icon = item.Campaign_Icon ? URL_FOLDER + item.Campaign_Icon : null;
                    item.Appeal_Icon = item.Appeal_Icon ? URL_FOLDER + item.Appeal_Icon : null;
                    item.Charity_icon = item.Charity_icon ? URL_FOLDER + item.Charity_icon : null;
                });

                return {
                    Charity,
                    Appeal,
                    Campaign: resultCampaign,
                    messageCode: 200,
                    message: messages.success
                }
            } catch (e) {
                logging(context, e);
                return {
                    messageCode: 500,
                    message: 'Internal Server Error'
                }
            }
        }),
        getMasterDataListDonation: (async (parent, args, context) => {
            try {
                let User_ID = context?.currentUser?.User_ID ?? null;
                let User = await db.table('User').where('User_ID', User_ID).first();
                let objectId = args.objectId;
                let objectType = args.objectType;

                if (objectType == 'charity') {
                    let Moves_Charity_ID = objectId;
                    let charity = await db.table('Charity')
                        .where('Moves_Charity_ID', Moves_Charity_ID)
                        .first();

                    if (!charity) {
                        return {
                            messageCode: 404,
                            message: 'charity not found'
                        }
                    }

                    let listAppeal = await db.table('Appeal')
                        .where('Moves_Charity_ID', Moves_Charity_ID);

                    let listCampaign = await db.table('Campaign')
                        .where('Moves_Charity_ID', Moves_Charity_ID);

                    return {
                        ListAppeal: listAppeal,
                        ListCampaign: listCampaign,
                        messageCode: 200,
                        message: 'OK'
                    }
                } else if (objectType == 'company') {
                    let Moves_Company_ID = objectId;
                    let company = await db.table('Company')
                        .where('Moves_Company_ID', Moves_Company_ID)
                        .first();

                    if (!company) {
                        return {
                            messageCode: 404,
                            message: 'company not found'
                        }
                    }

                    let listCampaignForMatch = await db.table('Match')
                        .where('Moves_Company_ID', Moves_Company_ID)
                        .distinct('Campaign_ID');
                    let listCampaignForMatchId = listCampaignForMatch.map(x => x.Campaign_ID);

                    let listCampaignForCompany = await db.table('Campaign')
                        .where('Moves_Company_ID', Moves_Company_ID);
                    let listCampaignForCompanyId = listCampaignForCompany.map(x => x.Campaign_ID);

                    let listCampaignId = [...new Set([...listCampaignForMatchId, ...listCampaignForCompanyId])];
                    let listCampaign = await db.table('Campaign')
                        .whereIn('Campaign_ID', listCampaignId);

                    let listAppealId = listCampaign.filter(x => x.Appeal_ID != null).map(x => x.Appeal_ID);
                    let listAppeal = await db.table('Appeal')
                        .whereIn('Appeal_ID', listAppealId);

                    return {
                        ListAppeal: listAppeal,
                        ListCampaign: listCampaign,
                        messageCode: 200,
                        message: 'OK'
                    }
                } else if (objectType == 'appeal') {
                    let Appeal_ID = objectId;
                    let appeal = await db.table('Appeal')
                        .where('Appeal_ID', Appeal_ID)
                        .first();

                    if (!appeal) {
                        return {
                            messageCode: 404,
                            message: 'appeal not found'
                        }
                    }

                    let listCampaign = await db.table('Campaign')
                        .where('Appeal_ID', Appeal_ID);

                    return {
                        ListAppeal: [appeal],
                        ListCampaign: listCampaign,
                        messageCode: 200,
                        message: 'OK'
                    }
                } else if (objectType == 'campaign') {
                    let Campaign_ID = objectId;
                    let campaign = await db.table('Campaign')
                        .where('Campaign_ID', Campaign_ID)
                        .first();

                    if (!campaign) {
                        return {
                            messageCode: 404,
                            message: 'campaign not found'
                        }
                    }

                    return {
                        ListAppeal: [],
                        ListCampaign: [campaign],
                        messageCode: 200,
                        message: 'OK'
                    }
                } else {
                    return {
                        messageCode: 404,
                        message: 'request not found'
                    }
                }
            } catch (e) {
                logging(context, e);
                return {
                    messageCode: 500,
                    message: 'Internal Server Error'
                }
            }
        }),
        getListDonation: (async (parent, args, context) => {
            try {
                let User_ID = context?.currentUser?.User_ID ?? null;
                let User = await db.table('User').where('User_ID', User_ID).first();

                let objectId = args.bodyData.objectId;
                let objectType = args.bodyData.objectType;
                let startDate = args.bodyData.startDate ? new Date(args.bodyData.startDate) : null;
                let endDate = args.bodyData.endDate ? new Date(args.bodyData.endDate) : null;
                let listAppealId = args.bodyData.listAppealId;
                let listCampaignId = args.bodyData.listCampaignId;
                let type = args.bodyData.type;

                let totalDonation = 0;
                let listDonation = [];

                if (objectType == 'charity') {
                    let result = await dashboardHelper.getTotal(User, type, objectId);
                    totalDonation = result?.totalDonation;
                    let Moves_Charity_ID = objectId;
                    let charity = await db.table('Charity')
                        .where('Moves_Charity_ID', Moves_Charity_ID)
                        .first();

                    if (!charity) {
                        return {
                            messageCode: 404,
                            message: 'charity not found'
                        }
                    }

                    let listAppeal = await db.table('Appeal')
                        .where('Moves_Charity_ID', Moves_Charity_ID);
                    let listAppealId = listAppeal.map(x => x.Appeal_ID);

                    let listCampaign = await db.table('Campaign')
                        .where('Moves_Charity_ID', Moves_Charity_ID);
                    let listCampaignId = listCampaign.map(x => x.Campaign_ID);
                    let listCompanyId = listCampaign.map(x => x.Moves_Company_ID);
                    let listCompany = await db.table('Company')
                        .whereIn('Moves_Company_ID', listCompanyId);

                    //Donation for Charity
                    listDonation = await db.table('Donation')
                        .where('Moves_Charity_ID', Moves_Charity_ID)
                        .orWhereIn('Appeal_ID', listAppealId)
                        .orWhereIn('Campaign_ID', listCampaignId)
                        .where(builder => {
                            if (startDate)
                                builder.whereRaw('??::date >= ?::date', ['Created_Date', startDate])
                            if (endDate)
                                builder.whereRaw('??::date <= ?::date', ['Created_Date', endDate])
                        })
                        .orderBy('Created_Date', 'desc');

                    listDonation.forEach(donation => {
                        donation.Charity_Name = charity.Charity_Name;

                        if (donation.Appeal_ID) {
                            let appeal = listAppeal.find(x => x.Appeal_ID == donation.Appeal_ID);
                            donation.Appeal_Name = appeal.Appeal_Name;
                            donation.Appeal_ID = appeal.Appeal_ID;
                        } else if (donation.Campaign_ID) {
                            let campaign = listCampaign.find(x => x.Campaign_ID == donation.Campaign_ID);
                            donation.Campaign_Name = campaign.Campaign_Name;
                            donation.Campaign_ID = campaign.Campaign_ID;

                            let company = listCompany.find(x => x.Moves_Company_ID == campaign.Moves_Company_ID);
                            donation.Company_Name = company.Company_Name;

                            if (campaign.Appeal_ID) {
                                let appeal = listAppeal.find(x => x.Appeal_ID);
                                donation.Appeal_Name = appeal.Appeal_Name;
                                donation.Appeal_ID = appeal.Appeal_ID;
                            }
                        }
                    });
                } else if (objectType == 'company') {
                    let result = await dashboardHelper.getTotal(User, type, objectId);
                    totalDonation = result?.totalDonation;

                    let Moves_Company_ID = objectId;
                    let company = await db.table('Company')
                        .where('Moves_Company_ID', Moves_Company_ID)
                        .first();

                    if (!company) {
                        return {
                            messageCode: 404,
                            message: 'company not found'
                        }
                    }

                    let listCampaignForMatch = await db.table('Match')
                        .where('Moves_Company_ID', Moves_Company_ID)
                        .distinct('Campaign_ID');
                    let listCampaignForMatchId = listCampaignForMatch.map(x => x.Campaign_ID);

                    let listCampaignForCompany = await db.table('Campaign')
                        .where('Moves_Company_ID', Moves_Company_ID);
                    let listCampaignForCompanyId = listCampaignForCompany.map(x => x.Campaign_ID);

                    let listCampaignId = [...new Set([...listCampaignForMatchId, ...listCampaignForCompanyId])];
                    let listCampaign = await db.table('Campaign')
                        .whereIn('Campaign_ID', listCampaignId);

                    let listCharityId = listCampaign.map(x => x.Moves_Charity_ID);
                    let listCharity = await db.table('Charity')
                        .whereIn('Moves_Charity_ID', listCharityId);
                    let listAppealId = listCampaign.filter(x => x.Appeal_ID != null).map(x => x.Appeal_ID);
                    let listAppeal = await db.table('Appeal')
                        .whereIn('Appeal_ID', listAppealId);

                    //Donation for Company
                    listDonation = await db.table('Donation')
                        .whereIn('Campaign_ID', listCampaignId)
                        .where(builder => {
                            if (startDate)
                                builder.whereRaw('??::date >= ?::date', ['Created_Date', startDate])
                            if (endDate)
                                builder.whereRaw('??::date <= ?::date', ['Created_Date', endDate])
                        })
                        .orderBy('Created_Date', 'desc');

                    listDonation.forEach(donation => {
                        donation.Company_Name = company.Company_Name;

                        let campaign = listCampaign.find(x => x.Campaign_ID == donation.Campaign_ID);
                        donation.Campaign_Name = campaign.Campaign_Name;
                        donation.Campaign_ID = campaign.Campaign_ID;

                        let charity = listCharity.find(x => x.Moves_Charity_ID == campaign.Moves_Charity_ID);
                        donation.Charity_Name = charity.Charity_Name;

                        if (campaign.Appeal_ID) {
                            let appeal = listAppeal.find(x => x.Appeal_ID);
                            donation.Appeal_Name = appeal.Appeal_Name;
                            donation.Appeal_ID = appeal.Appeal_ID;
                        }
                    });
                } else if (objectType == 'appeal') {
                    let Appeal_ID = objectId;
                    let appeal = await db.table('Appeal')
                        .where('Appeal_ID', Appeal_ID)
                        .first();

                    if (!appeal) {
                        return {
                            messageCode: 404,
                            message: 'appeal not found'
                        }
                    }

                    let _result = await dashboardHelper.getDonationAppeal(appeal.Appeal_ID);
                    totalDonation = _result.TotalDonation;

                    let charity = await db.table('Charity')
                        .where('Moves_Charity_ID', appeal.Moves_Charity_ID)
                        .first();

                    let listCampaign = await db.table('Campaign')
                        .where('Appeal_ID', Appeal_ID);
                    let listCampaignId = listCampaign.map(x => x.Campaign_ID);
                    let listCompanyId = listCampaign.map(x => x.Moves_Company_ID);
                    let listCompany = await db.table('Company')
                        .whereIn('Moves_Company_ID', listCompanyId);

                    //Donation for Appeal
                    listDonation = await db.table('Donation')
                        .where('Appeal_ID', Appeal_ID)
                        .orWhereIn('Campaign_ID', listCampaignId)
                        .where(builder => {
                            if (startDate)
                                builder.whereRaw('??::date >= ?::date', ['Created_Date', startDate])
                            if (endDate)
                                builder.whereRaw('??::date <= ?::date', ['Created_Date', endDate])
                        })
                        .orderBy('Created_Date', 'desc');

                    listDonation.forEach(donation => {
                        donation.Charity_Name = charity.Charity_Name;
                        donation.Appeal_Name = appeal.Appeal_Name;
                        donation.Appeal_ID = appeal.Appeal_ID;

                        if (donation.Campaign_ID) {
                            let campaign = listCampaign.find(x => x.Campaign_ID == donation.Campaign_ID);
                            donation.Campaign_Name = campaign.Campaign_Name;
                            donation.Campaign_ID = campaign.Campaign_ID;

                            let company = listCompany.find(x => x.Moves_Company_ID == campaign.Moves_Company_ID);
                            donation.Company_Name = company.Company_Name;
                        }
                    });
                } else if (objectType == 'campaign') {
                    let Campaign_ID = objectId;
                    let campaign = await db.table('Campaign')
                        .where('Campaign_ID', Campaign_ID)
                        .first();

                    if (!campaign) {
                        return {
                            messageCode: 404,
                            message: 'campaign not found'
                        }
                    }

                    let _result = await dashboardHelper.getDonationCampaign(Campaign_ID);
                    totalDonation = _result.TotalDonation;

                    let appeal = await db.table('Appeal')
                        .where('Appeal_ID', campaign.Appeal_ID)
                        .first();

                    let company = await db.table('Company')
                        .where('Moves_Company_ID', campaign.Moves_Company_ID)
                        .first();

                    let charity = await db.table('Charity')
                        .where('Moves_Charity_ID', campaign.Moves_Charity_ID)
                        .first();

                    //Donation for Campaign
                    listDonation = await db.table('Donation')
                        .where('Campaign_ID', Campaign_ID)
                        .where(builder => {
                            if (startDate)
                                builder.whereRaw('??::date >= ?::date', ['Created_Date', startDate])
                            if (endDate)
                                builder.whereRaw('??::date <= ?::date', ['Created_Date', endDate])
                        })
                        .orderBy('Created_Date', 'desc');

                    listDonation.forEach(donation => {
                        donation.Charity_Name = charity.Charity_Name;
                        donation.Company_Name = company.Company_Name;
                        donation.Appeal_Name = appeal?.Appeal_Name ?? null;
                        donation.Appeal_ID = appeal?.Appeal_ID ?? null;
                        donation.Campaign_Name = campaign.Campaign_Name;
                        donation.Campaign_ID = campaign.Campaign_ID;
                    });
                } else {
                    return {
                        messageCode: 404,
                        message: 'request not found'
                    }
                }

                if (listAppealId.length > 0) {
                    listDonation = listDonation.filter(x => listAppealId.includes(x.Appeal_ID));
                }

                if (listCampaignId.length > 0) {
                    listDonation = listDonation.filter(x => listCampaignId.includes(x.Campaign_ID));
                }

                return {
                    TotalDonation: totalDonation,
                    ListDonation: listDonation,
                    messageCode: 200,
                    message: 'OK'
                }
            } catch (e) {
                logging(context, e);
                return {
                    messageCode: 500,
                    message: 'Internal Server Error'
                }
            }
        }),
        getListDonationMobile: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context?.currentUser?.User_ID;

                let ListDonation = await db.table('Donation')
                    .where('User_ID', User_ID)
                    .orderBy('Created_Date', 'desc');

                return {
                    ListDonation,
                    messageCode: 200,
                    message: 'OK'
                }
            } catch (e) {
                logging(context, e);
                return {
                    messageCode: 500,
                    message: 'Internal Server Error'
                }
            }
        }),
        getDetailDonationMobile: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context?.currentUser?.User_ID;

                let Donation = await db.table('Donation')
                    .where('User_ID', User_ID)
                    .where('Donation_ID', args?.id)
                    .first();

                return {
                    Donation,
                    messageCode: 200,
                    message: 'OK'
                }
            } catch (e) {
                logging(context, e);
                return {
                    messageCode: 500,
                    message: 'Internal Server Error'
                }
            }
        })
    },
    Charity: {
        Appeals: async (parent, args, context) => {
            let statusLive = await getCategoryByTypeAndName(4, 'Live');
            let Appeal = await db.table('Appeal')
                .where('Moves_Charity_ID', parent.Moves_Charity_ID)
                .where('Appeal_Status_ID', statusLive.Category_ID)
                .orderBy('Appeal_Start_Date', 'desc');
            Appeal?.length && Appeal.map(item => {
                item.Appeal_Icon = item.Appeal_Icon ? URL_FOLDER + item.Appeal_Icon : null;
            });
            return Appeal
        },
        Campaigns: async (parent, args, context) => {
            let User_ID = context?.currentUser?.User_ID;
            let User = await db.table('User').where('User_ID', User_ID).first();

            let statusLive = await getCategoryByTypeAndName(5, 'Live');
            let CampaignPublic = await db.table('Campaign')
                .where('Public_Private', false)
                .where('Moves_Charity_ID', parent.Moves_Charity_ID)
                .where('Campaign_Status_ID', statusLive.Category_ID)
                .orderBy('Campaign_Launch_Date', 'desc');
            let CampaignPrivate = [];
            if (parent.Moves_Charity_ID == User.Moves_Charity_ID) {
                CampaignPrivate = await db.table('Campaign')
                    .where('Public_Private', true)
                    .where('Moves_Charity_ID', parent.Moves_Charity_ID)
                    .where('Campaign_Status_ID', statusLive.Category_ID)
                    .orderBy('Campaign_Launch_Date', 'desc');
            }
            let Campaign = [...CampaignPublic, ...CampaignPrivate];

            let Appeal_Id = Campaign.map(item => item.Appeal_ID);
            let listApeal = await db.table('Appeal').whereIn('Appeal_ID', Appeal_Id);

            Campaign?.length && Campaign.map(item => {
                item.Campaign_Icon = item.Campaign_Icon ? URL_FOLDER + item.Campaign_Icon : null;
                let appeal = listApeal.find(x => x.Appeal_ID == item.Appeal_ID);
                item.Appeal_Icon = appeal ? (appeal.Appeal_Icon ? URL_FOLDER + appeal.Appeal_Icon : null ) : null; 
            });
            return Campaign;
        }
    },
    Donation: {
        Campaign_Name: async (parent, args, context) => {
            let Campaign = await db.table('Campaign')
                .where('Campaign_ID', parent?.Campaign_ID)
                .first();
            return Campaign?.Campaign_Name
        },
        Charity_Name: async (parent, args, context) => {
            let Charity;
            if (parent?.Moves_Charity_ID) {
                Charity = await db.table('Charity')
                    .where('Moves_Charity_ID', parent?.Moves_Charity_ID)
                    .first();
            } else if (parent?.Campaign_ID) {
                let Campaign = await db.table('Campaign')
                    .where('Campaign_ID', parent?.Campaign_ID)
                    .first();
                if (Campaign) {
                    Charity = await db.table('Charity')
                        .where('Moves_Charity_ID', Campaign?.Moves_Charity_ID)
                        .first();
                }
            } else if (parent?.Appeal_ID) {
                let Appeal = await db.table('Appeal')
                    .where('Appeal_ID', parent?.Appeal_ID)
                    .first();
                if (Appeal) {
                    Charity = await db.table('Charity')
                        .where('Moves_Charity_ID', Appeal?.Moves_Charity_ID)
                        .first();
                }
            }
            return Charity?.Charity_Name || null
        },
        Appeal_Name: async (parent, args, context) => {
            let Appeal;
            if (parent?.Appeal_ID) {
                Appeal = await db.table('Appeal')
                    .where('Appeal_ID', parent?.Appeal_ID)
                    .first();
            } else if (parent?.Campaign_ID) {
                let Campaign = await db.table('Campaign')
                    .where('Campaign_ID', parent?.Campaign_ID)
                    .first();
                if (Campaign) {
                    Appeal = await db.table('Appeal')
                        .where('Appeal_ID', Campaign?.Appeal_ID)
                        .first();
                }
            }
            return Appeal?.Appeal_Name || null
        },
    },
    Mutation: {
        favouriteMobile: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context?.currentUser?.User_ID;

                let trx_result = await db.transaction(async trx => {
                    let find = await db.table('Favorites').modify((queryBuilder) => {
                        queryBuilder.where('User_ID', User_ID);
                        switch (args?.type) {
                            case 'charity':
                                queryBuilder.where('Moves_Charity_ID', args?.id).first();
                                break;
                            case 'appeal':
                                queryBuilder.where('Appeal_ID', args?.id).first();
                                break;
                            case 'campaign':
                                queryBuilder.where('Campaign_ID', args?.id).first();
                                break;
                            default:
                        }
                    });

                    if (find) {
                        await trx.table('Favorites')
                            .where('Favorites_ID', find?.Favorites_ID)
                            .del()
                    } else {
                        switch (args?.type) {
                            case 'charity':
                                await trx.table('Favorites').insert({User_ID, Moves_Charity_ID: args?.id});
                                break;
                            case 'appeal':
                                await trx.table('Favorites').insert({User_ID, Appeal_ID: args?.id});
                                break;
                            case 'campaign':
                                await trx.table('Favorites').insert({User_ID, Campaign_ID: args?.id});
                                break;
                            default:
                        }
                    }
                    return {
                        messageCode: 200,
                        message: messages.success
                    };
                });

                return trx_result;
            } catch (e) {
                logging(context, e);
                return {
                    messageCode: 500,
                    message: 'Internal Server Error',
                }
            }
        }),
        storeDonate: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context?.currentUser?.User_ID;
                let bodyData = args?.bodyData;

                let trx_result = await db.transaction(async trx => {

                    let DONATE = await commonSystem.getDonate(User_ID, trx);

                    if (bodyData?.Moves_Donated > DONATE?.Moves_Avaiable) {
                        // throw new Error('the move donated exceeds the donated available');
                        throw new Error(messages.error);
                    }

                    let find, statusLive;
                    switch (bodyData?.type) {
                        case 'charity':
                            find = await trx.table('Charity')
                                .where('Moves_Charity_ID', bodyData?.Moves_Charity_ID)
                                .where('Is_Active', true)
                                .first();
                            if (find) {
                                await trx.table('Donation').insert({
                                    User_ID,
                                    Moves_Charity_ID: bodyData?.Moves_Charity_ID,
                                    Moves_Donated: bodyData?.Moves_Donated,
                                    Sterling_Amount: bodyData?.Sterling_Amount,
                                    Amount_Donated:  bodyData?.Amount_Donated         
                                });
                            } 
                            else {
                                throw new Error(messages.error);
                            }
                            break;
                        case 'appeal':
                            statusLive = await getCategoryByTypeAndName(4, 'Live');
                            find = await trx.table('Appeal')
                                .where('Appeal_ID', bodyData?.Appeal_ID)
                                .where('Appeal_Status_ID', statusLive.Category_ID)
                                .first();
                            if (find) {
                                await trx.table('Donation').insert({
                                    User_ID,
                                    Appeal_ID: bodyData?.Appeal_ID,
                                    Moves_Donated: bodyData?.Moves_Donated,
                                    Sterling_Amount: bodyData?.Sterling_Amount,
                                    Amount_Donated:  bodyData?.Amount_Donated 
                                });
                            } 
                            else {
                                throw new Error(messages.error);
                            }
                            break;
                        case 'campaign':
                            statusLive = await getCategoryByTypeAndName(5, 'Live');
                            find = await trx.table('Campaign')
                                .where('Campaign_ID', bodyData?.Campaign_ID)
                                .where('Campaign_Status_ID', statusLive.Category_ID)
                                .first();
                            if (find) {
                                await trx.table('Donation').insert({
                                    User_ID,
                                    Campaign_ID: bodyData?.Campaign_ID,
                                    Moves_Conversion_Rate: bodyData?.Moves_Conversion_Rate,
                                    Moves_Donated: bodyData?.Moves_Donated,
                                    Sterling_Amount: bodyData?.Moves_Conversion_Rate * bodyData?.Moves_Donated
                                });

                                //Nếu Campaign tính theo số tiền
                                if (!find.End_Date_Target) {
                                    await createNewsWhenDonationCampaign(bodyData, find, trx);
                                }
                            } 
                            else {
                                throw new Error(messages.error);
                            }
                            break;
                        default:
                        // code block
                    }

                    let {Donated_Moves, Amount_Donated, Moves_Avaiable} = await commonSystem.getDonate(User_ID, trx);

                    let Sterling_Amount = await trx.table('Donation')
                        .where('User_ID', User_ID)
                        .sum('Sterling_Amount');
                    if (Sterling_Amount?.length) {
                        Sterling_Amount = Sterling_Amount[0]?.sum || 0;
                    }

                    let Badge = await trx.table('Badge')
                        .orderBy('Badge_Condition', 'ASC');

                    let Badge_Condition_Moves = {
                        ids: [],
                        conditions: [],
                    };
                    let Badge_Condition_Donor = {
                        ids: [],
                        conditions: [],
                    };
                    let Badge_Condition_Giver = {
                        ids: [],
                        conditions: [],
                    };

                    if (Badge?.length) {
                        for (let i = 0; i < Badge.length; i++) {
                            let item = Badge[i];
                            if (item['Badge_Type'] == 0) {
                                Badge_Condition_Moves.ids.push(item['Badge_ID']);
                                Badge_Condition_Moves.conditions.push(item['Badge_Condition']);
                            } 
                            else if (item['Badge_Type'] == 1) {
                                Badge_Condition_Donor.ids.push(item['Badge_ID']);
                                Badge_Condition_Donor.conditions.push(item['Badge_Condition']);
                            } 
                            else if (item['Badge_Type'] == 2) { }
                        }
                    }

                    let ids = [];
                    let badge_Moves = '';
                    if (Donated_Moves >= Badge_Condition_Moves.conditions[0] && 
                        Donated_Moves < Badge_Condition_Moves.conditions[1]) {
                        badge_Moves = await calculatorBadge(User_ID, Donated_Moves, Badge_Condition_Moves.ids[0], Badge_Condition_Moves.conditions[0], trx)
                    } 
                    else if (Donated_Moves >= Badge_Condition_Moves.conditions[1] && 
                             Donated_Moves < Badge_Condition_Moves.conditions[2]) {
                        badge_Moves = await calculatorBadge(User_ID, Donated_Moves, Badge_Condition_Moves.ids[1], Badge_Condition_Moves.conditions[1], trx)
                    } 
                    else if (Donated_Moves >= Badge_Condition_Moves.conditions[2]) {
                        badge_Moves = await calculatorBadge(User_ID, Donated_Moves, Badge_Condition_Moves.ids[2], Badge_Condition_Moves.conditions[2], trx)
                    }
                    if (badge_Moves) ids.push(badge_Moves);

                    let badge_Donor = '';
                    if (Sterling_Amount > Badge_Condition_Donor.conditions[0] && 
                        Sterling_Amount < Badge_Condition_Donor.conditions[1]) {
                        badge_Donor = await calculatorBadge(User_ID, Sterling_Amount, Badge_Condition_Donor.ids[0], Badge_Condition_Donor.conditions[0], trx)
                    } 
                    else if (Sterling_Amount > Badge_Condition_Donor.conditions[1] && 
                             Sterling_Amount < Badge_Condition_Donor.conditions[2]) {
                        badge_Donor = await calculatorBadge(User_ID, Sterling_Amount, Badge_Condition_Donor.ids[1], Badge_Condition_Donor.conditions[1], trx)
                    } 
                    else if (Sterling_Amount > Badge_Condition_Donor.conditions[2]) {
                        badge_Donor = await calculatorBadge(User_ID, Sterling_Amount, Badge_Condition_Donor.ids[2], Badge_Condition_Donor.conditions[2], trx)
                    }
                    if (badge_Donor) ids.push(badge_Donor);

                    let Badge_Awarded = await trx.table('Badge_Awarded')
                        .whereIn('Badge_ID', ids)
                        .where('User_ID', User_ID);

                    return {
                        Badge_Awarded,
                        Donated_Moves,
                        Amount_Donated,
                        Moves_Avaiable,
                        messageCode: 200,
                        message: messages.success
                    };
                });

                return trx_result;
            } 
            catch (e) {
                logging(context, e);
                return {
                    messageCode: 500,
                    message: 'Internal Server Error',
                }
            }
        }),
        recommendCharity: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context?.currentUser?.User_ID;
                let bodyData = args?.bodyData;

                // let trx_result = await db.transaction(async trx => {

                let find = await db.table('Charity')
                    .where('Charity_Name', bodyData?.Charity_Name)
                    .first();

                if (find) {
                    return {
                        messageCode: 400,
                        message: bodyData?.Charity_Name + messages.charity.exists
                    }
                }

                await db.table('Charity')
                    .insert({
                        Charity_Name: bodyData?.Charity_Name,
                        Contact_Email: bodyData?.Charity_Email,
                        Charity_Type: 0,
                        Created_By: User_ID,
                    });

                return {
                    messageCode: 200,
                    message: messages.success
                };
                // });

                // return trx_result;
            } catch (e) {
                logging(context, e);
                return {
                    messageCode: 500,
                    message: 'Internal Server Error',
                }
            }
        }),
    },
};

module.exports = resolvers;
