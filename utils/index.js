const { clients } = require('../cache')
const EventEmitterManagerService = require('./event-service')

/**
 * Removes client and event emitter from cache
 * @param {string} clientId UUID of client
 * @param {string} guid UUID of SSE emitter
 */
function removeClientAndEmitter(clientId, guid) {
  delete clients[clientId]
  EventEmitterManagerService.removeEmitter(guid)
}

/**
 * Accepts a time in milliseconds and formats it into a human-readable string
 * @param {number} timeInMillis
 * @returns {string} formatted time string (MM:SS:mins or SS:secs)
 */
function formatCompletionTime(timeInMillis) {
  if (!timeInMillis) {
    throw new Error('No time provided!')
  } else if (typeof timeInMillis !== 'number') {
    throw new Error('Time provided is not a number!')
  }

  let formattedTime = ''
  const seconds = Math.floor((timeInMillis / 1000) % 60)
  const minutes = Math.floor((timeInMillis / 1000 / 60) % 60)

  if (minutes > 0) {
    formattedTime = [
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
      'mins'
    ].join(':')
  } else {
    formattedTime = seconds.toString().padStart(2, '0') + 'sec'
  }
  return formattedTime
}

module.exports = {
  removeClientAndEmitter,
  formatCompletionTime
}
