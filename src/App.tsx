/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';

// Structura întrebărilor din testul Bright Language #1782403
interface Question {
  id: number;
  audioStart: number; // Secunda de start din test 1.mp4
  audioEnd: number;   // Secunda de sfârșit din test 1.mp4
  situation: string;
  question: string;
  options: string[];
  correctIndex: number;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    audioStart: 12,
    audioEnd: 26,
    situation: "Vrouw: 'Goedemorgen meneer Jansen, wat kan ik voor u doen?'\nMan: 'Goedemorgen. Ik kom mijn paspoort ophalen. Ik heb vorige week bericht gekregen dat het klaar ligt.'",
    question: "Wat komt de man doen?",
    options: [
      "Een nieuw paspoort aanvragen",
      "Zijn paspoort ophalen",
      "Een afspraak maken voor volgende week"
    ],
    correctIndex: 1
  },
  {
    id: 2,
    audioStart: 45,
    audioEnd: 60,
    situation: "Man: 'Pardon mevrouw, weet u hoe laat de trein naar Utrecht vertrekt?'\nVrouw: 'Even kijken... De trein heeft tien minuten vertraging. Hij vertrekt om kwart voor drie van spoor 4b.'",
    question: "Hoe laat vertrekt de trein naar Utrecht?",
    options: [
      "Om half drie",
      "Om kwart voor drie",
      "Om kwart over drie"
    ],
    correctIndex: 1
  },
  {
    id: 3,
    audioStart: 80,
    audioEnd: 96,
    situation: "Vrouw: 'Hallo Peter, ga je mee lunchen in de kantine?'\nMan: 'Nee, sorry. Ik heb een belangrijke deadline om twee uur. Ik eet snel een broodje achter mijn bureau.'",
    question: "Waarom gaat de man niet mee naar de kantine?",
    options: [
      "Hij heeft al geluncht",
      "Hij moet doorwerken voor een deadline",
      "Hij houdt niet van het eten in de kantine"
    ],
    correctIndex: 1
  },
  {
    id: 4,
    audioStart: 115,
    audioEnd: 132,
    situation: "Man: 'Heeft u deze trui ook in een kleinere maat, bijvoorbeeld maat M?'\nVrouw: 'Ik zal even in het magazijn kijken voor u... Nee helaas, we hebben alleen nog maat L en XL in deze kleur.'",
    question: "Welke maat zoekt de klant?",
    options: [
      "Maat M",
      "Maat L",
      "Maat XL"
    ],
    correctIndex: 0
  },
  {
    id: 5,
    audioStart: 150,
    audioEnd: 168,
    situation: "Vrouw: 'Dokterspraktijk De Vreeze, goedemiddag.'\nMan: 'Goedemiddag, met Thomas Bakker. Ik wil graag een afspraak maken voor morgenochtend.'\nVrouw: 'Morgenochtend zit de dokter helaas vol. Kan donderdagmiddag om half vier ook?'",
    question: "Wanneer kan de man terecht bij de dokter?",
    options: [
      "Morgenochtend",
      "Donderdagmiddag om 15:30 uur",
      "Volgende week maandag"
    ],
    correctIndex: 1
  }
];

// Helper pentru stocarea permanentă a fișierului video în IndexedDB
const DB_NAME = 'BrightLanguageAudioDB';
const STORE_NAME = 'media_files';
const VIDEO_KEY = 'test_1_mp4';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveVideoToDB(blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(blob, VIDEO_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function loadVideoFromDB(): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(VIDEO_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  // Audio / Video original
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasOriginalVoice, setHasOriginalVoice] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Se verifică fișierul audio salvat...');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioTimeoutRef = useRef<number | null>(null);

  const currentQ = QUESTIONS[currentIndex];

  // 1. Încărcăm automat fișierul salvat la refresh din IndexedDB
  useEffect(() => {
    loadVideoFromDB()
      .then((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setHasOriginalVoice(true);
          setStatusMessage('✅ Vocea originală din test 1.mp4 este activată!');
        } else {
          setHasOriginalVoice(false);
          setStatusMessage('ℹ️ Pentru a auzi vocile originale din video, apasă pe butonul albastru de sus.');
        }
      })
      .catch(() => {
        setHasOriginalVoice(false);
      });
  }, []);

  // 2. Cronometru pentru fiecare întrebare
  useEffect(() => {
    if (isTestFinished) return;
    setSecondsRemaining(60);
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextQuestion();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isTestFinished]);

  // 3. Încărcare fișier de pe calculator
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatusMessage('Se salvează fișierul audio permanent...');
      await saveVideoToDB(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setHasOriginalVoice(true);
      setStatusMessage('✅ Fișierul test 1.mp4 a fost încărcat și salvat cu succes!');
      
      // Pornim automat sunetul pentru întrebarea curentă
      setTimeout(() => {
        playOriginalAudio(currentQ.audioStart, currentQ.audioEnd, url);
      }, 300);
    } catch (err) {
      console.error(err);
      setStatusMessage('Eroare la salvarea fișierului.');
    }
  };

  // 4. Redare segment audio din video
  const playOriginalAudio = (startSec: number, endSec: number, explicitUrl?: string) => {
    const video = videoRef.current;
    const activeUrl = explicitUrl || videoUrl;

    if (!activeUrl || !video) {
      // Dacă încă nu a încărcat fișierul, deschidem dialogul de selecție fișier
      fileInputRef.current?.click();
      return;
    }

    if (audioTimeoutRef.current) {
      window.clearTimeout(audioTimeoutRef.current);
    }

    video.pause();
    video.currentTime = startSec;
    video.play().then(() => {
      setIsPlayingAudio(true);
      const durationMs = Math.max(1000, (endSec - startSec) * 1000);
      audioTimeoutRef.current = window.setTimeout(() => {
        video.pause();
        setIsPlayingAudio(false);
      }, durationMs);
    }).catch((err) => {
      console.warn("Nu s-a putut reda audio automat:", err);
      setIsPlayingAudio(false);
    });
  };

  const handleNextQuestion = () => {
    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex + 1 < QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsTestFinished(true);
    }
  };

  const restartTest = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsTestFinished(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Element video ascuns pentru redarea audio */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          style={{ display: 'none' }}
          onEnded={() => setIsPlayingAudio(false)}
        />
      )}

      {/* Header oficial Bright Language */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
              BL
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Bright Language Test</h1>
              <p className="text-xs text-slate-500 font-medium">Dutch Netherlands 120 General • Testnummer #1782403</p>
            </div>
          </div>

          {/* BUTONUL ALBASTRU PENTRU ÎNCĂRCAREA TEST 1.MP4 */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,audio/mp3,video/*,audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md flex items-center gap-2 ${
                hasOriginalVoice
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white ring-4 ring-blue-100'
              }`}
            >
              <span>{hasOriginalVoice ? '🔄 Înlocuiește fișierul audio' : '📁 Încarcă test 1.mp4 cu vocea originală'}</span>
            </button>
          </div>
        </div>

        {/* Notificare de status voce */}
        <div className="max-w-5xl mx-auto mt-2">
          <p className={`text-xs px-3 py-1.5 rounded-md inline-block ${
            hasOriginalVoice ? 'bg-emerald-50 text-emerald-700 font-medium' : 'bg-amber-50 text-amber-800'
          }`}>
            {statusMessage}
          </p>
        </div>
      </header>

      {/* Corpul Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
        {!isTestFinished ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            {/* Bara de sus: Număr întrebare și Timer */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Vraag {currentQ.id} van {QUESTIONS.length}
              </span>
              <div className="flex items-center gap-2 text-slate-600 font-mono text-sm bg-slate-100 px-3 py-1 rounded-full">
                <span>⏱️</span>
                <span>{secondsRemaining}s</span>
              </div>
            </div>

            {/* Butonul de ascultare audio cu vocea originală */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Luisteropdracht (Conversație audio)
                </p>
                <p className="text-sm text-slate-700">
                  {hasOriginalVoice
                    ? 'Apasă butonul pentru a asculta dialogul nativ din înregistrarea originală.'
                    : 'Apasă butonul albastru de sus pentru a conecta fișierul test 1.mp4 cu vocile originale.'}
                </p>
              </div>

              <button
                onClick={() => playOriginalAudio(currentQ.audioStart, currentQ.audioEnd)}
                className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                }`}
              >
                <span>{isPlayingAudio ? '🔊 Luisteren...' : '🔊 Nogmaals luisteren'}</span>
              </button>
            </div>

            {/* Întrebarea */}
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {currentQ.question}
            </h2>

            {/* Opțiunile de răspuns */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-slate-800 font-medium">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Buton Înainte */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleNextQuestion}
                disabled={selectedOption === null}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                  selectedOption === null
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                }`}
              >
                {currentIndex + 1 === QUESTIONS.length ? 'Test afronden' : 'Volgende vraag →'}
              </button>
            </div>
          </div>
        ) : (
          /* Rezultate test */
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold mb-4">
              ✓
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Test Afronding</h2>
            <p className="text-slate-600 mb-6">Ai finalizat testul de ascultare Bright Language Dutch 120 General.</p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <span className="text-4xl font-black text-blue-600">{score}</span>
              <span className="text-xl text-slate-400 font-medium"> / {QUESTIONS.length}</span>
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Scor obținut</p>
            </div>

            <button
              onClick={restartTest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md"
            >
              Opnieuw proberen (Reia testul)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}