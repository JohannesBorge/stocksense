# StockSense

An AI-powered dashboard where users can generate and save custom stock analysis cards based on news and market data.

## Features

- User authentication (email + Google)
- Subscription model with Stripe integration
- Interactive dashboard with card-style layout
- AI-powered stock analysis
- News sentiment analysis
- Custom time range selection
- Save and compare analyses

## Tech Stack

- Frontend: Next.js + Tailwind CSS
- Backend: Node.js
- Authentication: Firebase
- Payments: Stripe
- News: NewsAPI
- AI: OpenAI GPT-4
- Database: Supabase

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- OpenAI API key
- Stripe account
- NewsAPI key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stocksense.git
   cd stocksense
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The project is configured for deployment on Vercel. To deploy:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
