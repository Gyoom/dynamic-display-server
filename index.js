const express = require("express")

var bodyParser = require("body-parser");
const middlewares = require('./utils/middlewares')

const configRouter = require('./routes/config')
const slidesRouter = require('./routes/slides')
const picturesRouter = require('./routes/pictures')

const app = express()

app.use(middlewares.cors)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))
app.use(middlewares.logger)
app.use(middlewares.errorHandler)

app.use('/config', configRouter)
app.use('/slides', slidesRouter)
app.use('/pictures', picturesRouter)


app.listen(4000, () => {
  console.log(`Server running on port ${4000}`)
})