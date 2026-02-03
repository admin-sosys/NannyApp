import { createClient } from '@supabase/supabase-js';
import { Shift, UserProfile } from '../types';

// Supabase Configuration
const SUPABASE_URL = 'https://eclzflbxftsczqmwzsng.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f7YouYfnWygj96npzCikDA_p_NG2e1_';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Type mapping helpers (DB snake_case to App camelCase)
const mapShiftFromDB = (data: any): Shift => ({
  id: data.id,
  startTime: data.start_time,
  endTime: data.end_time,
  notes: data.notes
});

const mapProfileFromDB = (data: any): UserProfile => ({
  id: data.id,
  name: data.name,
  hourlyRate: data.hourly_rate,
  currency: data.currency
});

export const api = {
  auth: {
    signIn: async (email: string, password: string) => {
      return await supabase.auth.signInWithPassword({ email, password });
    },
    signUp: async (email: string, password: string) => {
      return await supabase.auth.signUp({ email, password });
    },
    signOut: async () => {
      return await supabase.auth.signOut();
    },
    getUser: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
  },
  
  shifts: {
    getAll: async (): Promise<Shift[]> => {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time', { ascending: false });
      
      if (error) {
        console.error("Supabase error fetching shifts:", error);
        return [];
      }
      return (data || []).map(mapShiftFromDB);
    },
    
    getActive: async (): Promise<Shift | null> => {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .is('end_time', null)
        .limit(1)
        .maybeSingle();

      if (error) console.error("Supabase error fetching active shift:", error);
      return data ? mapShiftFromDB(data) : null;
    },

    // Used for real-time clock in (starts Now)
    clockIn: async (): Promise<Shift> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      
      const newShift = {
        start_time: new Date().toISOString(),
        end_time: null,
        user_id: user.id 
      };

      const { data, error } = await supabase
        .from('shifts')
        .insert([newShift])
        .select()
        .single();

      if (error) throw error;
      return mapShiftFromDB(data);
    },

    // Used for manually adding past shifts
    create: async (shiftData: Partial<Shift>): Promise<Shift> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const dbPayload = {
        start_time: shiftData.startTime || new Date().toISOString(),
        end_time: shiftData.endTime || new Date().toISOString(),
        user_id: user.id,
        notes: shiftData.notes
      };

      const { data, error } = await supabase
        .from('shifts')
        .insert([dbPayload])
        .select()
        .single();
      
      if (error) throw error;
      return mapShiftFromDB(data);
    },

    clockOut: async (shiftId: string): Promise<void> => {
      const { error } = await supabase
        .from('shifts')
        .update({ end_time: new Date().toISOString() })
        .eq('id', shiftId);

      if (error) throw error;
    },

    update: async (updatedShift: Shift): Promise<void> => {
      const { error } = await supabase
        .from('shifts')
        .update({
          start_time: updatedShift.startTime,
          end_time: updatedShift.endTime,
          notes: updatedShift.notes
        })
        .eq('id', updatedShift.id);

      if (error) throw error;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  profile: {
    get: async (): Promise<UserProfile> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      // Try to get profile
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .limit(1)
        .maybeSingle();

      // If no profile exists (Trigger failed? Race condition?), create one now.
      if (!data) {
        const defaultProfile = {
          id: user.id,
          name: 'Nanny',
          hourly_rate: 25.00,
          currency: 'USD'
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('profiles')
          .insert([defaultProfile])
          .select()
          .single();
          
        if (insertError) {
          console.error("Failed to auto-create profile", insertError);
          // Return valid fallback object so app doesn't crash
          return { id: user.id, name: 'Nanny', hourlyRate: 25, currency: 'USD' };
        }
        data = newData;
      }

      return mapProfileFromDB(data);
    },
    
    update: async (profile: UserProfile): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile.name,
          hourly_rate: profile.hourlyRate,
          currency: profile.currency
        });

      if (error) throw error;
    }
  }
};
// Alias for backward compatibility if needed, though we should prefer 'api'
export const mockSupabase = api;