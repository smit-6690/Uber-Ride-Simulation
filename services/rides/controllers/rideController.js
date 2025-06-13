const axios = require('axios');
const Ride = require('../models/ride');
const { client } = require('../redisClient'); // ✅ Redis client
const { sendRideCompletedEvent } = require('../kafkaProducer');

// Haversine distance (km)
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Create a new ride
exports.createRide = async (req, res) => {
    try {
        const {
            pickupLocation,
            dropoffLocation,
            dateTime,
            customerId,
            passenger_count
        } = req.body;

        const date = new Date(dateTime);
        const hour = date.getHours();
        const day_of_week = date.getDay();
        const is_weekend = (day_of_week === 0 || day_of_week === 6) ? 1 : 0;
        const is_night = (hour >= 21 || hour < 6) ? 1 : 0;

        // Updated driver service URL
        const driverResponse = await axios.get('http://drivers-service:4002/api/drivers');
        const drivers = driverResponse.data || [];

        let nearestDriver = null;
        let minDistance = Infinity;

        for (const driver of drivers) {
            const activeRides = await Ride.find({
                driverId: driver.driverId,
                status: { $in: ['accepted', 'in-progress'] }
            });

            if (activeRides.length > 0) continue;

            const loc = driver.currentLocation;
            if (loc?.latitude && loc?.longitude) {
                const dist = haversineDistance(
                    pickupLocation.latitude,
                    pickupLocation.longitude,
                    loc.latitude,
                    loc.longitude
                );
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestDriver = driver;
                }
            }
        }

        if (!nearestDriver) {
            return res.status(400).json({ message: 'No available drivers nearby' });
        }

        const driverId = nearestDriver.driverId;

        const estimatedDistance = haversineDistance(
            pickupLocation.latitude,
            pickupLocation.longitude,
            dropoffLocation.latitude,
            dropoffLocation.longitude
        );

        let estimatedPrice = 0;

        try {
            const mlResponse = await axios.post("http://ml-service:8000/predict", {
                distance_km: estimatedDistance,
                passenger_count,
                hour,
                day_of_week,
                is_weekend,
                is_night
            });
            estimatedPrice = mlResponse.data.estimated_price;
        } catch (err) {
            console.error("ML model call failed:", err.message);
            estimatedPrice = 10.0;
        }

        const rideId = `RIDE-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;

        const ride = new Ride({
            rideId,
            pickupLocation,
            dropoffLocation,
            dateTime,
            customerId,
            driverId,
            passenger_count,
            estimatedDistance,
            estimatedPrice,
            status: 'accepted'
        });

        await ride.save();
        await client.del(`ridesByDriver:${driverId}`);

        res.status(201).json({ message: "Ride created", ride });
    } catch (error) {
        console.error("[CREATE RIDE ERROR]", error);
        res.status(400).json({ message: error.message });
    }
};

exports.findNearbyDrivers = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const customerLat = parseFloat(latitude);
        const customerLng = parseFloat(longitude);

        const response = await axios.get('http://drivers-service:4002/api/drivers');
        const drivers = response.data || [];

        const nearbyDrivers = drivers.filter(driver => {
            if (!driver.currentLocation?.latitude || !driver.currentLocation?.longitude) return false;

            const distance = calculateDistance(
                customerLat,
                customerLng,
                driver.currentLocation.latitude,
                driver.currentLocation.longitude
            );
            return distance <= 10;
        });

        const driversWithDistance = nearbyDrivers.map(driver => {
            const distance = calculateDistance(
                customerLat,
                customerLng,
                driver.currentLocation.latitude,
                driver.currentLocation.longitude
            );
            return {
                ...driver,
                distance: parseFloat(distance.toFixed(2))
            };
        });

        driversWithDistance.sort((a, b) => a.distance - b.distance);

        res.json({
            message: 'Nearby drivers found',
            count: driversWithDistance.length,
            drivers: driversWithDistance
        });

    } catch (error) {
        console.error('Error finding nearby drivers:', error.message);
        res.status(500).json({ message: 'Failed to fetch nearby drivers', error: error.message });
    }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lat2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Get all rides
exports.getAllRides = async (req, res) => {
    try {
        const rides = await Ride.find();
        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get ride by ID
exports.getRideById = async (req, res) => {
    try {
        const ride = await Ride.findOne({ rideId: req.params.id });
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        res.json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRide = async (req, res) => {
    try {
        console.log('📥 Received update request:', req.body);
        const ride = await Ride.findOne({ rideId: req.params.id });
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        const oldFare = ride.estimatedPrice || 0;
        let message = null;

        if (req.body.dateTime) {
            const oldDate = new Date(ride.dateTime);
            const newDate = new Date(req.body.dateTime);
            ride.dateTime = req.body.dateTime;
            message = `Ride time updated from ${oldDate.toLocaleString()} to ${newDate.toLocaleString()}`;
        }

        if (req.body.dropoffLocation) {
            const oldAddress = ride.dropoffLocation?.address;
            ride.dropoffLocation = {
                ...ride.dropoffLocation,
                ...req.body.dropoffLocation
            };
            ride.markModified('dropoffLocation');

            const estimatedDistance = haversineDistance(
                ride.pickupLocation.latitude,
                ride.pickupLocation.longitude,
                ride.dropoffLocation.latitude,
                ride.dropoffLocation.longitude
            );
            ride.estimatedDistance = estimatedDistance;

            const date = new Date(ride.dateTime);
            const hour = date.getHours();
            const day_of_week = date.getDay();
            const is_weekend = (day_of_week === 0 || day_of_week === 6) ? 1 : 0;
            const is_night = (hour >= 21 || hour < 6) ? 1 : 0;

            const features = {
                distance_km: estimatedDistance,
                passenger_count: ride.passenger_count || 1,
                hour,
                day_of_week,
                is_weekend,
                is_night
            };

            try {
                const response = await axios.post("http://ml-service:8000/predict", features);
                ride.estimatedPrice = response.data.estimated_price;
            } catch (err) {
                console.error("❌ ML model error:", err.message);
                ride.estimatedPrice = 10.0;
            }

            const newFare = ride.estimatedPrice || 0;
            const fareDifference = parseFloat((newFare - oldFare).toFixed(2));

            const addressMessage = `Dropoff location updated from "${oldAddress}" to "${req.body.dropoffLocation.address}"`;
            if (fareDifference > 0) {
                message = `${addressMessage}. Updated fare: $${newFare.toFixed(2)} (was $${oldFare.toFixed(2)}). You'll be charged $${fareDifference.toFixed(2)} more.`;
            } else if (fareDifference < 0) {
                message = `${addressMessage}. Updated fare: $${newFare.toFixed(2)} (was $${oldFare.toFixed(2)}). You'll be refunded $${Math.abs(fareDifference).toFixed(2)}.`;
            } else {
                message = `${addressMessage}. Fare remains unchanged at $${newFare.toFixed(2)}.`;
            }
        }

        await ride.save();
        await client.del(`ridesByDriver:${ride.driverId}`);

        res.json({ ride, message });
    } catch (error) {
        console.error('[UPDATE RIDE ERROR]', error);
        res.status(400).json({ message: error.message });
    }
};

exports.deleteRide = async (req, res) => {
    try {
        const ride = await Ride.findOneAndDelete({ rideId: req.params.id });
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        await client.del(`ridesByDriver:${ride.driverId}`);
        res.json({ message: 'Ride deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRideStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const ride = await Ride.findOneAndUpdate(
            { rideId: req.params.id },
            { status },
            { new: true, runValidators: true }
        );

        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        await client.del(`ridesByDriver:${ride.driverId}`);

        if (status === 'completed') {
            try {
                await sendRideCompletedEvent({
                    rideId: ride.rideId,
                    dateTime: ride.dateTime,
                    actualDistance: ride.actualDistance || ride.estimatedDistance,
                    actualPrice: ride.actualPrice || ride.estimatedPrice,
                    pickupLocation: ride.pickupLocation,
                    dropoffLocation: ride.dropoffLocation,
                    driverId: ride.driverId,
                    customerId: ride.customerId,
                    estimatedPrice: ride.estimatedPrice
                });
            } catch (err) {
                console.error("❌ Failed to send Kafka event:", err.message);
            }
        }

        res.json(ride);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.uploadRideImages = async (req, res) => {
    try {
        const { id } = req.params;
        const { images } = req.body;

        if (!images || !Array.isArray(images)) {
            return res.status(400).json({ message: 'Images array is required' });
        }

        const ride = await Ride.findOne({ rideId: id });
        if (!ride) return res.status(404).json({ message: 'Ride not found', rideId: id });

        ride.media = ride.media || [];
        const newImages = images.map(image => ({
            type: 'image',
            url: image.url,
            uploadDate: new Date()
        }));

        ride.media.push(...newImages);
        await ride.save();

        res.json({
            message: 'Images uploaded successfully',
            rideId: ride.rideId,
            media: ride.media
        });
    } catch (error) {
        res.status(400).json({ message: 'Error uploading images', error: error.message });
    }
};

exports.getRidesByCustomerId = async (req, res) => {
    try {
        const rides = await Ride.find({ customerId: req.params.customerId });
        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRidesByDriverId = async (req, res) => {
    try {
        const driverId = req.params.driverId;
        const cacheKey = `ridesByDriver:${driverId}`;

        const cached = await client.get(cacheKey);
        if (cached) {
            console.log('✅ Redis: Returning cached rides for driver');
            return res.json(JSON.parse(cached));
        }

        const rides = await Ride.find({ driverId });
        await client.setEx(cacheKey, 60, JSON.stringify(rides));
        console.log('⏱️ Redis: Cached rides for driver for 60s');

        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRideStatistics = async (req, res) => {
    try {
        const { city, state } = req.query;
        const query = {};
        if (city) query['pickupLocation.address'] = new RegExp(city, 'i');
        if (state) query['pickupLocation.address'] = new RegExp(state, 'i');

        const rides = await Ride.find(query);

        const revenuePerDay = {};
        const ridesPerArea = {};
        const ridesPerDriver = {};
        const ridesPerCustomer = {};

        rides.forEach(ride => {
            const date = new Date(ride.dateTime).toISOString().split('T')[0];
            revenuePerDay[date] = (revenuePerDay[date] || 0) + (ride.actualPrice || 0);

            let area = ride.pickupLocation?.address || 'Unknown';
            if (area.startsWith("Lat:") || area.startsWith("lng:")) {
                area = "Unknown";
            }
            if (area.includes(',')) {
                area = area.split(',')[0].trim();
            }
            ridesPerArea[area] = (ridesPerArea[area] || 0) + 1;

            const driverId = ride.driverId || 'Unknown';
            ridesPerDriver[driverId] = (ridesPerDriver[driverId] || 0) + 1;

            const customerId = ride.customerId || 'Unknown';
            ridesPerCustomer[customerId] = (ridesPerCustomer[customerId] || 0) + 1;
        });

        const statistics = {
            totalRides: rides.length,
            totalDistance: rides.reduce((sum, ride) => sum + (ride.actualDistance || 0), 0),
            totalRevenue: rides.reduce((sum, ride) => sum + (ride.actualPrice || 0), 0),
            averageRating: rides.reduce((sum, ride) => sum + (ride.rating || 0), 0) / rides.length || 0,
            statusBreakdown: rides.reduce((acc, ride) => {
                acc[ride.status] = (acc[ride.status] || 0) + 1;
                return acc;
            }, {}),
            timeDistribution: rides.reduce((acc, ride) => {
                const hour = new Date(ride.dateTime).getHours();
                acc[hour] = (acc[hour] || 0) + 1;
                return acc;
            }, {}),
            revenuePerDay: Object.entries(revenuePerDay).map(([date, revenue]) => ({ date, revenue })),
            ridesPerArea: Object.entries(ridesPerArea).map(([area, rides]) => ({ area, rides })),
            ridesPerDriver: Object.entries(ridesPerDriver).map(([driverId, rides]) => ({ driverId, rides })),
            ridesPerCustomer: Object.entries(ridesPerCustomer).map(([customerId, rides]) => ({ customerId, rides }))
        };

        res.json(statistics);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate statistics', error: error.message });
    }
};
