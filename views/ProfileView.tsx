import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Card } from '../components/Card';
import { WiiButton } from '../components/WiiButton';
import { Save } from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile }) => {
  const [formData, setFormData] = useState(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    alert('Profile saved!');
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
       <h2 className="text-2xl font-display font-bold text-gray-800">Settings</h2>

       <Card>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Display Name</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-wii-blue focus:outline-none transition-colors font-display font-bold text-gray-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Hourly Rate ($)</label>
                    <input 
                        type="number" 
                        step="0.50"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})}
                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-wii-blue focus:outline-none transition-colors font-mono text-lg font-bold text-gray-700"
                    />
                </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Currency</label>
                    <select
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                         className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-wii-blue focus:outline-none transition-colors font-bold text-gray-700"
                    >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                    </select>
                </div>

                <div className="pt-4">
                    <WiiButton type="submit" variant="success" icon={<Save size={20} />} className="w-full">
                        Save Changes
                    </WiiButton>
                </div>
            </form>
       </Card>

       <div className="text-center text-gray-400 text-xs mt-4">
            <p>NannyTime App v1.0.0</p>
            <p>Designed for Google Home Platform</p>
       </div>
    </div>
  );
};