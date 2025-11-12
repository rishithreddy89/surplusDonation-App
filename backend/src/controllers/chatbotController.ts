import { Request, Response } from 'express';
import { getChatbotResponse, getSuggestedQuestions } from '../utils/chatbotService';
import { AuthRequest } from '../middleware/auth';

export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const response = await getChatbotResponse(message, conversationHistory || []);

    res.status(200).json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot response',
    });
  }
};

export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const suggestions = getSuggestedQuestions();

    res.status(200).json({
      success: true,
      data: {
        suggestions,
      },
    });
  } catch (error: any) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
    });
  }
};
