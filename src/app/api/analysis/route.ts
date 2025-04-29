import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StockData } from '@/types/stock';

interface CompanyOverview {
  name: string;
  description: string;
  sector: string;
  industry: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { symbol, stockData, companyOverview }: {
      symbol: string;
      stockData: StockData;
      companyOverview: CompanyOverview;
    } = await request.json();

    const prompt = `Analyze the following stock data and provide insights:
Symbol: ${symbol}
Current Price: $${stockData.price}
Change: ${stockData.change} (${stockData.changePercent}%)
Company: ${companyOverview.name}
Sector: ${companyOverview.sector}
Industry: ${companyOverview.industry}
Description: ${companyOverview.description}

Please provide:
1. A sentiment analysis (positive, neutral, or negative)
2. A detailed analysis of the stock's performance and future outlook
3. 2-3 recent news headlines that might be affecting the stock price

Format the response as JSON with the following structure:
{
  "sentiment": "positive|neutral|negative",
  "aiInsight": "detailed analysis here",
  "news": [
    {
      "title": "news headline",
      "source": "news source",
      "date": "YYYY-MM-DD"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4-turbo-preview',
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
} 