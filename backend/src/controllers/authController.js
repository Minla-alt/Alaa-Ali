// Auth controller functions
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Register a new user
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    })
    
    await newUser.save()
    
    // Generate token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    
    res.status(201).json({ user: { id: newUser._id, username, email }, token })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    
    res.status(200).json({ user: { id: user._id, username: user.username, email }, token })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}