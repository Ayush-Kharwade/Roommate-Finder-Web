import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Enhanced Feature Card with hover effects
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center group">
    <div className="mx-auto bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mt-6 text-gray-900">{title}</h3>
    <p className="text-gray-600 mt-3 leading-relaxed">{description}</p>
  </div>
);

// Enhanced Testimonial Card with avatar
const TestimonialCard = ({ quote, name, city, avatar }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <p className="text-gray-700 italic leading-relaxed">"{quote}"</p>
    <div className="flex items-center mt-6">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
        {avatar}
      </div>
      <div className="ml-4 text-left">
        <p className="font-bold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{city}</p>
      </div>
    </div>
  </div>
);

// City Card Component
const CityCard = ({ name, image, propertyCount, onClick }) => (
  <button 
    onClick={onClick}
    className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-64 group w-full"
  >
    <div 
      className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <h3 className="text-white text-2xl font-bold mb-1">{name}</h3>
      <p className="text-blue-200 text-sm">{propertyCount}+ Properties</p>
    </div>
  </button>
);

// Stats Counter Component
const StatCard = ({ number, label, suffix = "" }) => (
  <div className="text-center transform hover:scale-105 transition-transform duration-300">
    <p className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      {number}{suffix}
    </p>
    <p className="text-gray-600 mt-2 font-medium">{label}</p>
  </div>
);

function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const navigate = useNavigate();

    // Comprehensive list of suggestions including cities and localities
    const allSuggestions = [
        // Major Cities
        'Mumbai', 'Bangalore', 'Pune', 'Delhi', 'Hyderabad', 'Chennai', 
        'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
        'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
        'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Kochi',
        
        // Mumbai localities
        'Andheri, Mumbai', 'Bandra, Mumbai', 'Powai, Mumbai', 'Goregaon, Mumbai',
        'Malad, Mumbai', 'Borivali, Mumbai', 'Thane West, Mumbai', 'Kandivali, Mumbai',
        
        // Bangalore localities
        'Koramangala, Bangalore', 'Whitefield, Bangalore', 'HSR Layout, Bangalore',
        'Indiranagar, Bangalore', 'Electronic City, Bangalore', 'Marathahalli, Bangalore',
        'Jayanagar, Bangalore', 'BTM Layout, Bangalore',
        
        // Pune localities
        'Hinjewadi, Pune', 'Kharadi, Pune', 'Wakad, Pune', 'Baner, Pune',
        'Aundh, Pune', 'Viman Nagar, Pune', 'Hadapsar, Pune', 'Magarpatta, Pune',
        
        // Delhi localities
        'Dwarka, Delhi', 'Rohini, Delhi', 'Laxmi Nagar, Delhi', 'Janakpuri, Delhi',
        'Saket, Delhi', 'Hauz Khas, Delhi', 'Vasant Kunj, Delhi', 'Pitampura, Delhi'
    ];

    const popularCities = [
        { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=500&fit=crop', count: '2,500' },
        { name: 'Bangalore', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&fit=crop', count: '1,800' },
        { name: 'Pune', image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=500&fit=crop', count: '1,200' },
        { name: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&fit=crop', count: '2,000' },
        { name: 'Hyderabad', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=500&fit=crop', count: '900' },
        { name: 'Chennai', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&fit=crop', count: '850' }
    ];

    const quickSearchCities = ['Mumbai', 'Bangalore', 'Pune', 'Delhi', 'Hyderabad'];

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim().length > 0) {
            const filtered = allSuggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 6); // Limit to 6 suggestions
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setShowSuggestions(false);
        navigate(`/listings?search=${suggestion}`);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (searchTerm.trim()) {
            navigate(`/listings?search=${searchTerm.trim()}`);
        } else {
            navigate('/listings');
        }
    };

    return (
        <main className="flex-grow bg-gray-50">
            {/* --- Enhanced Hero Section --- */}
            <div className="relative w-full bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 py-32 px-4 overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse"></div>
                </div>
                
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-white">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                                Find compatible
                                <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                                    flatmates
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                                Share your room with the right flatmates. Discover rooms & PGs across India.
                            </p>
                            
                            {/* Enhanced Search Bar with Autosuggestions */}
                            <form onSubmit={handleSearchSubmit} className="bg-white p-2 rounded-2xl shadow-2xl relative">
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Search by city, locality, or landmark..."
                                            className="w-full px-6 py-4 border-none rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            onFocus={() => searchTerm && setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        />
                                        
                                        {/* Autosuggestion Dropdown */}
                                        {showSuggestions && filteredSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden z-50 max-h-80 overflow-y-auto">
                                                {filteredSuggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className="w-full px-6 py-3 text-left hover:bg-white/30 transition-colors flex items-center gap-3 border-b border-white/10 last:border-b-0"
                                                    >
                                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="text-gray-800 font-bold">{suggestion}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        type="submit"
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>

                            {/* Quick Search Tags */}
                            <div className="mt-6 flex flex-wrap gap-3 items-center">
                                <span className="text-blue-200 text-sm font-medium">Popular:</span>
                                {quickSearchCities.map((city) => (
                                    <button 
                                        key={city}
                                        onClick={() => {
                                            setSearchTerm(city);
                                            navigate(`/listings?search=${city}`);
                                        }}
                                        className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white hover:bg-white/30 transition-all duration-300 border border-white/30"
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hero Illustration */}
                        <div className="hidden md:flex justify-center items-center">
                            <div className="relative w-96 h-96">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                                <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center shadow-2xl">
                                    <svg className="w-48 h-48 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-400 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                                    <span className="text-4xl">🏠</span>
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-pink-400 rounded-full flex items-center justify-center shadow-xl animate-bounce" style={{ animationDelay: '0.5s' }}>
                                    <span className="text-4xl">😊</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Enhanced Why Choose Us Section --- */}
            <div className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                            Why Choose RoommateFinder?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We've built the most trusted platform for finding roommates, with features designed to make your search safe, easy, and successful.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard 
                            icon={
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            } 
                            title="Verified Profiles" 
                            description="All users go through our comprehensive verification process to ensure safety and authenticity." 
                        />
                        <FeatureCard 
                            icon={
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            } 
                            title="Smart Matching" 
                            description="Our AI-powered algorithm matches you with compatible roommates based on lifestyle and preferences." 
                        />
                        <FeatureCard 
                            icon={
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            } 
                            title="Easy Agreements" 
                            description="Get rental agreements made easy, quick and affordable with our streamlined process." 
                        />
                        <FeatureCard 
                            icon={
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            } 
                            title="Community Focused" 
                            description="Join a community of like-minded individuals looking for meaningful roommate connections." 
                        />
                    </div>
                </div>
            </div>

            

            {/* --- Enhanced Social Proof Section --- */}
            <div className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-gray-900">
                        Trusted by Thousands
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <StatCard number="50,000" suffix="+" label="Happy Roommates" />
                        <StatCard number="95" suffix="%" label="Success Rate" />
                        <StatCard number="500" suffix="+" label="Cities" />
                        <StatCard number="4.8" suffix="/5" label="User Rating" />
                    </div>
                </div>
            </div>

            {/* --- Popular Cities Section --- */}
            <div className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                            View rooms in Popular Cities
                        </h2>
                        <p className="text-xl text-gray-600">
                            Explore thousands of verified properties in major cities
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {popularCities.map((city) => (
                            <CityCard 
                                key={city.name}
                                name={city.name}
                                image={city.image}
                                propertyCount={city.count}
                                onClick={() => navigate(`/listings?search=${city.name}`)}
                            />
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link 
                            to="/listings"
                            className="inline-flex items-center bg-green-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            View All Cities
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* --- Enhanced Testimonials Section --- */}
            <div className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                            What Our Users Say
                        </h2>
                        <p className="text-xl text-gray-600">
                            Real stories from real people who found their perfect match
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <TestimonialCard 
                            quote="I was moving to Mumbai for my first job and was so stressed. RoommateFinder made it incredibly simple. I found a verified room and a great flatmate in just a few days!" 
                            name="Anjali Gupta" 
                            city="Mumbai"
                            avatar="AG"
                        />
                        <TestimonialCard 
                            quote="As a student, safety was my biggest concern. The verified profiles on this site gave me peace of mind. Found a wonderful and respectful roommate in Pune." 
                            name="Rohan Sharma" 
                            city="Pune"
                            avatar="RS"
                        />
                        <TestimonialCard 
                            quote="Finally, a platform without brokers! I connected directly with a potential roommate in Bangalore who shares my interests. It feels less like a transaction and more like joining a community." 
                            name="Priya Singh" 
                            city="Bangalore"
                            avatar="PS"
                        />
                    </div>
                </div>
            </div>

            
            {/* --- Enhanced Call to Action Section --- */}
            <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-300 rounded-full blur-3xl"></div>
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Find Your Perfect Roommate?
                    </h2>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
                        Join thousands of happy users who found their ideal living situation. Start your journey today and discover your perfect match.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link 
                            to="/signup" 
                            className="bg-white text-blue-600 font-bold px-10 py-5 rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-xl transform hover:scale-105 text-lg"
                        >
                            Get Started Now
                        </Link>
                        <Link 
                            to="/listings" 
                            className="bg-transparent border-2 border-white text-white font-bold px-10 py-5 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 text-lg"
                        >
                            Browse Listings
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Home;