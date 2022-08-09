import { Injectable } from '@angular/core';
import { Apollo, gql } from "apollo-angular";

const _getListNewsForHomePage = gql`
  query Query($pageIndex: Int, $perPage: Int, $textSearch: String) {
    getListNewsForHomePage(pageIndex: $pageIndex, perPage: $perPage, textSearch: $textSearch) {
      listNews {
          News_Item_ID
          News_Title
          News_Content
          News_Url
          News_Image
          News_Status_Name
      }
      messageCode
      message
      totalRecords
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private apollo: Apollo) { }

  getListNewsForHomePage(pageIndex: Number, perPage: Number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListNewsForHomePage,
          variables: {
            pageIndex,
            perPage
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        })
    })
  }
}
