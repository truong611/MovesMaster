const {gql} = require('apollo-server-express');

const typeDefs = gql`
    type FitnessAppModel {
        Fitness_App_ID: Int,
        Fitness_App_Name: String,
        Fitness_App_Icon: String,
        Available_to_Moves_Users: Timestamp,
        Removed_from_Moves_Users: Timestamp,
    }

    type FitnessAppUsageModel {
        User_ID: Int,
        Fitness_App_ID: Int,
        FitnessApp: FitnessAppModel,
        Fitness_App_Date_Connected: Timestamp,
        Fitness_App_Access_User_ID: Int,
        Fitness_App_Access_Password: String,
        Fitness_App_Access_other_info: String,
        Fitness_App_Usage_ID: String,
        Fitness_App_Usage_Access_Token: String,
        Fitness_App_Usage_Refresh_Token: String,
        Fitness_App_Usage_Expires_At: Timestamp,
    }

    type getFitnessAppUsageResponse {
        FitnessAppUsage: [FitnessAppUsageModel],
        FitnessApp: [FitnessAppModel],
        messageCode: Int!,
        message: String!,
    }

    type removeFitnessAppUsageResponse {
        messageCode: Int!,
        message: String!,
    }

    # ROOT TYPE
    type Query {
        getFitnessAppUsage: getFitnessAppUsageResponse,
    }

    input RemoveFitnessAppUsageInput {
        Fitness_App_ID: Int!,
        isRemove: Boolean!,
        Fitness_App_Usage_ID: String,
        Fitness_App_Usage_Access_Token: String,
        Fitness_App_Usage_Refresh_Token: String,
        Fitness_App_Usage_Expires_At: Timestamp,
    }

    type Mutation {
        removeFitnessAppUsage(bodyData: RemoveFitnessAppUsageInput!): removeFitnessAppUsageResponse
    }
`;

module.exports = typeDefs;
