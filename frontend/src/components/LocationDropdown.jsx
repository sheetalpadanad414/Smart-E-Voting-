import React, { useState, useEffect } from 'react';
import { locationAPI } from '../services/api';
import toast from 'react-hot-toast';

const LocationDropdown = ({ 
  countryId, 
  stateId, 
  onCountryChange, 
  onStateChange,
  required = false,
  disabled = false 
}) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (countryId) {
      fetchStates(countryId);
    } else {
      setStates([]);
      if (onStateChange) onStateChange(null);
    }
  }, [countryId]);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await locationAPI.getAllCountries();
      setCountries(response.data.countries);
    } catch (error) {
      toast.error('Failed to load countries');
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      setLoadingStates(true);
      const response = await locationAPI.getStatesByCountry(countryId);
      setStates(response.data.states);
    } catch (error) {
      toast.error('Failed to load states');
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const handleCountryChange = (e) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    if (onCountryChange) onCountryChange(value);
  };

  const handleStateChange = (e) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    if (onStateChange) onStateChange(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Country Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={countryId || ''}
          onChange={handleCountryChange}
          disabled={disabled || loadingCountries}
          required={required}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* State Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State/Province {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={stateId || ''}
          onChange={handleStateChange}
          disabled={disabled || !countryId || loadingStates}
          required={required && countryId}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {!countryId ? 'Select country first' : loadingStates ? 'Loading...' : 'Select State'}
          </option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationDropdown;
