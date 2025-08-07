import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  Users, 
  DollarSign, 
  MessageCircle, 
  Calendar, 
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-primary-600" />,
      title: "Smart Recommendations",
      description: "Get personalized place recommendations based on your preferences and travel style."
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: "Collaborative Planning",
      description: "Plan trips together with friends through real-time group chat and voting."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-primary-600" />,
      title: "Budget Tracking",
      description: "Track expenses and split costs automatically with your travel companions."
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-primary-600" />,
      title: "Group Chat",
      description: "Discuss plans, share suggestions, and vote on activities in real-time."
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary-600" />,
      title: "Smart Scheduling",
      description: "Optimize your itinerary with AI-powered scheduling based on preferences."
    },
    {
      icon: <Star className="h-8 w-8 text-primary-600" />,
      title: "Personalized Experience",
      description: "Tailored recommendations for sunsets, beaches, fairs, and your interests."
    }
  ];

  const benefits = [
    "Save hours of research time",
    "Never miss must-see attractions",
    "Keep everyone in the loop",
    "Stay within budget",
    "Discover hidden gems",
    "Optimize travel routes"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Plan Amazing Trips
              <span className="block text-secondary-400">Together</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 leading-relaxed">
              Collaborative trip planning with smart recommendations, budget tracking, 
              and real-time group chat. Turn your travel dreams into reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary bg-white text-primary-700 hover:bg-gray-100 text-lg px-8 py-4 flex items-center justify-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary bg-secondary-500 hover:bg-secondary-600 text-lg px-8 py-4 flex items-center justify-center"
                  >
                    Start Planning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-outline border-white text-white hover:bg-white hover:text-primary-700 text-lg px-8 py-4"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Perfect Trips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From initial planning to expense tracking, our platform handles every aspect 
              of group travel planning with intelligent automation and collaboration tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="card-content">
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold text-gray-900 ml-3">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose TripPlanner?
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of travelers who have transformed their trip planning experience
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Smart & Efficient
                </h3>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-secondary-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  How It Works
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Set Your Preferences</h4>
                      <p className="text-gray-600 text-sm">Tell us about your travel style and interests</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Invite Your Group</h4>
                      <p className="text-gray-600 text-sm">Add friends and start collaborative planning</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Get Smart Recommendations</h4>
                      <p className="text-gray-600 text-sm">Receive personalized suggestions and plan together</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Track & Enjoy</h4>
                      <p className="text-gray-600 text-sm">Monitor expenses and enjoy your perfect trip</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who are already using TripPlanner to create 
            unforgettable experiences together.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="btn-primary bg-secondary-500 hover:bg-secondary-600 text-lg px-8 py-4 inline-flex items-center"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Landing;
