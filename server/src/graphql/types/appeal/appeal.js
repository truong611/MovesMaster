const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Appeal {
    Appeal_ID: Int,
    Appeal_Name: String,
    Moves_Charity_ID: Int,
    Appeal_Status_ID: Int,
    Appeal_URL: String,
    Appeal_Icon: String,
    Appeal_Description: String,
    Appeal_Target_Amount: Float,
    Appeal_Start_Date: Timestamp,
    Appeal_End_Date: Timestamp,
    Create_Date: Timestamp,
    Create_By: Int,
    Last_Modify_Date: Timestamp,
    Last_Modify_By: Int,

    #Vitual Field:
    Appeal_Status_Name: String,
    Amount_Raised: Float,
    Live_Campaign: String,
    Charity_Name: String,
    Charity_icon: String,
    TotalCampaign: Int,
    Charity_URL: String
  }

  type GetDetailAppealResponse {
    Appeal: Appeal,
    isShowButtonCreateCampaign: Boolean,
    isShowButtonEdit: Boolean,
    isShowButtonPublish: Boolean,
    isShowButtonAbandon: Boolean,
    messageCode: Int!,
    message: String!
    isFavourite: Boolean,
  }

  input CreateAppealInput {
    Appeal_Name: String!,
    Appeal_URL: String,
    Appeal_Description: String,
    Appeal_Start_Date: Timestamp!,
    Appeal_End_Date: Timestamp,
    Appeal_Target_Amount: Float!,
    Moves_Charity_ID: Int!,
    Appeal_Icon_File: Upload,
  }

  type CreateAppealResponse {
    Appeal_ID: Int,
    messageCode: Int!,
    message: String!
  }

  input UpdateAppealInput {
    Appeal_ID: Int!,
    Appeal_Name: String!,
    Appeal_URL: String,
    Appeal_Description: String,
    Appeal_Start_Date: Timestamp!,
    Appeal_End_Date: Timestamp,
    Appeal_Target_Amount: Float!,
    Appeal_Icon_File: Upload,
  }

  type GetListAppealResponse {
    ListStatus: [Category],
    Total: Int,
    ListAppeal: [Appeal],
    messageCode: Int!,
    message: String!
  }

  # ROOT TYPE
  type Query {
    getDetailAppeal (Appeal_ID: Int!): GetDetailAppealResponse,
    getListAppeal: GetListAppealResponse,
  }

  type Mutation {
    createAppeal(bodyData: CreateAppealInput): CreateAppealResponse,
    updateAppeal(bodyData: UpdateAppealInput): BaseResponse,
    publishAppeal(Appeal_ID: Int!): BaseResponse,
    abandonAppeal(Appeal_ID: Int!): BaseResponse,
  }
`;

module.exports = typeDefs;
