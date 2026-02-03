import React, { useMemo, useState } from 'react';
import { Shift, UserProfile } from '../types';
import { Card } from '../components/Card';
import { differenceInMinutes, parseISO, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth, format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, Sparkles } from 'lucide-react';
import { WiiButton } from '../components/WiiButton';
import { GoogleGenAI } from "@google/genai";

interface PayStubViewProps {
  shifts: Shift[];
  profile: UserProfile;
}

export const PayStubView: React.FC<PayStubViewProps> = ({ shifts, profile }) => {
  const [period, setPeriod] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    let start, end;

    if (period === 'WEEK') {
      start = startOfWeek(now);
      end = endOfWeek(now);
    } else {
      start = startOfMonth(now);
      end = endOfMonth(now);
    }

    const filteredShifts = shifts.filter(s => {
      if (!s.endTime) return false;
      const shiftDate = parseISO(s.startTime);
      return isWithinInterval(shiftDate, { start, end });
    });

    let totalMinutes = 0;
    filteredShifts.forEach(s => {
      if (s.endTime) {
        totalMinutes += differenceInMinutes(parseISO(s.endTime), parseISO(s.startTime));
      }
    });

    const hours = totalMinutes / 60;
    const earnings = hours * profile.hourlyRate;

    return {
      hours,
      earnings,
      count: filteredShifts.length
    };
  }, [shifts, period, profile.hourlyRate]);

  // Mock data for the chart
  const data = [
    { name: 'Worked', value: stats.hours },
    { name: 'Remaining (Target 40)', value: Math.max(0, (period === 'WEEK' ? 40 : 160) - stats.hours) },
  ];
  const COLORS = ['#00BFFF', '#F0F8FF'];

  const generateSummary = async () => {
     if (!process.env.API_KEY) {
        setAiSummary("API Key missing. Cannot generate AI summary.");
        return;
     }
     setIsGenerating(true);
     try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            You are a helpful payroll assistant.
            The nanny worked ${stats.hours.toFixed(2)} hours this ${period.toLowerCase()}.
            She earned ${profile.currency} ${stats.earnings.toFixed(2)}.
            Number of shifts: ${stats.count}.
            Write a very short, cheerful, encouraging note (max 2 sentences) for her pay stub.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        setAiSummary(response.text);
     } catch (e) {
        setAiSummary("Great work this week! Keep it up!");
     } finally {
        setIsGenerating(false);
     }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <h2 className="text-2xl font-display font-bold text-gray-800">Earnings</h2>

      {/* Toggle */}
      <div className="bg-gray-100 p-1 rounded-full flex relative">
        <button 
          onClick={() => setPeriod('WEEK')}
          className={`flex-1 py-2 rounded-full text-sm font-bold transition-all z-10 ${period === 'WEEK' ? 'bg-white shadow-md text-wii-blue' : 'text-gray-400'}`}
        >
          This Week
        </button>
        <button 
          onClick={() => setPeriod('MONTH')}
          className={`flex-1 py-2 rounded-full text-sm font-bold transition-all z-10 ${period === 'MONTH' ? 'bg-white shadow-md text-wii-blue' : 'text-gray-400'}`}
        >
          This Month
        </button>
      </div>

      {/* Main Stats Card */}
      <Card className="bg-wii-blue text-white border-none flex flex-col items-center">
        <span className="text-blue-100 font-bold mb-2">Total Earnings</span>
        <span className="text-5xl font-display font-bold mb-4">
            ${stats.earnings.toFixed(2)}
        </span>
        <div className="flex gap-8 w-full justify-center border-t border-white/20 pt-4">
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{stats.hours.toFixed(1)}</span>
                <span className="text-xs text-blue-100 uppercase tracking-wider">Hours</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{stats.count}</span>
                <span className="text-xs text-blue-100 uppercase tracking-wider">Shifts</span>
             </div>
        </div>
      </Card>

      {/* Visual Breakdown */}
      <Card title="Hours Goal" className="h-64">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                stroke="none"
            >
                {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
             <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
             />
            </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* AI Summary / Export */}
      <Card className="flex flex-col gap-4">
         <div className="flex items-start gap-3">
             <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Sparkles size={20} />
             </div>
             <div className="flex-1">
                 <h4 className="font-bold text-gray-800">Smart Summary</h4>
                 <p className="text-sm text-gray-500 mt-1">
                    {aiSummary || "Generate a summary of your work period."}
                 </p>
             </div>
         </div>
         
         {!aiSummary ? (
             <WiiButton variant="secondary" onClick={generateSummary} size="sm">
                {isGenerating ? 'Thinking...' : 'Generate Note'}
             </WiiButton>
         ) : null}

         <div className="h-px bg-gray-100 my-1" />

         <WiiButton variant="primary" icon={<Download size={18} />}>
            Download Pay Stub
         </WiiButton>
      </Card>
    </div>
  );
};