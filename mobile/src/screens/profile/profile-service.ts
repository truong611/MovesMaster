import gql from "graphql-tag";

export const FETCH_getProfile = gql`
    query getProfile {
        getProfile {
            user {
                User_Email
                Surname
                Forename
                User_Phone_Number
                User_Avatar
            }
            messageCode
            message
        }
    }
`;

export const FETCH_updateProfile = gql`
    mutation updateProfile($forename: String!, $surname: String!, $email: String!, $phone: String, $avatar: String, $fileName: String) {
        updateProfile(forename: $forename, surname: $surname, email: $email, phone: $phone, avatar: $avatar, fileName: $fileName) {
            message
            messageCode
            user {
                User_Email
                Surname
                Forename
                User_Phone_Number
                User_Avatar
            }
        }
    }
`;

export const FETCH_changePassword = gql`
    mutation changePassword($passwordOld: String!, $passwordNew: String) {
        changePassword(passwordOld: $passwordOld, passwordNew: $passwordNew) {
            messageCode
            message
        }
    }
`;

export const FETCH_refreshToken = gql`
    query refreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
            message
            messageCode
            user {
                token
                refreshToken
            }
        }
    }
`;
