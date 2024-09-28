export const ErrorMessage = {
    // Authentication & Authorization
    UNAUTHORIZED: {
        message: 'Unauthorized access',
        statusCode: 401,
    },
    FORBIDDEN: {
        message: 'You do not have permission to perform this action',
        statusCode: 403,
    },

    // User-related errors
    USER_NOT_FOUND: {
        message: 'User not found',
        statusCode: 404,
    },
    USER_ALREADY_EXISTS: {
        message: 'User already exists',
        statusCode: 409, // Conflict
    },
    INVALID_USER_CREDENTIALS: {
        message: 'Invalid username or password',
        statusCode: 401,
    },

    // Validation errors
    VALIDATION_FAILED: {
        message: 'Data validation failed',
        statusCode: 422, // Unprocessable Entity
    },
    MISSING_REQUIRED_FIELDS: {
        message: 'Missing required fields',
        statusCode: 400, // Bad Request
    },
    INVALID_DATA_FORMAT: {
        message: 'Data format is invalid',
        statusCode: 400, // Bad Request
    },

    // System errors
    INTERNAL_SERVER_ERROR: {
        message: 'Internal server error',
        statusCode: 500,
    },
    SERVICE_UNAVAILABLE: {
        message: 'Service temporarily unavailable',
        statusCode: 503,
    },
    DATABASE_CONNECTION_FAILED: {
        message: 'Failed to connect to the database',
        statusCode: 500,
    },

    // Custom error for specific services
    INVALID_TOKEN: {
        message: 'Invalid or expired token',
        statusCode: 401,
    },
    ITEM_NOT_FOUND: {
        message: 'Item not found',
        statusCode: 404,
    },
    ITEM_OUT_OF_STOCK: {
        message: 'Requested item is out of stock',
        statusCode: 409, // Conflict
    },

    // General error
    UNKNOWN_ERROR: {
        message: 'An unknown error occurred',
        statusCode: 500,
    },
};


// return ResponseHelper.error('User not found', 'USER_NOT_FOUND');
// => {
//   "success": true,
//   "data": {
//     // The actual data returned (e.g., list of users, product details, etc.)
//   },
//   "message": "Data retrieved successfully"
// }