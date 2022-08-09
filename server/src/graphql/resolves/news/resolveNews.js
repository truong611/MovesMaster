const db = require('../../../data/knex-db');
const messages = require('../../../messages/auth');
const authenticated = require('../../../middleware/authenticated-guard');
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const logging = require('../../../middleware/autologging');
const { saveFile, deleteFile, downloadFile, copyFile, convertFileName } = require('../../../common/handleFile');

const resolvers = {
    //QUERY
    Query: {
        getListNews: authenticated(async (parent, args, context) => {
            try {
                let mode = args.mode;
                let User_ID = context.currentUser.User_ID;
                let User = await db.table('User').where('User_ID', User_ID).first();
                let listNews = {
                    favourite: [],
                    all: [],
                };

                let listUserAdmin = await db.table('User')
                    .select('User_ID')
                    .where('IsAdmin', true);
                let listUserAdminId = listUserAdmin.map(x => x.User_ID);

                if (mode == 'web') {
                    listNews.all = await db.table('News_Item')
                        .where(builder => {
                            if (User.Moves_Charity_ID)
                                builder.where('Moves_Charity_ID', User.Moves_Charity_ID)

                            if (User.Moves_Company_ID)
                                builder.where('Moves_Company_ID', User.Moves_Company_ID)

                            if (User.IsAdmin)
                                builder.whereIn('Created_By', listUserAdminId)
                        })
                        .orderBy('News_Publish_Date', 'desc');
                }
                else {
                    listNews.all = await db.table('News_Item')
                        .where('News_Status_ID', 26)
                        .orderBy('News_Publish_Date', 'desc');
                }

                let Favorites = await db.table('Favorites')
                    .where('User_ID', User_ID);

                let Moves_Company_ID = [];
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
                        if (item?.Moves_Company_ID != null) {
                            Moves_Company_ID.push(item?.Moves_Company_ID)
                        }
                    })
                }

                listNews.favourite = await db.table('News_Item')
                    .where('News_Status_ID', 26)
                    .where(builder => {
                        builder.orWhereIn('Moves_Charity_ID', Moves_Charity_ID)
                        builder.orWhereIn('Appeal_ID', Appeal_ID)
                        builder.orWhereIn('Campaign_ID', Campaign_ID)
                        builder.orWhereIn('Moves_Company_ID', Moves_Company_ID)
                        builder.orderBy('News_Publish_Date', 'desc');
                    });

                let listStatus = await db.table('Category')
                    .where('Category_Type', 6);

                if (listNews.all.length) {
                    listNews.all.map(item => {
                        item.News_Image = item.News_Image ? URL_FOLDER + item.News_Image : null;
                        item.News_Url = item.News_Url ? URL_FOLDER + item.News_Url : null;
                        return item;
                    });

                    let listCharityId = listNews.all.filter(x => x.Moves_Charity_ID != null).map(x => x.Moves_Charity_ID);
                    let listAppealId = listNews.all.filter(x => x.Appeal_ID != null).map(x => x.Appeal_ID);
                    let listCompanyId = listNews.all.filter(x => x.Moves_Company_ID != null).map(x => x.Moves_Company_ID);
                    let listCreateById = listNews.all.filter(x => x.Created_By != null).map(x => x.Created_By);
                    let listCampaignId = listNews.all.filter(x => x.Campaign_ID != null).map(x => x.Campaign_ID);

                    let listCharity = await db.table('Charity')
                        .whereIn('Moves_Charity_ID', listCharityId);
                    let listAppeal = await db.table('Appeal')
                        .whereIn('Appeal_ID', listAppealId);
                    let listCompany = await db.table('Company')
                        .whereIn('Moves_Company_ID', listCompanyId);
                    let listCreateBy = await db.table('User')
                        .whereIn('User_ID', listCreateById);
                    let listCampaign = await db.table('Campaign')
                        .whereIn('Campaign_ID', listCampaignId);

                    //Lọc ra các new mà thuộc charity hoặc company có trạng thái Is_Remove_Access = true
                    let listNewsError = [];

                    listNews.all.forEach(item => {
                        let charity = listCharity.find(x => x.Moves_Charity_ID == item.Moves_Charity_ID);
                        item.Charity_Name = charity?.Charity_Name;

                        let appeal = listAppeal.find(x => x.Appeal_ID == item.Appeal_ID);
                        item.Appeal_Name = appeal?.Appeal_Name;

                        let company = listCompany.find(x => x.Moves_Company_ID == item.Moves_Company_ID);
                        item.Company_Name = company?.Company_Name;

                        let createBy = listCreateBy.find(x => x.User_ID == item.Created_By);
                        if (item.Is_Manual) item.CreateBy = createBy?.Forename + ' ' + createBy?.Surname;
                        else item.CreateBy = 'Auto';

                        let campaign = listCampaign.find(x => x.Campaign_ID == item.Campaign_ID);
                        item.Campaign_Name = campaign?.Campaign_Name;

                        let status = listStatus.find(x => x.Category_ID == item.News_Status_ID);
                        item.News_Status_Name = status?.Category_Name;

                        if (charity && charity.Is_Remove_Access == true && mode != 'web') {
                            listNewsError.push(item);
                        }
                        else if (company && company.Is_Remove_Access == true && mode != 'web') {
                            listNewsError.push(item);
                        }
                    });

                    //Lọc ra các new mà thuộc charity hoặc company có trạng thái Is_Remove_Access = true
                    if (listNewsError.length) {
                        listNews.all = listNews.all.filter(x => !listNewsError.includes(x));
                    }
                }

                if (listNews.favourite.length) {
                    let listCharityId = listNews.favourite.filter(x => x.Moves_Charity_ID != null)
                        .map(x => x.Moves_Charity_ID);
                    let listCompanyId = listNews.favourite.filter(x => x.Moves_Company_ID != null)
                        .map(x => x.Moves_Company_ID);

                    let listCharity = await db.table('Charity')
                        .whereIn('Moves_Charity_ID', listCharityId);
                    let listCompany = await db.table('Company')
                        .whereIn('Moves_Company_ID', listCompanyId);

                    listNews.favourite.map(item => {
                        item.News_Image = item.News_Image ? URL_FOLDER + item.News_Image : null;
                        item.News_Url = item.News_Url ? URL_FOLDER + item.News_Url : null;
                        return item;
                    });

                    //Lọc ra các new mà thuộc charity hoặc company có trạng thái Is_Remove_Access = true
                    let listNewsError = [];

                    listNews.favourite.forEach(item => {
                        let charity = listCharity.find(x => x.Moves_Charity_ID == item.Moves_Charity_ID);
                        item.Charity_Name = charity?.Charity_Name;

                        let company = listCompany.find(x => x.Moves_Company_ID == item.Moves_Company_ID);
                        item.Company_Name = company?.Company_Name;

                        if (charity && charity.Is_Remove_Access == true) {
                            listNewsError.push(item);
                        }
                        else if (company && company.Is_Remove_Access == true) {
                            listNewsError.push(item);
                        }
                    });

                    //Lọc ra các new mà thuộc charity hoặc company có trạng thái Is_Remove_Access = true
                    if (listNewsError.length) {
                        listNews.favourite = listNews.favourite.filter(x => !listNewsError.includes(x));
                    }
                }

                return {
                    listNews,
                    listStatus: listStatus,
                    message: messages.success,
                    messageCode: 200
                }
            } catch (e) {
                logging(context, e);
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
        getNews: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context.currentUser.User_ID;
                let news = await db.table('News_Item')
                    .where('News_Item_ID', args.id)
                    .first();

                news.News_Image = news.News_Image ? URL_FOLDER + news.News_Image : null;
                news.News_Url = news.News_Url ? URL_FOLDER + news.News_Url : null;

                return {
                    news,
                    message: messages.success,
                    messageCode: 200
                }
            } catch (err) {
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
        getMasterDataCreateNews: authenticated(async (parent, args, context) => {
            try {
                let ListCompany = await db.table('Company')
                    .where('Is_Active', true);

                let User_ID = context.currentUser.User_ID;
                let User = await db.table('User').where('User_ID', User_ID).first();

                let Charity = await db.table('Charity').where('Moves_Charity_ID', User.Moves_Charity_ID).first();

                let ListAppeal = [];
                let ListCampaign = [];

                if (User.Moves_Charity_ID) {
                    ListAppeal = await db.table('Appeal')
                        .where('Moves_Charity_ID', User.Moves_Charity_ID)
                        .where('Appeal_Status_ID', 16);

                    ListCampaign = await db.table('Campaign')
                        .where('Moves_Charity_ID', User.Moves_Charity_ID)
                        .where('Campaign_Status_ID', 23);
                }

                return {
                    Charity: Charity,
                    ListCompany: ListCompany,
                    ListAppeal: ListAppeal,
                    ListCampaign: ListCampaign,
                    message: 'OK',
                    messageCode: 200
                }
            }
            catch (e) {
                logging(context, e);
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
        getDetailNews: (async (parent, args, context) => {
            try {
                let ListCompany = await db.table('Company')
                    .where('Is_Active', true);

                let User_ID = context?.currentUser?.User_ID;
                let User = null;
                if (User_ID) {
                    User = await db.table('User').where('User_ID', User_ID).first();
                }

                let ListAppeal = [];
                let ListCampaign = [];

                if (User?.Moves_Charity_ID) {
                    ListAppeal = await db.table('Appeal')
                        .where('Moves_Charity_ID', User.Moves_Charity_ID)
                        .where('Appeal_Status_ID', 16);

                    ListCampaign = await db.table('Campaign')
                        .where('Moves_Charity_ID', User.Moves_Charity_ID)
                        .where('Campaign_Status_ID', 23);
                }

                let News = await db.table('News_Item')
                    .where('News_Item_ID', args.Id)
                    .first();

                if (!News) {
                    return {
                        message: 'News not found',
                        messageCode: 404
                    }
                }

                let newsCompany = await db.table('Company')
                    .where('Moves_Company_ID', News.Moves_Company_ID)
                    .first();

                if (newsCompany) {
                    let exists = ListCompany.find(x => x.Moves_Company_ID == newsCompany.Moves_Company_ID);

                    if (!exists) {
                        ListCompany.push(newsCompany);
                    }
                }

                let newsAppeal = await db.table('Appeal')
                    .where('Appeal_ID', News.Appeal_ID)
                    .first();

                if (newsAppeal) {
                    let exists = ListAppeal.find(x => x.Appeal_ID == newsAppeal.Appeal_ID);

                    if (!exists) {
                        ListAppeal.push(newsAppeal);
                    }
                }

                let newsCampaign = await db.table('Campaign')
                    .where('Campaign_ID', News.Campaign_ID)
                    .first();

                if (newsCampaign) {
                    let exists = ListCampaign.find(x => x.Campaign_ID == newsCampaign.Campaign_ID);

                    if (!exists) {
                        ListCampaign.push(newsCampaign);
                    }
                }

                let newsCharity = await db.table('Charity')
                    .where('Moves_Charity_ID', News.Moves_Charity_ID)
                    .first();

                let newsCreateBy = await db.table('User')
                    .where('User_ID', News.Created_By)
                    .first();

                let listStatus = await db.table('Category')
                    .where('Category_Type', 6);
                let status = listStatus.find(x => x.Category_ID == News.News_Status_ID);

                News.Charity_Name = newsCharity?.Charity_Name;
                News.Charity_URL = newsCharity?.Charity_URL;
                News.News_Image = News.News_Image ? URL_FOLDER + News.News_Image : null;
                News.CreateBy = (News.Is_Manual) ? newsCreateBy?.Forename + ' ' + newsCreateBy?.Surname : 'Auto';
                News.CreateByIsAdmin = newsCreateBy?.IsAdmin;
                News.News_Status_Name = status?.Category_Name;

                ListCompany.map(item => item.Company_Icon = item.Company_Icon ? URL_FOLDER + item.Company_Icon : null);
                ListAppeal.map(item => item.Appeal_Icon = item.Appeal_Icon ? URL_FOLDER + item.Appeal_Icon : null);
                ListCampaign.map(item => item.Campaign_Icon = item.Campaign_Icon ? URL_FOLDER + item.Campaign_Icon : null);

                return {
                    News: News,
                    ListCompany: ListCompany,
                    ListAppeal: ListAppeal,
                    ListCampaign: ListCampaign,
                    message: 'OK',
                    messageCode: 200
                }
            }
            catch (e) {
                logging(context, e);
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
        getListNewsForHomePage: (async (parent, args, context) => {
            try {
                let totalRecords = 0;
                let textSearch = args.textSearch?.trim();
                let pageIndex = args.pageIndex || 1;
                let perPage = args.perPage || 20;
                let offset = (pageIndex - 1) * perPage;

                let listNews = await db.table('News_Item')
                    .where(builder => {
                        builder.where('News_Status_ID', 26);

                        if (textSearch) {
                            builder.where('News_Title', 'ilike', '%' + textSearch + '%');
                            builder.orWhere('News_Content', 'ilike', '%' + textSearch + '%');
                        }
                    })
                    .offset(offset)
                    .limit(perPage)
                    .orderBy('News_Publish_Date', 'desc');

                if (listNews.length) {
                    let listStatus = await db.table('Category')
                        .where('Category_Type', 6)

                    listNews.map(item => {
                        item.News_Image = item.News_Image ? URL_FOLDER + item.News_Image : null;
                        item.News_Url = item.News_Url ? URL_FOLDER + item.News_Url : null;
                        return item;
                    });

                    let listCharityId = listNews.filter(x => x.Moves_Charity_ID != null).map(x => x.Moves_Charity_ID);
                    let listAppealId = listNews.filter(x => x.Appeal_ID != null).map(x => x.Appeal_ID);
                    let listCompanyId = listNews.filter(x => x.Moves_Company_ID != null).map(x => x.Moves_Company_ID);
                    let listCreateById = listNews.filter(x => x.Created_By != null).map(x => x.Created_By);
                    let listCampaignId = listNews.filter(x => x.Campaign_ID != null).map(x => x.Campaign_ID);

                    let listCharity = await db.table('Charity')
                        .whereIn('Moves_Charity_ID', listCharityId);
                    let listAppeal = await db.table('Appeal')
                        .whereIn('Appeal_ID', listAppealId);
                    let listCompany = await db.table('Company')
                        .whereIn('Moves_Company_ID', listCompanyId);
                    let listCreateBy = await db.table('User')
                        .whereIn('User_ID', listCreateById);
                    let listCampaign = await db.table('Campaign')
                        .whereIn('Campaign_ID', listCampaignId);

                    //Lọc ra các new mà thuộc charity hoặc company có trạng thái Is_Remove_Access = true
                    let listNewsError = [];

                    listNews.forEach(item => {
                        let charity = listCharity.find(x => x.Moves_Charity_ID == item.Moves_Charity_ID);
                        item.Charity_Name = charity?.Charity_Name;

                        let appeal = listAppeal.find(x => x.Appeal_ID == item.Appeal_ID);
                        item.Appeal_Name = appeal?.Appeal_Name;

                        let company = listCompany.find(x => x.Moves_Company_ID == item.Moves_Company_ID);
                        item.Company_Name = company?.Company_Name;

                        let createBy = listCreateBy.find(x => x.User_ID == item.Created_By);
                        if (item.Is_Manual) item.CreateBy = createBy?.User_Email;
                        else item.CreateBy = 'Auto';

                        let campaign = listCampaign.find(x => x.Campaign_ID == item.Campaign_ID);
                        item.Campaign_Name = campaign?.Campaign_Name;

                        let status = listStatus.find(x => x.Category_ID == item.News_Status_ID);
                        item.News_Status_Name = status?.Category_Name;

                        if (charity && charity.Is_Remove_Access == true) {
                            listNewsError.push(item);
                        }
                        else if (company && company.Is_Remove_Access == true) {
                            listNewsError.push(item);
                        }
                    });

                    //Lọc ra các new mà thuộc charity hoặc company có trạng thái Is_Remove_Access = true
                    if (listNewsError.length) {
                        listNews = listNews.filter(x => !listNewsError.includes(x));
                    }
                }

                totalRecords = listNews.length;

                return {
                    listNews: listNews,
                    totalRecords: totalRecords,
                    message: 'OK',
                    messageCode: 200
                }
            }
            catch (e) {
                logging(context, e);
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
    },
    NewsModel: {
        News_Item_Author: async (parent, args, context) => {
            return await db.table('User')
                .where('User_ID', parent.News_Item_Author_ID)
                .first()
        },
    },
    Mutation: {
        createNews: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context.currentUser.User_ID;
                let User = await db.table('User').where('User_ID', User_ID).first();
                let bodyData = args.bodyData;

                let trx_result = await db.transaction(async trx => {
                    let newsResult = await trx.table('News_Item')
                        .returning(['News_Item_ID'])
                        .insert({
                            News_Title: bodyData.News_Title,
                            News_Content: bodyData.News_Content,
                            News_Url: bodyData.News_Url,
                            Campaign_ID: bodyData.Campaign_ID,
                            Appeal_ID: bodyData.Appeal_ID,
                            Moves_Company_ID: bodyData.Moves_Company_ID,
                            News_Item_Author_ID: User_ID,
                            Moves_Charity_ID: User.Moves_Charity_ID,
                            News_Status_ID: 25, //Pending
                            Is_Manual: true,
                            Created_By: User_ID
                        });

                    let News_Item_ID = newsResult[0].News_Item_ID;

                    //Upload image
                    let url_icon = null;
                    let file = bodyData.News_Image_File;
                    if (file) {
                        let { filename, mimetype, createReadStream } = await file;

                        //Save url to db
                        let _fileNameIndex = filename.lastIndexOf('.');
                        let _fileName = filename.substring(0, _fileNameIndex) + News_Item_ID;
                        let _fileType = filename.substring(_fileNameIndex);
                        url_icon = '/news/' + _fileName + _fileType;
                        await trx.table('News_Item')
                            .where('News_Item_ID', News_Item_ID)
                            .update({
                                News_Image: url_icon,
                            });

                        //save file to directory
                        await saveFile([file], 'news', _fileName + _fileType);
                    }

                    return {
                        Id: News_Item_ID,
                        message: 'Create news success',
                        messageCode: 200
                    }
                });

                return trx_result;
            }
            catch (e) {
                logging(context, e);
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
        updateNews: authenticated(async (parent, args, context) => {
            try {
                let trx_result = await db.transaction(async trx => {
                    let User_ID = context.currentUser.User_ID;
                    let User = await db.table('User').where('User_ID', User_ID).first();
                    let News_Item_ID = args.Id;
                    let bodyData = args.bodyData;

                    let news = await trx.table('News_Item')
                        .where('News_Item_ID', News_Item_ID)
                        .first();

                    if (!news) {
                        return {
                            message: 'News not found',
                            messageCode: 404
                        }
                    }

                    await trx.table('News_Item')
                        .where('News_Item_ID', News_Item_ID)
                        .update({
                            News_Title: bodyData.News_Title,
                            News_Content: bodyData.News_Content,
                            News_Url: bodyData.News_Url,
                            Campaign_ID: bodyData.Campaign_ID,
                            Appeal_ID: bodyData.Appeal_ID,
                            Moves_Company_ID: bodyData.Moves_Company_ID,
                            News_Status_ID: 25, //Pending
                            Last_Modify_Date: new Date,
                            Last_Modify_By: User_ID
                        });

                    //Upload image
                    let url_icon = null;
                    let file = bodyData.News_Image_File;
                    if (file) {
                        let { filename, mimetype, createReadStream } = await file;

                        //Save url to db
                        let _fileNameIndex = filename.lastIndexOf('.');
                        let _fileName = filename.substring(0, _fileNameIndex) + News_Item_ID;
                        let _fileType = filename.substring(_fileNameIndex);
                        url_icon = '/news/' + _fileName + _fileType;
                        await trx.table('News_Item')
                            .where('News_Item_ID', News_Item_ID)
                            .update({
                                News_Image: url_icon,
                            });

                        //save file to directory
                        await saveFile([file], 'news', _fileName + _fileType);
                    }

                    return {
                        Id: News_Item_ID,
                        message: 'Update news success',
                        messageCode: 200
                    }
                });

                return trx_result;
            }
            catch (e) {
                logging(context, e);
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
        updateStatusNews: authenticated(async (parent, args, context) => {
            try {
                let trx_result = await db.transaction(async trx => {
                    let User_ID = context.currentUser.User_ID;

                    let news = await trx.table('News_Item')
                        .where('News_Item_ID', args.Id)
                        .first();

                    if (!news) {
                        return {
                            message: 'News not found',
                            messageCode: 404
                        }
                    }

                    //nếu News chuyển trạng thái sang Live thì update trường News_Publish_Date
                    let News_Publish_Date = (args.News_Status_ID == 26) ? new Date() : news.News_Publish_Date;

                    //update status
                    await trx.table('News_Item')
                        .where('News_Item_ID', args.Id)
                        .update({
                            News_Status_ID: args.News_Status_ID,
                            News_Publish_Date: News_Publish_Date
                        })

                    return {
                        messageCode: 200,
                        message: 'Update news success'
                    }
                });

                return trx_result;
            }
            catch (e) {
                logging(context, e);
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
    }
};

module.exports = resolvers;
