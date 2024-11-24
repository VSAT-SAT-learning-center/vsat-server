import { HttpStatus } from '@nestjs/common';

export const HttpStatusMessages = {
  [HttpStatus.OK]: (message: string = 'Request succeeded') => `The request has succeeded: ${message}.`,
  [HttpStatus.CREATED]: (message: string = 'Resource created') => `The resource has been created successfully: ${message}.`,
  [HttpStatus.NO_CONTENT]: (message: string = 'No content') => `No content to display: ${message}.`,
  [HttpStatus.BAD_REQUEST]: (message: string = 'Invalid request') => `Bad request: ${message}. Please check the input data.`,
  [HttpStatus.UNAUTHORIZED]: (message: string = 'Unauthorized') => `Unauthorized access: ${message}. Please log in.`,
  [HttpStatus.FORBIDDEN]: (message: string = 'Forbidden') => `You do not have permission to perform this action: ${message}.`,
  [HttpStatus.NOT_FOUND]: (message: string = 'Not found') => `The requested resource was not found: ${message}.`,
  [HttpStatus.CONFLICT]: (message: string = 'Conflict') => `There is a conflict with the current state of the resource: ${message}.`,
  [HttpStatus.INTERNAL_SERVER_ERROR]: (message: string = 'Server error') => `An internal server error occurred: ${message}.`,
  [HttpStatus.SERVICE_UNAVAILABLE]: (message: string = 'Service unavailable') => `The service is temporarily unavailable: ${message}. Please try again later.`,
  // Add more status codes and messages as needed
};
