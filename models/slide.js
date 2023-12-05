const mongoose = require('mongoose')

// Define Schema
const slideSchema = new mongoose.Schema({
  id: String,
  order: Number,
  name: String,
  domain: String,
  webpagePathData: String,
  picture:String
})

slideSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// Export model
module.exports = mongoose.model('Slide', slideSchema)