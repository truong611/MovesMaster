const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type BaseResponse {
    messageCode: Int!
    message: String
  }
`;

module.exports = typeDefs;