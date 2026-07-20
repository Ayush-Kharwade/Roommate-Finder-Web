import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // 1. Import db
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // 2. Import firestore functions
import toast from 'react-hot-toast';

function Signup() {
  const [name, setName] = useState(''); // 3. Add state for name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
  e.preventDefault();
  setError('');
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set the user's display name
    await updateProfile(user, { displayName: name });

    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: user.email,
    });

    toast.success('Successfully signed up!');
    navigate('/');
    } catch (err) {
    setError(err.message);
    toast.error("Failed to sign up.");
    }
  };

  return (
    <div className="container mx-auto p-8 flex justify-center">
      <form onSubmit={handleSignup} className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {/* 5. Add Name input field */}
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;