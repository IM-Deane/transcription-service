const EventEmitter = require('events')

class EventEmitterManagerService extends EventEmitter {
  constructor() {
    super()
    this.sseEmitters = {} // initialize
  }

  /**
   * Creates an emitter and adds it to cache and emits an `GUID` event.
   * @param {string} guid UUID of emitter
   */
  createEmitter(guid) {
    if (!guid) return

    this.sseEmitters[guid] = new EventEmitter()
    console.log(`New SSE: ${guid}`)

    return this.sseEmitters[guid]
  }

  /**
   * Retrieves an existing emitter from the cache
   * @param {string} guid UUID of emitter
   */
  getEmitter(guid) {
    if (!guid) return
    return this.sseEmitters[guid]
  }

  /**
   * Adds an existing emitter to cache and emits an `GUID` event.
   * @param {string} guid UUID of emitter
   * @param {EventEmitter} emitter instance being stored
   */
  setEmitter(guid, emitter) {
    if (!guid || !emitter) return

    this.sseEmitters[guid] = emitter
    console.log(`Added emitter to cache: ${guid}`)
  }

  /**
   * Removes emitter from cache
   * @param {string} guid UUID of emitter
   */
  removeEmitter(guid) {
    delete this.sseEmitters[guid]
  }
}

module.exports = new EventEmitterManagerService()
