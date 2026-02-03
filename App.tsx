import React, { useEffect, useState } from 'react';
import { api, supabase } from './services/mockSupabase'; // Import supabase client directly for listeners
import { Shift, UserProfile, ViewState } from './types';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { HistoryView } from './views/HistoryView';
import { PayStubView } from './views/PayStubView';
import { ProfileView } from './views/ProfileView';
import { AuthView } from './views/AuthView';
import { LogOut } from 'lucide-react';
import { WiiButton } from './components/WiiButton';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setIsLoading(false); // Stop loading if no user, render AuthView
    });

    // Listen for changes (Login, Logout, Auto-refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Clear data on logout
        setShifts([]);
        setProfile(null);
        setActiveShift(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Data Loading when Session exists
  useEffect(() => {
    if (!session) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [fetchedShifts, fetchedProfile] = await Promise.all([
          api.shifts.getAll(),
          api.profile.get()
        ]);
        
        setShifts(fetchedShifts);
        setProfile(fetchedProfile);
        
        const active = fetchedShifts.find(s => s.endTime === null);
        setActiveShift(active || null);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [session]);

  const handleClockIn = async () => {
    try {
      const newShift = await api.shifts.clockIn();
      setShifts([newShift, ...shifts]);
      setActiveShift(newShift);
    } catch (e) {
      alert("Error clocking in. Please try again.");
    }
  };

  const handleClockOut = async (id: string) => {
    await api.shifts.clockOut(id);
    const updatedShifts = await api.shifts.getAll();
    setShifts(updatedShifts);
    setActiveShift(null);
  };

  const handleUpdateShift = async (shift: Shift) => {
    await api.shifts.update(shift);
    const updatedShifts = await api.shifts.getAll();
    setShifts(updatedShifts);
    const active = updatedShifts.find(s => s.endTime === null);
    setActiveShift(active || null);
  };

  const handleDeleteShift = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this shift record?")) {
        await api.shifts.delete(id);
        const updatedShifts = await api.shifts.getAll();
        setShifts(updatedShifts);
        const active = updatedShifts.find(s => s.endTime === null);
        setActiveShift(active || null);
    }
  };

  const handleAddShift = async () => {
    // Manually create a completed shift for "now" that the user can edit
    // This distinguishes it from "clocking in" so we don't mess up active state
    const now = new Date().toISOString();
    const newShift = await api.shifts.create({ startTime: now, endTime: now });
    const updatedShifts = await api.shifts.getAll();
    setShifts(updatedShifts);
    return newShift;
  };

  const handleUpdateProfile = async (p: UserProfile) => {
    await api.profile.update(p);
    setProfile(p);
  };

  const handleSignOut = async () => {
    await api.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-wii-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-wii-blue"></div>
      </div>
    );
  }

  // Render Auth View if not logged in
  if (!session) {
    return (
      <div className="min-h-screen font-sans bg-gradient-to-br from-[#E0F7FA] to-[#E8F5E9] overflow-x-hidden selection:bg-wii-blue selection:text-white flex items-center justify-center">
         <div className="fixed top-0 left-0 w-full h-48 bg-white/40 blur-3xl -z-10 rounded-b-[50%]" />
         <div className="w-full max-w-md">
            <AuthView />
         </div>
      </div>
    );
  }

  // Render Main App
  return (
    <div className="min-h-screen font-sans text-wii-text bg-gradient-to-br from-[#E0F7FA] to-[#E8F5E9] overflow-x-hidden selection:bg-wii-blue selection:text-white">
      
      {/* Top decorative wave */}
      <div className="fixed top-0 left-0 w-full h-48 bg-white/40 blur-3xl -z-10 rounded-b-[50%]" />

      {/* Logout Button (Top Right) */}
      <div className="fixed top-4 right-4 z-40">
        <button 
          onClick={handleSignOut}
          className="p-2 bg-white/50 backdrop-blur-sm rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>

      <main className="max-w-md mx-auto min-h-screen relative p-6 pt-12">
        {view === ViewState.HOME && profile && (
          <HomeView 
            activeShift={activeShift} 
            onClockIn={handleClockIn} 
            onClockOut={handleClockOut}
            userName={profile.name}
          />
        )}
        
        {view === ViewState.HISTORY && (
          <HistoryView 
            shifts={shifts} 
            onUpdateShift={handleUpdateShift} 
            onDeleteShift={handleDeleteShift}
            onAddShift={handleAddShift}
          />
        )}
        
        {view === ViewState.PAYSTUB && profile && (
          <PayStubView shifts={shifts} profile={profile} />
        )}
        
        {view === ViewState.PROFILE && profile && (
          <ProfileView profile={profile} onUpdateProfile={handleUpdateProfile} />
        )}
      </main>

      <BottomNav activeView={view} onChange={setView} />
    </div>
  );
}