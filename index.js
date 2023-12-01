const express = require("express")

var bodyParser = require("body-parser");
const middlewares = require('./utils/middlewares')
const configRouter = require('./routes/config')
const screenshotsRouter = require('./routes/screenshots')

const app = express()

app.use(middlewares.cors)
//app.use(express.json())
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use(middlewares.logger)
app.use(middlewares.errorHandler)

app.use('/config', configRouter)
app.use('/screenshots', screenshotsRouter)


app.listen(4000, () => {
  console.log(`Server running on port ${4000}`)
})