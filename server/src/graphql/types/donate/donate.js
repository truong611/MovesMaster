const {gql} = require('apollo-server-express');

const typeDefs = gql`
    type Donation {
        Donation_ID: Int,
        Sterling_Amount: Float,
        Amount_Donated: Float,
        Currency_ID: Int,
        Currency_Conversion_Rate: Float,
        Moves_Donated: Float,
        Moves_Conversion_Rate: Float,
        Appeal_ID: Int,
        Moves_Charity_ID: Int,
        Campaign_ID: Int,
        Created_Date: Timestamp,
        User_ID: Int,

        #virtual field
        Charity_Name: String,
        Appeal_Name: String,
        Campaign_Name: String,
        Company_Name: String
    }

    type GetListCharityResponse {
        Charity: [Charity],
        Size: [Category],
        CharitySector: [Category],
        messageCode: Int!,
        message: String!
    }
    
    type GetListCampaignMobileResponse {
        Charity: [Charity],
        Appeal: [Appeal],
        Campaign: [Campaign],
        messageCode: Int!,
        message: String!
    }   
    
    type GetFavouriteMobileResponse {
        messageCode: Int!,
        message: String!
    } 
    
    type GetStoreDonateResponse {
        messageCode: Int!,
        message: String!,
        Donated_Moves: Float,
        Amount_Donated: Float,
        Moves_Avaiable: Float,
        Badge_Awarded: [BadgeAwarded]
    } 
    
    type GetRecommendCharityResponse {
        messageCode: Int!,
        message: String!,
    }

    input CharityFilter {
        Keyword: String,
        Geographic: String,
        Size: [Int],
        CharitySector: [Int],
    }

    input StoreDonateInput {
        Sterling_Amount: Float,
        Amount_Donated: Float,
        Moves_Donated: Float,
        Moves_Conversion_Rate: Float,
        Appeal_ID: Int,
        Moves_Charity_ID: Int,
        Campaign_ID: Int,
        type: String
    } 
    
    input RecommendCharityInput {
        Charity_Name: String!,
        Charity_Email: String!,
    }

    type GetMasterDataListDonationResponse {
        ListAppeal: [Appeal],
        ListCampaign: [Campaign],
        messageCode: Int!,
        message: String!
    }

    input GetListDonationInput {
        objectId: Int!, 
        objectType: String!,
        startDate: Timestamp,
        endDate: Timestamp,
        listAppealId: [Int],
        listCampaignId: [Int],
        type: Int
    }

    type GetListDonationResponse {
        TotalDonation: Float,
        ListDonation: [Donation],
        messageCode: Int!,
        message: String!
    }
    
    type GetListDonationMobileResponse {
        ListDonation: [Donation],
        messageCode: Int!,
        message: String!
    }
    
    type GetDetailDonationMobileResponse {
        Donation: Donation,
        messageCode: Int!,
        message: String!
    }

    # ROOT TYPE
    type Query {
        getListCharity (bodyData: CharityFilter!): GetListCharityResponse,
        getListCampaignMobile (type: String!): GetListCampaignMobileResponse,
        getMasterDataListDonation(objectId: Int!, objectType: String!): GetMasterDataListDonationResponse,
        getListDonation(bodyData: GetListDonationInput): GetListDonationResponse,
        getListDonationMobile: GetListDonationMobileResponse,
        getDetailDonationMobile(id : Int!): GetDetailDonationMobileResponse,
    }

    type Mutation {
        favouriteMobile(id: Int!, type: String): GetFavouriteMobileResponse,
        storeDonate(bodyData: StoreDonateInput!): GetStoreDonateResponse,
        recommendCharity(bodyData: RecommendCharityInput!): GetRecommendCharityResponse
    }

`;
module.exports = typeDefs;
