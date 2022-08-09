import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

import { CreateNewsInput } from '../models/news.model';

const _getListNews = gql`
  query Query($mode: String) {
    getListNews(mode: $mode) {
      listNews {
        all {
          News_Item_ID
          News_Image
          News_Title
          News_Url
          News_Status_ID
          Is_Active
          News_Publish_Date
          Created_By
          Created_Date
          Is_Manual
          Charity_Name
          Appeal_Name
          Company_Name
          Campaign_Name
          CreateBy
          News_Status_Name
        }
      }
      listStatus {
        Category_ID
        Category_Name
      }
      messageCode
      message
    }
  }
`;

const _getMasterDataCreateNews = gql`
  query Query{
    getMasterDataCreateNews {
      Charity {
        Charity_Name
        Charity_URL
      }
      ListCompany {
        Moves_Company_ID
        Company_Name
        Company_Number
        Company_URL
      }
      ListAppeal {
        Appeal_ID
        Appeal_Name
        Appeal_URL
      }
      ListCampaign {
        Campaign_ID
        Appeal_ID
        Campaign_Name
        Campaign_URL
      }
      messageCode
      message
    }
  }
`;

const _getDetailNews = gql`
  query Query($Id: Int!) {
    getDetailNews(Id: $Id) {
      News {
        News_Item_ID
        News_Image
        News_Title
        News_Url
        News_Content
        Campaign_ID
        Appeal_ID
        Moves_Charity_ID
        Moves_Company_ID
        News_Status_ID
        Is_Active
        News_Publish_Date
        Created_By
        Created_Date
        Is_Manual
        Charity_Name
        Charity_URL
        Appeal_Name
        Company_Name
        Campaign_Name
        CreateBy
        News_Status_Name
        CreateByIsAdmin
      }
      ListCompany {
        Moves_Company_ID
        Company_Name
        Company_Number
        Company_Icon
        Company_URL
      }
      ListAppeal {
        Appeal_ID
        Appeal_Name
        Appeal_Icon
        Appeal_URL
      }
      ListCampaign {
        Campaign_ID
        Appeal_ID
        Campaign_Name
        Campaign_Icon
        Campaign_URL
      }
      messageCode
      message
    }
  }
`;

const _createNews = gql`
  mutation Mutation($bodyData: CreateNewsInput) {
    createNews(bodyData: $bodyData) {
      Id
      messageCode
      message
    }
  }
`

const _updateNews = gql`
  mutation Mutation($Id: Int!, $bodyData: CreateNewsInput) {
    updateNews(Id: $Id, bodyData: $bodyData) {
      messageCode
      message
    }
  }
`

const _updateStatusNews = gql`
  mutation Mutation($Id: Int!, $News_Status_ID: Int!) {
    updateStatusNews(Id: $Id, News_Status_ID: $News_Status_ID) {
      messageCode
      message
    }
  }
`

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  constructor(private apollo: Apollo) {
  }

  getListNews() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListNews,
          variables: {
            mode: 'web'
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getMasterDataCreateNews() {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getMasterDataCreateNews,
          variables: {
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getDetailNews(Id: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getDetailNews,
          variables: {
            Id
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  createNews(bodyData: CreateNewsInput) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _createNews,
        variables: {
          bodyData
        },
        context: {
          useMultipart: true
        }
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  updateNews(Id: Number, bodyData: CreateNewsInput) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateNews,
        variables: {
          Id,
          bodyData
        },
        context: {
          useMultipart: true
        }
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  updateStatusNews(Id: Number, News_Status_ID: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateStatusNews,
        variables: {
          Id,
          News_Status_ID
        },
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

}
