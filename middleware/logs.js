const fs = require('fs');
const path = require('path');
const date = require('date-fns');

// if(!fs.existsSync('logs')){
//     fs.mkdirSync('logs');
// };

function logs(method,url,origin,userip){
    const datetime = `${date.format(new Date(),'yyyy-MM-dd\tHH:mm:ss')}`;
    const data = `\n${datetime} ${method} at ${url} by ${origin} with ip ${userip}`;
    // fs.appendFileSync(path.join('.','logs','logs.txt'),data);
};

module.exports = logs;
