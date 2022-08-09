import { Injectable } from '@angular/core';
import { Apollo, gql } from "apollo-angular";

const _getThongBaoByUserId = gql`
  query Query($str: String) {
    getThongBaoByUserId(str: $str) {
      listThongBao {
        Id
        TieuDe
        NoiDung
        DaXem
        PageUrl
        ParamsUrl
        NguoiDung_Id
        CreatedDate
      }
      messageCode
      message
    }
  }
`;

const _updateThongBao = gql`
  mutation Mutation($Id: ID!) {
    updateThongBao(Id: $Id) {
      messageCode
      message
    }
  }
`

const _createThongBao = gql`
  mutation Mutation($ThongBaoInput: ThongBaoInput!) {
    createThongBao(ThongBaoInput: $ThongBaoInput) {
      messageCode
      message
    }
  }
`

const _getCountThongBaoByUserId = gql`
  query Query {
    getCountThongBaoByUserId {
      count
      messageCode
      message
    }
  }
`;

const _reloadThongBao = gql`
  mutation Mutation($data: Boolean) {
    reloadThongBao(data: $data) {
      messageCode
      message
    }
  }
`

@Injectable({
  providedIn: 'root'
})
export class QuanLyThongBaoService {

  _subscriptionThongBaoCount = gql`
    subscription Subscription {
      RefreshThongBaoCount
    }
  `

  constructor(private apollo: Apollo) {
  }

  getThongBaoByUserId(str: string) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          variables: {
            str
          },
          query: _getThongBaoByUserId,
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  updateThongBao(Id: number) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _updateThongBao,
        variables: {
          "Id": Id
        }
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  createThongBao(ThongBaoInput: any) {
    return new Promise((resolve, reject) => {
      return this.apollo.mutate({
        mutation: _createThongBao,
        variables: {
          ThongBaoInput
        }
      }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

  getCountThongBaoByUserId() {
    return this.apollo
      .watchQuery<any>({
        query: _getCountThongBaoByUserId,
        fetchPolicy: 'network-only',
      });
  }

  reloadThongBao(data: boolean) {
    return this.apollo.mutate({
      mutation: _reloadThongBao,
      variables: {
        data
      }
    }).toPromise().then((res: any) => {
      return res.data.reloadThongBao
    })
  }
}
