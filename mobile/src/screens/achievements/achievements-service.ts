import gql from "graphql-tag";

export const FETCH_getBadgeAwarded = gql`
    query Query {
        getBadgeAwarded {
            message
            messageCode
            BadgeAwarded {
                Badge_ID
                Badge {
                    Badge_ID
                    Badge_Name
                    Badge_Reason
                    Badge_Icon
                    Badge_Condition
                    Badge_Type
                }
                User_ID
                Badge_Awarded_Date
                Badge_Awarded_Times
            }
            Badge {
                Badge_ID
                Badge_Name
                Badge_Reason
                Badge_Icon
                Badge_Condition
                Badge_Type
            }
        }
    }
`;
