// Side-effect import: loads the Reflect.metadata polyfill required by tsyringe and TSOA
// decorators. Must run before compositionRoot or any controller is imported in system tests.
import 'reflect-metadata'

// Relative path keeps FileSystemImageStorageService working on Windows (avoids `./C:\...` paths).
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? 'postgres://test:test@localhost:5433/hatsuportal_test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.API_KEY = 'test-api-key'
process.env.NODE_ENV = 'test'
process.env.IMAGES_BASE_PATH = 'hatsuportal-backend-test-images'
process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'SILENT'
