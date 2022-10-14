import Toast from 'react-native-toast-message';
import {Dimensions, Platform} from "react-native";
import "intl"
import "intl/locale-data/jsonp/en"
import { HTTPS_URL, HTTP_URL } from '../config';

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const dayOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const convertArrayToObject = (array, key) => {
    return array.reduce((obj, item) => {
        return {
            ...obj,
            [item[key]]: item,
        };
    }, {});
};

export const convertArrayToObjectIndex = (array, key) => {
    let obj: any = {};
    array.map((item, index) => {
        obj[item[key]] = index
    });
    return obj
};

export const regexString = (string: string) => {
    if (string?.trim() == '') {
        return true
    }
    return false
};

export const regexPhone = (string: string) => {
    if (regexString(string)) {
        return true
    }
    let reg = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\.\/0-9]*$/;
    if (!reg.test(string)) {
        return true
    }
    return false
};

export const regexDecimal = (string: string) => {
    if (regexString(string)) {
        return true
    }
    let reg = /^\d+(\.\d)?\d*$/;
    if (!reg.test(string)) {
        return true
    }
    return false
};

export const regexEmail = (string: string) => {
    let reg = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!reg.test(string)) {
        return true
    }
    return false
};

export const regexPassword = (string: string) => {
    // let reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // let reg = /^(?=.*[a-z])^(?=.*[0-9])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    let reg = /^(?=.*[a-z])^(?=.*[0-9])(?=.*[A-Z])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/;
    if (!reg.test(string)) {
        return true
    }
    return false
};

export const showToast = (type, text1, text2 = null, visibilityTime = 2500) => {
    let params: any;
    if (text1) {
        params = {
            type,
            text1,
            text2,
            visibilityTime,
        };
    } else {
        params = {
            type,
            text1,
            visibilityTime,
        };
    }
    Toast.show(params);
};

export const isIphoneWithNotch = () => {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        (dimen.height === 780 ||
            dimen.width === 780 ||
            dimen.height === 812 ||
            dimen.width === 812 ||
            dimen.height === 844 ||
            dimen.width === 844 ||
            dimen.height === 896 ||
            dimen.width === 896 ||
            dimen.height === 926 ||
            dimen.width === 926)
    );
};

export const StatusBarHeight = Platform.select({
    ios: isIphoneWithNotch() ? 44 : 20,
    // android: StatusBar.currentHeight,
    android: 0,
    default: 0
});

const padTo2Digits = (num) => {
    return num.toString().padStart(2, "0")
};

export const dateToTimestamp = (date) => {
    return date?.getTime()
};

export const getDay = (date) => {
    return padTo2Digits(date.getDate())
};

export const getHouse = (date) => {
    date = new Date(date)
    return padTo2Digits(date.getHours()) + ':' + padTo2Digits(date.getMinutes())
};

export const getMonth = (date) => {
    return monthNames[date.getMonth()]
};

export const timestampToDate = (timestamp, type = null) => {
    const date = new Date(timestamp);
    // if (Platform.OS === "ios") {
    //
    // } else {
    //     date.setHours(date.getHours() - 7)
    // }
    const day = padTo2Digits(date.getDate());
    const month = padTo2Digits(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = padTo2Digits(date.getMinutes());
    const seconds = padTo2Digits(date.getSeconds());
    if (type == "dd/MM/YYYY hh:mm") {
        return `${day}/${month}/${year} ${hours}:${minutes}`
    } else if (type == "YYYY-MM-dd") {
        return `${year}-${month}-${day}`
    }
    else if (type == "dd/MM/YYYY hh:mm:ss") {
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    }
    return [
        day,
        month,
        year,
    ].join("/")
};

export const formatDate = (date, type = null) => {
    if (date == null) {
        return ''
    }
    date = new Date(date);
    // if (Platform.OS === "ios") {
    //
    // } else {
    //     date.setHours(date.getHours() - 7)
    // }
    if (type == "dd/MM/YYYY hh:mm") {
        return `${padTo2Digits(date.getDate())}/${padTo2Digits(date.getMonth() + 1)}/${date.getFullYear()} ${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}`
    } else if (type == "hh:mm") {
        return `${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}`
    } else if (type == "dd MM YYYY") {
        return `${padTo2Digits(date.getDate())} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
    } else if (type == "MM YYYY") {
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    }else if (type == "dd/MM/YY hh:mm") {
        return `${padTo2Digits(date.getDate())}/${padTo2Digits(date.getMonth() + 1)}/${date.getFullYear()?.toString().substr(-2)} ${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}`
    }else if (type == "hh:mm:ss") {
        return `${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}:${padTo2Digits(date.getSeconds())}`
    }
    else if (type == "dd/MM/YYYY hh:mm:ss") {
        return `${padTo2Digits(date.getDate())}/${padTo2Digits(date.getMonth() + 1)}/${date.getFullYear()} ${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}:${padTo2Digits(date.getSeconds())}`
    }
    
    return [
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getMonth() + 1),
        date.getFullYear(),
    ].join("/")
};

export const formatNumber = (value, lamTron = false) => {
    if (isNaN(value)) {
        return 0
    }
    if (lamTron) {
        value = Math.round(value)
    }
    let number = new Intl.NumberFormat("en-US", {
        style: "decimal",
    }).format(value);
    if (number) {
        return number
        // return number.replace(/[.,]/g, function(x) {
        // return x == "," ? "." : ","
        // })
    }
    return 0
};

export const numberFormat = (value) => {
    if (isNaN(value)) {
        return 0
    }
    var re = '\\d(?=(\\d{' + 3 + '})+' + '\\D' + ')';
    var num = value.toFixed(Math.max(0, ~~2));
    var str = num.replace(new RegExp(re, 'g'), '$&' + ',');
    return str;
}

export const displayMultiSelect = (list, value, type) => {
    let label = "";
    if (value?.length && list?.length) {
        for (let i = 0; i < value.length; i++) {
            label += list[value[i]?.row][type];
            if (i != value.length - 1) {
                label += ", "
            }
        }
        return label
    }
    return ''
};

export const displaySelect = (list, value, type) => {
    let label = "";
    if (value && list?.length) {
        label += list[value?.row][type];
        return label
    }
    return ''
};

export const calculateDate = (date1, date2) => {
    let milliSeconds = Math.abs(date2 - date1);
    return convertToDays(milliSeconds)
};

const convertToDays = (milliSeconds) => {
    let days = Math.floor(milliSeconds / (86400 * 1000));
    milliSeconds -= days * (86400 * 1000);
    let hours = Math.floor(milliSeconds / (60 * 60 * 1000));
    milliSeconds -= hours * (60 * 60 * 1000);
    let minutes = Math.floor(milliSeconds / (60 * 1000));
    return `${days} days, ${hours} hours, ${minutes} minutes`;
};

export const stripHtml = (html) => {
    const regex = /(<([^>]+)>)/ig;
    return html.replace(regex, '')
};

export const getDiffDate = (date1: Date, date2: Date) => {
    date1 = new Date(date1);
    if (date1.getTime() > date2.getTime()) {
        return '+0: 00: 00: 00';
    }

    if (!date1) {
        return '+0: 00: 00: 00';
    }

    let diffTime = Math.abs(+date2 - +date1); //milliseconds

    let D = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let remain1 = diffTime - D * (1000 * 60 * 60 * 24);
    let H: any = Math.floor(remain1 / (1000 * 60 * 60));
    if (H < 10) {
        H = '0' + H;
    }

    let remain2 = remain1 - H * (1000 * 60 * 60);
    let M: any = Math.floor(remain2 / (1000 * 60));
    if (M < 10) {
        M = '0' + M;
    }

    let remain3 = remain2 - M * (1000 * 60);
    let S: any = Math.floor(remain3 / 1000);
    if (S < 10) {
        S = '0' + S;
    }

    return '+' + D + ': ' + H + ': ' + M + ': ' + S;
};

export const getRemainDay = (date1: Date, date2: Date) => {
    date1 = new Date(date1);
    date2 = new Date(date2);
    if (date1.getTime() > date2.getTime()) {
        return '0-days Remaining';
    }

    if (!date1 || !date2) {
        return '0-days Remaining';
    }

    let diffTime = Math.abs(+date2 - +date1); //milliseconds

    let D = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return D + '-days Remaining';
};

export const getQueryVariable = (url: string) => {
    let regex = /[?&]([^=#]+)=([^&#]*)/g,
        params: any = {},
        match;
    while (match = regex.exec(url)) {
        params[match[1]] = match[2];
    }
    return params
};

export const getDaysInMonth = (time) => {
    time = timestampToDate(time, 'YYYY-MM-dd');
    time = new Date(time);
    let month = padTo2Digits(time.getMonth());
    month = parseInt(month);
    let year = time.getFullYear();
    year = parseInt(year);

    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
        date.setHours(7, 0, 0);
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
};

export const dates = (current) => {
    current = new Date(current);
    current.setHours(7, 0, 0);
    const week: any = [];
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
        week[i] =  dayOfWeek[week[i]?.getDay()]
    }
    return week;
};

export const getDayOfWeek = (date) => {
    date = new Date(date);
    date.setDate(date.getDate() - 1);
    return dayOfWeek[date.getDay() ]
}

export const getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

export const replaceHTTP = (url) => {
    let _url = ''
    if(url){   
        _url = url.replace(HTTPS_URL,HTTP_URL)  
    }
    return _url
}
