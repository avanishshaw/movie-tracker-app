# Cinema Tracker Test Suite

This directory contains comprehensive test suites for the Cinema Tracker backend API.

## Test Structure

### Test Files

- **`auth.test.js`** - Authentication endpoint tests (registration, login, validation)
- **`media.test.js`** - Media CRUD operations and permissions tests
- **`user.test.js`** - User profile and authentication middleware tests
- **`admin.test.js`** - Admin-specific functionality tests (approval/rejection workflows)
- **`integration.test.js`** - End-to-end workflow and multi-user scenario tests
- **`setup.js`** - Test environment setup and database configuration
- **`utils/testHelpers.js`** - Reusable test utilities and helper functions

### Test Categories

#### 1. Authentication Tests (`auth.test.js`)
- User registration with validation
- User login with various scenarios
- Input validation and error handling
- Case-insensitive email handling
- Password hashing verification

#### 2. Media Management Tests (`media.test.js`)
- Media entry creation with validation
- CRUD operations (Create, Read, Update, Delete)
- Permission-based access control
- Search and filtering functionality
- Pagination support
- Soft delete implementation

#### 3. User Profile Tests (`user.test.js`)
- User profile retrieval
- Authentication middleware testing
- Admin role verification
- Token validation and error handling
- User existence verification

#### 4. Admin Functionality Tests (`admin.test.js`)
- Pending media retrieval
- Media approval workflow
- Media rejection workflow
- Admin-only access control
- Status change operations

#### 5. Integration Tests (`integration.test.js`)
- Complete user workflows
- Multi-user scenarios
- Admin approval workflows
- Search and filtering across users
- Error handling and edge cases
- Concurrent operations

## Running Tests

### Prerequisites
- Node.js (v16 or higher)
- All dependencies installed (`npm install`)

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test suites
npm run test:auth          # Authentication tests only
npm run test:media         # Media tests only
npm run test:user          # User tests only
npm run test:admin         # Admin tests only
npm run test:integration   # Integration tests only
```

### Test Environment

Tests use an in-memory MongoDB instance via `mongodb-memory-server` for:
- Fast test execution
- Complete isolation between tests
- No external dependencies
- Automatic cleanup

## Test Utilities

### Helper Functions (`utils/testHelpers.js`)

The test helpers provide reusable functions for common test operations:

#### User Management
- `createTestUser(userData)` - Create a test user
- `createTestAdmin(adminData)` - Create a test admin
- `registerUser(userData)` - Register user via API
- `loginUser(credentials)` - Login user via API
- `getAuthToken(userData)` - Get JWT token for user
- `getAdminToken(adminData)` - Get JWT token for admin

#### Media Management
- `createTestMedia(mediaData, userId)` - Create test media entry
- `createMediaEntry(token, mediaData)` - Create media via API
- `getMediaEntries(token, queryParams)` - Get media entries
- `updateMediaEntry(token, mediaId, updateData)` - Update media
- `deleteMediaEntry(token, mediaId)` - Delete media

#### Admin Operations
- `approveMedia(adminToken, mediaId)` - Approve media entry
- `rejectMedia(adminToken, mediaId)` - Reject media entry
- `getPendingMedia(adminToken)` - Get pending media

#### Data Generators
- `generateValidUserData(overrides)` - Generate valid user data
- `generateValidMediaData(overrides)` - Generate valid media data
- `generateInvalidUserData()` - Generate invalid user data
- `generateInvalidMediaData()` - Generate invalid media data

#### Assertion Helpers
- `expectSuccessfulResponse(response, status)` - Assert successful response
- `expectErrorResponse(response, status, message)` - Assert error response
- `expectValidationError(response)` - Assert validation error
- `expectUnauthorizedError(response)` - Assert unauthorized error
- `expectForbiddenError(response)` - Assert forbidden error
- `expectNotFoundError(response)` - Assert not found error

## Test Coverage

The test suite aims for comprehensive coverage including:

- **Happy Path Scenarios** - Normal operation flows
- **Error Handling** - Invalid inputs, missing data, unauthorized access
- **Edge Cases** - Boundary conditions, concurrent operations
- **Security** - Authentication, authorization, input validation
- **Data Integrity** - Database operations, soft deletes, relationships
- **Performance** - Pagination, search, filtering

## Best Practices

### Test Organization
- Each test file focuses on a specific domain
- Tests are grouped by functionality using `describe` blocks
- Individual test cases use descriptive `it` statements
- Setup and teardown are handled in `beforeEach`/`afterEach`

### Test Data
- Use factory functions for creating test data
- Clean up data between tests
- Use realistic but minimal test data
- Avoid hardcoded values where possible

### Assertions
- Use specific assertions for better error messages
- Test both success and failure scenarios
- Verify database state when relevant
- Check response structure and content

### Performance
- Use in-memory database for speed
- Parallel test execution where possible
- Minimal test data setup
- Efficient cleanup operations

## Debugging Tests

### Common Issues

1. **Database Connection Issues**
   - Ensure MongoDB Memory Server is properly configured
   - Check for port conflicts
   - Verify cleanup between tests

2. **Authentication Issues**
   - Verify JWT secret is set in test environment
   - Check token generation and validation
   - Ensure user creation in database

3. **Async/Await Issues**
   - Use proper async/await syntax
   - Handle Promise rejections
   - Set appropriate test timeouts

### Debug Commands

```bash
# Run single test with verbose output
npm test -- --testNamePattern="should register a new user" --verbose

# Run tests with debug output
DEBUG=* npm test

# Run tests and keep database for inspection
npm test -- --detectOpenHandles --forceExit
```

## Contributing

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Add appropriate test cases for both success and failure scenarios
3. Use helper functions from `testHelpers.js` when possible
4. Ensure tests are isolated and don't depend on each other
5. Update this README if adding new test categories or utilities
6. Maintain high test coverage for new features

## Test Metrics

The test suite includes coverage thresholds:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

Run `npm run test:coverage` to see detailed coverage reports.
