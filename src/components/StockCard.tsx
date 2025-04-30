'use client';

import { useState, useRef } from 'react';
import { StockAnalysis, PDFFile } from '@/types/stock';
import { ArrowUpIcon, ArrowDownIcon, PencilIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/solid';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { Fragment } from 'react';
import { formatDate } from '@/utils/date';
import { formatCurrency, formatNumber } from '@/utils/format';
import { createPortal } from 'react-dom';

type StockCardProps = StockAnalysis & {
  pdfFiles?: PDFFile[];
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
  pdfFiles = [],
  onUpdate,
  onDelete,
}: StockCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    pdfFiles,
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes('pdf')) {
      alert('Please select a PDF file');
      return;
    }

    setIsUploading(true);
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('symbol', symbol);

      // Upload the file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const { url } = await response.json();

      // Add the new PDF file to the analysis
      const newPDFFile: PDFFile = {
        name: file.name,
        url,
        uploadedAt: new Date().toISOString(),
      };

      const updatedAnalysis = {
        ...editedAnalysis,
        pdfFiles: [...(editedAnalysis.pdfFiles || []), newPDFFile],
      };

      setEditedAnalysis(updatedAnalysis);
      if (onUpdate) {
        onUpdate(updatedAnalysis);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePDFClick = (pdf: PDFFile) => {
    setSelectedPDF(pdf);
  };

  if (isDeleting) {
    return null;
  }

  const renderModal = () => {
    if (!isExpanded) return null;

    return createPortal(
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
            <div className="fixed inset-0 bg-gray-900/20" />
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
                        <div>
                          <label className="block text-sm font-medium text-gray-300">PDF Files</label>
                          <div className="mt-2 space-y-2">
                            {editedAnalysis.pdfFiles?.map((pdf, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{pdf.name}</span>
                                <button
                                  onClick={() => {
                                    const newPDFFiles = [...(editedAnalysis.pdfFiles || [])];
                                    newPDFFiles.splice(index, 1);
                                    setEditedAnalysis({ ...editedAnalysis, pdfFiles: newPDFFiles });
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              accept=".pdf"
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              {isUploading ? 'Uploading...' : 'Upload PDF'}
                            </button>
                          </div>
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
                        <div>
                          <h4 className="text-sm font-medium text-white">PDF Files</h4>
                          <div className="mt-2 space-y-2">
                            {pdfFiles.map((pdf, index) => (
                              <button
                                key={index}
                                onClick={() => handlePDFClick(pdf)}
                                className="flex items-center text-sm text-indigo-400 hover:text-indigo-300"
                              >
                                <DocumentIcon className="h-4 w-4 mr-2" />
                                {pdf.name}
                              </button>
                            ))}
                          </div>
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
      </Transition>,
      document.body
    );
  };

  const renderPDFViewer = () => {
    if (!selectedPDF) return null;

    return createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-lg p-4 w-full max-w-4xl h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">{selectedPDF.name}</h3>
            <button
              onClick={() => setSelectedPDF(null)}
              className="text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <iframe
            src={selectedPDF.url}
            className="flex-1 w-full rounded-lg bg-white"
            title={selectedPDF.name}
          />
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div className="bg-gray-900 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-800 relative">
        <div 
          className="cursor-pointer"
          onClick={() => !isEditing && setIsExpanded(true)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-white">{symbol}</h3>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{companyName}</p>
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

          <div className="mt-4">
            {pdfFiles.length > 0 && (
              <div className="flex items-center text-sm text-gray-400">
                <DocumentIcon className="h-4 w-4 mr-1" />
                {pdfFiles.length} PDF{pdfFiles.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-10">
          <Menu as="div" className="relative">
            <Menu.Button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-full hover:bg-gray-800 focus:outline-none"
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
              <Menu.Items className="absolute right-0 bottom-full mb-2 w-48 origin-bottom-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        className={`${
                          active ? 'bg-gray-700' : ''
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
      {renderModal()}
      {renderPDFViewer()}
    </>
  );
} 