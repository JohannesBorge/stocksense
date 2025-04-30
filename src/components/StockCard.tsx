'use client';

import { useState } from 'react';
import { StockAnalysis } from '@/types/stock';
import { ArrowUpIcon, ArrowDownIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { Fragment } from 'react';
import { formatDate } from '@/utils/date';
import { formatCurrency, formatNumber } from '@/utils/format';

type StockCardProps = StockAnalysis & {
  onUpdate?: (updatedAnalysis: StockAnalysis) => void;
  onDelete?: (symbol: string) => void;
};

export default function StockCard({
  symbol,
  companyName,
  price,
  change,
  changePercent,
  news,
  sentiment,
  aiInsight,
  date,
  onUpdate,
  onDelete,
}: StockCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedAnalysis, setEditedAnalysis] = useState<StockAnalysis>({
    symbol,
    companyName,
    price,
    change,
    changePercent,
    news,
    sentiment,
    aiInsight,
    date,
  });

  const isPositive = change >= 0;
  const sentimentColors = {
    positive: 'bg-green-500/10 text-green-400',
    neutral: 'bg-yellow-500/10 text-yellow-400',
    negative: 'bg-red-500/10 text-red-400',
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedAnalysis);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${symbol}?`)) {
      setIsDeleting(true);
      try {
        await onDelete?.(symbol);
      } catch (error) {
        console.error('Error deleting stock:', error);
        alert('Failed to delete stock. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isDeleting) {
    return null;
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-700 relative">
        <div 
          className="cursor-pointer"
          onClick={() => !isEditing && setIsExpanded(true)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-white">{symbol}</h3>
              <p className="text-sm text-gray-400">{companyName}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-white">${formatCurrency(price)}</p>
              <div className="flex items-center justify-end">
                {isPositive ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(change)} ({formatNumber(changePercent)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sentimentColors[sentiment]}`}>
              {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Sentiment
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Last updated: {formatDate(date)}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-10">
          <Menu as="div" className="relative">
            <Menu.Button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-full hover:bg-gray-700 focus:outline-none"
            >
              <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 bottom-full mb-2 w-48 origin-bottom-right rounded-md bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        className={`${
                          active ? 'bg-gray-600' : ''
                        } flex w-full items-center px-4 py-2 text-sm text-red-400`}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      <Transition appear show={isExpanded} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsExpanded(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                    {isEditing ? 'Edit Analysis' : 'Stock Analysis Details'}
                  </Dialog.Title>

                  <div className="mt-4 space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300">AI Insight</label>
                          <textarea
                            value={editedAnalysis.aiInsight}
                            onChange={(e) => setEditedAnalysis({ ...editedAnalysis, aiInsight: e.target.value })}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            rows={4}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300">Sentiment</label>
                          <select
                            value={editedAnalysis.sentiment}
                            onChange={(e) => setEditedAnalysis({ ...editedAnalysis, sentiment: e.target.value as 'positive' | 'neutral' | 'negative' })}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300">News</label>
                          {editedAnalysis.news.map((item, index) => (
                            <div key={index} className="mt-2">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const newNews = [...editedAnalysis.news];
                                  newNews[index] = { ...newNews[index], title: e.target.value };
                                  setEditedAnalysis({ ...editedAnalysis, news: newNews });
                                }}
                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h4 className="text-sm font-medium text-white">AI Insight</h4>
                          <p className="mt-1 text-sm text-gray-400">{aiInsight}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">Latest News</h4>
                          <ul className="mt-2 space-y-2">
                            {news.map((item, index) => (
                              <li key={index} className="text-sm text-gray-400">
                                {item.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                          onClick={handleSave}
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                          onClick={() => setIsEditing(true)}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                          onClick={() => setIsExpanded(false)}
                        >
                          Close
                        </button>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
} 