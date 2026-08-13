import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; 
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import SEO from './SEO.jsx';
import { Link } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side guards before hitting Firebase. Firebase itself only
    // enforces 6 characters, which is too weak for an account that carries a
    // phone number and a message history.
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must include at least one letter and one number.');
      return;
    }

    setIsLoading(true);
    let createdUser = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      createdUser = userCredential.user;

      await updateProfile(createdUser, { displayName: trimmedName });

      await setDoc(doc(db, 'users', createdUser.uid), {
        name: trimmedName,
        email: createdUser.email,
        createdAt: serverTimestamp(),
      });

      toast.success('Successfully signed up!');
      navigate('/');
    } catch (err) {
      // If the Auth account was created but a later step failed,
      // delete it so no orphaned user is left behind.
      if (createdUser) {
        try {
          await createdUser.delete();
        } catch (cleanupErr) {
          console.error('Failed to roll back orphaned auth user:', cleanupErr);
        }
      }
      setError(mapAuthError(err.code));
      toast.error('Failed to sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  const mapAuthError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try logging in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  return (
    <div className="container mx-auto p-8 flex justify-center">
      <SEO title="Sign Up" />
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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border rounded-lg"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-green text-white py-2 rounded-lg hover:bg-brand-green-dark disabled:bg-brand-green/40"
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="text-xs text-gray-500 mt-3 text-center">
          At least 8 characters, including a letter and a number.
        </p>
        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-green font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;