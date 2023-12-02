const morgan = require('morgan')
var cors = require('cors')
const NotFoundError = require('./NotFoundError')

morgan.token('body', req => JSON.stringify(req.body))

const Logger = morgan('[:date[clf]] [:referrer] :method :url :status :res[content-length] :response-time ms')

const Cors = cors()

// Error handler
const ErrorHandler = (error, req, res, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
      return res.status(400).send({ error: 'malformatted id' })
    }
    if (error instanceof NotFoundError) {
      return res.status(404).end()
    }
    next(error)
  }
  
exports.logger = Logger
exports.cors = Cors
exports.errorHandler = ErrorHandler
