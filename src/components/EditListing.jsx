// src/components/EditListing.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function EditListing() {
  const { id } = useParams(); // Get the property ID from the URL
  const navigate = useNavigate();
  const [property, setProperty] = useState({
    title: '',
    address: '',
    rent: '',
    vacancies: 1,
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);

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

  const handleChange = (e) => {
    setProperty({ ...property, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docRef = doc(db, 'properties', id);
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
        <div className="mb-4">
          <label className="block text-gray-700">Address</label>
          <input type="text" name="address" value={property.address} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Monthly Rent (₹)</label>
          <input type="text" name="rent" value={property.rent} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Vacancies</label>
          <input type="number" name="vacancies" value={property.vacancies} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" min="1" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Image URL</label>
          <input type="url" name="imageUrl" value={property.imageUrl} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." required />
        </div>
        <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditListing;