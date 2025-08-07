import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    totalBudget: 0,
    completedTrips: 0
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get('/api/trips');
      setTrips(response.data);
      
      // Calculate stats
      const now = new Date();
      const upcoming = response.data.filter(trip => 
        new Date(trip.dates.startDate) > now && trip.status !== 'cancelled'
      );
      const completed = response.data.filter(trip => trip.status === 'completed');
      
      setStats({
        totalTrips: response.data.length,
        upcomingTrips: upcoming.length,
        completedTrips: completed.length,
        totalBudget: response.data.reduce((sum, trip) => sum + (trip.budget?.totalBudget?.amount || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.planning;
  };

  const getStatusText = (status) => {
    const texts = {
      planning: 'Planning',
      confirmed: 'Confirmed',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return texts[status] || 'Planning';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600">Loading your trips...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Plan your next adventure or manage your existing trips
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MapPin className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <Calendar className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingTrips}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalBudget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTrips}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/trips/create"
            className="btn-primary flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Plan New Trip
          </Link>
          <Link
            to="/profile"
            className="btn-outline flex items-center justify-center"
          >
            Update Preferences
          </Link>
        </div>
      </div>

      {/* Trips Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Trips</h2>
          {trips.length > 0 && (
            <Link
              to="/trips"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>

        {trips.length === 0 ? (
          <div className="card">
            <div className="card-content text-center py-12">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No trips yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start planning your first adventure with friends and family
              </p>
              <Link
                to="/trips/create"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Trip
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 6).map((trip) => (
              <Link
                key={trip._id}
                to={`/trips/${trip._id}`}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                <div className="card-content">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {trip.title}
                    </h3>
                    <span className={`badge ${getStatusColor(trip.status)}`}>
                      {getStatusText(trip.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {trip.startLocation.name} → {trip.destination.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        {formatDate(trip.dates.startDate)} - {formatDate(trip.dates.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{trip.members.length} member{trip.members.length !== 1 ? 's' : ''}</span>
                    </div>
                    
                    {trip.budget && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>${trip.budget.totalBudget?.amount?.toLocaleString() || 0}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{trip.duration} day{trip.duration !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity or Tips */}
      {trips.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Planning Tips</h3>
            <p className="card-description">
              Make the most of your trip planning experience
            </p>
          </div>
          <div className="card-content">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="p-2 bg-primary-100 rounded-lg mr-4 flex-shrink-0">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Invite Your Group
                  </h4>
                  <p className="text-sm text-gray-600">
                    Add friends to collaborate on planning and split expenses automatically.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 bg-secondary-100 rounded-lg mr-4 flex-shrink-0">
                  <Star className="h-5 w-5 text-secondary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Set Your Preferences
                  </h4>
                  <p className="text-sm text-gray-600">
                    Update your travel preferences to get better recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
