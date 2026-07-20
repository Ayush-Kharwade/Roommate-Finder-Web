import Room from '../models/Room.js';

// @desc    Create a new room listing and geocode the address
// @route   POST /api/rooms
export const createRoom = async (req, res) => {
  try {
    // 1. Extract the data sent from your React frontend
    const { title, price, description, address } = req.body;

    // Basic validation
    if (!title || !price || !address) {
      return res.status(400).json({ error: 'Please provide title, price, and address' });
    }

    // 2. The Geocoding Process (Calling LocationIQ)
    const apiKey = process.env.LOCATIONIQ_API_KEY;
    // We use encodeURIComponent so spaces in the address become %20 for the URL
    const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(address)}&format=json`;

    // Fetch the data from the API (Using Node's native fetch)
    const geocodeResponse = await fetch(url);
    const geocodeData = await geocodeResponse.json();

    // 3. Handle Invalid Addresses
    // If LocationIQ can't find the address, it usually returns an error object or empty array
    if (geocodeData.error || geocodeData.length === 0) {
      return res.status(400).json({ 
        error: 'Could not find coordinates for this address. Please be more specific.' 
      });
    }

    // 4. Extract and Format Coordinates
    // LocationIQ returns strings, so we convert them to decimals
    const lat = parseFloat(geocodeData[0].lat);
    const lon = parseFloat(geocodeData[0].lon);

    // 5. Save to MongoDB Database
    const newRoom = new Room({
      title,
      price,
      description,
      address, // Save the typed address
      location: {
        type: 'Point',
        // CRITICAL: MongoDB requires Longitude first, then Latitude!
        coordinates: [lon, lat] 
      }
    });

    const savedRoom = await newRoom.save();

    // 6. Send success response back to the frontend
    res.status(201).json({
      success: true,
      message: 'Room listed successfully!',
      data: savedRoom
    });

  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Server error while creating the listing' });
  }
};