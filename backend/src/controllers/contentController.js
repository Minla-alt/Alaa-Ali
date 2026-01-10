// Content controller functions
import Content from '../models/Content.js'

// Get all content
export const getContent = async (req, res) => {
  try {
    const { language = 'en' } = req.query
    const content = await Content.find({ language })
    res.status(200).json(content)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

// Create new content
export const createContent = async (req, res) => {
  try {
    const { title, description, language, category } = req.body
    const userId = req.user.userId
    
    const newContent = new Content({
      title,
      description,
      language,
      category,
      createdBy: userId
    })
    
    await newContent.save()
    res.status(201).json(newContent)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}