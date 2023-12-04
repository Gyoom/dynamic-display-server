const {MONGODB_URI, PORT} = require('./utils/config')
const path = require("path");
const express = require("express")
const mongoose = require('mongoose')

var bodyParser = require("body-parser");
const middlewares = require('./utils/middlewares')

const configRouter = require('./routes/configs')
const slidesRouter = require('./routes/slides')
const picturesRouter = require('./routes/pictures')
const buildPath = path.normalize(path.join(__dirname, '/public'))

mongoose.connect(MONGODB_URI)

const app = express()


app.use(middlewares.cors)
const rootRouter = express.Router()
app.use(express.static(buildPath))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))
app.use(middlewares.logger)
app.use(middlewares.errorHandler)


app.use('/api/config', configRouter)
app.use('/api/slides', slidesRouter)
app.use('/api/pictures', picturesRouter)


rootRouter.get('(/*)?', async (req, res, next) => {
  res.sendFile(path.join(buildPath, 'index.html'));
})

app.use(rootRouter)


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})