const { v4: uuidv4 } = require('uuid')

const EventEmitterManagerService = require('../utils/event-service')
const { serverCache } = require('../cache')
const { removeClientAndEmitter } = require('../utils')

/**
 * Register's a new client connection
 * @param {*} req Handles the request from the client
 * @param {*} res Handles the response to the client
 */
function registerClient(req, res) {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache'
  }

  res.writeHead(200, headers)

  const guid = uuidv4().toString() // generate id for event emitter
  EventEmitterManagerService.setEmitter(guid, res)

  // send a guid event and data to client
  res.write(`event: GUID\n`)
  res.write(`data: ${guid}`)
  res.write('\n\n') // end of chunk

  const clientId = uuidv4().toString()
  const newClient = { id: clientId, response: res }
  serverCache.clients[clientId] = newClient // cache client

  res.flush() // flushing buffer to send event to client

  // LISTENERS
  req.on('error', (error) => {
    console.log('Connection error', error.message)

    // removeClientAndEmitter(clientId, guid);
  })

  req.on('close', () => {
    console.log(`${clientId} Connection closed`)
    // removeClientAndEmitter(clientId, guid);
  })
}

module.exports = {
  registerClient
}
