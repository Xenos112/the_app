export class UserAlreadyExistsError extends Error {
  constructor(message?: string) {
    super('User already exists')
    this.name = 'UserAlreadyExistsError'
    this.message = message ?? 'User already exists'
  }
}

export class UserNotFoundError extends Error {
  constructor(message?: string) {
    super('User not found')
    this.name = 'UserNotFoundError'
    this.message = message ?? 'User not found'
  }
}

export class NotAuthenticatedError extends Error {
  constructor(message?: string) {
    super('Not authenticated')
    this.name = 'NotAuthenticatedError'
    this.message = message ?? 'Not authenticated'
  }
}
