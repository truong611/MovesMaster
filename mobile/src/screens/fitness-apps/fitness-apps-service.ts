import gql from "graphql-tag";

export const FETCH_getFitnessAppUsage = gql`
    query Query {
        getFitnessAppUsage {
            message
            messageCode
            FitnessApp {
                Fitness_App_ID
                Fitness_App_Name
                Fitness_App_Icon
                Available_to_Moves_Users
                Removed_from_Moves_Users
            }
            FitnessAppUsage {
                User_ID
                Fitness_App_ID
                Fitness_App_Date_Connected
                Fitness_App_Access_User_ID
                Fitness_App_Access_Password
                Fitness_App_Access_other_info
                FitnessApp {
                    Fitness_App_ID
                    Fitness_App_Name
                    Fitness_App_Icon
                    Available_to_Moves_Users
                    Removed_from_Moves_Users
                }
                Fitness_App_Usage_ID
                Fitness_App_Usage_Access_Token
                Fitness_App_Usage_Refresh_Token
                Fitness_App_Usage_Expires_At
            }
        }
    }
`;

export const FETCH_removeFitnessAppUsage = gql`
    mutation Mutation($bodyData: RemoveFitnessAppUsageInput!) {
        removeFitnessAppUsage(bodyData: $bodyData) {
            messageCode
            message
        }
    }
`;
