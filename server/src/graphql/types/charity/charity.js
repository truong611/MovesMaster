const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Charity {
    Moves_Charity_ID: Int,
    Charity_Name: String,
    Charity_Commission_No: String,
    Contact_Name: String,
    Contact_Email: String,
    Contact_Phone_Number: String,
    Charity_URL: String,
    Charity_Aims: String,
    Charity_icon: String,
    Charity_Geographical_Scope: Int,
    Charity_Income_Band_ID: Int,
    Charity_Date_Founded: Timestamp,
    Is_Active: Boolean,
    Date_Active: Timestamp,
    Is_Deleted: Boolean,
    Created_Date: Timestamp,
    Last_Modified_Date: Timestamp,
    Created_By: Int,
    Last_Modified_By: Int,
    Is_Remove_Privileges: Boolean,
    Is_Remove_Access: Boolean,
    Charity_Type: Int,
    Address_For_Invoice: String,
    Payment_Site_Url: String,
    Account_Name: String,
    Account_No: String,
    Sort_Code: String,
    Member_Payment_Site_Url: String,
    Member_Account_Name: String,
    Member_Account_No: String,
    Member_Sort_Code: String,
    Renewal_Date: Timestamp,

    #Virtual Field:
    Charity_Geographical_Scope_Name: String,
    Charity_Income_Band_Name: String,
    Charity_Sector: String, #Sector 1, Sector 2, Sector 3,...
    List_Charity_Sector_ID: [Int],
    Appeals: [Appeal],
    Campaigns: [Campaign],
  }

  type ActionHistory {
    Id: Int,
    Object_Id: Int,
    Object_Type: String,
    Action: String,
    Action_Date: Timestamp,
    By: Int,
    Surname: String,
    Forename: String,
  }

  input CharityUserInput {
    Charity_Name: String,
    Charity_Commission_No: String,
    Contact_Name: String,
    Contact_Email: String,
    Contact_Phone_Number: String,
  }

  type GetDetailCharityResponse {
    Charity: Charity,
    messageCode: Int!,
    message: String!
  }  

  type GetListCharityNotActiveResponse {
    ListCharity: [Charity],
    messageCode: Int!,
    message: String!
  }

  type GetListCharityInvitationResponse {
    ListCharity: [Charity],
    messageCode: Int!,
    message: String!
  }

  type CheckExistsEmailByCharityEmailResponse {
    IsExists: Boolean,
    Contact_Name: String,
    Contact_Phone_Number: String,
    Contact_Email: String,
    messageCode: Int!,
    message: String!
  }

  type CheckCharityInforResponse {
    Url: String,
    messageCode: Int!,
    message: String!
  }
  
  # ROOT TYPE
  type Query {
    getDetailCharity (Id: Int!): GetDetailCharityResponse,
    getListCharityNotActive: GetListCharityNotActiveResponse,
    checkCharityInfor(Id: Int!, Mode: String!): CheckCharityInforResponse,
    getListCharityInvitation: GetListCharityInvitationResponse,
    charityInvitation(Id: Int!): BaseResponse,
    checkExistsEmailByCharityEmail(Contact_Email: String!): CheckExistsEmailByCharityEmailResponse
  }

  type Mutation {
    createCharity(bodyData: CharityUserInput!) : BaseResponse,
    approveCharity(Id: Int!): BaseResponse,
    denyCharity(Id: Int!): BaseResponse,
  }
`;
module.exports = typeDefs;
