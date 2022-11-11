import { formatDate } from ".";
import {API_URL, WEB_URL} from "../config";

export const login = (email, password, successCb, errorCb, isActiveMobile) => {
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            query: `query Query($email: String!, $password: String!, $type: String, $isActiveMobile: Boolean!) {
                      login(email: $email, password: $password, type: $type, isActiveMobile: $isActiveMobile) {
                        user {
                          token
                          refreshToken
                          User_ID
                          User_Email
                          Surname
                          Forename
                          User_Phone_Number
                          User_Avatar
                          IsAdmin
                          Is_Deleted
                          Moves_Company_ID
                          tokenExpiration
                          Type
                          Charity_Name
                          Moves_Charity_ID
                          Company_Name
                          Created_Date
                          Is_Mobile_App_User
                          Is_Web_App_User
                        }
                        messageCode
                        message
                        isExistsWeb
                      }
                    }`,
            variables: {
                'email': email,
                'password': password,
                "type": "mobile",
                "isActiveMobile": isActiveMobile
            },
        }),
    })
        .then(async (data) => {
            let response = await data.json();
            if (response?.data?.login?.messageCode == 200) {
                successCb(response?.data?.login)
            } else {
                errorCb({
                    title: 'Error',
                    message: response?.data?.login?.message,
                    isExistsWeb: response?.data?.login?.isExistsWeb
                });
            }
        })
        .catch(err => {
            errorCb({
                title: 'Unexpected',
                message: 'Please try again',
            });

        });
};

export const signup = (forename, surname, email, phone, password, successCb, errorCb) => {
    let createDate = formatDate(new Date(), "YYYY/MM/DD-hh:mm:ss")
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            query: `mutation Mutation($forename: String!, $surname: String!, $email: String!, $phone: String, $password: String!, $createDate: String!) {
                          register(forename: $forename, surname: $surname, email: $email, phone: $phone, password: $password, createDate: $createDate ) {
                            user {
                              User_ID
                              User_Email
                              Surname
                              Forename
                              User_Phone_Number
                              IsAdmin
                              User_Avatar
                              Is_Deleted
                              Moves_Company_ID
                              Moves_Charity_ID
                              Type
                              token
                              refreshToken
                              tokenExpiration
                              Company_Name
                              Charity_Name
                            }
                            message
                            messageCode
                          }
                        }`,
            variables: {
                forename,
                surname,
                email,
                password,
                phone,
                createDate
            },
        }),
    })
        .then(async (data) => {
            let response = await data.json();
            if (response?.data?.register?.messageCode == 200) {
                successCb(response?.data?.register);
            } else {
                errorCb({
                    title: 'Error',
                    message: response?.data?.register?.message,
                });
            }
        })
        .catch(err => {
            errorCb({
                title: 'Unexpected',
                message: 'Please try again',
            });
        });
};

export const forgotPassword = (email, successCb, errorCb) => {
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            query: `mutation Mutation($email: String!, $url: String, $type: String) {
                      signResetPassWord(Email: $email, url: $url, type: $type) {
                        messageCode
                        message
                      }
                    }`,
            variables: {
                email,
                url: WEB_URL + '/reset-password',
                type: 'mobile'
            },
        }),
    })
        .then(async (data) => {
            let response = await data.json();
            if (response?.data?.signResetPassWord?.messageCode == 200) {
                successCb(response?.data?.signResetPassWord);
            } else {
                errorCb({
                    title: 'Error',
                    message: response?.data?.signResetPassWord?.message,
                });
            }
        })
        .catch(err => {
            errorCb({
                title: 'Unexpected',
                message: 'Please try again',
            });
        });
};

export const getSystemParameter = (key, successCb, errorCb) => {
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            query: `query getSystemParameter($key: String!) {
                      getSystemParameter(key: $key) {
                        messageCode
                        message
                        SystemParameter {
                          Id
                          Key
                          KeyName
                          Value
                          BoolValue
                        }
                      }
                    }`,
            variables: {
                key,
            },
        }),
    })
        .then(async (data) => {
            let response = await data.json();
            if (response?.data?.getSystemParameter?.messageCode == 200) {
                successCb(response?.data?.getSystemParameter);
            } else {
                errorCb({
                    title: 'Error',
                    message: response?.data?.getSystemParameter?.message,
                });
            }
        })
        .catch(err => {
            errorCb({
                title: 'Unexpected',
                message: 'Please try again',
            });
        });
};

let logout;
export const setLogout = (l) => {
    logout = l;
};
export {logout};
