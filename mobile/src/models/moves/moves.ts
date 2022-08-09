import {Instance, SnapshotOut, types} from 'mobx-state-tree';

/**
 * Model description here for TypeScript hints.
 */

const UserInfoModel = types.model('UserInfo').props({
    username: types.maybe(types.string),
    // password: types.maybe(types.string),
    token: types.maybe(types.string),
    surname: types.maybe(types.string),
    forename: types.maybe(types.string),
    id: types.maybe(types.string),
    exp: types.maybe(types.number),
    email: types.maybe(types.string),
    phone: types.maybe(types.string),
    avatar: types.maybe(types.string),
    createdDate: types.maybe(types.Date),
});

const AppInfoModel = types.model('AppInfo').props({
    tabIndex: types.maybe(types.number),
    version: types.maybe(types.number),
});

const DonateInfoModel = types.model('DonateInfo').props({
    donatedMoves: types.maybe(types.number),
    amountDonated: types.maybe(types.number),
    movesAvailable: types.maybe(types.number),
});

const ActivityModel = types.model('Activity').props({
    Activity_Type_ID: types.maybe(types.number),
    Activity_Type_Name: types.maybe(types.string),
    Activity_Type_Icon: types.maybe(types.string),

    Activity_Unit_ID: types.maybe(types.number),
    Activity_Unit_Name: types.maybe(types.string),

    Activity_Type_Unit_ID: types.maybe(types.number),
    Conversation_To_Moves_Rate: types.maybe(types.number),

    Units: types.maybe(types.number),
    FromDate: types.maybe(types.Date),
    ToDate: types.maybe(types.Date),
});

export const MovesModel = types
    .model('Moves')
    .props({
        userInfo: types.optional(types.maybe(UserInfoModel), {
            username: '',
            // password: '',
            token: '',
            surname: '',
            forename: '',
            id: '',
            exp: 0,
            email: '',
            phone: '',
            avatar: '',
            createdDate: 0,
        }),
        appInfo: types.optional(types.maybe(AppInfoModel), {
            tabIndex: 1,
            version: 1,
        }),
        donateInfo: types.optional(types.maybe(DonateInfoModel), {
            donatedMoves: 0,
            amountDonated: 0,
            movesAvailable: 0,
        }),
        activity: types.optional(types.array(ActivityModel), []),
    })
    .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
    .actions((self: any) => ({
        getActivity() {
            return self.activity
        },
        addActivity(value) {
            self.activity = [...self.activity, value];
        },
        updateActivity(index, value) {
            self.activity[index] = value
        },
        removeActivity(index) {
            self.activity.splice(index, 1);
        },
        clearActivity() {
            self.activity = []
        },
        getUserInfo() {
            return self.userInfo;
        },
        getUserInfoByKey(key) {
            return self.userInfo[key];
        },
        getAppInfo() {
            return self.appInfo;
        },
        getDonateInfo() {
            return self.donateInfo;
        },
        setDonateInfo(value: any) {
            if (value?.donatedMoves != null) {
                self.donateInfo.donatedMoves = value?.donatedMoves;
            }
            if (value?.amountDonated != null) {
                self.donateInfo.amountDonated = value?.amountDonated;
            }
            if (value?.movesAvailable != null) {
                self.donateInfo.movesAvailable = value?.movesAvailable;
            }
        },
        setUserInfo(value: any) {
            if (value?.username != null) {
                self.userInfo.username = value?.username;
            }
            // if (value?.password != null) {
            //     self.userInfo.password = value?.password;
            // }
            if (value?.token != null) {
                self.userInfo.token = value?.token;
            }
            if (value?.surname != null) {
                self.userInfo.surname = value?.surname;
            }
            if (value?.forename != null) {
                self.userInfo.forename = value?.forename;
            }
            if (value?.id != null) {
                self.userInfo.id = value?.id;
            }
            if (value?.exp != null) {
                self.userInfo.exp = value?.exp;
            }
            if (value?.email != null) {
                self.userInfo.email = value?.email;
            }
            if (value?.phone != null) {
                self.userInfo.phone = value?.phone;
            }
            if (value?.avatar != null) {
                self.userInfo.avatar = value?.avatar;
            }
            if (value?.createdDate != null) {
                self.userInfo.createdDate = value?.createdDate;
            }
        },
        setAppInfo(value: any) {
            if (value?.tabIndex != null) {
                self.appInfo.tabIndex = value?.tabIndex;
            }
            if (value?.version != null) {
                self.appInfo.version = value?.version;
            }
        },
        logout() {
            self.userInfo.username = '';
            // self.userInfo.password = '';
            self.userInfo.token = '';
            self.userInfo.surname = '';
            self.userInfo.forename = '';
            self.userInfo.id = '';
            self.userInfo.exp = 0;
            self.userInfo.email = '';
            self.userInfo.phone = '';
            self.userInfo.avatar = '';
            self.userInfo.createdDate = 0;

            self.appInfo.tabIndex = 1;
            self.appInfo.version = 1;

            self.donateInfo.donatedMoves = 0;
            self.donateInfo.amountDonated = 0;
            self.donateInfo.movesAvailable = 0;
        },
    })); // eslint-disable-line @typescript-eslint/no-unused-vars

type MovesType = Instance<typeof MovesModel>

export interface Moves extends MovesType {
}

type MovesSnapshotType = SnapshotOut<typeof MovesModel>

export interface MovesSnapshot extends MovesSnapshotType {
}

export const createMovesDefaultModel = () => types.optional(MovesModel, {});
