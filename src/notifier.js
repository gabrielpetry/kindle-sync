
const { Notification } = require('electron')
const path = require('path')

module.exports = function(
    title,
    body
    ) {
    const notification = {
        title,
        body,
        silent: true
    }
    new Notification(notification).show()
}