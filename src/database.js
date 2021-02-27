const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const { app } = require('electron')
const path = require('path')

const DBPATH = path.join(app.getPath('userData'), 'database.json')
const adapter = new FileSync(DBPATH)
const db = low(adapter)

db.defaults({ books: [], count: 0 })
  .write()

module.exports = {
    db,
    getBooks: () => {
        return db.get('books').value()
    },
    findOne: (path) => {
        return db.get('books').find(o => o == path).value()
    },
    insertOne: (item) => {
        return db.get('books').push(item).write()
    }
}
