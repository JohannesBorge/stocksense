import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'gpt-4o-mini',
    });

    return NextResponse.json({
      message: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
} 