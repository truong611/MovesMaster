import {Injectable} from '@angular/core';
import {Apollo, gql} from "apollo-angular";

const _getFAQ = gql`
  query Query {
    getFAQ {
      data {
        Id
        CauHoi
        TraLoi
        expanded
      }
      messageCode
      message
    }
  }
`;

const _createFAQ = gql`
  mutation Mutation($bodyData: FAQInput!) {
    createFAQ(bodyData: $bodyData) {
      messageCode
      message
    }
  }
`;

const _updateFAQ = gql`
  mutation Mutation($Id: ID!, $bodyData: FAQInput!) {
    updateFAQ(Id: $Id, bodyData: $bodyData) {
      messageCode
      message
    }
  }
`;

const _deleteFAQ = gql`
  mutation Mutation($Id: ID!) {
    deleteFAQ(Id: $Id) {
      messageCode
      message
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  constructor(private apollo: Apollo) {
  }

  getFAQ() {
    return this.apollo
      .watchQuery<any>({
        query: _getFAQ,
        fetchPolicy: 'network-only',
      });
  }

  createFAQ(bodyData: any) {
    return this.apollo.mutate({
      mutation: _createFAQ,
      variables: {
        "bodyData": {
          "CauHoi": bodyData?.CauHoi,
          "TraLoi": bodyData?.TraLoi,
        }
      }
    })
  }

  updateFAQ(Id: Number, bodyData: any) {
    return this.apollo.mutate({
      mutation: _updateFAQ,
      variables: {
        "Id": Id,
        "bodyData": {
          "CauHoi": bodyData?.CauHoi,
          "TraLoi": bodyData?.TraLoi,
        }
      }
    })
  }

  deleteFAQ(Id: number) {
    return this.apollo.mutate({
      mutation: _deleteFAQ,
      variables: {
        Id
      }
    })
  }

}
