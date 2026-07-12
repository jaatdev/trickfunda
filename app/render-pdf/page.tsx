import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';

// Define the shape of our flashcards (copied from types to avoid strict dependency issues in this tool)
interface Flashcard {
  front?: string;
  front_hi?: string;
  back?: string;
  back_hi?: string;
  details?: string;
  details_hi?: string;
  synonyms?: string[];
  synonyms_hi?: string[];
  antonyms?: string[];
  antonyms_hi?: string[];
  example?: string;
  example_hi?: string;
  trick?: string;
  trick_hi?: string;
  kdHack?: string;
  kdHack_hi?: string;
}

export default async function RenderPdfPage({ searchParams }: { searchParams: { file?: string, title?: string } }) {
  const filePath = searchParams.file;
  const title = searchParams.title || 'Flashcards';
  
  if (!filePath) {
    return <div>No file specified.</div>;
  }
  
  const absolutePath = path.resolve(process.cwd(), filePath);
  
  let flashcards: Flashcard[] = [];
  try {
    const rawData = await fs.readFile(absolutePath, 'utf8');
    flashcards = JSON.parse(rawData);
  } catch (error) {
    return <div>Error reading file: {String(error)}</div>;
  }

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Printable List - We use the exact same layout as the browser PDF generator */}
      <div id="pdf-summary-content" className="bg-white p-8 md:p-12">
        <div className="text-center mb-10 pdf-header">
          <h1 className="text-4xl font-black text-gray-900 capitalize mb-2">TrickFunda</h1>
          <h2 className="text-xl text-gray-600 capitalize">{title}</h2>
        </div>

        <div className="space-y-8 divide-y divide-gray-300">
          {flashcards.map((card, index) => {
            const displayTrick = card.kdHack || card.trick;
            const displayTrickHi = card.kdHack_hi || card.trick_hi;
            const hasTrick = !!displayTrick || !!displayTrickHi;

            return (
              <div key={index} className="pt-8 first:pt-0" style={{ pageBreakInside: 'avoid' }}>
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Left: Front / Term */}
                  <div className="lg:w-1/3 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                        {index + 1}
                      </span>
                      <div>
                        {card.front && (
                          <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {card.front}
                          </h3>
                        )}
                        {card.front_hi && (
                          <p className="text-lg text-blue-600 font-medium mt-1">
                            {card.front_hi}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Details & Tricks */}
                  <div className="lg:w-2/3 space-y-4">
                    {(card.back || card.back_hi) && (
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                          Meaning
                        </div>
                        {card.back && (
                          <p className="text-gray-800 font-medium text-lg mb-1">{card.back}</p>
                        )}
                        {card.back_hi && (
                          <p className="text-gray-600">{card.back_hi}</p>
                        )}
                      </div>
                    )}

                    {card.details && (
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {card.details}
                      </p>
                    )}

                    {/* Word Relations */}
                    {(card.synonyms?.length || card.antonyms?.length || card.example) && (
                      <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        {card.synonyms && card.synonyms.length > 0 && (
                          <div>
                            <span className="font-bold text-emerald-600 mr-2">Synonyms:</span>
                            <span className="text-gray-700 font-medium">{card.synonyms.join(', ')}</span>
                          </div>
                        )}
                        
                        {card.antonyms && card.antonyms.length > 0 && (
                          <div>
                            <span className="font-bold text-rose-500 mr-2">Antonyms:</span>
                            <span className="text-gray-700 font-medium">{card.antonyms.join(', ')}</span>
                          </div>
                        )}
                        
                        {card.example && (
                          <div className="w-full pt-2 mt-2 border-t border-gray-200">
                            <span className="font-bold text-gray-500 mr-2">Example:</span>
                            <span className="text-gray-700 italic">{card.example}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* KD Hack */}
                    {hasTrick && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-2 text-sm font-bold text-emerald-600 uppercase tracking-wider">
                          KD Hack / Trick
                        </div>
                        {displayTrick && (
                          <p className="text-gray-800 font-medium leading-relaxed">
                            {displayTrick}
                          </p>
                        )}
                        {displayTrickHi && (
                          <p className="text-gray-700 leading-relaxed mt-1">
                            {displayTrickHi}
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
