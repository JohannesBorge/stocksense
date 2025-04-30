import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StockData } from '@/types/stock';

interface CompanyOverview {
  name: string;
  description: string;
  sector: string;
  industry: string;
}

interface AnalysisResponse {
  sentiment: 'positive' | 'neutral' | 'negative';
  aiInsight: string;
  news: Array<{
    title: string;
    source: string;
    date: string;
  }>;
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

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Received request for symbol:', symbol);
    console.log('Stock data:', stockData);
    console.log('Company overview:', companyOverview);

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

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
    });

    console.log('Received response from OpenAI');
    const content = completion.choices[0].message.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let response: AnalysisResponse;
    try {
      response = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    // Validate response structure
    if (!response.sentiment || !response.aiInsight || !Array.isArray(response.news)) {
      throw new Error('Invalid response structure from OpenAI');
    }

    if (!['positive', 'neutral', 'negative'].includes(response.sentiment)) {
      throw new Error('Invalid sentiment value from OpenAI');
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating analysis:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: 'Failed to generate analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 