import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';

const _getListMatchByObjectId = gql`
  query Query($Id: Int!, $Type: String!) {
    getListMatchByObjectId(Id: $Id, Type: $Type) {
      messageCode
      message
      ListMatch {
        Moves_Company_ID
        Match_ID
        Match_Date_Created
        Company_Name
        Company_Icon
        Campaign_ID
        Campaign_Icon
        Campaign_Name
      }
      IsShowButtonCreate
      PercentageDiscount
      Campaign {
        Charity_Name
        Campaign_Target_Value
        Campaign_Launch_Date
        Campaign_End_Date
        End_Date_Target
      }
    }
  }
`

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  constructor(private apollo: Apollo) { }

  getListMatchByObjectId(Id: number, Type: string) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          query: _getListMatchByObjectId,
          variables: {
            Id: Id,
            Type: Type
          },
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }
}