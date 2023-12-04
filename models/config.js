const mongoose = require('mongoose')

// Define Schema
const configSchema = new mongoose.Schema({
  reloadDelay: Number,
  displayDelay: Number
})

configSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// Export model
module.exports = mongoose.model('Config', configSchema)