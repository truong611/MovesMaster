const fs = require("fs");
const path = require('path');

module.exports = async (context, result) => {
    let current_datetime = new Date();
    let formatted_date = `Log_${current_datetime.getFullYear()}_${current_datetime.getMonth() + 1}` +
        `_${current_datetime.getDate()}.txt`

    let contentLog = `${current_datetime.toTimeString()} currentUser: ${JSON.stringify(context?.currentUser?.User_Email)} ` +
        ` ${JSON.stringify(result.toString())}`

    fs.appendFile(path.join(__dirname, `../log/${formatted_date}`), `${contentLog}` + "\n", err => {
        if (err) {
            console.log(err);
        }
    });
}