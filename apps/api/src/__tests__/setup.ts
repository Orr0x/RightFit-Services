// Jest setup file for global test configuration

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key'
process.env.JWT_ACCESS_EXPIRY = '1h'
process.env.JWT_REFRESH_EXPIRY = '30d'
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/test_db'

// Increase test timeout if needed
jest.setTimeout(10000)
