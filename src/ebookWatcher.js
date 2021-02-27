const chokidar = require('chokidar');
const database = require("./database")
const fs = require('fs')
const exec = require('child_process').exec;
const notifier = require('./notifier');
const sendEmail = require('./email')
const path = require('path')
const { log } = require('./log')

fileTypes = [
    "*.pdf",
    "*.mobi",
    "*.epub",
    "*.azw3"
]

function convertEbook(input, output) {
    cmd = `ebook-convert "${input}" "${output}"`

    return new Promise((resolve, reject) => {
     exec(cmd, (error, stdout, stderr) => {
      if (error || stderr) {
       resolve(false)
      }
      resolve(true)
     })
    })
   }

   
module.exports = function(config) {
    if (config.ebookPath == "") return
    chokidar.watch(config.ebookPath).on('add', async (file_path, event) => {
        try {
            // if exists in db ignores
            if (database.findOne(file_path)) return

            const file_name = path.basename(file_path)
            // if too large it ignores
            if (fs.statSync(file_path).size / (1024*1024) > 25) {
                notifier("Error", `Ebook too large to be sent by email ${file_name} to .mobi`)
                database.insertOne(file_path)
                log(`Inserted ${file_name} into databse, cause it's too large and won't be sent.`)
                return;
            }

            if (['epub'].includes(file_path.slice(-4))) {
                log(`Started to convert ${file_name} to .mobi`)
                // console.log("epub or mobi")
                let output_temporary = path.join(
                    path.dirname(file_path),
                "..",
                path.basename(file_path, ".epub") + ".mobi" 
                )

                let output_permanent = path.join(
                    path.dirname(file_path),
                path.basename(file_path, ".epub") + ".mobi" 
                )

                let input = file_path.replace('\\', '/')
                let conversion = await convertEbook(input, output_temporary)
                log(`Conversion Finished: ${file_name} to .mobi, moving to working dir`)
                // if sucessfull then remove the old file
                if (conversion) {
                    fs.unlinkSync(file_path)
                    console.log(output_temporary, output_permanent)
                    fs.rename(output_temporary, output_permanent, function (err) {
                        if (err) console.log(err) 
                    })
                    log(`Successfully converted and removed ${file_name}`)
                    notifier("Completed", `Completed conversion of ${file_name} to .mobi`)
                } else {
                    console.log("Something bad Happend")
                }

                return;
            }

            if (['mobi', '.pdf', 'azw3'].includes(file_path.slice(-4))) {
                log(`Started to send ${file_name} via email`)
                let email = sendEmail({ ...config, filepath: file_path })
                if (email) {
                    database.insertOne(file_path)
                    notifier("Success", `Sent ebook via email: ${file_name}`)
                    log(`Email send sucessfully ${file_name}`)
                }
                return;
            }

            log(`I don't know how to handle: ${file_name}`)
            database.insertOne(file_path)
        } catch (error) {
            log(error.toString(), "error")
        }
    })

    
}