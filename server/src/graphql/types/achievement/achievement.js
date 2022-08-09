const {gql} = require('apollo-server-express');

const typeDefs = gql`
    type Badge {
        Badge_ID: ID,
        Badge_Name: String,
        Badge_Reason: String,
        Badge_Icon: String,
        Badge_Condition: Float,
        Badge_Type: Int,
    }

    type BadgeAwarded {
        Badge_ID: Int,
        Badge: Badge,
        User_ID: Int,
        Badge_Awarded_Date: Timestamp,
        Badge_Awarded_Times: Int,
    }

    type GetBadgeAwardedResponse {
        BadgeAwarded: [BadgeAwarded],
        Badge: [Badge],
        messageCode: Int!,
        message: String!
    }

    # ROOT TYPE
    type Query {
        getBadgeAwarded: GetBadgeAwardedResponse,
    }

    # type Mutation {}

`;
module.exports = typeDefs;
