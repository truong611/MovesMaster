const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type New {
    News_Item_ID: Int,
    News_Image: String,
    News_Title: String,
    News_Content: String,
  }

  type Category {
    Category_ID: Int,
    Category_Name: String
  }

  type GetDashboardProfileResponse {
    Charity: Charity,
    Company: Company,
    List_Geographical_Scope: [Category],
    List_Income_Band: [Category],
    List_Sector: [Category],
    List_Action_History: [ActionHistory],
    TotalCharityNotActive: Int,
    TotalCompanyNotActive: Int,
    TotalCharityInvitation: Int,
    messageCode: Int!,
    message: String!,
  }

  type GetDashboardAccountInfoResponse {
    Role: String,
    User_Id: Int,
    Surname: String,
    Forename: String,
    User_Email: String,
    messageCode: Int!,
    message: String!,
  }

  type GetDashboardNewsResponse {
    ListNew: [New],
    messageCode: Int!,
    message: String!,
  }

  type GetDashboardReportResponse {
    TotalAppeal: Int,
    TotalCampaign: Int,
    TotalDonation: Float,
    TotalCharityActive: Int,
    TotalCompanyActive: Int,
    TotalMove: Float,
    TotalMatchOfCompany: Int,
    isFavourite: Boolean,
    messageCode: Int!,
    message: String!,
  }

  input UpdateDashboardCharityInput {
    Charity_URL: String,
    Contact_Forename: String,
    Contact_Surname: String,
    Contact_Email: String,
    Contact_Phone_Number: String,
    Charity_Date_Founded: Timestamp,
    Charity_Aims: String,
    Charity_icon_file: Upload,
    Charity_Geographical_Scope: Int,
    Charity_Income_Band_ID: Int,
    ListCategoryId: [Int],
    Address_For_Invoice: String,
    Payment_Site_Url: String,
    Account_Name: String,
    Account_No: String,
    Sort_Code: String,
    Member_Payment_Site_Url: String,
    Member_Account_Name: String,
    Member_Account_No: String,
    Member_Sort_Code: String
  }

  input UpdateDashboardCompanyInput {
    Company_Icon_File: Upload,
    Company_URL: String,
    Contact_Forename: String,
    Contact_Surname: String,
    Contact_Email: String,
    Contact_Phone_Number: String,
    Company_CSR_Statement: String,
  }
  
  type GetDashboardMobileDataResponse {
    Donated_Moves: Float,
    Amount_Donated: Float,
    Moves_Avaiable: Float,
    LastUpload: Timestamp,
  }
  
  type GetDashboardMobileResponse {
    data: GetDashboardMobileDataResponse,
    messageCode: Int!,
    message: String!,
  }

  type GetDirectoryResponse {
    ListCharity: [Charity],
    ListCompany: [Company],
    ListIncomeBand: [Category],
    ListGeographicScope: [Category],
    ListCharitySector: [Category],
    messageCode: Int!,
    message: String!,
  }

  # ROOT TYPE
  type Query {
    getDashboardProfile(type: Int!, objectId: Int): GetDashboardProfileResponse,
    getDashboardAccountInfo(type: Int!, objectId: Int): GetDashboardAccountInfoResponse,
    getDashboardNews(type: Int!, objectId: Int): GetDashboardNewsResponse,
    getDashboardReport(type: Int!, objectId: Int): GetDashboardReportResponse,
    getDashboardMobile: GetDashboardMobileResponse,
    getDirectory: GetDirectoryResponse,
  }

  type Mutation {
    updateDashboardCharity(UpdateDashboardCharityInput: UpdateDashboardCharityInput): BaseResponse,
    updateDashboardCompany(UpdateDashboardCompanyInput: UpdateDashboardCompanyInput): BaseResponse,
    updateRemovePrivileges(type: Int!, objectId: Int!): BaseResponse,
    updateRemoveAccess(type: Int!, objectId: Int!): BaseResponse,
  }
`;

module.exports = typeDefs;
