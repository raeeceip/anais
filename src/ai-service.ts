import axios from 'axios';

export class AIService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: "llama3",
        prompt: prompt,
        stream: false
      });

      return response.data.response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm sorry, I encountered an error while processing your request.";
    }
  }
}