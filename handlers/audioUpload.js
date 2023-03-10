const fs = require('fs')
const { spawn } = require('child_process')

const formidable = require('formidable')
const mv = require('mv')

const EventEmitterManagerService = require('../utils/event-service')
const { formatCompletionTime } = require('../utils/index')

/**
 * Handles file upload and audio transcription
 * @param {*} req Handles the request from the client
 * @param {*} res Handles the response to the client
 */
function uploadAndTranscribeAudio(req, res) {
  const form = formidable({ multiples: true })

  // parse multi-part form data
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }

    const guid = fields.guid
    const sseEmitter = EventEmitterManagerService.getEmitter(guid)

    try {
      // validate audio file
      if (!files || !files.file.mimetype.includes('audio/')) {
        res.status(400).json({ message: 'Invalid file detected.' })
        return
      }

      // mock progress events at 40%
      sseEmitter.write(`event: ${guid}\n`)
      sseEmitter.write(`data: ${JSON.stringify({ progress: 40 })}`)
      sseEmitter.write('\n\n')
      sseEmitter.flush() // end of chunk

      // create unique filename
      const timestamp = new Date().toISOString()
      const filename = `${timestamp}-${files.file.originalFilename}`

      // create temp audio file
      const oldPath = files.file.filepath
      const newPath = `./temp/${filename}`
      mv(oldPath, newPath, (err) => err && console.log(err))

      let completionTime = 0
      const startTime = Date.now()
      // use python to transcribe file's audio to text
      const python = spawn('python', ['python/transcribe.py', newPath])

      let transcribedText = ''
      python.stdout
        .on('data', (chunk) => {
          // send progress event to client
          sseEmitter.write(`event: ${guid}\n`)
          sseEmitter.write(`data: ${JSON.stringify({ progress: 80 })}`)
          sseEmitter.write('\n\n')
          sseEmitter.flush() // end of chunk

          transcribedText = chunk.toString() // save transcribed text
        })
        .on('end', () => {
          // send final progress to client
          sseEmitter.write(`event: ${guid}\n`)
          sseEmitter.write(`data: ${JSON.stringify({ progress: 100 })}`)
          sseEmitter.write('\n\n')
          sseEmitter.flush() // end of chunk

          const endTime = Date.now()
          completionTime = endTime - startTime
        })

      python.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`) // handle errors
      })

      python.on('close', () => {
        const filenameNoExt = filename.substring(0, filename.lastIndexOf('.'))
        const formattedTime = formatCompletionTime(completionTime)
        console.log(`Process finished in ${formattedTime}`)

        // send file data
        res.status(200).json({
          result: 'File uploaded and transcribed successfully',
          filename: filenameNoExt,
          transcribedText,
          completionTime: formattedTime
        })

        // cleanup temp file
        fs.unlink(newPath, (err) => err && console.error(err))
      })
    } catch (error) {
      sseEmitter.write('error', error)
      res.status(500).json({ message: error.message })
      EventEmitterManagerService.removeEmitter(guid) // remove event emitter
    }
  })
}

module.exports = {
  uploadAndTranscribeAudio
}
