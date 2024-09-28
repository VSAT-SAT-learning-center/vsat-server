export const SuccessMessages = {
  get: (entity: string) => `Get ${entity} successfully.`,
  create: (entity: string) => `Successfully created ${entity}.`,
  update: (entity: string) => `Successfully updated ${entity}.`,
  delete: (entity: string) => `Successfully deleted ${entity}.`,
  login: () => `Login successful. Welcome back!`,
  logout: () => `Logout successful.`,
  sendEmail: () => `Email has been sent successfully.`,
  resetPassword: () => `Password reset successful. Please check your email.`,
  action: () => `Your action has been completed successfully.`,
  save: () => `Data has been saved successfully.`,
  remember: () => `Successfully remembered.`,
};


// return ResponseHelper.success(newUser, SuccessMessages.create("User"));
// => {
//   "success": false,
//   "message": "User not found",
//   "errorCode": "USER_NOT_FOUND"
// }
