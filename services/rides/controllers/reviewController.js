const axios = require('axios');
const Review = require('../models/review');
const mongoose = require('mongoose');

// Submit a review
exports.submitReview = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    const { rideId, reviewerId, reviewerType, revieweeId, revieweeType, rating, comment } = req.body;

    // Validate required fields
    if (!rideId || !reviewerId || !revieweeId || !reviewerType || !revieweeType || !rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate reviewer/reviewee types
    if (!['customer', 'driver'].includes(reviewerType) || !['customer', 'driver'].includes(revieweeType)) {
      return res.status(400).json({ message: 'Invalid reviewer or reviewee type' });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Invalid rating. Must be between 1 and 5' });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ rideId, reviewerId });
    if (existing) {
      return res.status(409).json({ message: 'You already submitted a review for this ride.', existingReview: existing });
    }

    // 🔁 Check if reviewer and reviewee exist using axios (instead of model import)
    const reviewerURL = reviewerType === 'driver'
      ? `http://localhost:4002/api/drivers/${reviewerId}`
      : `http://localhost:4003/api/customers/${reviewerId}`;

    const revieweeURL = revieweeType === 'driver'
      ? `http://localhost:4002/api/drivers/${revieweeId}`
      : `http://localhost:4003/api/customers/${revieweeId}`;

    try {
      const [reviewerRes, revieweeRes] = await Promise.all([
        axios.get(reviewerURL),
        axios.get(revieweeURL)
      ]);

      if (!reviewerRes.data || !revieweeRes.data) {
        return res.status(404).json({ message: 'Reviewer or reviewee not found' });
      }
    } catch (axiosErr) {
      console.error('❌ Axios error during reviewer/reviewee check:', axiosErr.message);
      return res.status(500).json({ message: 'Failed to verify reviewer/reviewee' });
    }

    // Save review
    const review = new Review({
      rideId,
      reviewerId,
      reviewerType,
      revieweeId,
      revieweeType,
      rating: ratingNum,
      comment: comment || undefined
    });

    await review.save();

    res.status(201).json({
      message: 'Review submitted successfully.',
      review
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
};

// Get all reviews for a user
exports.getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ revieweeId: userId });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Check if user has reviewed a ride
exports.checkReviewStatus = async (req, res) => {
  try {
    const { rideId, reviewerId } = req.params;
    const review = await Review.findOne({ rideId, reviewerId });
    res.json({ hasReviewed: !!review });
  } catch (error) {
    console.error('Error checking review status:', error);
    res.status(500).json({ message: 'Failed to check review status' });
  }
};
