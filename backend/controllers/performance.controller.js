import PerformanceReview from '../models/PerformanceReview.js';
import ActivityLog from '../models/ActivityLog.js';

// Get all performance reviews
export const getAllReviews = async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    let query = {};
    
    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;

    const reviews = await PerformanceReview.find(query)
      .populate('employee', 'name email department position')
      .populate('reviewer', 'username email')
      .sort({ reviewDate: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get review by ID
export const getReviewById = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id)
      .populate('employee', 'name email department position salary')
      .populate('reviewer', 'username email');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create performance review
export const createReview = async (req, res) => {
  try {
    const { employee, reviewPeriod, reviewDate, reviewer, ratings, strengths, areasOfImprovement, goals, feedback } = req.body;

    const review = await PerformanceReview.create({
      employee,
      reviewPeriod,
      reviewDate,
      reviewer,
      ratings,
      strengths,
      areasOfImprovement,
      goals,
      feedback,
      status: 'Completed'
    });

    // Log activity
    await ActivityLog.create({
      user: reviewer,
      userModel: 'Admin',
      action: 'Created performance review',
      entityType: 'Performance',
      entityId: review._id,
      details: `Overall rating: ${review.overallRating}`
    });

    res.status(201).json({ success: true, message: 'Performance review created', data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update performance review
export const updateReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, message: 'Review updated', data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete performance review
export const deleteReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findByIdAndDelete(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get performance statistics
export const getPerformanceStats = async (req, res) => {
  try {
    const avgRatings = await PerformanceReview.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: null,
          avgOverallRating: { $avg: '$overallRating' },
          avgTechnicalSkills: { $avg: '$ratings.technicalSkills' },
          avgCommunication: { $avg: '$ratings.communication' },
          avgTeamwork: { $avg: '$ratings.teamwork' },
          avgProblemSolving: { $avg: '$ratings.problemSolving' },
          avgProductivity: { $avg: '$ratings.productivity' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const ratingDistribution = await PerformanceReview.aggregate([
      { $match: { status: 'Completed' } },
      {
        $bucket: {
          groupBy: '$overallRating',
          boundaries: [1, 2, 3, 4, 5, 6],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.json({ 
      success: true, 
      data: { 
        averages: avgRatings[0] || {}, 
        distribution: ratingDistribution 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

