const express = require('express')
const router = express.Router()

router.get('/', (_, res) => {
  res.send('Hello from the Event Server!')
})

module.exports = router
