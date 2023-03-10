const formidable = require('formidable')
const { Request, Response } = require('express')

const form = formidable({ multiples: true }) // req.files will be an array

/**
 * Parses multipart form data and sets the body and files fields in the request object
 * @param {Request} req request object
 * @param {Response} res response object
 * @param {function} next calls the next middleware/route
 */
function parseMultipartForm(req, _, next) {
  const contentType = req.headers['content-type']

  if (contentType && contentType.indexOf('multipart/form-data') !== -1) {
    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err)
        return
      }

      // sets fields in request object
      req.body = fields
      req.files = files
      next() // continues to the next middleware/route
    })
  }
  next()
}

module.exports = parseMultipartForm
