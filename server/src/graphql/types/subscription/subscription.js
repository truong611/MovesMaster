const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Subscription {
    RefreshMessageCount: Boolean,
    RefreshNotificationCount: Boolean
  }
`

module.exports = typeDefs