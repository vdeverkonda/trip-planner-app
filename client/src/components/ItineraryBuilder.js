import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  MapPin, 
  DollarSign,
  Save,
  X,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import LocationAutocomplete from './LocationAutocomplete';

const ItineraryBuilder = ({ trip, onUpdate }) => {
  const [itinerary, setItinerary] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize itinerary with trip days
  useEffect(() => {
    if (trip) {
      const startDate = new Date(trip.dates.startDate);
      const endDate = new Date(trip.dates.endDate);
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      // Create days array
      const days = [];
      for (let i = 0; i < duration; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);
        
        // Find existing itinerary for this day or create empty
        const existingDay = trip.itinerary?.find(day => day.day === i + 1);
        days.push({
          day: i + 1,
          date: dayDate,
          activities: existingDay?.activities || []
        });
      }
      
      setItinerary(days);
    }
  }, [trip]);

  const [activityForm, setActivityForm] = useState({
    name: '',
    place: {
      name: '',
      address: '',
      coordinates: { lat: 0, lng: 0 },
      placeId: ''
    },
    timeSlot: {
      startTime: '09:00',
      endTime: '10:00',
      duration: 60
    },
    estimatedCost: {
      amount: 0,
      currency: 'USD'
    },
    notes: ''
  });

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  const handleAddActivity = (dayIndex) => {
    setSelectedDay(dayIndex);
    setShowAddForm(true);
    setActivityForm({
      name: '',
      place: {
        name: '',
        address: '',
        coordinates: { lat: 0, lng: 0 },
        placeId: ''
      },
      timeSlot: {
        startTime: '09:00',
        endTime: '10:00',
        duration: 60
      },
      estimatedCost: {
        amount: 0,
        currency: 'USD'
      },
      notes: ''
    });
  };

  const handleEditActivity = (dayIndex, activityIndex) => {
    const activity = itinerary[dayIndex].activities[activityIndex];
    setSelectedDay(dayIndex);
    setEditingActivity(activityIndex);
    setActivityForm({
      name: activity.place?.name || activity.name || '',
      place: activity.place || {
        name: '',
        address: '',
        coordinates: { lat: 0, lng: 0 },
        placeId: ''
      },
      timeSlot: activity.timeSlot || {
        startTime: '09:00',
        endTime: '10:00',
        duration: 60
      },
      estimatedCost: activity.estimatedCost || {
        amount: 0,
        currency: 'USD'
      },
      notes: activity.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteActivity = (dayIndex, activityIndex) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      const newItinerary = [...itinerary];
      newItinerary[dayIndex].activities.splice(activityIndex, 1);
      setItinerary(newItinerary);
      saveItinerary(newItinerary);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes - startMinutes;
  };

  const handleSaveActivity = async () => {
    if (!activityForm.name.trim()) {
      toast.error('Activity name is required');
      return;
    }

    const duration = calculateDuration(activityForm.timeSlot.startTime, activityForm.timeSlot.endTime);
    
    const newActivity = {
      place: {
        name: activityForm.place.name || activityForm.name,
        address: activityForm.place.address || '',
        coordinates: activityForm.place.coordinates || { lat: 0, lng: 0 },
        placeId: activityForm.place.placeId || ''
      },
      timeSlot: {
        ...activityForm.timeSlot,
        duration: duration
      },
      estimatedCost: activityForm.estimatedCost,
      notes: activityForm.notes,
      addedBy: trip.organizer._id || trip.organizer,
      status: 'approved'
    };

    const newItinerary = [...itinerary];
    
    if (editingActivity !== null) {
      // Update existing activity
      newItinerary[selectedDay].activities[editingActivity] = newActivity;
    } else {
      // Add new activity
      newItinerary[selectedDay].activities.push(newActivity);
    }
    
    setItinerary(newItinerary);
    await saveItinerary(newItinerary);
    
    // Reset form
    setShowAddForm(false);
    setEditingActivity(null);
    setSelectedDay(null);
  };

  const saveItinerary = async (newItinerary) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5001/api/trips/${trip._id}/itinerary`,
        { itinerary: newItinerary },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (onUpdate) {
        onUpdate();
      }
      toast.success('Itinerary updated successfully!');
    } catch (error) {
      console.error('Error saving itinerary:', error);
      toast.error('Failed to save itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowAddForm(false);
    setEditingActivity(null);
    setSelectedDay(null);
  };

  const generateSampleItinerary = async () => {
    await generateAIItinerary();
  };

  const generateAIItinerary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5001/api/trips/${trip._id}/ai-itinerary`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.itinerary) {
        setItinerary(response.data.itinerary);
        toast.success('🤖 AI itinerary generated successfully!');
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate AI itinerary');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Trip Itinerary</h3>
        <div className="flex items-center space-x-2">
          {loading && <div className="spinner"></div>}
          <span className="text-sm text-gray-500">
            {itinerary.reduce((total, day) => total + day.activities.length, 0)} activities planned
          </span>
        </div>
      </div>

      {/* Itinerary Days */}
      <div className="space-y-4">
        {itinerary.map((day, dayIndex) => (
          <div key={dayIndex} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="card-title">Day {day.day}</h4>
                  <p className="card-description">{formatDate(day.date)}</p>
                </div>
                <button
                  onClick={() => handleAddActivity(dayIndex)}
                  className="btn-outline btn-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </button>
              </div>
            </div>
            
            <div className="card-content">
              {day.activities.length > 0 ? (
                <div className="space-y-3">
                  {day.activities.map((activity, activityIndex) => (
                    <div key={activityIndex} className="flex items-start p-4 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {activity.place?.name || activity.name}
                            </h5>
                            {activity.place?.address && (
                              <p className="text-sm text-gray-600 mt-1">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {activity.place.address}
                              </p>
                            )}
                            {activity.notes && (
                              <p className="text-sm text-gray-700 mt-2">{activity.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEditActivity(dayIndex, activityIndex)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(dayIndex, activityIndex)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          {activity.timeSlot && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(activity.timeSlot.startTime)} - {formatTime(activity.timeSlot.endTime)}
                            </div>
                          )}
                          {activity.estimatedCost?.amount > 0 && (
                            <div className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ${activity.estimatedCost.amount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No activities planned for this day</p>
                  <button
                    onClick={() => handleAddActivity(dayIndex)}
                    className="text-primary-600 hover:text-primary-700 text-sm mt-2"
                  >
                    Add your first activity
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Sample Itinerary */}
      {itinerary.every(day => day.activities.length === 0) && (
        <div className="card">
          <div className="card-content text-center py-8">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No itinerary yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start planning your trip by adding activities and places to visit
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => handleAddActivity(0)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Activity
              </button>
              <button
                onClick={generateSampleItinerary}
                disabled={loading}
                className="btn-outline flex items-center"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Generating...
                  </>
                ) : (
                  'Generate Sample'
                )}
              </button>
              <button
                onClick={generateAIItinerary}
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Generating AI Itinerary...
                  </>
                ) : (
                  'Generate AI Itinerary'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Activity Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingActivity !== null ? 'Edit Activity' : 'Add New Activity'} - Day {selectedDay + 1}
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Activity Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Name *
                  </label>
                  <input
                    type="text"
                    value={activityForm.name}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Visit Statue of Liberty"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <LocationAutocomplete
                    value={activityForm.place}
                    onChange={(locationData) => setActivityForm(prev => ({ 
                      ...prev, 
                      place: locationData 
                    }))}
                    placeholder="Search for a place..."
                  />
                </div>

                {/* Time Slot */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <select
                      value={activityForm.timeSlot.startTime}
                      onChange={(e) => setActivityForm(prev => ({
                        ...prev,
                        timeSlot: { ...prev.timeSlot, startTime: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{formatTime(time)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <select
                      value={activityForm.timeSlot.endTime}
                      onChange={(e) => setActivityForm(prev => ({
                        ...prev,
                        timeSlot: { ...prev.timeSlot, endTime: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{formatTime(time)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Estimated Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Cost (Optional)
                  </label>
                  <div className="flex">
                    <select
                      value={activityForm.estimatedCost.currency}
                      onChange={(e) => setActivityForm(prev => ({
                        ...prev,
                        estimatedCost: { ...prev.estimatedCost, currency: e.target.value }
                      }))}
                      className="w-20 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="USD">$</option>
                      <option value="EUR">€</option>
                      <option value="GBP">£</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={activityForm.estimatedCost.amount}
                      onChange={(e) => setActivityForm(prev => ({
                        ...prev,
                        estimatedCost: { ...prev.estimatedCost, amount: parseFloat(e.target.value) || 0 }
                      }))}
                      className="flex-1 p-3 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={activityForm.notes}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Any special notes or instructions..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={handleCancelEdit}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveActivity}
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="spinner mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingActivity !== null ? 'Update Activity' : 'Add Activity'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryBuilder;
