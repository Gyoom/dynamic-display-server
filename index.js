const express = require("express")

const middlewares = require('./utils/middlewares')
const configRouter = require('./routes/config')
const screenshotsRouter = require('./routes/screenshots')

const app = express()

app.use(middlewares.logger)
app.use(middlewares.cors)


app.use('/config', configRouter)
app.use('/screenshots', screenshotsRouter)

app.use(middlewares.errorHandler)

app.listen(4000, () => {
  console.log(`Server running on port ${4000}`)
})