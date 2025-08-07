import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Heart, 
  Camera, 
  Mountain, 
  Utensils, 
  Music,
  Palette,
  Sun,
  Moon,
  Save,
  Edit3,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, updatePreferences } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [preferences, setPreferences] = useState({
    interests: [],
    budgetRange: { min: 0, max: 5000 },
    travelStyle: 'balanced',
    accommodationType: 'hotel',
    foodPreferences: [],
    activityLevel: 'moderate',
    groupSize: 'small',
    planningStyle: 'flexible'
  });

  const interestOptions = [
    { id: 'beaches', label: 'Beaches', icon: Sun },
    { id: 'mountains', label: 'Mountains', icon: Mountain },
    { id: 'culture', label: 'Culture & History', icon: Palette },
    { id: 'food', label: 'Food & Dining', icon: Utensils },
    { id: 'nightlife', label: 'Nightlife', icon: Moon },
    { id: 'adventure', label: 'Adventure Sports', icon: Mountain },
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'music', label: 'Music & Festivals', icon: Music },
    { id: 'nature', label: 'Nature & Wildlife', icon: Heart },
    { id: 'shopping', label: 'Shopping', icon: MapPin }
  ];

  const travelStyleOptions = [
    { value: 'budget', label: 'Budget Traveler', description: 'Focus on saving money and finding deals' },
    { value: 'balanced', label: 'Balanced', description: 'Mix of comfort and value' },
    { value: 'luxury', label: 'Luxury', description: 'Premium experiences and comfort' }
  ];

  const accommodationOptions = [
    { value: 'hostel', label: 'Hostels' },
    { value: 'hotel', label: 'Hotels' },
    { value: 'resort', label: 'Resorts' },
    { value: 'airbnb', label: 'Airbnb/Vacation Rentals' },
    { value: 'mixed', label: 'Mixed' }
  ];

  const foodOptions = [
    { value: 'local', label: 'Local Cuisine' },
    { value: 'international', label: 'International' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' }
  ];

  const activityLevelOptions = [
    { value: 'low', label: 'Low', description: 'Relaxed pace, minimal walking' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced mix of activities and rest' },
    { value: 'high', label: 'High', description: 'Active, packed schedule' }
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      });
      
      if (user.preferences) {
        setPreferences({
          interests: user.preferences.interests || [],
          budgetRange: user.preferences.budgetRange || { min: 0, max: 5000 },
          travelStyle: user.preferences.travelStyle || 'balanced',
          accommodationType: user.preferences.accommodationType || 'hotel',
          foodPreferences: user.preferences.foodPreferences || [],
          activityLevel: user.preferences.activityLevel || 'moderate',
          groupSize: user.preferences.groupSize || 'small',
          planningStyle: user.preferences.planningStyle || 'flexible'
        });
      }
    }
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interestId) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handleFoodPreferenceToggle = (foodId) => {
    setPreferences(prev => ({
      ...prev,
      foodPreferences: prev.foodPreferences.includes(foodId)
        ? prev.foodPreferences.filter(id => id !== foodId)
        : [...prev.foodPreferences, foodId]
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(profileData);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await updatePreferences(preferences);
      toast.success('Preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-outline flex items-center"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <div className="spinner mr-2"></div>
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="btn-outline flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-content">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="input"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900">{profileData.name || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              <p className="text-gray-900">{profileData.email}</p>
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className="input"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-900">{profileData.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                  className="input"
                  placeholder="Enter your location"
                />
              ) : (
                <p className="text-gray-900">{profileData.location || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Travel Preferences</h2>
        <button
          onClick={handleSavePreferences}
          disabled={loading}
          className="btn-primary flex items-center"
        >
          {loading ? (
            <div className="spinner mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Preferences
        </button>
      </div>

      {/* Interests */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Interests</h3>
          <p className="card-description">
            Select your travel interests to get better recommendations
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {interestOptions.map((interest) => {
              const IconComponent = interest.icon;
              const isSelected = preferences.interests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">{interest.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Budget Range */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Budget Range</h3>
          <p className="card-description">
            Set your typical budget range per trip
          </p>
        </div>
        <div className="card-content">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Budget ($)
              </label>
              <input
                type="number"
                min="0"
                value={preferences.budgetRange.min}
                onChange={(e) => handlePreferenceChange('budgetRange', {
                  ...preferences.budgetRange,
                  min: parseInt(e.target.value) || 0
                })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Budget ($)
              </label>
              <input
                type="number"
                min="0"
                value={preferences.budgetRange.max}
                onChange={(e) => handlePreferenceChange('budgetRange', {
                  ...preferences.budgetRange,
                  max: parseInt(e.target.value) || 0
                })}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Travel Style */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Travel Style</h3>
          <p className="card-description">
            How do you prefer to travel?
          </p>
        </div>
        <div className="card-content">
          <div className="space-y-3">
            {travelStyleOptions.map((style) => (
              <label key={style.value} className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="travelStyle"
                  value={style.value}
                  checked={preferences.travelStyle === style.value}
                  onChange={(e) => handlePreferenceChange('travelStyle', e.target.value)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">{style.label}</div>
                  <div className="text-sm text-gray-600">{style.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Accommodation & Food */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Accommodation</h3>
          </div>
          <div className="card-content">
            <select
              value={preferences.accommodationType}
              onChange={(e) => handlePreferenceChange('accommodationType', e.target.value)}
              className="input"
            >
              {accommodationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Activity Level</h3>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              {activityLevelOptions.map((level) => (
                <label key={level.value} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="activityLevel"
                    value={level.value}
                    checked={preferences.activityLevel === level.value}
                    onChange={(e) => handlePreferenceChange('activityLevel', e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{level.label}</div>
                    <div className="text-sm text-gray-600">{level.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Food Preferences */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Food Preferences</h3>
          <p className="card-description">
            Select your dietary preferences and food interests
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {foodOptions.map((food) => {
              const isSelected = preferences.foodPreferences.includes(food.value);
              return (
                <button
                  key={food.value}
                  type="button"
                  onClick={() => handleFoodPreferenceToggle(food.value)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="text-sm font-medium">{food.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Travel Preferences
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'preferences' && renderPreferencesTab()}
    </div>
  );
};

export default Profile;
