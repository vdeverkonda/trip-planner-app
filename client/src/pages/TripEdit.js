import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Car, 
  Bus, 
  Plane,
  ArrowRight,
  Save,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import "react-datepicker/dist/react-datepicker.css";
import LocationAutocomplete from '../components/LocationAutocomplete';

const TripEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingTrip, setFetchingTrip] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startLocation: {
      name: '',
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    destination: {
      name: '',
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    dates: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    transportation: 'car',
    groupSize: 1,
    budget: {
      range: 'moderate',
      total: 0,
      currency: 'USD'
    },
    preferences: {
      travelStyle: [],
      interests: [],
      pace: 'moderate',
      accommodation: 'hotel',
      budgetPriority: 'balanced',
      specialRequests: ''
    }
  });
  const [errors, setErrors] = useState({});

  const travelStyleOptions = [
    {
      id: 'culture_history',
      title: 'Culture & History',
      description: 'Museums, historical sites, walking tours, local traditions',
      icon: '🏛️'
    },
    {
      id: 'foodie',
      title: 'Foodie Experience',
      description: 'Culinary tours, famous restaurants, cooking classes, local markets',
      icon: '🍽️'
    },
    {
      id: 'adventure_outdoors',
      title: 'Adventure & Outdoors',
      description: 'Hiking, kayaking, zip-lining, national parks, extreme sports',
      icon: '🏔️'
    },
    {
      id: 'relaxation',
      title: 'Relaxation & Wellness',
      description: 'Spas, beaches, scenic drives, quiet cafes, meditation retreats',
      icon: '🧘'
    },
    {
      id: 'family_friendly',
      title: 'Family-Friendly',
      description: 'Zoos, amusement parks, kid-friendly museums, interactive experiences',
      icon: '👨‍👩‍👧‍👦'
    },
    {
      id: 'nightlife_entertainment',
      title: 'Nightlife & Entertainment',
      description: 'Bars, clubs, live music, theater shows, festivals',
      icon: '🎭'
    },
    {
      id: 'shopping_local',
      title: 'Shopping & Local Life',
      description: 'Local markets, boutiques, artisan shops, neighborhood exploration',
      icon: '🛍️'
    },
    {
      id: 'photography_scenic',
      title: 'Photography & Scenic',
      description: 'Instagram spots, scenic viewpoints, sunrise/sunset locations',
      icon: '📸'
    }
  ];

  const budgetRanges = [
    {
      id: 'budget',
      title: 'Budget-Friendly',
      description: 'Free activities, local eats, public transport',
      range: '$0-50/day',
      icon: '💰'
    },
    {
      id: 'moderate',
      title: 'Moderate',
      description: 'Mix of paid attractions, mid-range dining',
      range: '$50-150/day',
      icon: '💳'
    },
    {
      id: 'luxury',
      title: 'Luxury Experience',
      description: 'Premium experiences, fine dining, private tours',
      range: '$150+/day',
      icon: '💎'
    }
  ];

  const paceOptions = [
    {
      id: 'relaxed',
      title: 'Relaxed Pace',
      description: 'Lots of downtime, 1-2 activities per day',
      icon: '🐌'
    },
    {
      id: 'moderate',
      title: 'Moderate Pace',
      description: 'Balanced schedule, 3-4 activities per day',
      icon: '🚶'
    },
    {
      id: 'packed',
      title: 'Packed Schedule',
      description: 'See everything, 5+ activities per day',
      icon: '🏃'
    }
  ];

  const transportationOptions = [
    { value: 'car', label: 'Car', icon: Car },
    { value: 'public_transport', label: 'Bus/Train', icon: Bus },
    { value: 'mixed', label: 'Mixed Transport', icon: Plane },
    { value: 'walking', label: 'Walking', icon: MapPin }
  ];

  // Fetch trip data on component mount
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setFetchingTrip(true);
        const response = await axios.get(`/api/trips/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const trip = response.data;
        
        // Pre-populate form with existing trip data
        setFormData({
          title: trip.title || '',
          description: trip.description || '',
          startLocation: trip.startLocation || {
            name: '',
            address: '',
            coordinates: { lat: 0, lng: 0 }
          },
          destination: trip.destination || {
            name: '',
            address: '',
            coordinates: { lat: 0, lng: 0 }
          },
          dates: {
            startDate: trip.dates?.startDate ? new Date(trip.dates.startDate) : new Date(),
            endDate: trip.dates?.endDate ? new Date(trip.dates.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          transportation: trip.transportation || 'car',
          groupSize: trip.groupSize || 1,
          budget: {
            range: trip.budget?.range || 'moderate',
            total: trip.budget?.total || 0,
            currency: trip.budget?.currency || 'USD'
          },
          preferences: {
            travelStyle: trip.preferences?.travelStyle || [],
            interests: trip.preferences?.interests || [],
            pace: trip.preferences?.pace || 'moderate',
            accommodation: trip.preferences?.accommodation || 'hotel',
            budgetPriority: trip.preferences?.budgetPriority || 'balanced',
            specialRequests: trip.preferences?.specialRequests || ''
          }
        });
      } catch (error) {
        console.error('Error fetching trip:', error);
        toast.error('Failed to load trip data');
        navigate('/dashboard');
      } finally {
        setFetchingTrip(false);
      }
    };

    if (id) {
      fetchTrip();
    }
  }, [id, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLocationChange = (type, locationData) => {
    setFormData(prev => ({
      ...prev,
      [type]: locationData
    }));
    
    if (errors[type]) {
      setErrors(prev => ({
        ...prev,
        [type]: ''
      }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Trip title is required';
      }
    }

    if (stepNumber === 2) {
      if (!formData.startLocation?.name) {
        newErrors.startLocation = 'Start location is required';
      }
      if (!formData.destination?.name) {
        newErrors.destination = 'Destination is required';
      }
      if (!formData.dates.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (!formData.dates.endDate) {
        newErrors.endDate = 'End date is required';
      }
      if (formData.dates.startDate && formData.dates.endDate && formData.dates.startDate >= formData.dates.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (formData.groupSize < 1) {
        newErrors.groupSize = 'Group size must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      // Calculate duration
      const startDate = new Date(formData.dates.startDate);
      const endDate = new Date(formData.dates.endDate);
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Structure data to match backend model
      const updateData = {
        title: formData.title,
        description: formData.description,
        startLocation: formData.startLocation,
        destination: formData.destination,
        dates: formData.dates,
        duration: duration,
        transportation: formData.transportation,
        groupSize: formData.groupSize,
        preferences: {
          aggregated: {
            travelStyle: formData.preferences.travelStyle || [],
            interests: formData.preferences.interests || [],
            budgetRange: formData.budget.range,
            timePreferences: [],
            specialInterests: formData.preferences.specialRequests ? [formData.preferences.specialRequests] : [],
            mobilityPreferences: []
          }
        }
      };

      const response = await axios.put(`/api/trips/${id}`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Trip updated successfully!');
      navigate(`/trips/${id}`);
    } catch (error) {
      console.error('Trip update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update trip');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Trip Details</h2>
        <p className="text-gray-600">Update your trip's basic information</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trip Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your trip title"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Describe your trip..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Logistics</h2>
        <p className="text-gray-600">Update locations, dates, and travel details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Start Location *
          </label>
          <LocationAutocomplete
            value={formData.startLocation}
            onChange={(locationData) => handleLocationChange('startLocation', locationData)}
            placeholder="Where are you starting from?"
            error={errors.startLocation}
          />
          {errors.startLocation && <p className="text-red-500 text-sm mt-1">{errors.startLocation}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Destination *
          </label>
          <LocationAutocomplete
            value={formData.destination}
            onChange={(locationData) => handleLocationChange('destination', locationData)}
            placeholder="Where do you want to go?"
            error={errors.destination}
          />
          {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Start Date *
          </label>
          <DatePicker
            selected={formData.dates.startDate}
            onChange={(date) => handleInputChange('dates', { ...formData.dates, startDate: date })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholderText="Select start date"
            minDate={new Date()}
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            End Date *
          </label>
          <DatePicker
            selected={formData.dates.endDate}
            onChange={(date) => handleInputChange('dates', { ...formData.dates, endDate: date })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholderText="Select end date"
            minDate={formData.dates.startDate || new Date()}
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="h-4 w-4 inline mr-1" />
            Group Size *
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={formData.groupSize}
            onChange={(e) => handleInputChange('groupSize', parseInt(e.target.value) || 1)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.groupSize ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Number of travelers"
          />
          {errors.groupSize && <p className="text-red-500 text-sm mt-1">{errors.groupSize}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transportation
          </label>
          <Select
            value={transportationOptions.find(option => option.value === formData.transportation)}
            onChange={(option) => handleInputChange('transportation', option.value)}
            options={transportationOptions}
            className="react-select-container"
            classNamePrefix="react-select"
            formatOptionLabel={(option) => (
              <div className="flex items-center">
                <option.icon className="h-4 w-4 mr-2" />
                {option.label}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Travel Preferences</h2>
        <p className="text-gray-600">Help us personalize your trip recommendations</p>
      </div>

      {/* Travel Style Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          What type of experiences are you looking for? (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {travelStyleOptions.map((style) => (
            <div
              key={style.id}
              onClick={() => {
                const currentStyles = formData.preferences.travelStyle || [];
                const isSelected = currentStyles.includes(style.id);
                const newStyles = isSelected
                  ? currentStyles.filter(s => s !== style.id)
                  : [...currentStyles, style.id];
                
                handleInputChange('preferences', {
                  ...formData.preferences,
                  travelStyle: newStyles
                });
              }}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.preferences.travelStyle?.includes(style.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <span className="text-2xl mr-3">{style.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{style.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          What's your preferred budget range per day?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {budgetRanges.map((budget) => (
            <div
              key={budget.id}
              onClick={() => handleInputChange('budget', { ...formData.budget, range: budget.id })}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.budget.range === budget.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">{budget.icon}</span>
                <h4 className="font-semibold text-gray-900">{budget.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{budget.description}</p>
                <p className="text-xs text-primary-600 font-medium mt-2">{budget.range}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Pace */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          What's your preferred travel pace?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paceOptions.map((pace) => (
            <div
              key={pace.id}
              onClick={() => handleInputChange('preferences', { ...formData.preferences, pace: pace.id })}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.preferences.pace === pace.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">{pace.icon}</span>
                <h4 className="font-semibold text-gray-900">{pace.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{pace.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Any special requests or considerations?
        </label>
        <textarea
          value={formData.preferences.specialRequests}
          onChange={(e) => handleInputChange('preferences', { 
            ...formData.preferences, 
            specialRequests: e.target.value 
          })}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Accessibility needs, dietary restrictions, specific interests, etc."
        />
      </div>

      {/* Trip Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Updated Trip Summary</h3>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900">{formData.title}</h4>
            <p className="text-sm text-gray-600">{formData.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">
                  {formData.startLocation?.name && typeof formData.startLocation.name === 'string' 
                    ? formData.startLocation.name 
                    : 'Start location not set'}
                </span>
              </div>

              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">
                  {formData.destination?.name && typeof formData.destination.name === 'string'
                    ? formData.destination.name
                    : 'Destination not set'}
                </span>
              </div>

              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">
                  {formData.dates.startDate?.toLocaleDateString()} - {formData.dates.endDate?.toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">
                  {formData.groupSize} {formData.groupSize === 1 ? 'person' : 'people'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Car className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm capitalize">
                  {formData.transportation.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-sm">Budget:</span>
                <span className="text-sm font-medium ml-2 capitalize">{formData.budget.range}</span>
              </div>

              <div className="flex items-center">
                <span className="text-sm">Travel Style:</span>
                <span className="text-sm font-medium ml-2">
                  {formData.preferences.travelStyle?.length > 0 
                    ? formData.preferences.travelStyle.map(style => 
                        travelStyleOptions.find(opt => opt.id === style)?.title
                      ).filter(Boolean).join(', ')
                    : 'None selected'}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-sm">Pace:</span>
                <span className="text-sm font-medium ml-2 capitalize">{formData.preferences.pace}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Updating your trip</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your changes will be saved and visible to all trip members</li>
          <li>• Existing recommendations may be updated based on new preferences</li>
          <li>• Group chat and budget data will remain unchanged</li>
        </ul>
      </div>
    </div>
  );

  if (fetchingTrip) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary-600 mr-3" />
          <span className="text-lg text-gray-600">Loading trip data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {step} of 3
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((step / 3) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="btn-outline"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/trips/${id}`)}
              className="btn-outline"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex items-center"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Updating Trip...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Trip
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TripEdit;
