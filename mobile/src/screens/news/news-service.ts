import gql from "graphql-tag";

export const FETCH_getListNews = gql`
    query getListNews {
        getListNews {
            message
            messageCode
            listNews {
                favourite {
                    News_Item_ID
                    News_Image
                    News_Title
                    News_Content
                }
                all {
                    News_Item_ID
                    News_Image
                    News_Title
                    News_Content
                }
            }
        }
    }
`;

export const FETCH_getNews = gql`
    query getNews($id: Int!) {
        getNews( id: $id) {
            message
            messageCode
            news {
                News_Item_ID
                News_Image
                News_Title
                News_Content
                Created_By
                Is_Active
                News_Status_ID
                Moves_Company_ID
                Moves_Charity_ID
                Appeal_ID
                Campaign_ID
                News_Item_Author_ID
                Created_Date
                News_Item_Author {
                    Surname
                    Forename
                }
                News_Url
            }
        }
    }
`;


