import gql from 'graphql-tag';

export const FETCH_getMasterDataUploadActivity = gql`
  query getMasterDataUploadActivity {
    getMasterDataUploadActivity {
      message
      messageCode
      data {
        ActivityType {
          Activity_Type_ID
          Activity_Type_Name
          Activity_Type_Icon
          ActivityUnit {
            Activity_Unit_ID
            Activity_Unit_Name
            ActivityTypeUnit {
              Activity_Type_Unit_ID
              Activity_Type_ID
              Activity_Unit_ID
              Conversation_To_Moves_Rate
              Date_Introduced
              Date_Retired
              Limit_Minute
            }
            Activity_Type_ID
          }
        }
        LastUpload
        Upload_Count
        Upload_End_Date
        JOINING_BONUS
        Activity_Type_Entry {
          Activity_Upload_ID
          Include_YN
          Number_Units
          Conversion_Rate
          Moves_Arising
          Activity_Type_Unit_ID
          Object_Source_Type
          Object_Source_ID
          Activity_End_Time
          Activity_Start_Time
          Activity_Entry_ID
          ActivityType {
            Activity_Type_Name
          }
          Fitness_App {
            Fitness_App_Name
          }
        }
      }
    }
  }
`;

export const FETCH_uploadActivity = gql`
  mutation ActivityUploadInput($bodyData: [ActivityUploadInput], $newDate: String!, $GMT_Mobile: Float!) {
    uploadActivity(bodyData: $bodyData, newDate: $newDate, GMT_Mobile: $GMT_Mobile) {
      messageCode
      message
    }
  }
`;

export const FETCH_uploadActiviyGarmin = gql`
  mutation Mutation($GMT_Mobile: Int!) {
    updateGarminActivity(GMT_Mobile: $GMT_Mobile) {
      messageCode
      message
    }
  }
`;

export const FETCH_uploadActivityApple = gql`
mutation UpdateAppleHealthActivity($bodyData: [AppleHealthActivityInput], $GMT_Mobile: Float!) {
  updateAppleHealthActivity(bodyData: $bodyData, GMT_Mobile: $GMT_Mobile) {
    messageCode
    message
  }
}
`;

export const FETCH_getViewActivity = gql`
  query GetViewActivity($month: Int!, $year: Int!, $day: Int! ) {
    getViewActivity( month: $month, year: $year, day : $day) {
      messageCode
      message
      Activity_Entry {
        Include_YN
        Number_Units
        Moves_Arising
        Object_Source_ID
        Activity_Start_Time
        Activity_Entry_ID
        Activity_End_Time
        Upload_Count
        ActivityType {
          Activity_Type_Name
          Activity_Type_Icon
        }
        ActivityUnit {
          Activity_Unit_Name
        }
        Object_Source_Type
        Activity_Type_Unit_ID
        Activity_Upload_ID
        Conversion_Rate
        Fitness_App {
          Fitness_App_Name
          Fitness_App_Icon
        }
      }
    }
  }
`;

export const FETCH_getOverViewActivity = gql`
  query getOverviewActivity($date: Timestamp!, $type: String!) {
    getOverviewActivity(date: $date, type: $type) {
      message
      messageCode
      data
    }
  }
`;

export const FETCH_getOverViewActivityMobile = gql`
  query getOverviewActivityMobile($date: Timestamp!, $type: String!) {
    getOverviewActivityMobile(date: $date, type: $type) {
      message
      messageCode
      data{
        day
        month
        year
        activity
      }
    }
  }
`;
