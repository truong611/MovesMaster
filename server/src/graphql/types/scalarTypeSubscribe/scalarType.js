const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Timestamp
  scalar Upload
`

module.exports = typeDefs