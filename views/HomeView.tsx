import React, { useEffect, useState, useRef } from 'react';
import { Shift } from '../types';
import { WiiButton } from '../components/WiiButton';
import { Card } from '../components/Card';
import { Clock, Mic, Coffee, Sun } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';

interface HomeViewProps {
  activeShift: Shift | null;
  onClockIn: () => Promise<void>;
  onClockOut: (shiftId: string) => Promise<void>;
  userName: string;
}

export const HomeView: React.FC<HomeViewProps> = ({ activeShift, onClockIn, onClockOut, userName }) => {
  const [elapsed, setElapsed] = useState<string>('00:00');
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  
  // Timer for active shift
  useEffect(() => {
    let interval: any;
    if (activeShift) {
      const updateTimer = () => {
        const now = new Date();
        const start = new Date(activeShift.startTime);
        const diffMins = differenceInMinutes(now, start);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        setElapsed(`${hours}h ${minutes}m`);
      };
      updateTimer();
      interval = setInterval(updateTimer, 60000);
    } else {
      setElapsed('00:00');
    }
    return () => clearInterval(interval);
  }, [activeShift]);

  // Voice Command Simulation
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice recognition not supported in this browser. Try Chrome on Android or Safari on iOS.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setVoiceMessage("Listening...");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setVoiceMessage(`I heard: "${transcript}"`);
      
      if (transcript.includes('arrived') || transcript.includes('here') || transcript.includes('clock in') || transcript.includes('start')) {
        if (!activeShift) onClockIn();
      } else if (transcript.includes('left') || transcript.includes('gone') || transcript.includes('clock out') || transcript.includes('stop')) {
        if (activeShift) onClockOut(activeShift.id);
      }
      
      setTimeout(() => setIsListening(false), 2000);
    };

    recognition.onerror = () => {
      setVoiceMessage("I didn't catch that.");
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col gap-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 font-semibold text-sm">Welcome back,</p>
          <h1 className="text-3xl font-display font-bold text-gray-800">{userName}</h1>
        </div>
        <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
          <img 
            src={`https://ui-avatars.com/api/?name=${userName}&background=00BFFF&color=fff&rounded=true`} 
            alt="Profile" 
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>

      {/* Main Action Area */}
      <div className="relative">
        {activeShift ? (
           <WiiButton 
             variant="danger" 
             size="xl" 
             onClick={() => onClockOut(activeShift.id)}
             className="shadow-red-200"
             icon={<Coffee size={48} />}
           >
             <div className="flex flex-col items-center">
                <span>Clock Out</span>
                <span className="text-lg opacity-90 font-mono bg-black/10 px-4 py-1 rounded-full mt-2">
                  {elapsed}
                </span>
             </div>
           </WiiButton>
        ) : (
          <WiiButton 
            variant="primary" 
            size="xl" 
            onClick={onClockIn}
            className="shadow-blue-200"
            icon={<Sun size={48} />}
          >
            Clock In
          </WiiButton>
        )}
      </div>

      {/* Voice Assistant Card */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <h3 className="font-bold text-lg mb-1">Voice Control</h3>
                <p className="text-sm opacity-90">
                    {isListening ? voiceMessage : 'Tap mic and say "I have arrived"'}
                </p>
            </div>
            <button 
                onClick={toggleListening}
                className={`p-4 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/20 hover:bg-white/30'}`}
            >
                <Mic size={24} />
            </button>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center p-4">
            <span className="text-3xl font-bold text-wii-accent font-display">
                {format(new Date(), 'EEEE')}
            </span>
            <span className="text-gray-400 text-sm">Today</span>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4">
             <span className="text-3xl font-bold text-wii-blue font-display">
                {activeShift ? 'Active' : 'Off'}
            </span>
            <span className="text-gray-400 text-sm">Status</span>
        </Card>
      </div>
    </div>
  );
};