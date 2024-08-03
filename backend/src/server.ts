import app from './app'
import swaggerUI from 'swagger-ui-express'

const port = process.env.PORT || 8080

// Wait for tsyringeContainer initialization before starting server
;(async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Setting up swagger documentation to http://localhost/docs`)
    const swaggerDocument = require('../build/swagger.json')
    app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
  }

  app.listen(port, () => console.log(`App listening on port ${port}`))
})()
