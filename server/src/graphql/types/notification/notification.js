const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Notification {
    Notification_ID: Int,
    Notification_From_User_ID: Int,
    Notification_From_Charity_ID: Int,
    Notification_To_Charity_ID: Int,
    Notification_From_Company_ID: Int,
    Notification_To_Company_ID: Int,
    Content: String,
    Created_Date: Timestamp,
    Is_Seen: Boolean,
    URL: String,

    Name: String,
    Email: String
  }

  input CreateNotificationInput {
    Notification_To_Charity_ID: Int,
    Notification_To_Company_ID: Int,
    Content: String,
  }

  type GetTotalNotificationResponse {
    Total: Int,
    messageCode: Int!,
    message: String!
  }

  type GetListNotificationResponse {
    ListNotification: [Notification],
    messageCode: Int!,
    message: String!
  }

  type GetDetailNotificationResponse {
    Notification: Notification,
    messageCode: Int!,
    message: String!
  }

  type GetListAllNotification {
    ListNotification: [Notification],
    messageCode: Int!,
    message: String!
  }

  # ROOT TYPE
  type Query {
    getTotalNotification: GetTotalNotificationResponse,
    getListNotification: GetListNotificationResponse,
    getDetailNotification(Id: Int!): GetDetailNotificationResponse,
    getListAllNotification: GetListAllNotification,
  }

  type Mutation {
    createNotification(bodyData: CreateNotificationInput): BaseResponse,
    updateIsSeenNotification(Id: Int!): BaseResponse,
  }
`;

module.exports = typeDefs;