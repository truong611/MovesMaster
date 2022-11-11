const db = require('../../../data/knex-db');
const messages = require('../../../messages/auth');
const authenticated = require('../../../middleware/authenticated-guard');
const logging = require('../../../middleware/autologging');
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const commonSystem = require('../../../common/commonSystem');
const request = require('request');
const GARMIN_Domain = process.env.GARMIN_Domain;
const GARMIN_Consumer_Key = process.env.GARMIN_Consumer_Key;
const GARMIN_Consumer_Secret = process.env.GARMIN_Consumer_Secret;
const Limit_Second = process.env.Limit_Second
const Litmit_Count_Activity = process.env.Litmit_Count_Activity
const Limit_Activity_Minute = process.env.Limit_Activity_Minute
const JOINING_BONUS = process.env.JOINING_BONUS ?? 0;
const CryptoJS = require("crypto-js");

const dateToTimestamp = (date) => {
    return date?.getTime()
};

const groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

const convertArrayToObject = (array, key) => {
    return array.reduce((obj, item) => {
        return {
            ...obj,
            [item[key]]: item,
        };
    }, {});
};

const checkExistsArray = (arrayParrent, arrayChild) => {
    let exists = false;
    arrayParrent.forEach(itemParent => {
        let valid = true;
        arrayChild.forEach(itemChild => {
            if (!itemParent.includes(itemChild)) valid = false;
        });

        if (valid == true) exists = true;
    });

    return exists;
};

const getListArray = (includeParent, id) => {
    let _include = [];
    for (let j = 0; j < includeParent.length; j++) {
        let includeChild = includeParent[j];

        if (includeChild.includes(id)) {
            _include = [..._include, ...includeChild];
        }
    }

    _include = [...new Set([..._include])].sort(function (a, b) {
        return a - b
    });

    return _include;
}

const getArrayDistinct = (arrayParrent, arrayChild, id) => {
    let exists = false;
    let exists_id = false;
    let index = -1;
    let list = [];

    arrayParrent.forEach((itemParent, _index) => {
        exists_id = itemParent.includes(id);
        if (exists_id) index = _index;
    });

    arrayParrent.forEach(itemParent => {
        let valid = true;
        arrayChild.forEach(itemChild => {
            if (!itemParent.includes(itemChild)) valid = false;
        });

        if (valid == true) exists = true;
    });

    if (exists_id && exists) {
        //no thing
    } else if (!exists_id && exists) {
        //never
    }
    //Thêm mảng mới
    else if (!exists_id && !exists) {
        list = arrayChild.sort(function (a, b) {
            return a - b
        });
    }
    //Cập nhật lại mảng cũ theo index
    else if (exists_id && !exists) {
        let current = arrayParrent[index];
        list = [...new Set([...current, ...arrayChild])].sort(function (a, b) {
            return a - b
        });
    }

    return {
        index: index,
        list: list,
    };
}

const getListDate = (start = new Date, end = new Date) => {
    let list = [];

    if (start.getTime() > end.getTime()) {
        return list;
    }

    let tempDate = new Date(start);
    while (commonSystem.formatDate(tempDate) != commonSystem.formatDate(end)) {
        let item = [new Date(tempDate)];
        tempDate.setDate(tempDate.getDate() + 1);
        item.push(commonSystem.setTimeToDate(tempDate));
        list.push(item);
    }

    list.push([commonSystem.setTimeToDate(tempDate), end]);
    
    if (list.length > 7) {
        list = list.reverse().splice(0, 7);
    }
    
    return list;
}

const handleUploadGarmin = async (User_ID, app_usage, oauth_token, oauth_token_secret, list_Activity_Type, listRangeDate = [], GMT_Mobile) => {
    let trx_result = await db.transaction(async trx => {
        for (let i = 0; i < listRangeDate.length; i++) {
            let item_time = listRangeDate[i];
            let res = await doRequest(oauth_token, oauth_token_secret, item_time[0].getTime(), item_time[1].getTime());
            if (res.body) {
                let body = JSON.parse(res.body);
                for (let j = 0; j < body.length; j++) {
                    let item = body[j];
                    let activity_type = list_Activity_Type
                        .find(x => x.Activity_Type_Name.trim().toLocaleLowerCase() == item.activityType.trim().toLocaleLowerCase());

                    if (activity_type) {
                        let exists = await trx.table('Fitness_App_Activities')
                            .where('User_ID', User_ID)
                            .where('Fitness_App_Activities_Object_ID', item.summaryId)
                            .first();
                        //Nếu chưa tồn tại
                        if (!exists) {
                            await trx.table('Fitness_App_Activities')
                                .insert({
                                    Fitness_App_Distance: item.distanceInMeters,
                                    Fitness_App_Moving_Time: Math.ceil(item.durationInSeconds / 60),
                                    Fitness_App_Type: item.activityType,
                                    User_ID: User_ID,
                                    Fitness_App_Activities_Usage_ID: app_usage.Fitness_App_Usage_ID,
                                    Fitness_App_Activities_Object_ID: item.summaryId,
                                    Fitness_App_Activities_Apply_Moves: false,
                                    Fitness_App_Activities_Start_Date:commonSystem.createNewDateDevice(new Date(item.startTimeInSeconds * 1000), GMT_Mobile),
                                    Fitness_App_Activities_Start_Date_Local: commonSystem.createNewDateDevice(new Date(item.startTimeInSeconds * 1000), GMT_Mobile),
                                    Fitness_App_Activities_End_Date_Local: commonSystem.createNewDateDevice(new Date((item.startTimeInSeconds + item.durationInSeconds) * 1000), GMT_Mobile),
                                    Activity_Type_ID: activity_type.Activity_Type_ID
                                });
                        }
                        //Nếu tồn tại nhưng chưa upload activity
                        else if (exists.Fitness_App_Activities_Apply_Moves == false) {
                            await trx.table('Fitness_App_Activities')
                                .where('Fitness_App_Activities_Object_ID', item.summaryId)
                                .update({
                                    Fitness_App_Distance: item.distanceInMeters,
                                    Fitness_App_Moving_Time: Math.ceil(item.durationInSeconds / 60),
                                    Fitness_App_Type: item.activityType,
                                    Fitness_App_Activities_Start_Date:commonSystem.createNewDateDevice(new Date(item.startTimeInSeconds * 1000), GMT_Mobile),
                                    Fitness_App_Activities_Start_Date_Local: commonSystem.createNewDateDevice(new Date(item.startTimeInSeconds * 1000), GMT_Mobile),
                                    Fitness_App_Activities_End_Date_Local: commonSystem.createNewDateDevice(new Date((item.startTimeInSeconds + item.durationInSeconds) * 1000), GMT_Mobile),
                                    Activity_Type_ID: activity_type.Activity_Type_ID
                                });
                        }
                    }
                }
            }
        }

        return;
    });

    return;
}

const _getMasterDataUploadActivity = async (User_ID) => {
    let User = await db.table('User')
        .where('User_ID', User_ID)
        .where('Is_Mobile_App_User', true)
        .first();

    let LastUpload = User['Created_Date'];
    
    let ActivityType = await db.table('Activity_Type');

    ActivityType?.length && ActivityType.map(item => {
        item.Activity_Type_Icon = item.Activity_Type_Icon ? URL_FOLDER + item.Activity_Type_Icon : null;
    });

    let Activity_Upload = await db.table('Activity_Upload')
        .where('User_ID', User_ID)
        .orderBy('Activity_Upload_Datetime', 'desc');
    if (Activity_Upload?.length) {
        LastUpload = Activity_Upload[0]['Activity_Upload_Datetime']
    }

    let Fitness_App_Activities = await db.table('Fitness_App_Activities')
        .where('User_ID', User_ID)
        .where('Fitness_App_Activities_Start_Date_Local', '>=', LastUpload)
        .where('Fitness_App_Activities_Apply_Moves', false);

    Fitness_App_Activities.sort(function (a, b) {
        return +(new Date(b.Fitness_App_Activities_Start_Date_Local)) - +(new Date(a.Fitness_App_Activities_Start_Date_Local));
    });
    Fitness_App_Activities.reverse();

    //Lấy ra tập giao nhau
    let includeParent = [];
    for (let i = 0; i < Fitness_App_Activities.length; i++) {
        let item = Fitness_App_Activities[i];
        for (let j = 0; j < Fitness_App_Activities.length; j++) {
            if (i != j) {
                let _item = Fitness_App_Activities[j];

                let StartDate1 = dateToTimestamp(item.Fitness_App_Activities_Start_Date_Local);
                let EndDate1 = dateToTimestamp(item.Fitness_App_Activities_End_Date_Local);
                let StartDate2 = dateToTimestamp(_item.Fitness_App_Activities_Start_Date_Local);
                let EndDate2 = dateToTimestamp(_item.Fitness_App_Activities_End_Date_Local);

                //Nếu giao nhau
                if ((StartDate1 < EndDate2) && (EndDate1 > StartDate2)) {
                    let includeChild = [item.Fitness_App_Activities_ID, _item.Fitness_App_Activities_ID];
                    if (!checkExistsArray(includeParent, includeChild)) {
                        includeParent.push(includeChild);
                    }
                }
                //Nếu không giao nhau
                else {

                }
            }
        }
    }

    let listId = Fitness_App_Activities.map(x => x.Fitness_App_Activities_ID)
        .sort(function (a, b) {
            return a - b
        });

    let listInclude = [];
    let listNotInclude = [];
    for (let i = 0; i < listId.length; i++) {
        let id = listId[i];

        let _list = getListArray(includeParent, id);
        //Nếu nằm trong mảng giao nhau
        if (_list.length > 0) {
            let result = getArrayDistinct(listInclude, _list, id);

            //Thêm mảng mới
            if (result.index == -1 && result.list.length > 0) {
                listInclude.push(result.list);
            }
            //Cập nhật lại mảng cũ theo index
            else if (result.index != -1 && result.list.length > 0) {
                listInclude[result.index] = result.list;
            }
        }
        //Nếu không nằm trong mảng giao nhau
        else {
            listNotInclude.push(id);
        }
    }

    let count = 1
    let Upload_end_date = User['Created_Date']
    if (Activity_Upload?.length) {
        count = Activity_Upload[0]['Upload_Count'] + 1
        Upload_end_date = Activity_Upload[0]['Upload_Period_End_Time']
    }

    let list_entry = [];
    for (let i = 0; i < Fitness_App_Activities.length; i++) {
        let item = Fitness_App_Activities[i];

        let Fitness_App_Usage = await db.table('Fitness_App_Usage')
            .where('User_ID', User_ID)
            .where('Fitness_App_Usage_ID', item.Fitness_App_Activities_Usage_ID)
            .first();

        let Object_Source_ID = Fitness_App_Usage?.Fitness_App_ID;

        // let activity_type = null;

        // //Strava
        // if (Object_Source_ID == 2) {
        //     activity_type = await db.table('Activity_Type')
        //         .where('Strava_Activity_Type_Name', 'ilike', item.Fitness_App_Type.trim())
        //         .first();
        // }
        // //Garmin
        // else if (Object_Source_ID == 3) {
        //     activity_type = await db.table('Activity_Type')
        //         .where('Activity_Type_Name', 'ilike', item.Fitness_App_Type.trim())
        //         .first();
        // }
        
        // let Object_Source_Type = activity_type?.Activity_Type_ID;

        if (item.Activity_Type_ID) {
            let activity_Type_Unit = null;
            activity_Type_Unit = await db.table('Activity_Type_Unit')
                .where('Activity_Type_ID', item.Activity_Type_ID)
                .where('Date_Introduced', '<=', new Date)
                .where(builde => {
                    builde.where('Date_Retired', null)
                    .orWhere('Date_Retired', '>=', new Date)
                })
                //.where('Date_Retired', '>=', new Date)
                .where('Activity_Unit_ID', 1) //Phút
                .orderBy('Date_Retired', 'desc')
                .first();

            // //Nếu không có đơn vị là Mét (m) => lấy theo thời gian Giây (s)
            // if (!activity_Type_Unit) {
            //     activity_Type_Unit = await db.table('Activity_Type_Unit')
            //         .where('Activity_Type_ID', Object_Source_Type)
            //         .where('Date_Introduced', '<=', new Date)
            //         .where('Date_Retired', '>=', new Date)
            //         .where('Activity_Unit_ID', 3) //Giây
            //         .orderBy('Date_Retired', 'desc')
            //         .first();
            // }

            if (activity_Type_Unit && Object_Source_ID) {
                let Conversion_Rate = activity_Type_Unit.Conversation_To_Moves_Rate;
                let Number_Units = item.Fitness_App_Moving_Time;
                let Moves_Arising = commonSystem.roundNumber(Number_Units * Conversion_Rate, 2);

                let entry = {
                    Fitness_App_Activities_ID: item.Fitness_App_Activities_ID,
                    Activity_Entry_ID: null,
                    Activity_Start_Time: commonSystem.formatDate2(item.Fitness_App_Activities_Start_Date_Local, "YYYY/MM/DD-hh:mm:ss") ,
                    Activity_End_Time: commonSystem.formatDate2(item.Fitness_App_Activities_End_Date_Local,"YYYY/MM/DD-hh:mm:ss") ,
                    Object_Source_ID: Object_Source_ID,
                    Object_Source_Type: item.Activity_Type_ID,
                    Activity_Type_Unit_ID: activity_Type_Unit.Activity_Type_Unit_ID,
                    Moves_Arising: Moves_Arising,
                    Conversion_Rate: Conversion_Rate,
                    Number_Units: Number_Units,
                    Include_YN: listNotInclude.includes(item.Fitness_App_Activities_ID),
                    Activity_Upload_ID: null,
                    Upload_Count: count
                };

                list_entry.push(entry);
            }
        }
    }

    listInclude.forEach((includeArr, index) => {
        let _list = list_entry.filter(x => includeArr.includes(x.Fitness_App_Activities_ID))
            .sort(function (a, b) {
                return b.Moves_Arising - a.Moves_Arising
            })

        if (_list.length > 0) {
            let maxItemId = _list[0].Fitness_App_Activities_ID;

            list_entry.forEach(item => {
                if (_list.includes(item)) {
                    if (item.Fitness_App_Activities_ID == maxItemId) {
                        item.Include_YN = true;
                    } else {
                        item.Include_YN = false;
                    }
                }
            });
        }
    });
    console.log("list_entry: ", list_entry)
    LastUpload = commonSystem.formatDate2(LastUpload, "YYYY/MM/DD-hh:mm:ss")
    return {
        ActivityType,
        LastUpload,
        Activity_Type_Entry: list_entry,
        Upload_Count: count - 1,
        Upload_End_Date: Upload_end_date,
        JOINING_BONUS: JOINING_BONUS,
    }
}

const resolvers = {
    //QUERY
    Query: {
        getMasterDataUploadActivity: authenticated(async (parent, args, context) => {
            try {
                let result = await _getMasterDataUploadActivity(context.currentUser.User_ID);

                return {
                    data: result,
                    message: messages.success,
                    messageCode: 200
                }
            } catch (e) {
                logging(context, e);
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
        getViewActivity: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context.currentUser.User_ID;
                let Activity_Entry = [];
                Activity_Entry = await db.table('Activity_Entry')
                    .select(
                        'Activity_Entry.Activity_Entry_ID',
                        'Activity_Entry.Activity_Start_Time',
                        'Activity_Entry.Activity_End_Time',
                        'Activity_Entry.Object_Source_ID',
                        'Activity_Entry.Object_Source_Type',
                        'Activity_Entry.Activity_Type_Unit_ID',
                        'Activity_Entry.Moves_Arising',
                        'Activity_Entry.Conversion_Rate',
                        'Activity_Entry.Number_Units',
                        'Activity_Entry.Include_YN',
                        'Activity_Entry.Upload_Count',
                        'Activity_Entry.Activity_Upload_ID'
                    )
                    .innerJoin('Activity_Upload', 'Activity_Upload.Activity_Upload_ID', 'Activity_Entry.Activity_Upload_ID')
                    .where(builder => {
                        builder.whereRaw('??::date = ?::date', ['Activity_Entry.Activity_Start_Time', new Date(args?.year, args?.month, args?.day)]);
                    })
                    .where(builder => {
                        builder.where('Activity_Upload.User_ID', User_ID);
                    });
                for(let i = 0; i < Activity_Entry?.length; i++){
                    Activity_Entry[i].Activity_Start_Time = commonSystem.formatDate2(Activity_Entry[i].Activity_Start_Time, "YYYY/MM/DD-hh:mm:ss")
                    Activity_Entry[i].Activity_End_Time = commonSystem.formatDate2(Activity_Entry[i].Activity_End_Time, "YYYY/MM/DD-hh:mm:ss")
                }
                return {
                    Activity_Entry,
                    message: messages.success,
                    messageCode: 200
                }
            } catch (e) {
                logging(context, e);
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
        getOverviewActivity: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context.currentUser.User_ID;

                let Activity_Type_Unit = await db.table('Activity_Type_Unit');
                let Activity_Type = await db.table('Activity_Type');
                let Activity_Unit = await db.table('Activity_Unit');
                let Activity_Type_Unit_Map = convertArrayToObject(Activity_Type_Unit, 'Activity_Type_Unit_ID');
                let Activity_Type_Map = convertArrayToObject(Activity_Type, 'Activity_Type_ID');
                let Activity_Unit_Map = convertArrayToObject(Activity_Unit, 'Activity_Unit_ID');

                let days = [];
                let months = [];
                if (args?.type == 'week') {
                    days = commonSystem.getDaysInWeek(args?.date, 'dayOfMonth');
                } else if (args?.type == 'month') {
                    days = commonSystem.getDaysInMonth(args?.date);
                } else if (args?.type == 'year') {
                    months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                }

                let data = {};

                for (let i = 0; i < days?.length; i++) {
                    data[days[i]] = {
                        activity: {},
                        // moves: 0,
                    };
                    let Activity_Upload = await db.table('Activity_Upload')
                        .where('User_ID', User_ID)
                        .where(builder => {
                            builder.whereRaw('??::date = ?::date', ['Activity_Upload_Datetime', new Date(days[i])]);
                        })
                        .first();
                    if (Activity_Upload) {
                        let Activity_Entry = await db.table('Activity_Entry')
                            .where('Activity_Upload_ID', Activity_Upload?.Activity_Upload_ID)
                            .where('Include_YN', true)
                            .orderBy('Activity_End_Time', 'ASC');
                        let groupByActivity_Entry = groupBy(Activity_Entry, 'Activity_Type_Unit_ID');
                        for (let key in groupByActivity_Entry) {
                            if (groupByActivity_Entry.hasOwnProperty(key)) {
                                let type = Activity_Type_Map[Activity_Type_Unit_Map[key]?.Activity_Type_ID]?.Activity_Type_Name;
                                // let unit = Activity_Unit_Map[Activity_Type_Unit_Map[key]?.Activity_Unit_ID]?.Activity_Unit_Name;
                                for (let j = 0; j < groupByActivity_Entry[key]?.length; j++) {
                                    // data[days[i]]['moves'] += groupByActivity_Entry[key][j]?.Moves_Arising;
                                    if (data[days[i]]['activity'].hasOwnProperty(type)) {
                                        data[days[i]]['activity'][type] += groupByActivity_Entry[key][j]?.Moves_Arising
                                    } else {
                                        data[days[i]]['activity'][type] = groupByActivity_Entry[key][j]?.Moves_Arising
                                    }
                                    // if (data[days[i]]['activity'][type].hasOwnProperty(unit)) {
                                    //     data[days[i]]['activity'][type][unit] += groupByActivity_Entry[key][j]?.Number_Units
                                    // } else {
                                    //     data[days[i]]['activity'][type][unit] = groupByActivity_Entry[key][j]?.Number_Units
                                    // }
                                }
                            }
                        }
                    }
                }
                for (let i = 0; i < months?.length; i++) {
                    data[months[i]] = {
                        activity: {},
                        // moves: 0,
                    };

                    let dayOfMonth = commonSystem.getDaysInMonth(new Date(new Date(args?.date).getFullYear(), months[i] - 1, 1), 'YYYY-MM-dd');
                    let Activity_Upload_ID = await db.table('Activity_Upload')
                        .where('User_ID', User_ID)
                        .where('Activity_Upload_Datetime', '>=', dayOfMonth[0] + 'T00:00:00Z')
                        .where('Activity_Upload_Datetime', '<=', dayOfMonth[dayOfMonth.length - 1] + 'T23:59:59Z')
                        .select('Activity_Upload_ID');
                    Activity_Upload_ID = Activity_Upload_ID.map(item => item.Activity_Upload_ID);
                    if (Activity_Upload_ID) {
                        let Activity_Entry = await db.table('Activity_Entry')
                            .whereIn('Activity_Upload_ID', Activity_Upload_ID)
                            .where('Include_YN', true)
                            .orderBy('Activity_End_Time', 'ASC');
                        let groupByActivity_Entry = groupBy(Activity_Entry, 'Activity_Type_Unit_ID');
                        for (let key in groupByActivity_Entry) {
                            if (groupByActivity_Entry.hasOwnProperty(key)) {
                                let type = Activity_Type_Map[Activity_Type_Unit_Map[key]?.Activity_Type_ID]?.Activity_Type_Name;
                                // let unit = Activity_Unit_Map[Activity_Type_Unit_Map[key]?.Activity_Unit_ID]?.Activity_Unit_Name;
                                for (let j = 0; j < groupByActivity_Entry[key]?.length; j++) {
                                    // data[months[i]]['moves'] += groupByActivity_Entry[key][j]?.Moves_Arising;
                                    if (data[months[i]]['activity'].hasOwnProperty(type)) {
                                        data[months[i]]['activity'][type] += groupByActivity_Entry[key][j]?.Moves_Arising
                                    } else {
                                        data[months[i]]['activity'][type] = groupByActivity_Entry[key][j]?.Moves_Arising
                                    }
                                    // if (data[months[i]]['activity'][type].hasOwnProperty(unit)) {
                                    // data[months[i]]['activity'][type][unit] += groupByActivity_Entry[key][j]?.Number_Units
                                    // } else {
                                    //     data[months[i]]['activity'][type][unit] = groupByActivity_Entry[key][j]?.Number_Units
                                    // }
                                }
                            }
                        }
                    }
                }

                return {
                    data: JSON.stringify(data),
                    message: messages.success,
                    messageCode: 200
                }
            } catch (e) {
                logging(context, e);
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
        getOverviewActivityMobile: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context.currentUser.User_ID;
                let days = [];
                if (args?.type == 'week') {
                    days = commonSystem.getDaysInWeek(args?.date, 'dayOfMonth');
                } else if (args?.type == 'month') {
                    days = commonSystem.getDaysInMonthMobile(args?.date);
                }
                let data = [];
                for (let i = 0; i < days?.length; i++) {
                    let _date = new Date(days[i])
                    let obj = {
                        day: new Date(days[i]).getDate(),
                        month: new Date(days[i]).getMonth() + 1,
                        year: new Date(days[i]).getFullYear(),
                        activity: false
                    }
                    let Activity_Entry = [];
                    Activity_Entry = await db.table('Activity_Entry')
                        .select(
                            'Activity_Entry.Activity_Entry_ID',
                            'Activity_Entry.Activity_Start_Time',
                            'Activity_Entry.Activity_End_Time',
                            'Activity_Entry.Object_Source_ID',
                            'Activity_Entry.Object_Source_Type',
                            'Activity_Entry.Activity_Type_Unit_ID',
                            'Activity_Entry.Moves_Arising',
                            'Activity_Entry.Conversion_Rate',
                            'Activity_Entry.Number_Units',
                            'Activity_Entry.Include_YN',
                            'Activity_Entry.Upload_Count',
                            'Activity_Entry.Activity_Upload_ID'
                        )
                        .innerJoin('Activity_Upload', 'Activity_Upload.Activity_Upload_ID', 'Activity_Entry.Activity_Upload_ID')
                        .where(builder => {
                            builder.whereRaw('??::date = ?::date', ['Activity_Entry.Activity_Start_Time', new Date(_date.getFullYear(), _date.getMonth(), _date.getDate())]);
                        })
                        .where(builder => {
                            builder.where('Activity_Upload.User_ID', User_ID);
                        });
                    if (Activity_Entry?.length > 0) obj.activity = true
                    data.push(obj)
                }
                return {
                    data: data,
                    message: messages.success,
                    messageCode: 200
                }
            }
            catch (e) {
                logging(context, e);
                return {
                    message: 'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
    },
    Activity_Type_Entry: {
        ActivityType: async (parent, args, context) => {
            let Activity_Type_Unit = await db.table('Activity_Type_Unit')
                .where('Activity_Type_Unit_ID', parent?.Activity_Type_Unit_ID)
                .first();

            let Activity_Type = await db.table('Activity_Type')
                .where('Activity_Type_ID', Activity_Type_Unit?.Activity_Type_ID)
                .first();
            if (Activity_Type) {
                Activity_Type.Activity_Type_Icon = Activity_Type.Activity_Type_Icon ? URL_FOLDER + Activity_Type.Activity_Type_Icon : null;
            }
            return Activity_Type
        },
        ActivityUnit: async (parent, args, context) => {
            let Activity_Type_Unit = await db.table('Activity_Type_Unit')
                .where('Activity_Type_Unit_ID', parent?.Activity_Type_Unit_ID)
                .first();

            let Activity_Unit = await db.table('Activity_Unit')
                .where('Activity_Unit_ID', Activity_Type_Unit?.Activity_Unit_ID)
                .first();
            return Activity_Unit
        },
        Fitness_App: async (parent, args, context) => {
            let Fitness_App = await db.table('Fitness_App')
                .where('Fitness_App_ID', parent?.Object_Source_ID)
                .first();
            return Fitness_App || null
        },
    },
    ActivityType: {
        ActivityUnit: async (parent, args, context) => {
            let ActivityTypeUnit = await db.table('Activity_Type_Unit')
                .where('Activity_Type_ID', parent.Activity_Type_ID);
            let Activity_Unit_ID = [];
            ActivityTypeUnit?.length && ActivityTypeUnit.map(item => {
                Activity_Unit_ID.push(item.Activity_Unit_ID)
            });
            let Activity_Unit = await db.table('Activity_Unit')
                .whereIn('Activity_Unit_ID', Activity_Unit_ID);
            Activity_Unit?.length && Activity_Unit.map(item => {
                item.Activity_Type_ID = parent.Activity_Type_ID;
                return item
            });
            return Activity_Unit
        }
    },
    ActivityUnit: {
        ActivityTypeUnit: async (parent, args, context) => {
            return await db.table('Activity_Type_Unit')
                .where('Activity_Type_ID', parent.Activity_Type_ID)
                .where('Activity_Unit_ID', parent.Activity_Unit_ID)
                .first();
        }
    },
    Mutation: {
        uploadActivity: authenticated(async (parent, args, context) => {
            let GMT_server = new Date().getTimezoneOffset()/60
            try {
                let trx_result = await db.transaction(async trx => {
                    let count = 1;
                    let User_ID = context.currentUser.User_ID;

                    let result = await _getMasterDataUploadActivity(User_ID);

                    result.Activity_Type_Entry.map(x => {
                        x.Auto = true;
                        return x;
                    })

                    let User = await trx.table('User').where('User_ID', User_ID).first();

                    if (!User) {
                        throw new Error(messages.error);
                    }
                    let { bodyData, newDate, GMT_Mobile } = args;
                    if (!bodyData?.length && !result?.Activity_Type_Entry?.length) {
                        throw new Error("No moves to submit!");
                    }

                    bodyData.sort(function (a, b) {
                        return +(new Date(b.Activity_Start_Time)) - +(new Date(a.Activity_Start_Time));
                    });

                    bodyData.reverse();


                    let activity_upload = await trx.table('Activity_Upload')
                        .where('User_ID', User_ID)
                        .orderBy('Activity_Upload_Datetime', 'desc')
                        .first();

                    activity_upload ? count = activity_upload?.Upload_Count + 1 : count = 1


                    let payload = [];
                    for (let i = 0; i < bodyData.length; i++) {
                        let item = bodyData[i];
                        let Activity_Type_Unit = await trx.table('Activity_Type_Unit')
                            .where('Activity_Type_Unit_ID', item?.Activity_Type_Unit_ID)
                            .first();

                        let Conversion_Rate = Activity_Type_Unit?.Conversation_To_Moves_Rate;
                        let Moves_Arising = commonSystem.roundNumber(parseFloat(item?.Number_Units) * parseFloat(Conversion_Rate), 2);
                        Moves_Arising = Math.round(Moves_Arising * 100) / 100;

                        payload = [...payload, {
                            // Activity_Start_Time: new Date(new Date(item.Activity_Start_Time).getTime() + (GMT_server - GMT_Mobile)*60*60*1000) ,
                            // Activity_End_Time: new Date(new Date(item.Activity_End_Time).getTime() + (GMT_server - GMT_Mobile)*60*60*1000),
                            Activity_Start_Time: commonSystem.createNewDateDevice(item.Activity_Start_Time, GMT_Mobile ),
                            Activity_End_Time: commonSystem.createNewDateDevice(item.Activity_End_Time, GMT_Mobile),
                            Object_Source_ID: null,
                            Object_Source_Type: null,
                            Activity_Type_Unit_ID: item.Activity_Type_Unit_ID,
                            Moves_Arising: Moves_Arising,
                            Conversion_Rate: Conversion_Rate,
                            Number_Units: item?.Number_Units,
                            Include_YN: true,
                            Activity_Upload_ID: null,
                            Auto: false,
                            Upload_Count: count
                        }];
                    }


                    let list_Fitness_App_Activities_ID = result.Activity_Type_Entry.map(x => x.Fitness_App_Activities_ID);
                    console.log("list_Fitness_App_Activities_ID 1: ", list_Fitness_App_Activities_ID)

                    let data_activity_entry = []
                    result.Activity_Type_Entry.map(item => {
                        let obj = {...item}
                        obj.Activity_Start_Time = commonSystem.convertStrToDate(obj.Activity_Start_Time)
                        obj.Activity_End_Time = commonSystem.convertStrToDate(obj.Activity_End_Time)
                        data_activity_entry.push(obj)
                    })

                    // payload = [...payload, ...result.Activity_Type_Entry];
                    payload = [...payload, ...data_activity_entry];

                    payload.sort(function (a, b) {
                        return +(new Date(b.Activity_Start_Time)) - +(new Date(a.Activity_Start_Time));
                    });
                    payload.reverse();

                    let datetime = {
                        Activity_Start_Time: null,
                        Activity_End_Time: null,
                    };

                    let list_date_string = [];
                    for (let i = 0; i < payload.length; i++) {
                        let item = payload[i];

                        let date_string = commonSystem.formatDate(item?.Activity_Start_Time);
                        if (payload.length == 1) {
                            list_date_string.push({
                                key: date_string,
                                array_time: [
                                    {
                                        start: item.Activity_Start_Time,
                                        end: item.Activity_End_Time
                                    }
                                ]
                            })
                        }else{
                            if (list_date_string.find(x => x.key == date_string)) {
                                let index = list_date_string.findIndex(x => x.key == date_string);

                                list_date_string[index].array_time.push({
                                    start: item.Activity_Start_Time,
                                    end: item.Activity_End_Time
                                });
                            } else {
                                list_date_string.push({
                                    key: date_string,
                                    array_time: [
                                        {
                                            start: item.Activity_Start_Time,
                                            end: item.Activity_End_Time
                                        }
                                    ]
                                });
                            }
                        }
                        // console.log("New Date: ",commonSystem.convertStrToDate('2022/11/03-12:11:25'))

                        //Valid when Activity in day
                        // if (commonSystem.formatDate(item.Activity_Start_Time) != commonSystem.formatDate(item.Activity_End_Time)) {
                        //     throw new Error('invalid activity in day');
                        // }

                        // if (i == 0 && activity_upload && (item.Activity_Start_Time.getTime() < activity_upload.Upload_Period_End_Time.getTime())) {
                        //     throw new Error('Activity_Start_Time < Upload_Period_End_Time');
                        // }
                        // else if (i == 0 && !activity_upload && (item.Activity_Start_Time.getTime() < User.Created_Date.getTime())) {
                        //     throw new Error('Activity_Start_Time < User.Created_Date');
                        // }

                        // if (i == payload.length - 1 && (item.Activity_End_Time.getTime() > (new Date).getTime())) {
                        //     throw new Error('Activity_End_Time > new Date');
                        // }

                        // if (i != 0 && !item.Auto) {
                        //     let StartDate1 = dateToTimestamp(datetime?.Activity_Start_Time);
                        //     let EndDate1 = dateToTimestamp(datetime?.Activity_End_Time);
                        //     let StartDate2 = dateToTimestamp(item?.Activity_Start_Time);
                        //     let EndDate2 = dateToTimestamp(item?.Activity_End_Time);
                        //     if ((StartDate1 < EndDate2) && (EndDate1 > StartDate2)) {
                        //         throw new Error('Include time');
                        //     }
                        // }
                        // datetime.Activity_Start_Time = item?.Activity_Start_Time;
                        // datetime.Activity_End_Time = item?.Activity_End_Time;
                    }

                    for (let i = 0; i < list_date_string.length; i++) {
                        let item = list_date_string[i];
                        let exists_date = await trx.table('Activity_Upload')
                            .where('User_ID', User_ID)
                            .where(builder => {
                                builder.whereRaw('??::date = ?::date', ['Activity_Upload_Datetime', commonSystem.createNewDateDevice(new Date().getTime(), GMT_Mobile)]);
                            })
                            .first();

                        if (exists_date) {
                            await trx.table('Activity_Upload')
                                .where('User_ID', User_ID)
                                .where('Activity_Upload_ID', exists_date.Activity_Upload_ID)
                                .update({
                                    Upload_Period_End_Time: new Date(item.array_time[item.array_time.length - 1].end),
                                    // Activity_Upload_Datetime: new Date(new Date().getTime() + (GMT_server - GMT_Mobile)*60*60*1000),
                                    Activity_Upload_Datetime: commonSystem.createNewDateDevice(new Date().getTime(), GMT_Mobile),
                                    Upload_Count: count
                                });
                        } else {
                            await trx.table('Activity_Upload')
                                .insert({
                                    User_ID: User_ID,
                                    // Activity_Upload_Datetime: new Date(new Date().getTime() + (GMT_server - GMT_Mobile)*60*60*1000),
                                    Activity_Upload_Datetime: commonSystem.createNewDateDevice(new Date().getTime(), GMT_Mobile),
                                    Upload_Period_Start_Time: new Date(item.array_time[0].start),
                                    Upload_Period_End_Time: new Date(item.array_time[item.array_time.length - 1].end),
                                    Upload_Count: count
                                });
                        }
                    }

                    //Lấy Activity_Upload_ID
                    for (let i = 0; i < payload.length; i++) {
                        let item = payload[i];

                        let activity_upload = await trx.table('Activity_Upload')
                            .where('User_ID', User_ID)
                            .where(builder => {
                                builder.whereRaw('??::date = ?::date', ['Activity_Upload_Datetime',commonSystem.createNewDateDevice(new Date().getTime(), GMT_Mobile)]);
                            })
                            .first();

                        if (activity_upload) item.Activity_Upload_ID = activity_upload.Activity_Upload_ID;
                        else throw new Error('Activity_Upload not found');
                    }

                    payload.forEach(item => {
                        delete item.Activity_Entry_ID;
                        delete item.Fitness_App_Activities_ID;
                        delete item.Auto;
                    });


                    let list_Activity_Entry_ID = await trx.table('Activity_Entry')
                        .returning(['Activity_Entry_ID']).insert(payload);

                    let listEntryId = list_Activity_Entry_ID.map(x => x.Activity_Entry_ID);

                    let listEntry = await trx.table('Activity_Entry')
                        .whereIn('Activity_Entry_ID', listEntryId);

                    listEntry.sort(function (a, b) {
                        return +(new Date(b.Activity_Start_Time)) - +(new Date(a.Activity_Start_Time));
                    });
                    listEntry.reverse();

                    //Lấy ra tập giao nhau
                    let includeParent = [];
                    for (let i = 0; i < listEntry.length; i++) {
                        let item = listEntry[i];
                        for (let j = 0; j < listEntry.length; j++) {
                            if (i != j) {
                                let _item = listEntry[j];

                                let StartDate1 = dateToTimestamp(item.Activity_Start_Time);
                                let EndDate1 = dateToTimestamp(item.Activity_End_Time);
                                let StartDate2 = dateToTimestamp(_item.Activity_Start_Time);
                                let EndDate2 = dateToTimestamp(_item.Activity_End_Time);

                                //Nếu giao nhau
                                if ((StartDate1 < EndDate2) && (EndDate1 > StartDate2)) {
                                    let includeChild = [item.Activity_Entry_ID, _item.Activity_Entry_ID];
                                    if (!checkExistsArray(includeParent, includeChild)) {
                                        includeParent.push(includeChild);
                                    }
                                }
                                //Nếu không giao nhau
                                else {

                                }
                            }
                        }
                    }

                    let listId = listEntry.map(x => x.Activity_Entry_ID)
                        .sort(function (a, b) {
                            return a - b
                        });

                    let listInclude = [];
                    let listNotInclude = [];
                    for (let i = 0; i < listId.length; i++) {
                        let id = listId[i];

                        let _list = getListArray(includeParent, id);
                        //Nếu nằm trong mảng giao nhau
                        if (_list.length > 0) {
                            let result = getArrayDistinct(listInclude, _list, id);

                            //Thêm mảng mới
                            if (result.index == -1 && result.list.length > 0) {
                                listInclude.push(result.list);
                            }
                            //Cập nhật lại mảng cũ theo index
                            else if (result.index != -1 && result.list.length > 0) {
                                listInclude[result.index] = result.list;
                            }
                        }
                        //Nếu không nằm trong mảng giao nhau
                        else {
                            listNotInclude.push(id);
                        }
                    }

                    listInclude.forEach((includeArr, index) => {
                        let _list = listEntry.filter(x => includeArr.includes(x.Activity_Entry_ID))
                            .sort(function (a, b) {
                                return b.Moves_Arising - a.Moves_Arising
                            })

                        if (_list.length > 0) {
                            let maxItemId = _list[0].Activity_Entry_ID;

                            listEntry.forEach(item => {
                                if (_list.includes(item)) {
                                    if (item.Activity_Entry_ID == maxItemId) {
                                        item.Include_YN = true;
                                    } else {
                                        item.Include_YN = false;
                                    }
                                }
                            });
                        }
                    });

                    for (let i = 0; i < listEntry.length; i++) {
                        let item = listEntry[i];
                        await trx.table('Activity_Entry')
                            .where('Activity_Entry_ID', item.Activity_Entry_ID)
                            .update({
                                Include_YN: item.Include_YN
                            });
                    }

                    console.log("list_Fitness_App_Activities_ID 2: ", list_Fitness_App_Activities_ID)

                    await trx.table('Fitness_App_Activities')
                        .whereIn('Fitness_App_Activities_ID', list_Fitness_App_Activities_ID)
                        .update({
                            Fitness_App_Activities_Apply_Moves: true
                        });

                    return {
                        message: messages.success,
                        messageCode: 200
                    }
                });

                return trx_result;
            } catch (e) {
                logging(context, e);
                return {
                    message: e.toString(), //'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
        updateGarminActivity: authenticated(async (parent, args, context) => {
            try {
                let User_ID = context?.currentUser?.User_ID;
                let user = await db.table('User')
                    .where('User_ID', User_ID)
                    .first();
                if (!user) {
                    return {
                        message: 'user not found',
                        messageCode: 404
                    }
                }
                let GMT_Mobile = args?.GMT_Mobile
                let GMT_server = new Date().getTimezoneOffset()/60

                let app_usage = await db.table('Fitness_App_Usage')
                    .where('User_ID', User_ID)
                    .where('Fitness_App_ID', 3)
                    .first();

                if (!app_usage) {
                    return {
                        message: 'Fitness app usage not found',
                        messageCode: 404
                    }
                }

                //Lấy id của type
                let list_Activity_Type = await db.table('Activity_Type');

                let oauth_token = app_usage.Fitness_App_Usage_Access_Token;
                let oauth_token_secret = app_usage.Fitness_App_Usage_Refresh_Token;

                let last_Activity_Upload = await db.table('Activity_Upload')
                    .where('User_ID', User_ID)
                    .orderBy('Activity_Upload_Datetime', 'desc')
                    .first();

                // let startDate = user.Created_Date ? new Date(user.Created_Date) : new Date();
                let startDate = user.Created_Date ? new Date(new Date(user.Created_Date).getTime() - (GMT_server - GMT_Mobile)*60*60*1000) : new Date(new Date().getTime() - (GMT_server - GMT_Mobile)*60*60*1000);
                // let startDate = user.Created_Date ? commonSystem.createNewDateDevice(user.Created_Date, args?.GMT_Mobile) : commonSystem.createNewDateDevice(new Date().getTime(), GMT_Mobile);
                if (last_Activity_Upload) {
                    // startDate = new Date(last_Activity_Upload.Activity_Upload_Datetime);
                    startDate = new Date(new Date(last_Activity_Upload.Activity_Upload_Datetime).getTime() - (GMT_server - GMT_Mobile)*60*60*1000);
                    //  startDate = commonSystem.createNewDateDevice(last_Activity_Upload.Activity_Upload_Datetime, args?.GMT_Mobile);
                }

                // let nowDate = new Date(new Date().getTime() + (GMT_server - GMT_Mobile)*60*60*1000);
                let nowDate = new Date(new Date().getTime() - (GMT_server - GMT_Mobile)*60*60*1000);
                let listRangeDate = [];

                //Nếu chỉ trong một ngày
                if (commonSystem.formatDate(startDate) == commonSystem.formatDate(nowDate)) {
                    listRangeDate.push([startDate, nowDate]);
                    await handleUploadGarmin(User_ID, app_usage, oauth_token, oauth_token_secret, list_Activity_Type, listRangeDate, GMT_Mobile);
                }
                else {
                    let listRangeDate = getListDate(startDate, nowDate);
                    if (listRangeDate.length) {
                        // console.log("listRangeDate: ", listRangeDate)
                        await handleUploadGarmin(User_ID, app_usage, oauth_token, oauth_token_secret, list_Activity_Type, listRangeDate,GMT_Mobile);
                    }
                }

                return {
                    message: 'OK',
                    messageCode: 200
                }
            }
            catch (e) {
                logging(context, e);
                return {
                    message: e.toString(), //'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
        updateAppleHealthActivity: authenticated(async (parent, args, context) => {
            try {
                let { bodyData } = args;
                let User_ID = context?.currentUser?.User_ID;
                let user = await db.table('User')
                    .where('User_ID', User_ID)
                    .first();
                if (!user) {
                    return {
                        message: 'user not found',
                        messageCode: 404
                    }
                }

                let app_usage = await db.table('Fitness_App_Usage')
                    .where('User_ID', User_ID)
                    .where('Fitness_App_Usage_ID', 'MovesMatter_AppleHealth')
                    .first();

                if (!app_usage) {
                    return {
                        message: 'Fitness app usage not found',
                        messageCode: 404
                    }
                }

                //Lấy id của type
                let list_Activity_Type = await db.table('Activity_Type');
                if (bodyData?.length) {
                    let trx_result = await db.transaction(async trx => {
                        for (let i = 0; i < bodyData.length; i++) {
                            let item = bodyData[i];
                            let activity_type = list_Activity_Type
                                .find(x => x.AppleHealth_Activity_Type_Name.trim().toLocaleLowerCase() == item.Type_Name.trim().toLocaleLowerCase());

                            if (activity_type && new Date(item.StartTime).getTime() != new Date(item.EndTime).getTime() && item.Unit_Minute > 0) {
                                let exists = await trx.table('Fitness_App_Activities')
                                    .where('User_ID', User_ID)
                                    .where('Fitness_App_Activities_Usage_ID', 'MovesMatter_AppleHealth')
                                    .where('Fitness_App_Activities_Object_ID', item?.ID)
                                    .first();                          
                                //Create
                                if (!exists) {
                                    await trx.table('Fitness_App_Activities')
                                        .insert({
                                            Fitness_App_Distance: item.Quantity,
                                            Fitness_App_Moving_Time: item.Unit_Minute,
                                            Fitness_App_Type: item.Type_Name,
                                            User_ID: User_ID,
                                            Fitness_App_Activities_Usage_ID: 'MovesMatter_AppleHealth',
                                            Fitness_App_Activities_Object_ID: item?.ID,
                                            Fitness_App_Activities_Apply_Moves: false,
                                            // Fitness_App_Activities_Start_Date: new Date(item.StartTime),
                                            // Fitness_App_Activities_Start_Date_Local: new Date(item.StartTime),
                                            // Fitness_App_Activities_End_Date_Local: new Date(item.EndTime),
                                            Fitness_App_Activities_Start_Date: commonSystem.createNewDateDevice(item.StartTime, args?.GMT_Mobile),
                                            Fitness_App_Activities_Start_Date_Local: commonSystem.createNewDateDevice(item.StartTime, args?.GMT_Mobile),
                                            Fitness_App_Activities_End_Date_Local: commonSystem.createNewDateDevice(item.EndTime, args?.GMT_Mobile),
                                            Activity_Type_ID: activity_type.Activity_Type_ID
                                        });
                                }
                                //Update
                                else if (exists.Fitness_App_Activities_Apply_Moves == false) {
                                    await trx.table('Fitness_App_Activities')
                                        .where('User_ID', User_ID)
                                        .where('Fitness_App_Activities_Usage_ID', 'MovesMatter_AppleHealth')
                                        .where('Fitness_App_Activities_Object_ID', item?.ID)
                                        .update({
                                            Fitness_App_Distance: item.Quantity,
                                            Fitness_App_Moving_Time: item.Unit_Minute,
                                            Fitness_App_Type: item.Type_Name,
                                            // Fitness_App_Activities_Start_Date: new Date(item.StartTime),
                                            // Fitness_App_Activities_Start_Date_Local: new Date(item.StartTime),
                                            // Fitness_App_Activities_End_Date_Local: new Date(item.EndTime),
                                            Fitness_App_Activities_Start_Date: commonSystem.createNewDateDevice(item.StartTime, args?.GMT_Mobile),
                                            Fitness_App_Activities_Start_Date_Local: commonSystem.createNewDateDevice(item.StartTime, args?.GMT_Mobile),
                                            Fitness_App_Activities_End_Date_Local: commonSystem.createNewDateDevice(item.EndTime, args?.GMT_Mobile),
                                            Activity_Type_ID: activity_type.Activity_Type_ID
                                        });
                                }
                            }
                        }

                        return;
                    });
                }

                return {
                    message: 'OK',
                    messageCode: 200
                }
            } 
            catch (e) {
                logging(context, e);
                return {
                    message: e.toString(), //'Internal Server Error',
                    messageCode: 500
                }
            }
        }),
    }
};

function doRequest(oauth_token, oauth_token_secret, startTime, endTime) {
    startTime = Math.floor(startTime / 1000);
    endTime = Math.floor(endTime / 1000);
    console.log("-------------------")
    console.log("start_time:", startTime)
    console.log("end_time:", endTime)
    console.log("-------------------")
    let oauth_timestamp = Math.floor(new Date().getTime() / 1000);
    let oauth_nonce = Math.floor(new Date().getTime() / 1000);
    let key = Buffer.from(GARMIN_Consumer_Secret + '&' + oauth_token_secret).toString();
    let Signature_Base_String = `GET&https%3A%2F%2Fapis.garmin.com%2Fwellness-api%2Frest%2Factivities&oauth_consumer_key%3D${GARMIN_Consumer_Key}%26oauth_nonce%3D${oauth_nonce}%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D${oauth_timestamp}%26oauth_token%3D${oauth_token}%26oauth_version%3D1.0%26uploadEndTimeInSeconds%3D${endTime}%26uploadStartTimeInSeconds%3D${startTime}`
    const hash = CryptoJS.HmacSHA1(Signature_Base_String, key)
    let base64encoded = CryptoJS.enc.Base64.stringify(hash)
    const uriEncodedHash = encodeURIComponent(base64encoded);

    console.log("uri: ", GARMIN_Domain + "uploadStartTimeInSeconds=" + startTime + "&uploadEndTimeInSeconds=" + endTime)
    console.log("Authorization: ", `OAuth oauth_nonce=${oauth_nonce}, oauth_signature=${uriEncodedHash}, oauth_token=${oauth_token}, oauth_consumer_key=${GARMIN_Consumer_Key}, oauth_timestamp=${oauth_timestamp}, oauth_signature_method="HMAC-SHA1", oauth_version="1.0"`)
    let options = {
        method: 'GET',
        url: GARMIN_Domain + "uploadStartTimeInSeconds=" + startTime + "&uploadEndTimeInSeconds=" + endTime,
        headers: {
            "Authorization": `OAuth oauth_nonce=${oauth_nonce}, oauth_signature=${uriEncodedHash}, oauth_token=${oauth_token}, oauth_consumer_key=${GARMIN_Consumer_Key}, oauth_timestamp=${oauth_timestamp}, oauth_signature_method="HMAC-SHA1", oauth_version="1.0"`
        }
    };

    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (res.statusCode != 200) {
                resolve({
                    statusCode: res.statusCode,
                    body: null
                });
            }
            else {
                resolve({
                    statusCode: res.statusCode,
                    body: body
                });
            }
        });
    });
}

module.exports = resolvers;
