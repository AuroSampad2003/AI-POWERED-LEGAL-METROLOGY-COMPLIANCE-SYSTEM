import User from '../models/User.js';
import Inspection from '../models/Inspection.js';
import Complaint from '../models/Complaint.js';
import generateEnforcementCaseId from '../utils/generateCaseId.js';
import { sendEscalationEmail } from '../services/complaintMailer.js';

// =====================================================
// ADMIN DASHBOARD STATISTICS
// =====================================================

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalInspections,
      compliant,
      nonCompliant,
      pending,
      failed,
    ] = await Promise.all([
      User.countDocuments(),

      Inspection.countDocuments(),

      Inspection.countDocuments({
        status: 'COMPLIANT',
      }),

      Inspection.countDocuments({
        status: 'NON_COMPLIANT',
      }),

      Inspection.countDocuments({
        status: {
          $in: ['UPLOADED', 'ANALYSIS_PENDING', 'ANALYZED'],
        },
      }),

      Inspection.countDocuments({
        status: 'FAILED',
      }),
    ]);

    const recentInspections = await Inspection.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('productName category status createdAt user');

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalInspections,
        compliant,
        nonCompliant,
        pending,
        failed,
        recentInspections,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard statistics',
    });
  }
};


// =====================================================
// GET ALL USERS
// =====================================================

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};


// =====================================================
// GET SINGLE USER
// =====================================================

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};


// =====================================================
// UPDATE USER ROLE
// =====================================================

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Use USER or ADMIN.',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update user role error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
    });
  }
};


// =====================================================
// DELETE USER
// =====================================================

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};


// =====================================================
// GET ALL INSPECTIONS
// =====================================================

export const getAllInspections = async (req, res) => {
  try {
    const inspections = await Inspection.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inspections.length,
      data: inspections,
    });
  } catch (error) {
    console.error('Get inspections error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspections',
    });
  }
};


// =====================================================
// GET SINGLE INSPECTION
// =====================================================

export const getInspectionByIdAdmin = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('user', 'fullName email');

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found',
      });
    }

    res.status(200).json({
      success: true,
      data: inspection,
    });
  } catch (error) {
    console.error('Get inspection error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspection',
    });
  }
};


// =====================================================
// UPDATE INSPECTION STATUS
// =====================================================

export const updateInspectionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'UPLOADED',
      'ANALYSIS_PENDING',
      'ANALYZED',
      'COMPLIANT',
      'NON_COMPLIANT',
      'FAILED',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inspection status',
      });
    }

    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found',
      });
    }

    inspection.status = status;

    await inspection.save();

    res.status(200).json({
      success: true,
      message: 'Inspection status updated successfully',
      data: inspection,
    });
  } catch (error) {
    console.error('Update inspection status error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update inspection status',
    });
  }
};


// =====================================================
// GET ALL COMPLAINTS (for Violation Review page)
// =====================================================

export const getAllComplaintsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const complaints = await Complaint.find(filter)
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error('Get complaints error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
    });
  }
};


// =====================================================
// GET SINGLE COMPLAINT (for Complaint Review page)
// =====================================================

export const getComplaintByIdAdmin = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'fullName email')
      .populate('inspection');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    console.error('Get complaint error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
    });
  }
};


// =====================================================
// UPDATE COMPLAINT STATUS / ADMIN REMARKS
// =====================================================

export const updateComplaintReview = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    const allowedStatuses = [
      'SUBMITTED',
      'PENDING_REVIEW',
      'UNDER_REVIEW',
      'MORE_INFO_REQUIRED',
      'VERIFIED',
      'REJECTED',
      'ESCALATED',
      'RESOLVED',
    ];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint status',
      });
    }

    const complaint = await Complaint.findById(req.params.id).populate('user', 'fullName email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const wasAlreadyEscalated = complaint.status === 'ESCALATED';

    if (status !== undefined) complaint.status = status;
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;

    if (status === 'VERIFIED' && !complaint.enforcementCaseId) {
      complaint.enforcementCaseId = await generateEnforcementCaseId();
      complaint.verifiedAt = new Date();
    }

    await complaint.save();

    // Notify the user by email exactly once — on the transition into
    // ESCALATED, not on every subsequent remarks-only save.
    if (status === 'ESCALATED' && !wasAlreadyEscalated) {
      sendEscalationEmail({
        to: complaint.user?.email,
        fullName: complaint.user?.fullName,
        complaintId: complaint.complaintId,
        enforcementCaseId: complaint.enforcementCaseId,
        productName: complaint.productName,
        adminRemarks: complaint.adminRemarks,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint,
    });
  } catch (error) {
    console.error('Update complaint review error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update complaint',
    });
  }
};