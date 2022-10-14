const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Company {
    Moves_Company_ID: Int,
    Company_Name: String,
    Company_Number: String,
    Company_URL: String,
    Company_Icon: String,
    Company_CSR_Statement: String,
    Contact_Name: String,
    Contact_Forename: String,
    Contact_Surname: String,
    Contact_Email: String,
    Contact_Phone_Number: String,
    Is_Active: Boolean,
    Date_Active: Timestamp,
    Is_Remove_Privileges: Boolean,
    Is_Remove_Access: Boolean,
    Created_Date: Timestamp,

    #virtual field
    CharityInfor: CharityInfor
  }

  type CharityInfor {
    Charity_Name: String,
    Charity_Commission_No: String,
    Contact_Name: String,
    Contact_Phone_Number: String,
    Contact_Email: String,
  }

  input CreateCompanyInput {
    Company_Name: String,
    Company_Number: String,
    Contact_Forename: String,
    Contact_Surname: String,
    Contact_Email: String,
    Contact_Phone_Number: String,
  }

  type CreateCompanyResponse {
    messageCode: Int!,
    message: String!,
  }

  type GetListCompanyNotActiveResponse {
    ListCompany: [Company],
    messageCode: Int!,
    message: String!,
  }

  # ROOT TYPE
  type Query {
    getListCompanyNotActive: GetListCompanyNotActiveResponse
  }

  type Mutation {
    createCompany(CreateCompanyInput: CreateCompanyInput): CreateCompanyResponse,
    approveCompany(Id: Int!): BaseResponse,
    denyCompany(Id: Int!): BaseResponse,
  }
`;

module.exports = typeDefs;