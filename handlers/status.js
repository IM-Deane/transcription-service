const { clients } = require('../cache')

/**
 * Returns the current number of clients connected
 * @param {*} res Handles the response to the client
 */
function getStatus(_, res) {
  res.json({ clients: clients.length })
}

module.exports = {
  getStatus
}
