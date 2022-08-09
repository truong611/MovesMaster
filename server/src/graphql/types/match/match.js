const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Match {
    Match_ID: Int,
    Campaign_ID: Int,
    Moves_Company_ID: Int,
    Match_Date_Created: Timestamp,

    #virtual field
    Company_Icon: String,
    Company_Name: String,
    Campaign_Icon: String,
    Campaign_Name: String
  }

  type GetListMatchByObjectIdResponse {
    ListMatch: [Match],
    Campaign: Campaign,
    IsShowButtonCreate: Boolean,
    PercentageDiscount: Float,
    messageCode: Int!,
    message: String!
  }

  # ROOT TYPE
  type Query {
    getListMatchByObjectId(Id: Int!, Type: String!): GetListMatchByObjectIdResponse,
  }
`

module.exports = typeDefs;