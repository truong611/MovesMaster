const {gql} = require('apollo-server-express');

const typeDefs = gql`
    type NewsModel {
        News_Item_ID: ID,
        News_Item_Author_ID: Int,
        News_Item_Author: User,
        News_Image: String,
        News_Title: String,
        News_Content: String,
        News_Url: String,
        Campaign_ID: Int,
        Appeal_ID: Int,
        Moves_Charity_ID: Int,
        Moves_Company_ID: Int,
        News_Status_ID: Int,
        Is_Active: Boolean,
        News_Publish_Date: Timestamp,
        Created_By: Int,
        Created_Date: Timestamp,

        Is_Manual: Boolean,
        Charity_Name: String,
        Charity_URL: String,
        Appeal_Name: String,
        Company_Name: String,
        Campaign_Name: String,
        CreateBy: String,
        News_Status_Name: String,
        CreateByIsAdmin: Boolean,
    }

    type ListNewsModel {
        favourite: [NewsModel],
        all: [NewsModel],
    }

    type ResponseGetListNews {
        listNews: ListNewsModel,
        listStatus: [Category],
        messageCode: Int!,
        message: String!,
    } 
    
    type ResponseGetNews {
        news: NewsModel,
        messageCode: Int!,
        message: String!,
    }

    input CreateNewsInput {
        News_Image_File: Upload,
        News_Title: String,
        News_Content: String,
        News_Url: String,
        Campaign_ID: Int,
        Appeal_ID: Int,
        Moves_Company_ID: Int,
    }

    type CreateNewsResponse {
        Id: Int!,
        messageCode: Int!,
        message: String!,
    }

    type GetMasterDataCreateNewsResponse {
        Charity: Charity,
        ListCompany: [Company],
        ListAppeal: [Appeal],
        ListCampaign: [Campaign],
        messageCode: Int!,
        message: String!,
    }

    type GetDetailNewsResponse {
        News: NewsModel,
        ListCompany: [Company],
        ListAppeal: [Appeal],
        ListCampaign: [Campaign],
        messageCode: Int!,
        message: String!,
    }

    type GetListNewsForHomePageResponse {
        listNews: [NewsModel],
        totalRecords: Int,
        messageCode: Int!,
        message: String!,
    }

    # ROOT TYPE
    type Query {
        getListNews(mode: String): ResponseGetListNews,
        getNews(id: Int!): ResponseGetNews,
        getMasterDataCreateNews: GetMasterDataCreateNewsResponse,
        getDetailNews(Id: Int!): GetDetailNewsResponse,
        getListNewsForHomePage(pageIndex: Int, perPage: Int, textSearch: String): GetListNewsForHomePageResponse,
    }

    type Mutation {
        createNews(bodyData: CreateNewsInput): CreateNewsResponse,
        updateNews(Id: Int!, bodyData: CreateNewsInput): BaseResponse,
        updateStatusNews(Id: Int!, News_Status_ID: Int!): BaseResponse,
    }
`;

module.exports = typeDefs;
