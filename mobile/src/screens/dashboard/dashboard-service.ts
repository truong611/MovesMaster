import gql from "graphql-tag";

export const FETCH_getDashboardMobile = gql`
    query getDashboardMobile {
        getDashboardMobile {
            message
            messageCode
            data {
                Donated_Moves,
                Amount_Donated,
                Moves_Avaiable,
                LastUpload
            }
        }
    }
`;
