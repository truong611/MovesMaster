import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';

const _getListThuatNguChuyenMon = gql`
  query Query {
    getListThuatNguChuyenMon {
      Id
      TenVietTat
      TenDayDu
      DienGiai
      PhanLoai
      DanhMuc {
        Id
        TenDM
      }
    }
  }
`

const _createThuatNguChuyenMon = gql`
  mutation Mutation($bodyData: thuatNguChuyenMonInput!) {
    createThuatNguChuyenMon(bodyData: $bodyData) {
      messageCode
      message
    }
  }
`;

const _importThuatNguChuyenMon = gql`
  mutation Mutation($bodyData: [thuatNguChuyenMonInput]!) {
    importThuatNguChuyenMon(bodyData: $bodyData) {
      messageCode
      message
    }
  }
`;

const _updateThuatNguChuyenMon = gql`
  mutation Mutation($Id: ID!, $bodyData: thuatNguChuyenMonInput!) {
    updateThuatNguChuyenMon(Id: $Id, bodyData: $bodyData) {
      messageCode
      message
    }
  }
`;

const _deleteThuatNguChuyenMon = gql`
  mutation Mutation($Id: ID!) {
    deleteThuatNguChuyenMon(Id: $Id) {
      messageCode
      message
    }
  }
`;


@Injectable({
  providedIn: 'root'
})
export class ThuatNguChuyenMonService {

  constructor(private apollo: Apollo) { }

  getListThuatNguChuyenMon() {
    return this.apollo
      .watchQuery<any>({
        query: _getListThuatNguChuyenMon,
        fetchPolicy: 'network-only'
      });
  }

  createThuatNguChuyenMon(bodyData: any) {
    return this.apollo.mutate({
      mutation: _createThuatNguChuyenMon,
      variables: {
        "bodyData": {
          "TenVietTat": bodyData?.TenVietTat,
          "TenDayDu": bodyData?.TenDayDu,
          "DienGiai": bodyData?.DienGiai,
          "PhanLoai": parseInt(bodyData?.PhanLoai)
        }
      }
    })
  }

  importThuatNguChuyenMon(bodyData: any) {
    return this.apollo.mutate({
      mutation: _importThuatNguChuyenMon,
      variables: {
        "bodyData": bodyData
      }
    })
  }

  updateThuatNguChuyenMon(Id: number, bodyData: any) {
    return this.apollo.mutate({
      mutation: _updateThuatNguChuyenMon,
      variables: {
        "Id": Id,
        "bodyData": {
          "TenVietTat": bodyData?.TenVietTat,
          "TenDayDu": bodyData?.TenDayDu,
          "DienGiai": bodyData?.DienGiai,
          "PhanLoai": parseInt(bodyData?.PhanLoai)
        }
      }
    })
  }

  deleteThuatNguChuyenMon(Id: number) {
    return this.apollo.mutate({
      mutation: _deleteThuatNguChuyenMon,
      variables: {
        "Id": Id
      }
    })
  }
}
