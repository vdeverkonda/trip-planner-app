import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import axios from 'axios';

const LocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Enter location", 
  error = "",
  label = "Location"
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value?.name || '');
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setInputValue(value?.name || '');
  }, [value]);

  const searchLocations = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    console.log('Searching for locations:', query); // Debug log
    setLoading(true);
    try {
      const response = await axios.get('/api/places/autocomplete', {
        params: { query }
      });

      console.log('API response:', response.data); // Debug log

      if (response.data.predictions) {
        console.log('Setting suggestions:', response.data.predictions.length); // Debug log
        setSuggestions(response.data.predictions);
      } else {
        console.log('No predictions in response'); // Debug log
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      console.log('Error details:', error.response?.data); // Debug log
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceDetails = async (placeId) => {
    try {
      const response = await axios.get(`/api/places/details/${placeId}`);
      return response.data.result;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  const handleSuggestionClick = async (suggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    setLoading(true);

    try {
      // Get detailed place information
      const placeDetails = await getPlaceDetails(suggestion.place_id);
      
      if (placeDetails) {
        // Extract city and state from address components
        const addressComponents = placeDetails.address_components || [];
        const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || '';
        const state = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.short_name || '';
        const country = addressComponents.find(comp => comp.types.includes('country'))?.long_name || '';

        onChange({
          name: suggestion.description,
          address: placeDetails.formatted_address,
          coordinates: {
            lat: placeDetails.geometry.location.lat,
            lng: placeDetails.geometry.location.lng
          },
          city,
          state,
          country,
          placeId: suggestion.place_id
        });
      } else {
        // Fallback if place details fail
        onChange({
          name: suggestion.description,
          address: suggestion.description,
          coordinates: { lat: 0, lng: 0 },
          placeId: suggestion.place_id
        });
      }
    } catch (error) {
      console.error('Error handling suggestion click:', error);
      // Fallback to basic data
      onChange({
        name: suggestion.description,
        address: suggestion.description,
        coordinates: { lat: 0, lng: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const clearInput = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    onChange({
      name: '',
      address: '',
      coordinates: { lat: 0, lng: 0 }
    });
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <MapPin className="h-4 w-4 inline mr-1" />
        {label}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={`input pr-20 ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
          autoComplete="off"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading && (
            <div className="spinner mr-2"></div>
          )}
          {inputValue && (
            <button
              type="button"
              onClick={clearInput}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Search className="h-4 w-4 text-gray-400 ml-2" />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id || index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    {suggestion.structured_formatting?.secondary_text || suggestion.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !loading && inputValue.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center">
          <p className="text-gray-500 text-sm">No locations found</p>
          <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
