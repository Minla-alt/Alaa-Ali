const mongoose = require('mongoose');
const OpenAI = require('openai');
const Recommendation = require('../models/Recommendation');
const RecommendationFeedback = require('../models/RecommendationFeedback');
const SavedContent = require('../models/SavedContent');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Course = require('../models/Course');
const Book = require('../models/Book');

// Initialize OpenAI client conditionally
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Get AI-powered daily learning recommendation
 */
const getDailyRecommendation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, timeAvailable } = req.query;

    // Validate inputs
    const validSubjects = ['Math', 'Science', 'Languages', 'Programming', null];
    if (subject && !validSubjects.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject. Must be: Math, Science, Languages, Programming'
      });
    }

    if (timeAvailable && (isNaN(timeAvailable) || timeAvailable < 5 || timeAvailable > 480)) {
      return res.status(400).json({
        success: false,
        message: 'Time available must be between 5 and 480 minutes'
      });
    }

    // Check rate limiting (1 hour)
    const rateLimitMs = parseInt(process.env.RECOMMENDATION_RATE_LIMIT_MS) || 3600000;
    const lastRecommendation = await Recommendation.findOne({
      userId,
      generatedAt: { $gte: new Date(Date.now() - rateLimitMs) }
    }).sort({ generatedAt: -1 });

    if (lastRecommendation && !req.query.forceRefresh) {
      return res.status(200).json({
        success: true,
        recommendation: {
          id: lastRecommendation.recommendationId,
          type: lastRecommendation.contentType,
          title: lastRecommendation.title,
          reason: lastRecommendation.reason,
          estimatedTime: lastRecommendation.estimatedTime,
          difficulty: lastRecommendation.difficulty,
          contentId: lastRecommendation.contentId,
          sourceUrl: lastRecommendation.sourceUrl,
          language: lastRecommendation.language
        },
        generatedAt: lastRecommendation.generatedAt,
        userProfile: await getUserProfile(userId),
        cached: true
      });
    }

    // Get user profile data
    const userProfile = await getUserProfile(userId);
    const availableResources = await getAvailableResources(subject, userProfile.preferredLanguage);

    // Generate AI recommendation
    const aiRecommendation = await generateAIRecommendation(userProfile, availableResources, subject, timeAvailable);

    if (!aiRecommendation) {
      // Fallback recommendation
      const fallback = await getFallbackRecommendation(userProfile, subject, timeAvailable);
      return res.status(200).json({
        success: true,
        recommendation: fallback,
        generatedAt: new Date(),
        userProfile,
        fallback: true
      });
    }

    // Store recommendation in database
    const recommendationId = `rec_${Date.now()}_${userId}`;
    const recommendation = new Recommendation({
      recommendationId,
      userId,
      contentId: aiRecommendation.id,
      contentType: aiRecommendation.type,
      title: aiRecommendation.title,
      reason: aiRecommendation.reason,
      estimatedTime: aiRecommendation.estimatedTime,
      difficulty: aiRecommendation.difficulty,
      language: userProfile.preferredLanguage,
      sourceUrl: aiRecommendation.sourceUrl || null
    });

    await recommendation.save();

    res.status(200).json({
      success: true,
      recommendation: {
        id: recommendation.recommendationId,
        type: recommendation.contentType,
        title: recommendation.title,
        reason: recommendation.reason,
        estimatedTime: recommendation.estimatedTime,
        difficulty: recommendation.difficulty,
        contentId: recommendation.contentId,
        sourceUrl: recommendation.sourceUrl,
        language: recommendation.language
      },
      generatedAt: recommendation.generatedAt,
      userProfile,
      cached: false
    });

  } catch (error) {
    console.error('Error generating recommendation:', error);
    
    // If OpenAI fails, return fallback recommendation
    if (error.message?.includes('OpenAI')) {
      try {
        const userId = req.user.id;
        const { subject, timeAvailable } = req.query;
        const userProfile = await getUserProfile(userId);
        const fallback = await getFallbackRecommendation(userProfile, subject, timeAvailable);
        
        return res.status(200).json({
          success: true,
          recommendation: fallback,
          generatedAt: new Date(),
          userProfile,
          fallback: true,
          error: 'AI service temporarily unavailable'
        });
      } catch (fallbackError) {
        console.error('Error generating fallback recommendation:', fallbackError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendation'
    });
  }
};

/**
 * Submit feedback on recommendation
 */
const submitFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recommendationId, helpful, feedback } = req.body;

    // Validate inputs
    if (!recommendationId || typeof helpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'recommendationId and helpful (boolean) are required'
      });
    }

    // Verify recommendation exists
    const recommendation = await Recommendation.findOne({
      recommendationId,
      userId
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    // Store feedback
    const feedbackDoc = new RecommendationFeedback({
      recommendationId,
      userId,
      helpful,
      feedback: feedback || null
    });

    await feedbackDoc.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback'
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    
    // Handle duplicate feedback
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted for this recommendation'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};

/**
 * Get user profile for recommendation context
 */
async function getUserProfile(userId) {
  try {
    // Get user basic info
    const user = await User.findById(userId).select('language');
    
    // Get saved content statistics
    const savedContentStats = await SavedContent.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSavedItems = savedContentStats.reduce((sum, item) => sum + item.count, 0);

    // Calculate average progress
    const progressStats = await Progress.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          averageProgress: { $avg: '$completionPercentage' },
          totalHours: { $sum: '$learningHours' }
        }
      }
    ]);

    const averageProgress = progressStats[0]?.averageProgress || 0;
    const totalLearningHours = progressStats[0]?.totalHours || 0;

    // Calculate learning streak (consecutive days with activity)
    const learningStreak = await calculateLearningStreak(userId);

    // Get user's subject interests from saved content
    const subjectInterests = await getUserSubjectInterests(userId);

    return {
      preferredLanguage: user?.language || 'en',
      totalSavedItems,
      averageProgress: Math.round(averageProgress),
      totalLearningHours,
      learningStreak,
      subjectInterests
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      preferredLanguage: 'en',
      totalSavedItems: 0,
      averageProgress: 0,
      totalLearningHours: 0,
      learningStreak: 0,
      subjectInterests: []
    };
  }
}

/**
 * Get available resources for recommendation
 */
async function getAvailableResources(subject, language) {
  try {
    let query = { language };
    
    if (subject) {
      query.subject = subject;
    }

    // Get courses
    const courses = await Course.find(query)
      .select('title description subject duration difficulty language educationLevel sourceUrl')
      .limit(10)
      .lean();

    // Get books
    const books = await Book.find(query)
      .select('title description author publisher subject duration difficulty language educationLevel sourceUrl')
      .limit(10)
      .lean();

    return {
      courses: courses.map(course => ({
        id: course._id,
        type: 'course',
        title: course.title,
        description: course.description,
        subject: course.subject,
        duration: course.duration,
        difficulty: course.difficulty,
        educationLevel: course.educationLevel,
        language: course.language,
        sourceUrl: course.sourceUrl
      })),
      books: books.map(book => ({
        id: book._id,
        type: 'book',
        title: book.title,
        description: book.description,
        author: book.author,
        publisher: book.publisher,
        subject: book.subject,
        duration: book.duration,
        difficulty: book.difficulty,
        educationLevel: book.educationLevel,
        language: book.language,
        sourceUrl: book.sourceUrl
      }))
    };
  } catch (error) {
    console.error('Error getting available resources:', error);
    return { courses: [], books: [] };
  }
}

/**
 * Generate AI recommendation using OpenAI
 */
async function generateAIRecommendation(userProfile, availableResources, subject, timeAvailable) {
  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized - API key not configured');
    }

    const prompt = constructPrompt(userProfile, availableResources, subject, timeAvailable);

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an intelligent learning assistant. Provide ONLY a JSON response with the exact format specified. No additional text or explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse JSON response
    const recommendation = JSON.parse(response);
    
    // Validate response format
    if (!recommendation.id || !recommendation.type || !recommendation.title || !recommendation.reason) {
      throw new Error('Invalid recommendation format from OpenAI');
    }

    return recommendation;

  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('OpenAI API Error: ' + error.message);
  }
}

/**
 * Construct prompt for OpenAI
 */
function constructPrompt(userProfile, availableResources, subject, timeAvailable) {
  const allResources = [...availableResources.courses, ...availableResources.books];
  
  let prompt = `You are an intelligent learning assistant. Based on the following user profile, recommend ONE specific course or book that would be perfect for their learning journey.

User Profile:
- Language: ${userProfile.preferredLanguage}
- Total items saved: ${userProfile.totalSavedItems}
- Average progress: ${userProfile.averageProgress}%
- Total learning hours: ${userProfile.totalLearningHours}
- Learning streak: ${userProfile.learningStreak} days
- Previous subjects studied: ${userProfile.subjectInterests.join(', ') || 'None yet'}
- Available time: ${timeAvailable ? timeAvailable + ' minutes' : 'Not specified'}
- Subject filter: ${subject || 'Any subject'}

Available Resources (choose ONE from this list):
${JSON.stringify(allResources.slice(0, 15), null, 2)}

Please provide a recommendation in EXACT JSON format:
{
  "id": "[resource id from the list above]",
  "type": "course" or "book",
  "title": "[resource title]",
  "reason": "[explain why this is perfect for them in their preferred language]",
  "estimatedTime": [minutes from the resource],
  "difficulty": "beginner/intermediate/advanced",
  "sourceUrl": "[sourceUrl if available, otherwise null]"
}

IMPORTANT: Choose ONE resource from the provided list above. If no suitable resource exists, return the most popular course/book that matches their preferences.`;

  return prompt;
}

/**
 * Get fallback recommendation when AI fails
 */
async function getFallbackRecommendation(userProfile, subject, timeAvailable) {
  try {
    const query = { 
      language: userProfile.preferredLanguage 
    };
    
    if (subject) {
      query.subject = subject;
    }

    // Try to get a popular course first, then book
    const course = await Course.findOne(query).sort({ createdAt: -1 });
    
    if (course) {
      return {
        id: course._id.toString(),
        type: 'course',
        title: course.title,
        reason: userProfile.preferredLanguage === 'ar' 
          ? 'تم اختيار هذا المساق لأنه مناسب لمستواك التعليمي'
          : 'This course was selected as it matches your learning level',
        estimatedTime: course.duration || 60,
        difficulty: course.difficulty,
        contentId: course._id,
        sourceUrl: course.sourceUrl,
        language: course.language
      };
    }

    const book = await Book.findOne(query).sort({ createdAt: -1 });
    
    if (book) {
      return {
        id: book._id.toString(),
        type: 'book',
        title: book.title,
        reason: userProfile.preferredLanguage === 'ar' 
          ? 'تم اختيار هذا الكتاب لأنه مناسب لمستواك التعليمي'
          : 'This book was selected as it matches your learning level',
        estimatedTime: book.duration || 120,
        difficulty: book.difficulty,
        contentId: book._id,
        sourceUrl: book.sourceUrl,
        language: book.language
      };
    }

    // Ultimate fallback
    return {
      id: 'fallback',
      type: 'course',
      title: userProfile.preferredLanguage === 'ar' 
        ? 'أساسيات التعلم'
        : 'Learning Fundamentals',
      reason: userProfile.preferredLanguage === 'ar' 
        ? 'مساق أساسي لبدء رحلة التعلم'
        : 'Basic course to start your learning journey',
      estimatedTime: 30,
      difficulty: 'beginner',
      contentId: null,
      sourceUrl: null,
      language: userProfile.preferredLanguage
    };

  } catch (error) {
    console.error('Error generating fallback recommendation:', error);
    throw error;
  }
}

/**
 * Calculate learning streak (consecutive days with activity)
 */
async function calculateLearningStreak(userId) {
  try {
    // Get user's progress records
    const progressRecords = await Progress.find({ userId })
      .select('lastAccessedAt')
      .sort({ lastAccessedAt: -1 });

    if (progressRecords.length === 0) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);

    for (const record of progressRecords) {
      const recordDate = new Date(record.lastAccessedAt);
      recordDate.setHours(0, 0, 0, 0);
      
      if (recordDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (recordDate.getTime() < currentDate.getTime()) {
        break; // Streak broken
      }
    }

    return streak;

  } catch (error) {
    console.error('Error calculating learning streak:', error);
    return 0;
  }
}

/**
 * Get user's subject interests from saved content
 */
async function getUserSubjectInterests(userId) {
  try {
    const savedContent = await SavedContent.find({ userId }).populate('contentId');
    
    const subjects = new Set();
    
    savedContent.forEach(item => {
      if (item.contentId && item.contentId.subject) {
        subjects.add(item.contentId.subject);
      }
    });

    return Array.from(subjects);

  } catch (error) {
    console.error('Error getting user subject interests:', error);
    return [];
  }
}

module.exports = {
  getDailyRecommendation,
  submitFeedback
};