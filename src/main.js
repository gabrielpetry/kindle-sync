const {
    app,
    Tray,
    shell,
    Menu
} = require('electron')
const path = require('path')
const notifier = require('./notifier')
const ebookWatcher = require("./ebookWatcher")
// One-liner for current directory
const fs = require('fs')

const { LOGFILE, log } = require('./log')

const configurationDir = app.getPath('userData')

const assetsDirectory = path.join(__dirname, 'assets')
const CONFIGFILE = path.join(configurationDir, 'config.json')
let tray = undefined

app.on('ready', () => {
    log("App Started")

    if (!fs.existsSync(configurationDir)) {
        log(`${configurationDir} does not exists, creating`)

        fs.mkdirSync(configurationDir);
    }

    if (!fs.existsSync(CONFIGFILE)) {
        log(`${CONFIGFILE} doest no texists, creating`)
        let defaultconfig = {
            ebookPath: "",
            sender_email: "",
            smtp_password: "",
            smtp_server: "",
            smtp_port: 587,
            receiver_email: ""
        }
        fs.writeFileSync(CONFIGFILE, JSON.stringify(defaultconfig, null, 4 , 'utf-8'))
    }
    createTray()

    try {
        const config = require(CONFIGFILE)
        if (config.ebookPath == "") {
            notifier("Error", "You need to configure the program and relaunch")
            shell.openExternal(CONFIGFILE)
            app.isQuiting = true
            app.quit()
            throw "Config file doest not exists"
            return;
        }
        log(config)
        ebookWatcher(config)
    } catch (exception) {
        notifier("Error starting app", exception)
        log(exception.toString(), "ERROR")
    }
})

const createTray = () => {
    // http://robinweatherall.co.uk
    tray = new Tray(path.join(assetsDirectory, 'Robinweatherall-Library-Books.ico'))
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Config', click: function() {
            shell.openExternal(CONFIGFILE)
        }},
        { label: 'Logs', click: function() {
            shell.openExternal(LOGFILE)
        }},
        { label: 'Database', click: function() {
            shell.openExternal(path.join(process.cwd(), 'database.json'))
        }},
        { label: 'Quit', click:  function() {
            app.isQuiting = true;
            app.quit();
        }}
      ])

      tray.setContextMenu(contextMenu)
}
