// AI controller functions
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Generate content using AI
export const generateContent = async (req, res) => {
  try {
    const { prompt, language = 'en' } = req.body
    
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an educational content generator that creates content in ${language}.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'gpt-3.5-turbo',
    })
    
    res.status(200).json({ content: completion.choices[0].message.content })
  } catch (error) {
    console.error('AI generation error:', error)
    res.status(500).json({ message: 'AI content generation failed' })
  }
}

// Translate content using AI
export const translateContent = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body
    
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguage}.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      model: 'gpt-3.5-turbo',
    })
    
    res.status(200).json({ translation: completion.choices[0].message.content })
  } catch (error) {
    console.error('Translation error:', error)
    res.status(500).json({ message: 'Translation failed' })
  }
}