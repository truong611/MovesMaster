const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type ActivityTypeUnit {
        Activity_Type_Unit_ID: ID,
        Activity_Type_ID: Int,
        Activity_Unit_ID: Int,
        Conversation_To_Moves_Rate: Float,
        Date_Introduced: Timestamp,
        Date_Retired: Timestamp,
    }

    type Fitness_App_Activities {
        Fitness_App_Activities_ID: Int,
        Fitness_App_Distance: Float,
        Fitness_App_Moving_Time: Float,
        Fitness_App_Type: String,
        User_ID: Int,
        Fitness_App_Activities_Usage_ID: String,
        Fitness_App_Activities_Object_ID: String,
        Fitness_App_Activities_Apply_Moves: Boolean,
        Fitness_App_Activities_Start_Date: Timestamp,
        Fitness_App_Activities_Start_Date_Local: Timestamp
    }

    type Activity_Type_Entry {
        Activity_Entry_ID: Int,
        Activity_Start_Time: Timestamp,
        Activity_End_Time: Timestamp,
        Object_Source_ID: Int,
        Object_Source_Type: Int,
        Activity_Type_Unit_ID: Int,
        Moves_Arising: Float,
        Conversion_Rate: Float,
        Number_Units: Float,
        Include_YN: Boolean,
        Activity_Upload_ID: Int,

        ActivityType: ActivityType,
        ActivityUnit: ActivityUnit,
        Fitness_App: FitnessAppModel,
    }

    type ActivityType {
        Activity_Type_ID: ID,
        Activity_Type_Name: String,
        Activity_Type_Icon: String,
        ActivityUnit: [ActivityUnit]
    }

    type ActivityUnit {
        Activity_Unit_ID: ID,
        Activity_Unit_Name: String,
        Activity_Type_ID: Int,
        ActivityTypeUnit: ActivityTypeUnit
    }

    type ResponseActivityType {
        ActivityType: [ActivityType],
        LastUpload: Timestamp,
        Activity_Type_Entry: [Activity_Type_Entry]
    }

    input ActivityUploadInput {
        Activity_Start_Time: Timestamp!,
        Activity_End_Time: Timestamp!,
        Activity_Type_Unit_ID: Int,
        Number_Units: Float,
    }

    type ResponseGetMasterUploadActivity {
        data: ResponseActivityType,
        messageCode: Int!,
        message: String!,
    } 
    
    type ResponseGetViewActivity {
        Activity_Entry: [Activity_Type_Entry],
        messageCode: Int!,
        message: String!,
    }  
    
    type ResponseGetOverviewActivity {
        data: String,
        messageCode: Int!,
        message: String!,
    }
    
    type ResponseUploadActivity {
        messageCode: Int!,
        message: String!,
    }

    # ROOT TYPE
    type Query {
        getMasterDataUploadActivity: ResponseGetMasterUploadActivity,
        getViewActivity(date: Timestamp!): ResponseGetViewActivity,
        getOverviewActivity(date: Timestamp!, type: String!): ResponseGetOverviewActivity,
    }

     type Mutation{
        uploadActivity(bodyData: [ActivityUploadInput]): ResponseUploadActivity
     }
`;

module.exports = typeDefs;
