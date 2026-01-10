// Authentication middleware
import jwt from 'jsonwebtoken'

// Validate auth data for registration/login
export const validateAuth = (req, res, next) => {
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email format' })
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }
  
  next()
}

// Authenticate user using JWT
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed: Invalid token' })
  }
}