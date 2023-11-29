const express = require("express")

const middlewares = require('./utils/middlewares')

const configRouter = require('./routes/config')
const screenshotsRouter = require('./routes/screenshots')

const app = express()

app.use(express.json())
app.use(middlewares.logger)
app.use(middlewares.cors)
app.use(middlewares.errorHandler)

// app.use(express.urlencoded({
//   extended: true
// }))
// app.use(express.static('public'))


app.use('/config', configRouter)
app.use('/screenshots', screenshotsRouter)


app.listen(4000, () => {
  console.log(`Server running on port ${4000}`)
})