import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import "react-datepicker/dist/react-datepicker.css";

const TripCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    transportation: 'car',
    groupSize: 1
  });
  const [errors, setErrors] = useState({});

  const transportationOptions = [
    { value: 'car', label: 'Car', icon: Car },
    { value: 'public_transport', label: 'Public Transport', icon: Bus },
    { value: 'mixed', label: 'Mixed', icon: Plane },
    { value: 'walking', label: 'Walking', icon: Users }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLocationChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        name: value,
        address: value,
        coordinates: { lat: 0, lng: 0 } // In real app, use geocoding
      }
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
      if (!formData.startLocation.name.trim()) {
        newErrors.startLocation = 'Start location is required';
      }
      if (!formData.destination.name.trim()) {
        newErrors.destination = 'Destination is required';
      }
    }

    if (stepNumber === 2) {
      if (!formData.dates.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (!formData.dates.endDate) {
        newErrors.endDate = 'End date is required';
      }
      if (formData.dates.startDate && formData.dates.endDate && 
          formData.dates.endDate <= formData.dates.startDate) {
        newErrors.endDate = 'End date must be after start date';
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
      const response = await axios.post('/api/trips', formData);
      toast.success('Trip created successfully!');
      navigate(`/trips/${response.data.trip._id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error(error.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Let's plan your trip
        </h2>
        <p className="text-gray-600">
          Tell us about your destination and what you'd like to call this adventure
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Trip Title
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`input ${errors.title ? 'border-red-500' : ''}`}
          placeholder="e.g., Summer Beach Getaway"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="input"
          placeholder="Tell us more about your trip..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Starting From
          </label>
          <input
            id="startLocation"
            type="text"
            value={formData.startLocation.name}
            onChange={(e) => handleLocationChange('startLocation', e.target.value)}
            className={`input ${errors.startLocation ? 'border-red-500' : ''}`}
            placeholder="Enter starting location"
          />
          {errors.startLocation && (
            <p className="mt-1 text-sm text-red-600">{errors.startLocation}</p>
          )}
        </div>

        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Going To
          </label>
          <input
            id="destination"
            type="text"
            value={formData.destination.name}
            onChange={(e) => handleLocationChange('destination', e.target.value)}
            className={`input ${errors.destination ? 'border-red-500' : ''}`}
            placeholder="Enter destination"
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          When are you traveling?
        </h2>
        <p className="text-gray-600">
          Choose your travel dates and preferences
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Start Date
          </label>
          <DatePicker
            selected={formData.dates.startDate}
            onChange={(date) => handleInputChange('dates', { ...formData.dates, startDate: date })}
            className={`input ${errors.startDate ? 'border-red-500' : ''}`}
            minDate={new Date()}
            placeholderText="Select start date"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            End Date
          </label>
          <DatePicker
            selected={formData.dates.endDate}
            onChange={(date) => handleInputChange('dates', { ...formData.dates, endDate: date })}
            className={`input ${errors.endDate ? 'border-red-500' : ''}`}
            minDate={formData.dates.startDate || new Date()}
            placeholderText="Select end date"
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transportation
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {transportationOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('transportation', option.value)}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  formData.transportation === option.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <IconComponent className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="groupSize" className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="h-4 w-4 inline mr-1" />
          Expected Group Size
        </label>
        <input
          id="groupSize"
          type="number"
          min="1"
          max="20"
          value={formData.groupSize}
          onChange={(e) => handleInputChange('groupSize', parseInt(e.target.value) || 1)}
          className="input w-32"
        />
        <p className="mt-1 text-sm text-gray-500">
          You can invite members after creating the trip
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review your trip
        </h2>
        <p className="text-gray-600">
          Make sure everything looks good before creating your trip
        </p>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">{formData.title}</h3>
              {formData.description && (
                <p className="text-gray-600 mt-1">{formData.description}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">
                  {formData.startLocation.name} → {formData.destination.name}
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

              <div className="flex items-center">
                <Car className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm capitalize">
                  {formData.transportation.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• We'll create your trip and generate personalized recommendations</li>
          <li>• You can invite friends to collaborate on the planning</li>
          <li>• Set up a budget and track expenses together</li>
          <li>• Use group chat to discuss and vote on activities</li>
        </ul>
      </div>
    </div>
  );

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
            <div></div>
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
                  Creating Trip...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Trip
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TripCreate;
