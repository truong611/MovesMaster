import {Injectable} from '@angular/core';
import {Apollo, gql} from "apollo-angular";

const _getQuyTrinh = gql`
  query Query($bodyData: QuyTrinhInput) {
    getQuyTrinh(bodyData: $bodyData) {
      message
      messageCode
      data {
        Id
        MaQT
        TenQT
        MoTa
        FilesAlreadyExists {
          Id
          TenTaiLieu
        }
        DanhMuc {
          Id
          MaDM
          TenDM
          MoTa
          TrangThai
          Order
          NhomDanhMuc {
            MaNhom
            TenNhom
            Id
          }
        }
      }
    }
  }
`;

const _createQuyTrinh = gql`
  mutation Mutation($bodyData: QuyTrinhInput!) {
    createQuyTrinh(bodyData: $bodyData) {
      messageCode
      message
    }
  }
`;

const _updateQuyTrinh = gql`
  mutation Mutation($Id: ID!, $bodyData: QuyTrinhInput!) {
    updateQuyTrinh(Id: $Id, bodyData: $bodyData) {
      messageCode
      message
    }
  }
`;

const _deleteQuyTrinh = gql`
  mutation Mutation($Id: ID!) {
    deleteQuyTrinh(Id: $Id) {
      messageCode
      message
    }
  }
`;

const _downloadQuyTrinh = gql`
  query Query($Id: ID!) {
    downloadQuyTrinh(Id: $Id) {
      messageCode
      message
      data
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class QuyTrinhChuyenMonService {

  constructor(private apollo: Apollo) {
  }

  getQuyTrinh(bodyData: any) {
    return this.apollo
      .watchQuery<any>({
        query: _getQuyTrinh,
        fetchPolicy: 'network-only',
        variables: {
          "bodyData": {
            "MaQT": bodyData?.MaQT,
            "TenQT": bodyData?.TenQT,
            "MoTa": bodyData?.MoTa,
            "DanhMuc_Id": parseInt(bodyData?.DanhMuc?.Id)
          }
        }
      });
  }

  createQuyTrinh(bodyData: any, files: Array<File>) {
    return this.apollo.mutate({
      mutation: _createQuyTrinh,
      variables: {
        "bodyData": {
          "MaQT": bodyData?.MaQT,
          "TenQT": bodyData?.TenQT,
          "MoTa": bodyData?.MoTa,
          "Files": files,
          "DanhMuc_Id": parseInt(bodyData?.DanhMuc?.Id)
        }
      },
      context: {
        useMultipart: true
      }
    })
  }

  updateQuyTrinh(Id: Number, bodyData: any, files: Array<File>, ids: any) {
    return this.apollo.mutate({
      mutation: _updateQuyTrinh,
      variables: {
        "Id": Id,
        "bodyData": {
          "MaQT": bodyData?.MaQT,
          "TenQT": bodyData?.TenQT,
          "MoTa": bodyData?.MoTa,
          "Files": files,
          "FilesAlreadyExists": ids,
          "DanhMuc_Id": parseInt(bodyData?.DanhMuc?.Id)
        }
      },
      context: {
        useMultipart: true
      }
    })
  }

  deleteQuyTrinh(Id: number) {
    return this.apollo.mutate({
      mutation: _deleteQuyTrinh,
      variables: {
        Id
      }
    })
  }

  downloadQuyTrinh(Id: number) {
    return new Promise((resolve, reject) => {
      return this.apollo
        .query<any>({
          variables: {
            Id
          },
          query: _downloadQuyTrinh,
          fetchPolicy: 'network-only'
        }).toPromise()
        .then(response => {
          resolve(response)
        });
    });
  }

}
