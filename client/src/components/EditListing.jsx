// src/components/EditListing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { primaryName, secondaryName, formatAddress } from '../utils/formatAddress';

function EditListing() {
  const { id } = useParams(); // Get the property ID from the URL
  const navigate = useNavigate();
  const [property, setProperty] = useState({
    title: '',
    address: '',
    rent: 0,
    vacancies: 1,
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');

  // Fetch the property data when the component loads
  useEffect(() => {
    const fetchProperty = async () => {
      const docRef = doc(db, 'properties', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProperty(docSnap.data());
      } else {
        alert("No such document!");
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
      if (formData.address === selectedAddress) {
          setSuggestions([]);
          return;
      }
      if (skipNextFetch.current) {
          skipNextFetch.current = false;
          return;
      }
      if (!property.address || property.address.length < 3) {
          setSuggestions([]);
          return;
      }
      const handler = setTimeout(async () => {
          const KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(property.address)}&key=${KEY}&countrycode=in&limit=5`;
          try {
              const res = await axios.get(url);
              const results = res.data.results || [];
              const seen = new Set();
              const unique = results.filter(r => {
                  const label = formatAddress(r);
                  if (seen.has(label)) return false;
                  seen.add(label);
                  return true;
              });
              setSuggestions(unique);
          } catch (err) {
              console.error('Autocomplete error:', err);
          }
      }, 500);
      return () => clearTimeout(handler);
  }, [property.address]);

  const handleSuggestionClick = (suggestion) => {
      const label = formatAddress(suggestion);
      setSelectedAddress(label);          // marks this text as "already resolved"
      setFormData(prev => ({
          ...prev,
          address: label,
          lat: suggestion.geometry.lat,
          lng: suggestion.geometry.lng,
      }));
      setSuggestions([]);
  };

  const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === 'address') {
          setProperty(prev => ({ ...prev, address: value, lat: null, lng: null }));
          return;
      }
      setProperty(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!property.lat || !property.lng) {
        toast.error('Please pick an address from the suggestions.');
        return;
    }
    
    setIsSaving(true);
    try {
      await updateDoc(docRef, {
        ...property,
        vacancies: Number(property.vacancies)
      });
      toast.success("Property updated successfully!");
      navigate('/');
    } catch (error) {
      console.error("Error updating document: ", error);
      toast.error("Failed to update property.");
    } finally {
        setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Property</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input type="text" name="title" value={property.title} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="relative">
            <input type="text" name="address" value={property.address} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg" required autoComplete="off"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();      // don't submit the form from this field
                        setSuggestions([]);
                    }
                }}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)} />
            {suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-brand-sand rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {suggestions.map((s, i) => (
                        <li key={i} onClick={() => handleSuggestionClick(s)}
                            className="px-4 py-2 cursor-pointer hover:bg-brand-cream text-brand-ink">
                            <li key={i} onClick={() => handleSuggestionClick(s)}
                                className="px-4 py-2 cursor-pointer hover:bg-brand-cream">
                                <p className="text-brand-ink font-medium truncate">{primaryName(s) || s.formatted}</p>
                                {secondaryName(s) && <p className="text-xs text-gray-500 truncate">{secondaryName(s)}</p>}
                            </li>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Monthly Rent (₹)</label>
          <input type="number" name="rent" value={property.rent} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Vacancies</label>
          <input type="number" name="vacancies" value={property.vacancies} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" min="1" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Image URL</label>
          <input type="url" name="imageUrl" value={property.imageUrl} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." required />
        </div>
        <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300"
        >
            {isSaving ? 'Saving...' : 'Update Listing'}
        </button>
      </form>
    </div>
  );
}

export default EditListing;