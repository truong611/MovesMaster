import gql from "graphql-tag";

export const getListMatch = gql `
    query ListMatch($id: Int!, $type: String!) {
        getListMatchByObjectId(Id: $id, Type: $type) {
        ListMatch {
            Match_ID
            Campaign_ID
            Moves_Company_ID
            Match_Date_Created
            Company_Icon
            Company_Name
            Campaign_Icon
            Campaign_Name
            Company_URL
        }
        messageCode
        message
        }
    }
`;

export const FETCH_getListCharity = gql`
    query getListCharity($bodyData: CharityFilter!) {
        getListCharity(bodyData: $bodyData) {
            messageCode
            message
            Charity {
                Moves_Charity_ID
                Charity_Name
                Charity_icon
                Charity_Aims
                Created_Date
                Is_Active
                Charity_URL
                Appeals {
                    Appeal_ID
                    Appeal_Name
                    Appeal_Icon
                    Appeal_Description
                    Appeal_Start_Date
                }
                Campaigns {
                    Campaign_ID
                    Campaign_Name
                    Campaign_Icon
                    Appeal_Icon
                    Campaign_Price_Per_Move
                    End_Date_Target
                    Campaign_Target_Value
                    Campaign_Description
                    Campaign_Launch_Date
                }
            }
            Size {
                Category_Name
                Category_ID
            }
            CharitySector {
                Category_Name
                Category_ID
            }
        }
    }
`;

export const FETCH_getDashboardReport = gql`
    query getDashboardReport ($type: Int!, $objectId: Int){
        getDashboardReport (type: $type, objectId: $objectId) {
            TotalAppeal
            TotalCampaign
            TotalDonation
            messageCode
            message
            isFavourite
        }
    }
`;

export const FETCH_getDetailAppeal = gql`
    query getDetailAppeal($appealId: Int!) {
        getDetailAppeal(Appeal_ID: $appealId) {
            Appeal {
                Appeal_ID
                Appeal_Name
                Moves_Charity_ID
                Appeal_Status_ID
                Appeal_URL
                Appeal_Icon
                Appeal_Description
                Appeal_Target_Amount
                Appeal_Start_Date
                Appeal_End_Date
                Appeal_Status_Name
                Amount_Raised
                Charity_Name
                Charity_icon
                TotalCampaign
                Charity_URL
                Payment_Site_Url,
                Member_Payment_Site_Url
            }
            isShowButtonCreateCampaign
            isShowButtonEdit
            isShowButtonPublish
            isShowButtonAbandon
            messageCode
            message
            isFavourite
        }
    }
`;

export const FETCH_getDetailCampaign = gql`
    query Query($campaignId: Int!) {
        getDetailCampaign(Campaign_ID: $campaignId) {
            Campaign {
                Campaign_ID
                Appeal_ID
                Moves_Charity_ID
                Campaign_Name
                Campaign_Description
                Campaign_URL
                Campaign_Icon
                Campaign_Launch_Date
                Campaign_End_Date
                Campaign_Target_Value
                Campaign_Price_Per_Move
                Moves_Company_ID
                End_Date_Target
                Campaign_Status_ID
                Public_Private
                Is_Match
                Campaign_Status_Name
                Charity_Name
                Charity_icon
                Company_Name
                Appeal_Name
                Amount_Raised
                Number_Matches
                Sterling_Amount
                Progress_Donations
                Progress_Moves
                Charity_URL
            }
            ListAppeal {
                Appeal_ID
                Appeal_Name
                Moves_Charity_ID
                Appeal_Icon
                Appeal_URL
            }
            ListCompany {
                Moves_Company_ID
                Company_Name
                Company_Icon
                Company_URL
            }
            IsShowButtonEdit
            IsShowButtonPublish
            IsShowButtonApprove
            IsShowButtonDecline
            IsShowButtonCreateMatch
            messageCode
            message
            isFavourite
        }
    }
`;

export const FETCH_getListCampaignMobile = gql`
    query getListCampaignMobile($type: String!) {
        getListCampaignMobile(type: $type) {
            message
            messageCode
            Campaign {
                Campaign_ID
                Campaign_Name
                Campaign_Icon
                Campaign_Price_Per_Move
                End_Date_Target
                Campaign_Target_Value
                Amount_Raised
                Campaign_Description
                Campaign_Launch_Date
                Appeal_Icon
                Charity_icon
            }
            Appeal {
                Appeal_ID
                Appeal_Name
                Appeal_Icon
                Appeal_Description
                Appeal_Start_Date
                Charity_icon
            }
            Charity {
                Moves_Charity_ID
                Charity_Name
                Charity_icon
                Charity_Aims
                Created_Date
                Is_Active
                Charity_URL
                Payment_Site_Url,
                Member_Payment_Site_Url
            }
        }
    }
`;

export const FETCH_favouriteMobile = gql`
    mutation Mutation($id: Int!, $type: String) {
        favouriteMobile(id: $id, type: $type) {
            message
            messageCode
        }
    }
`;

export const FETCH_storeDonate = gql`
    mutation Mutation($bodyData: StoreDonateInput!, $GMT_Mobile: Int!) {
        storeDonate(bodyData: $bodyData,GMT_Mobile: $GMT_Mobile ) {
            message
            messageCode
            Donated_Moves
            Amount_Donated
            Moves_Avaiable
            Badge_Awarded {
                Badge {
                    Badge_Reason
                    Badge_ID
                    Badge_Name
                    Badge_Icon
                    Badge_Condition
                    Badge_Type
                }
                Badge_ID
                User_ID
                Badge_Awarded_Date
                Badge_Awarded_Times
            }
        }
    }
`;

export const FETCH_recommendCharity = gql`
    mutation Mutation($bodyData: RecommendCharityInput!) {
        recommendCharity(bodyData: $bodyData) {
            messageCode
            message
        }
    }
`;

export const FETCH_getListDonationMobile = gql`
    query getListDonationMobile {
        getListDonationMobile {
            message
            messageCode
            ListDonation {
                Donation_ID
                Sterling_Amount
                Amount_Donated
                Currency_ID
                Currency_Conversion_Rate
                Moves_Donated
                Moves_Conversion_Rate
                Appeal_ID
                Moves_Charity_ID
                Campaign_ID
                Created_Date
                User_ID
                Charity_Name
                Appeal_Name
                Campaign_Name
                Company_Name
            }
        }
    }
`;

export const FETCH_getDetailDonationMobile = gql`
    query getListDonationMobile($id: Int!) {
        getDetailDonationMobile(id: $id) {
            message
            messageCode
            Donation {
                Company_Name
                Campaign_Name
                Appeal_Name
                Charity_Name
                User_ID
                Created_Date
                Donation_ID
                Sterling_Amount
                Amount_Donated
                Currency_ID
                Currency_Conversion_Rate
                Moves_Donated
                Moves_Conversion_Rate
                Appeal_ID
                Moves_Charity_ID
                Campaign_ID
            }
        }
    }
`;


