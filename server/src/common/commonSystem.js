const db = require('../data/knex-db');

const commonSystem = {
  convertDateToString: (date) => {
    try {
      let _date = new Date(date);

      let dd = _date.getDate();
      let MM = _date.getMonth() + 1;
      let yyyy = _date.getFullYear();

      let _dd = '';
      if (dd < 10) _dd = '0' + dd;
      else _dd = dd.toString();

      let _MM = '';
      if (MM < 10) _MM = '0' + MM;
      else _MM = MM.toString();

      return _dd + '/' + _MM + '/' + yyyy;
    }
    catch (e) {
      throw new Error(e);
    }
  },
  roundNumber: function (number = 0, unit = -1) {
    let result = number;
    switch (unit) {
      case 0: {
        result = Math.round(number);
        break;
      }
      case 1: {
        result = Math.round(number * 10) / 10;
        break;
      }
      case 2: {
        result = Math.round(number * 100) / 100;
        break;
      }
      case 3: {
        result = Math.round(number * 1000) / 1000;
        break;
      }
      case 4: {
        result = Math.round(number * 10000) / 10000;
        break;
      }
      default: {
        result = result;
        break;
      }
    }
    return result;
  },
  getRemainDay: (date1, date2) => {
    if (!date1 || !date2) return null;

    if (date1.getTime() > date2.getTime()) {
      return null;
    }

    date1.setSeconds(0);
    date1.setMilliseconds(0);

    date2.setSeconds(0);
    date2.setMilliseconds(0);

    let diffTime = Math.abs(+date2 - +date1); //milliseconds

    let D = commonSystem.roundNumber(diffTime / (1000 * 60 * 60 * 24), 1);

    return D;
  },
  padTo2Digits: (num) => {
    return num.toString().padStart(2, "0")
  },
  formatDate: (date, type = null) => {
    date = new Date(date);
    return [
      date.getFullYear(),
      commonSystem.padTo2Digits(date.getMonth() + 1),
      commonSystem.padTo2Digits(date.getDate()),
    ].join("-")
  },
  setTimeToDate: (date = new Date) => {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  },
  getListRangeDate: (start, end) => {
    let baseTime = 24 * 60 * 60 * 1000;
    let diffTime = end.getTime() - start.getTime();
    let diffDay = Math.ceil(diffTime / baseTime);
    let list = [];

    if (diffDay == 1) {
      list.push([start, new Date(commonSystem.setTimeToDate(start).getTime() + baseTime)]);
      list.push([new Date(commonSystem.setTimeToDate(start).getTime() + baseTime), end]);
    }
    else if (diffDay > 1) {
      for (let i = 0; i < diffDay; i++) {
        if (i == 0) {
          let nextDate = new Date(commonSystem.setTimeToDate(start).getTime() + ((i + 1) * baseTime));
          list.push([start, nextDate]);
        }
        else if (i == diffDay - 1) {
          let nextDate = new Date(commonSystem.setTimeToDate(start).getTime() + ((i + 1) * baseTime));
          list.push([nextDate, end]);
        }
        else {
          let nextDate = new Date(commonSystem.setTimeToDate(start).getTime() + ((i + 1) * baseTime));
          list.push([nextDate, nextDate.setDate(nextDate.getDate() + 1)]);
        }
      }
    }

    return list;
  },
  addDays: (date, num) => {
    date.setDate(date.getDate() + num);
    return date;
  },
  getDonate: async (User_ID, trx = db) => {
    let Donated_Moves = 0;
    let Amount_Donated = 0;
    let Moves_Avaiable = 0;

    let Upload_Moves = 0;
    let Activity_Upload = await trx.table('Activity_Upload')
      .where('User_ID', User_ID);
    if (Activity_Upload?.length) {
      let Activity_Upload_ID = [];
      for (let i = 0; i < Activity_Upload.length; i++) {
        let item = Activity_Upload[i];
        Activity_Upload_ID = [...Activity_Upload_ID, item?.Activity_Upload_ID]
      }
      let Activity_Entry = await trx.table('Activity_Entry')
        .whereIn('Activity_Upload_ID', Activity_Upload_ID)
        .where('Include_YN', true);
      if (Activity_Entry?.length) {
        for (let i = 0; i < Activity_Entry.length; i++) {
          let item = Activity_Entry[i];
          Upload_Moves += parseFloat(item?.Moves_Arising)
        }
      }
    }

    let Donation = await trx.table('Donation')
      .where('User_ID', User_ID);
    for (let i = 0; i < Donation.length; i++) {
      let item = Donation[i];
      Donated_Moves += parseFloat(item?.Moves_Donated)
      Amount_Donated += parseFloat(item?.Sterling_Amount);
    }

    Moves_Avaiable = Upload_Moves - Donated_Moves;
    return { Donated_Moves, Amount_Donated, Moves_Avaiable }
  },
  getDaysInWeek: (current, type = 'dayOfMonth') => {
    const dayOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    current = new Date(current);
    current.setHours(7, 0, 0);
    const week = [];
    // Starting Monday not Sunday
    if (current.getDay() == 0) {
      current.setDate(current.getDate() - 1);
    }
    current.setDate((current.getDate() - current.getDay() + 1));
    for (let i = 0; i < 7; i++) {
      week.push(
          new Date(current)
      );
      current.setDate(current.getDate() + 1);
    }
    for (let i = 0; i < week.length; i++) {
      if (type == 'dayOfMonth') {

      } else if(type == 'dayOfWeek') {
        week[i] =  dayOfWeek[week[i]?.getDay()]
      }
    }
    return week;
  },
  getDaysInMonth: (date, format = null) => {
    date = new Date(date);
    let year = date.getFullYear();
    let month = date.getMonth();
    date = new Date(year, month, 1);
    date.setHours(7, 0, 0);
    const days = [];
    while (date.getMonth() === month) {
      if (format == 'YYYY-MM-dd') {
        days.push(commonSystem.formatDate(new Date(date)));
      } else {
        days.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  },
};


module.exports = commonSystem;
