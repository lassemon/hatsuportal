import 'dotenv/config' // this import needs to be the first thing the application does for env to be available
import app from './app'
import swaggerUI from 'swagger-ui-express'

const port = process.env.PORT || 80

if (process.env.NODE_ENV !== 'production') {
  console.log(`Setting up swagger documentation to http://localhost:${port}/docs`)
  // SwaggerUI
  const swaggerDocument = require('../swagger.json')
  app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
}

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
