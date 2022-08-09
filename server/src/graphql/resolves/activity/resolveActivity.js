const db = require('../../../data/knex-db');
const messages = require('../../../messages/auth');
const authenticated = require('../../../middleware/authenticated-guard');
const logging = require('../../../middleware/autologging');
const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const STATIC_FOLDER = process.env.STATIC_FOLDER;
const URL_FOLDER = (HOSTNAME + ':' + PORT) + '/' + STATIC_FOLDER;
const commonSystem = require('../../../common/commonSystem');

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
        .orderBy('Upload_Period_End_Time', 'desc');
    if (Activity_Upload?.length) {
        LastUpload = Activity_Upload[0]['Upload_Period_End_Time']
    }

    let Fitness_App_Activities = await db.table('Fitness_App_Activities')
        .where('User_ID', User_ID)
        .where('Fitness_App_Activities_Start_Date_Local', '>=', LastUpload);

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

    let list_entry = [];
    for (let i = 0; i < Fitness_App_Activities.length; i++) {
        let item = Fitness_App_Activities[i];
        let activity_type = await db.table('Activity_Type')
            .where('Activity_Type_Name', 'ilike', item.Fitness_App_Type.trim())
            .first();
        let Object_Source_Type = activity_type?.Activity_Type_ID;

        let Fitness_App_Usage = await db.table('Fitness_App_Usage')
            .where('Fitness_App_Usage_ID', item.Fitness_App_Activities_Usage_ID)
            .first();

        let Object_Source_ID = Fitness_App_Usage?.Fitness_App_ID;

        if (Object_Source_Type) {
            let activity_Type_Unit = null;
            activity_Type_Unit = await db.table('Activity_Type_Unit')
                .where('Activity_Type_ID', Object_Source_Type)
                .where('Date_Introduced', '<=', new Date)
                .where('Date_Retired', '>=', new Date)
                .where('Activity_Unit_ID', 1) //Mét
                .orderBy('Date_Retired', 'desc')
                .first();

            //Nếu không có đơn vị là Mét (m) => lấy theo thời gian Giây (s)
            if (!activity_Type_Unit) {
                activity_Type_Unit = await db.table('Activity_Type_Unit')
                    .where('Activity_Type_ID', Object_Source_Type)
                    .where('Date_Introduced', '<=', new Date)
                    .where('Date_Retired', '>=', new Date)
                    .where('Activity_Unit_ID', 3) //Giây
                    .orderBy('Date_Retired', 'desc')
                    .first();
            }

            if (activity_Type_Unit && Object_Source_ID) {
                let Conversion_Rate = activity_Type_Unit.Conversation_To_Moves_Rate;
                let Number_Units = item.Fitness_App_Distance;
                let Moves_Arising = commonSystem.roundNumber(Number_Units / Conversion_Rate, 2);

                let entry = {
                    Fitness_App_Activities_ID: item.Fitness_App_Activities_ID,
                    Activity_Entry_ID: null,
                    Activity_Start_Time: item.Fitness_App_Activities_Start_Date_Local,
                    Activity_End_Time: item.Fitness_App_Activities_End_Date_Local,
                    Object_Source_ID: Object_Source_ID,
                    Object_Source_Type: Object_Source_Type,
                    Activity_Type_Unit_ID: activity_Type_Unit.Activity_Type_Unit_ID,
                    Moves_Arising: Moves_Arising,
                    Conversion_Rate: Conversion_Rate,
                    Number_Units: Number_Units,
                    Include_YN: listNotInclude.includes(item.Fitness_App_Activities_ID),
                    Activity_Upload_ID: null
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

    return {
        ActivityType,
        LastUpload,
        Activity_Type_Entry: list_entry
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
                let Activity_Upload = await db.table('Activity_Upload')
                    .where('User_ID', User_ID)
                    .where(builder => {
                        builder.whereRaw('??::date = ?::date', ['Activity_Upload_Datetime', new Date(args?.date)]);
                    })
                    .first();

                let Activity_Entry = [];

                if (Activity_Upload) {
                    Activity_Entry = await db.table('Activity_Entry')
                        .where('Activity_Upload_ID', Activity_Upload?.Activity_Upload_ID);
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
            try {
                let trx_result = await db.transaction(async trx => {
                    let User_ID = context.currentUser.User_ID;

                    let result = await _getMasterDataUploadActivity(User_ID);

                    let User = await trx.table('User').where('User_ID', User_ID).first();

                    if (!User) {
                        throw new Error(messages.error);
                    }

                    let {bodyData} = args;
                    if (!bodyData?.length) {
                        throw new Error(messages.error);
                    }

                    bodyData.sort(function (a, b) {
                        return +(new Date(b.Activity_Start_Time)) - +(new Date(a.Activity_Start_Time));
                    });
                    bodyData.reverse();

                    let payload = [];
                    for (let i = 0; i < bodyData.length; i++) {
                        let item = bodyData[i];
                        let Activity_Type_Unit = await trx.table('Activity_Type_Unit')
                            .where('Activity_Type_Unit_ID', item?.Activity_Type_Unit_ID)
                            .first();

                        let Conversion_Rate = Activity_Type_Unit?.Conversation_To_Moves_Rate;
                        let Moves_Arising = parseFloat(item?.Number_Units) * parseFloat(Conversion_Rate);
                        Moves_Arising = Math.round(Moves_Arising * 100) / 100;

                        payload = [...payload, {
                            Activity_Start_Time: item.Activity_Start_Time,
                            Activity_End_Time: item.Activity_End_Time,
                            Object_Source_ID: null,
                            Object_Source_Type: null,
                            Activity_Type_Unit_ID: item.Activity_Type_Unit_ID,
                            Moves_Arising: Moves_Arising,
                            Conversion_Rate: Conversion_Rate,
                            Number_Units: item?.Number_Units,
                            Include_YN: true,
                            Activity_Upload_ID: null,
                            Auto: false,
                        }];
                    }

                    result.Activity_Type_Entry.map(x => {
                        x.Auto = true;
                        return x;
                    })

                    let list_Fitness_App_Activities_ID = result.Activity_Type_Entry.map(x => x.Fitness_App_Activities_ID);

                    payload = [...payload, ...result.Activity_Type_Entry];

                    payload.sort(function (a, b) {
                        return +(new Date(b.Activity_Start_Time)) - +(new Date(a.Activity_Start_Time));
                    });
                    payload.reverse();

                    let datetime = {
                        Activity_Start_Time: null,
                        Activity_End_Time: null,
                    };

                    let activity_upload = await trx.table('Activity_Upload')
                        .where('User_ID', User_ID)
                        .orderBy('Activity_Upload_Datetime', 'desc')
                        .first();

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
                        } else {
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

                        //Valid when Activity in day
                        if (commonSystem.formatDate(item.Activity_Start_Time) != commonSystem.formatDate(item.Activity_End_Time)) {
                            throw new Error('invalid activity in day');
                        }

                        if (i == 0 && activity_upload && (item.Activity_Start_Time.getTime() < activity_upload.Upload_Period_End_Time.getTime())) {
                            throw new Error('Activity_Start_Time < Upload_Period_End_Time');
                        } 
                        else if (i == 0 && !activity_upload && (item.Activity_Start_Time.getTime() < User.Created_Date.getTime())) {
                            throw new Error('Activity_Start_Time < User.Created_Date');
                        }

                        if (i == payload.length - 1 && (item.Activity_End_Time.getTime() > (new Date).getTime())) {
                            throw new Error('Activity_End_Time > new Date');
                        }

                        if (i != 0 && !item.Auto) {
                            let StartDate1 = dateToTimestamp(datetime?.Activity_Start_Time);
                            let EndDate1 = dateToTimestamp(datetime?.Activity_End_Time);
                            let StartDate2 = dateToTimestamp(item?.Activity_Start_Time);
                            let EndDate2 = dateToTimestamp(item?.Activity_End_Time);
                            if ((StartDate1 < EndDate2) && (EndDate1 > StartDate2)) {
                                throw new Error('Include time');
                            }
                        }
                        datetime.Activity_Start_Time = item?.Activity_Start_Time;
                        datetime.Activity_End_Time = item?.Activity_End_Time;
                    }

                    for (let i = 0; i < list_date_string.length; i++) {
                        let item = list_date_string[i];
                        let exists_date = await trx.table('Activity_Upload')
                            .where('User_ID', User_ID)
                            .where(builder => {
                                builder.whereRaw('??::date = ?::date', ['Activity_Upload_Datetime', new Date(item.key)]);
                            })
                            .first();

                        if (exists_date) {
                            await trx.table('Activity_Upload')
                                .where('User_ID', User_ID)
                                .where('Activity_Upload_ID', exists_date.Activity_Upload_ID)
                                .update({
                                    Upload_Period_End_Time: new Date(item.array_time[item.array_time.length - 1].end)
                                });
                        } else {
                            await trx.table('Activity_Upload')
                                .insert({
                                    User_ID: User_ID,
                                    Activity_Upload_Datetime: new Date(item.key),
                                    Upload_Period_Start_Time: new Date(item.array_time[0].start),
                                    Upload_Period_End_Time: new Date(item.array_time[item.array_time.length - 1].end)
                                });
                        }
                    }

                    //Lấy Activity_Upload_ID
                    for (let i = 0; i < payload.length; i++) {
                        let item = payload[i];

                        let activity_upload = await trx.table('Activity_Upload')
                            .where('User_ID', User_ID)
                            .where(builder => {
                                builder.whereRaw('??::date = ?::date', ['Activity_Upload_Datetime', new Date(item.Activity_Start_Time)]);
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
    }
};

module.exports = resolvers;
