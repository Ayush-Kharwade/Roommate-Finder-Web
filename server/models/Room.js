import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String 
  },
  address: { 
    type: String, 
    required: true 
  },
  
  // --- NEW STARTUP FEATURES ---
  
  // 1. Cloudinary Image URLs
  images: {
    type: [String], // An array of strings (URLs)
    default: []
  },
  
  // 2. WhatsApp Integration
  phoneNumber: {
    type: String, // String is safer than Number so it can hold the "+91" country code
    required: true
  },
  
  // 3. Search Filters (Cybersecurity note: 'enum' blocks hackers from sending invalid data)
  genderPreference: {
    type: String,
    enum: ['Male', 'Female', 'Any'], // Only allows exactly these three words
    default: 'Any'
  },
  
  // ----------------------------
  
  // The optimized GeoJSON object for fast map searches
  location: {
    type: {
      type: String,
      enum: ['Point'], 
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// The magic index for your radius searches
roomSchema.index({ location: "2dsphere" });

const Room = mongoose.model('Room', roomSchema);
export default Room;