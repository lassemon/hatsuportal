import 'dotenv/config' // this import needs to be the first thing the application does for env to be available
import app from './app'
import swaggerUI from 'swagger-ui-express'
import fs from 'fs'
import https from 'https'

//import { configureContainer } from './container'
//import { DomainEventHandlerRegistry } from './infrastructure/services/DomainEventHandlerRegistry'

const HTTPS_PORT = '443'

const port = process.env.PORT || 443
const key = fs.readFileSync('./cert/server.key')
const cert = fs.readFileSync('./cert/server.cert')

// The DomainEventHandlerRegistry constructor will automatically call registerHandlers()
//await container.resolve(DomainEventHandlerRegistry)

if (process.env.NODE_ENV !== 'production') {
  console.log(`Setting up swagger documentation to ${port === HTTPS_PORT ? 'https://localhost/docs' : `http://localhost:${port}/docs`}`)
  // SwaggerUI
  const swaggerDocument = require('../build/swagger.json')
  app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
}

const httpsServer = https.createServer({ key, cert }, app)
httpsServer.listen(port, () => console.log(`App listening at ${port === HTTPS_PORT ? 'https://localhost' : `http://localhost:${port}`}`))
