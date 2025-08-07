import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  MessageCircle,
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  useEffect(() => {
    if (socket && trip) {
      socket.emit('join-trip', trip._id);
      
      return () => {
        socket.emit('leave-trip', trip._id);
      };
    }
  }, [socket, trip]);

  const fetchTripDetails = async () => {
    try {
      const response = await axios.get(`/api/trips/${id}`);
      setTrip(response.data);
    } catch (error) {
      console.error('Error fetching trip details:', error);
      toast.error('Failed to load trip details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm(`Are you sure you want to delete "${trip.title}"? This action cannot be undone and will remove all associated data including itinerary, messages, and budget information.`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      await axios.delete(`/api/trips/${trip._id}`);
      toast.success('Trip deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error(error.response?.data?.message || 'Failed to delete trip');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Trip Info Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Trip Information</h3>
        </div>
        <div className="card-content">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-medium">{trip.startLocation.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">To</p>
                  <p className="font-medium">{trip.destination.name}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{trip.duration} days</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Group Size</p>
                  <p className="font-medium">{trip.members.length} members</p>
                </div>
              </div>
            </div>
          </div>
          
          {trip.description && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-gray-700">{trip.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('itinerary')}
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-semibold">View Itinerary</h3>
            <p className="text-sm text-gray-600">See planned activities</p>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('chat')}
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <MessageCircle className="h-8 w-8 text-secondary-600 mx-auto mb-2" />
            <h3 className="font-semibold">Group Chat</h3>
            <p className="text-sm text-gray-600">Discuss with group</p>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('budget')}
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold">Budget</h3>
            <p className="text-sm text-gray-600">Track expenses</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderItineraryTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Trip Itinerary</h3>
        <button className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </button>
      </div>
      
      {trip.itinerary && trip.itinerary.length > 0 ? (
        <div className="space-y-4">
          {trip.itinerary.map((day, index) => (
            <div key={index} className="card">
              <div className="card-header">
                <h4 className="card-title">Day {index + 1}</h4>
                <p className="card-description">{formatDate(day.date)}</p>
              </div>
              <div className="card-content">
                {day.activities.length > 0 ? (
                  <div className="space-y-3">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium">{activity.name}</h5>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          {activity.time && (
                            <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No activities planned for this day</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-content text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No itinerary yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start planning your trip by adding activities and places to visit
            </p>
            <button className="btn-primary">
              Generate Itinerary
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderChatTab = () => (
    <div className="card">
      <div className="card-content text-center py-12">
        <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Group Chat Coming Soon
        </h3>
        <p className="text-gray-600">
          Chat functionality will be available in the next update
        </p>
      </div>
    </div>
  );

  const renderBudgetTab = () => (
    <div className="card">
      <div className="card-content text-center py-12">
        <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Budget Tracking Coming Soon
        </h3>
        <p className="text-gray-600">
          Budget management features will be available in the next update
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600">Loading trip details...</span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
            <p className="text-gray-600 mt-2">
              {formatDate(trip.dates.startDate)} - {formatDate(trip.dates.endDate)}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="btn-outline flex items-center">
              <Edit className="h-4 w-4 mr-2" />
              Edit Trip
            </button>
            
            <button
              onClick={handleDeleteTrip}
              disabled={deleteLoading}
              className="btn-outline border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 flex items-center"
            >
              {deleteLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Trip
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'itinerary', label: 'Itinerary' },
              { id: 'chat', label: 'Chat' },
              { id: 'budget', label: 'Budget' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'itinerary' && renderItineraryTab()}
      {activeTab === 'chat' && renderChatTab()}
      {activeTab === 'budget' && renderBudgetTab()}
    </div>
  );
};

export default TripDetail;
