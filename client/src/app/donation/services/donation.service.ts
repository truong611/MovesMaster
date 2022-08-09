import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

const _getListDonation = gql`
  query GetListDonation($bodyData: GetListDonationInput) {
    getListDonation(bodyData: $bodyData) {
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
      TotalDonation
      messageCode
      message
    }
  }
`

const _getMasterDataListDonation = gql`
  query GetListDonation($objectId: Int!, $objectType: String!) {
    getMasterDataListDonation(objectId: $objectId, objectType: $objectType) {
      ListAppeal {
        Appeal_ID
        Appeal_Name
      }
      ListCampaign {
        Campaign_ID
        Campaign_Name
      }
      messageCode
      message
    }
  }
`

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  constructor(private apollo: Apollo) { }

  getListDonation(bodyData: any) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListDonation,
          variables: {
            bodyData: bodyData,
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getMasterDataListDonation(objectId: number, objectType: string) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getMasterDataListDonation,
          variables: {
            objectId: objectId,
            objectType: objectType
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }
}