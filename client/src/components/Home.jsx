import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Enhanced Feature Card with hover effects
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl border border-brand-sand hover:border-brand-marigold transition-colors text-center">
    <div className="mx-auto bg-brand-green/10 text-brand-green w-16 h-16 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-lg font-bold mt-6 text-brand-ink">{title}</h3>
    <p className="text-brand-ink/70 mt-3 leading-relaxed text-sm">{description}</p>
  </div>
);

const CityCard = ({ name, image, onClick }) => (
  <button
    onClick={onClick}
    className="relative rounded-xl overflow-hidden h-64 group w-full text-left"
  >
    <div
      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <h3 className="font-serif text-white text-2xl font-bold">{name}</h3>
      <p className="text-brand-marigold text-sm font-medium mt-1">Explore rooms →</p>
    </div>
  </button>
);

// Stats Counter Component
const StatCard = ({ number, label }) => (
  <div className="text-center">
    <p className="font-serif text-5xl md:text-6xl font-bold text-brand-green">
      {number}
    </p>
    <p className="text-brand-ink/70 mt-2 font-medium">{label}</p>
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
        { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=500&fit=crop' },
        { name: 'Bangalore', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&fit=crop' },
        { name: 'Pune', image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=500&fit=crop' },
        { name: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&fit=crop' },
        { name: 'Hyderabad', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=500&fit=crop' },
        { name: 'Chennai', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&fit=crop' }
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
            {/* --- Hero --- */}
            <div className="relative w-full min-h-[600px] flex items-center px-4 py-20 overflow-hidden">
                {/* Photo background with warm overlay */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(27,77,62,0.92) 0%, rgba(27,77,62,0.75) 45%, rgba(27,77,62,0.35) 100%)' }}></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="max-w-2xl">
                        <p className="text-brand-marigold font-semibold tracking-wide uppercase text-sm mb-4">
                            No brokers · Connect directly
                        </p>
                        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 text-white">
                            A room that feels like{' '}
                            <span className="text-brand-marigold">home</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                            Find rooms, PGs, and flatmates you'll actually get along with — across India, with no middlemen.
                        </p>

                        {/* Search — the welcome mat */}
                        <form onSubmit={handleSearchSubmit} className="bg-white p-2 rounded-2xl shadow-2xl relative">
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Search by city, locality, or landmark…"
                                        className="w-full px-5 py-4 border-none rounded-xl text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-green text-base"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onFocus={() => searchTerm && setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    />
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
                                            {filteredSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="w-full px-5 py-3 text-left hover:bg-brand-cream transition-colors flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                                                >
                                                    <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-brand-ink font-medium">{suggestion}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="bg-brand-marigold text-brand-ink font-bold px-8 py-4 rounded-xl hover:bg-brand-marigold-dark transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Quick cities */}
                        <div className="mt-6 flex flex-wrap gap-2 items-center">
                            <span className="text-white/70 text-sm font-medium">Popular:</span>
                            {quickSearchCities.map((city) => (
                                <button
                                    key={city}
                                    onClick={() => { setSearchTerm(city); navigate(`/listings?search=${city}`); }}
                                    className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm text-white hover:bg-white/25 transition-colors border border-white/20"
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Enhanced Why Choose Us Section --- */}
            <div className="py-24 bg-brand-cream">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <p className="text-brand-marigold font-semibold tracking-wide uppercase text-sm mb-3">Why us</p>
                        <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-brand-ink">
                            Finding a home shouldn't feel like a gamble
                        </h2>
                        <p className="text-lg text-brand-ink/70 max-w-2xl mx-auto">
                            We're building the simplest, most direct way to find rooms and flatmates across India.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard 
                            icon={
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            } 
                            title="Direct Contact"
                            description="Reach owners and flatmates directly. No brokers, no middlemen, no hidden fees."
                        />
                        <FeatureCard 
                            icon={
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            } 
                            title="Compatibility First" 
                            description="Filter by lifestyle, budget, and preferences to find people you'll actually get along with." 
                        />
                        <FeatureCard 
                            icon={
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            } 
                            title="Free to Use" 
                            description="No listing fees, no subscription, no commission. Free while we build this together." 
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
            <div className="py-24 bg-brand-sand">
                <div className="container mx-auto px-4">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-center text-brand-ink">
                        Get in early
                    </h2>
                    <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
                        We're just getting started — join now and help shape the community from the ground up.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
                        <StatCard number="Founding" label="Member status for early users" />
                        <StatCard number="0%" label="Broker fees — connect directly" />
                        <StatCard number="100%" label="Free while we grow" />
                    </div>
                </div>
            </div>

            {/* --- Popular Cities Section --- */}
            <div className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                       <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-brand-ink">
                            View rooms in Popular Cities
                        </h2>
                        <p className="text-xl text-gray-600">
                            Explore rooms and PGs across major cities
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
                            className="inline-flex items-center bg-brand-green text-white font-bold px-8 py-4 rounded-xl hover:bg-brand-green-dark transition-colors"
                        >
                            View All Cities
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* --- Final CTA --- */}
            <div className="py-24 bg-brand-green text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                        Your next home is a search away
                    </h2>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Be one of the first to find your room or flatmate — and help shape what this becomes.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/signup" className="bg-brand-marigold text-brand-ink font-bold px-10 py-4 rounded-xl hover:bg-brand-marigold-dark transition-colors text-lg">
                            Get started
                        </Link>
                        <Link to="/listings" className="bg-transparent border-2 border-white/40 text-white font-bold px-10 py-4 rounded-xl hover:bg-white/10 transition-colors text-lg">
                            Browse rooms
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Home;