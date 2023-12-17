const mongoose = require('mongoose')

// Define Schema
const SerieSchema = new mongoose.Schema({
  id: String,
  name: String,
  slides: Array,
  reloadDelay: Number,
  displayDelay: Number,
  transitionDelay: Number
})

SerieSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// Export model
module.exports = mongoose.model('Serie', SerieSchema)