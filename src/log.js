const fs = require('fs');
const path = require('path')
const { app } = require('electron')
const LOGFILE = path.join(app.getPath('userData'), 'application.log')

module.exports = {
    LOGFILE,
    log: (message, level = "info") => {
        try {
            const now = new Date();
            if (["object"].includes(typeof message)) {
                message = JSON.stringify(message, null, 4 , 'utf-8')
            }
            let log_message = 
                `${now.toGMTString()} [${level}] ${message}\n`
                
            console.log(log_message)
            return fs.appendFile(LOGFILE, log_message, err => {
                if (!err) return true
                console.log(err)
                return false
            })
        } catch (error) {
            console.log(error)
        }
    }
}