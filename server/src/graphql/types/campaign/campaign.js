const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Campaign {
    Campaign_ID: Int,
    Appeal_ID: Int,
    Moves_Charity_ID: Int,
    Campaign_Name: String,
    Campaign_Description: String,
    Campaign_URL: String,
    Campaign_Icon: String,
    Campaign_Launch_Date: Timestamp,
    Campaign_End_Date: Timestamp,
    Campaign_Target_Value: Float,
    Campaign_Price_Per_Move: Float,
    Moves_Company_ID: Int,
    End_Date_Target: Boolean,
    Campaign_Status_ID: Int,
    Public_Private: Boolean,
    Is_Match: Boolean,
    # Currency_ID: Int,

    Campaign_Status_Name: String,
    Charity_Name: String,
    Charity_icon: String,
    Charity_URL: String,
    Company_Name: String,
    Appeal_Name: String,
    Amount_Raised: Float,
    Progress_Number: Int,
    Progress_Date: Float,
    Number_Matches: Int,
    Sterling_Amount: Float,
    Progress_Donations: Int, #total user donation
    Progress_Moves: Float, #total move donation
  }

  # type Currency {
  #   Currency_ID: Int,
  #   Currency_Name: String,
  #   Exchange_Rate: Float
  # }

  input CreateCampaignInput {
    Password: String,
    Campaign_Icon: String,
    Campaign_Icon_File: Upload,
    Campaign_Name: String!,
    Campaign_URL: String,
    Campaign_Description: String,
    Campaign_Launch_Date: Timestamp!,
    Campaign_End_Date: Timestamp,
    End_Date_Target: Boolean!,
    Campaign_Target_Value: Float!,
    Campaign_Price_Per_Move: Float!,
    Public_Private: Boolean!,
    Is_Match: Boolean!,
    Appeal_ID: Int,
    Moves_Company_ID: Int!,
    Moves_Charity_ID: Int!,
    # Currency_ID: Int,
  }

  type CreateCampaignResponse {
    Campaign_ID: Int,
    messageCode: Int!,
    message: String!
  }

  type GetMasterDataCreateCampaignResponse {
    ListAppeal: [Appeal],
    ListCompany: [Company],
    # ListCurrency: [Currency],
    messageCode: Int!,
    message: String!
  }

  type GetDetailCampaignResponse {
    Campaign: Campaign,
    ListAppeal: [Appeal],
    ListCompany: [Company],
    # ListCurrency: [Currency],
    IsShowButtonEdit: Boolean,
    IsShowButtonPublish: Boolean,
    IsShowButtonApprove: Boolean,
    IsShowButtonDecline: Boolean,
    IsShowButtonCreateMatch: Boolean,
    PercentageDiscount: Float,
    messageCode: Int!,
    message: String!
    isFavourite: Boolean,
  }

  type GetListCampaignResponse {
    ListCampaign: [Campaign],
    ListStatus: [Category],
    messageCode: Int!,
    message: String!
  }

  input UpdateCampaignInput {
    Password: String!,
    Campaign_ID: Int!,
    Campaign_Icon: String,
    Campaign_Icon_File: Upload,
    Campaign_Name: String!,
    Campaign_URL: String,
    Campaign_Description: String,
    Campaign_Launch_Date: Timestamp!,
    Campaign_End_Date: Timestamp,
    End_Date_Target: Boolean!,
    Campaign_Target_Value: Float!,
    Campaign_Price_Per_Move: Float!,
    Public_Private: Boolean!,
    Is_Match: Boolean!,
    Appeal_ID: Int,
    Moves_Company_ID: Int!,
    # Currency_ID: Int,
  }

  # ROOT TYPE
  type Query {
    getMasterDataCreateCampaign(ObjectId: Int, ObjectType: String): GetMasterDataCreateCampaignResponse,
    getDetailCampaign(Campaign_ID: Int!): GetDetailCampaignResponse,
    getListCampaign(ObjectId: Int, ObjectType: String): GetListCampaignResponse,
  }

  type Mutation {
    createCampaign(CreateCampaignInput: CreateCampaignInput): CreateCampaignResponse,
    approveCampaign(Password: String!, Id: Int!, Mode: String!): BaseResponse,
    publishCampaign(Password: String!, Id: Int!): BaseResponse,
    declineCampaign(Id: Int!): BaseResponse,
    updateCampaign(bodyData: UpdateCampaignInput): BaseResponse,
  }
`;

module.exports = typeDefs;
