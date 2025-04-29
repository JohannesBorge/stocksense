'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';

export default function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="relative isolate overflow-hidden">
        {/* Hero section */}
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              AI-Powered Stock Analysis
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Get real-time stock analysis, sentiment insights, and AI-powered predictions to make smarter investment decisions.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm font-semibold leading-6 text-white"
                  >
                    Sign in <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Feature section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">Smarter Investing</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to make informed decisions
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Our AI-powered platform analyzes market trends, news sentiment, and historical data to give you the edge in your investment strategy.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Pricing section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Choose the plan that&apos;s right for you
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className="relative flex flex-col rounded-2xl bg-gray-800 p-8 shadow-xl"
              >
                <h3 className="text-lg font-semibold leading-8 text-white">{plan.name}</h3>
                <p className="mt-4 text-sm leading-6 text-gray-300">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">${plan.price}</span>
                  <span className="text-sm font-semibold leading-6 text-gray-300">/month</span>
                </p>
                <Link
                  href="/signup"
                  className="mt-8 block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

const features = [
  {
    name: 'Real-time Analysis',
    description: 'Get instant insights into market movements and stock performance with our advanced AI algorithms.',
  },
  {
    name: 'Sentiment Analysis',
    description: 'Understand market sentiment through news analysis and social media trends to make better decisions.',
  },
  {
    name: 'AI Predictions',
    description: 'Leverage machine learning models to predict potential market movements and identify opportunities.',
  },
];

const pricingPlans = [
  {
    name: 'Basic',
    description: 'Perfect for individual investors getting started with stock analysis.',
    price: '29',
  },
  {
    name: 'Pro',
    description: 'Advanced features for serious investors who need deeper insights.',
    price: '79',
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for professional traders and investment firms.',
    price: '299',
  },
];
