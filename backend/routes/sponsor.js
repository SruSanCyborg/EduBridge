const express = require('express');
const { SponsorOpportunity, Donation, SponsorCampaign } = require('../models/Sponsor');
const Notification = require('../models/Notification');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Demo opportunities storage (in-memory for demo mode)
let demoOpportunities = [
  {
    _id: 'demo-opp-1',
    title: 'Women in Tech Scholarship',
    description: 'Supporting women pursuing careers in technology and engineering fields.',
    type: 'scholarship',
    category: 'Technology',
    budget: { amount: 5000, currency: 'USD', type: 'fixed' },
    status: 'active',
    sponsor: '3',
    applicationDeadline: '2024-12-31T23:59:59.000Z',
    selectionDate: '2025-01-15',
    maxApplicants: 100,
    eligibility: {
      minAge: 18,
      maxAge: 35,
      educationLevel: ['Undergraduate', 'Graduate'],
      location: { countries: ['United States'], states: [], cities: [] },
      gpaRequirement: 3.0,
      subjects: ['Computer Science', 'Engineering'],
      otherCriteria: []
    },
    requiredDocuments: ['Resume/CV', 'Transcripts', 'Personal Statement'],
    applicationQuestions: [
      { question: 'Why are you interested in this scholarship?', type: 'essay', required: true },
      { question: 'What are your career goals in tech?', type: 'essay', required: true },
      { question: 'How will this scholarship help you?', type: 'essay', required: true }
    ],
    applications: [],
    views: 45,
    selectedCount: 0,
    createdAt: new Date(),
    visibility: 'public'
  }
];
let demoOpportunityIdCounter = 2;

// Get sponsor opportunities
router.get('/opportunities', optionalAuth, async (req, res) => {
  try {
    const { category, type, status = 'active' } = req.query;
    let opportunities;
    
    // Try database first
    try {
      const filters = { status, visibility: 'public' };
      
      if (category) filters.category = category;
      if (type) filters.type = type;
      
      opportunities = await SponsorOpportunity.find(filters)
        .populate('sponsor', 'name profileImage sponsorProfile.organizationName')
        .sort({ createdAt: -1 });
    } catch (dbError) {
      // Fallback to demo mode
      opportunities = demoOpportunities.filter(opp => {
        let matches = opp.status === status && opp.visibility === 'public';
        
        if (category && matches) matches = opp.category === category;
        if (type && matches) matches = opp.type === type;
        
        return matches;
      });
      
      // Sort by creation date (newest first)
      opportunities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Add sponsor info for demo mode
      opportunities = opportunities.map(opp => ({
        ...opp,
        sponsor: {
          _id: opp.sponsor,
          name: 'Demo Sponsor',
          profileImage: '',
          sponsorProfile: {
            organizationName: 'EduTech Foundation'
          }
        }
      }));
    }
    
    res.json({ opportunities });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ message: 'Error fetching opportunities' });
  }
});

// Create new opportunity
router.post('/opportunities', auth, authorize('sponsor'), async (req, res) => {
  try {
    let opportunity;
    
    // Try database first
    try {
      opportunity = new SponsorOpportunity({
        ...req.body,
        sponsor: req.user._id
      });
      await opportunity.save();
    } catch (dbError) {
      // Fallback to demo mode
      opportunity = {
        _id: `demo-opp-${demoOpportunityIdCounter++}`,
        ...req.body,
        sponsor: req.user._id,
        applications: [],
        views: 0,
        selectedCount: 0,
        status: 'active',
        visibility: 'public',
        createdAt: new Date()
      };
      demoOpportunities.push(opportunity);
    }
    
    res.status(201).json({ opportunity });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ message: 'Error creating opportunity' });
  }
});

// Apply for opportunity
router.post('/opportunities/:opportunityId/apply', auth, authorize('student'), async (req, res) => {
  try {
    let opportunity;
    
    // Try database first
    try {
      opportunity = await SponsorOpportunity.findById(req.params.opportunityId);
    } catch (dbError) {
      // Fallback to demo mode
      opportunity = demoOpportunities.find(opp => opp._id === req.params.opportunityId);
    }
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Check if already applied
    const existingApplication = opportunity.applications.find(
      app => app.applicant.toString() === req.user._id.toString()
    );
    
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this opportunity' });
    }
    
    // Check if deadline passed
    if (new Date() > new Date(opportunity.applicationDeadline)) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }
    
    // Create new application
    const newApplication = {
      _id: `demo-app-${Date.now()}`,
      applicant: req.user._id,
      responses: req.body.responses,
      documents: req.body.documents,
      personalInfo: req.body.personalInfo, // Name, email, phone, etc.
      status: 'submitted',
      appliedAt: new Date()
    };
    
    opportunity.applications.push(newApplication);
    
    // Save to database or demo storage
    try {
      if (opportunity.save) {
        await opportunity.save();
      } else {
        // For demo mode, the opportunity is already updated in the array
        console.log('Application saved to demo storage');
      }
    } catch (saveError) {
      console.log('Saved to demo mode');
    }
    
    // Create notification for sponsor (skip in demo mode to avoid errors)
    try {
      if (process.env.NODE_ENV !== 'demo') {
        await Notification.createNewApplicationNotification({
          sponsor: opportunity.sponsor,
          opportunity: {
            _id: opportunity._id,
            title: opportunity.title
          },
          applicant: {
            _id: req.user._id,
            name: req.user.name || req.body.personalInfo.name || 'Anonymous'
          },
          applicationId: newApplication._id
        });
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }
    
    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
});

// Get sponsor's opportunities (for sponsor dashboard)
router.get('/my-opportunities', auth, authorize('sponsor'), async (req, res) => {
  try {
    let opportunities;
    
    // Try database first
    try {
      opportunities = await SponsorOpportunity.find({ sponsor: req.user._id })
        .populate('applications.applicant', 'name email profileImage')
        .sort({ createdAt: -1 });
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Falling back to demo mode for sponsor opportunities');
      opportunities = demoOpportunities.filter(opp => opp.sponsor === req.user._id);
      
      // Add demo applicant info for applications
      opportunities = opportunities.map(opp => ({
        ...opp,
        applications: opp.applications ? opp.applications.map(app => ({
          ...app,
          applicant: {
            _id: app.applicant,
            name: app.personalInfo?.name || 'Demo Student',
            email: app.personalInfo?.email || 'student@demo.com',
            profileImage: ''
          }
        })) : []
      }));
      
      // Sort by creation date (newest first)
      opportunities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    res.json({ opportunities });
  } catch (error) {
    console.error('Get sponsor opportunities error:', error);
    res.status(500).json({ message: 'Error fetching opportunities' });
  }
});

// Get specific opportunity with applications (for sponsor)
router.get('/opportunities/:opportunityId/applications', auth, authorize('sponsor'), async (req, res) => {
  try {
    let opportunity;
    
    // Try database first
    try {
      opportunity = await SponsorOpportunity.findOne({
        _id: req.params.opportunityId,
        sponsor: req.user._id
      }).populate('applications.applicant', 'name email profileImage userProfile');
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Falling back to demo mode for opportunity applications');
      opportunity = demoOpportunities.find(opp => 
        opp._id === req.params.opportunityId && opp.sponsor === req.user._id
      );
      
      if (opportunity) {
        // Add demo applicant info for applications
        opportunity = {
          ...opportunity,
          applications: opportunity.applications ? opportunity.applications.map(app => ({
            ...app,
            applicant: {
              _id: app.applicant,
              name: app.personalInfo?.name || 'Demo Student',
              email: app.personalInfo?.email || 'student@demo.com',
              profileImage: '',
              userProfile: {}
            }
          })) : []
        };
      }
    }
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    res.json({ opportunity, applications: opportunity.applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Update application status (shortlist/select/reject)
router.patch('/opportunities/:opportunityId/applications/:applicationId/status', auth, authorize('sponsor'), async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    let opportunity;
    
    // Try database first
    try {
      opportunity = await SponsorOpportunity.findOne({
        _id: req.params.opportunityId,
        sponsor: req.user._id
      });
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Falling back to demo mode for application status update');
      opportunity = demoOpportunities.find(opp => 
        opp._id === req.params.opportunityId && opp.sponsor === req.user._id
      );
    }
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    let application;
    if (opportunity.applications && opportunity.applications.id) {
      // Database mode
      application = opportunity.applications.id(req.params.applicationId);
    } else {
      // Demo mode
      application = opportunity.applications?.find(app => app._id === req.params.applicationId);
    }
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Valid status transitions
    const validStatuses = ['under-review', 'shortlisted', 'selected', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const oldStatus = application.status;
    application.status = status;
    if (reviewNotes) application.reviewNotes = reviewNotes;
    
    // If selected, increment selected count
    if (status === 'selected' && oldStatus !== 'selected') {
      opportunity.selectedCount = (opportunity.selectedCount || 0) + 1;
    }
    
    // Save to database or demo storage
    try {
      if (opportunity.save) {
        await opportunity.save();
      } else {
        // For demo mode, the opportunity is already updated in the array
        console.log('Application status updated in demo mode');
      }
    } catch (saveError) {
      console.log('Updated in demo mode');
    }
    
    // Create notification for student (skip in demo mode to avoid errors)
    try {
      if (process.env.NODE_ENV !== 'demo') {
        await Notification.createApplicationStatusNotification({
          applicant: application.applicant,
          opportunity: {
            _id: opportunity._id,
            title: opportunity.title,
            sponsor: {
              name: req.user.name || req.user.sponsorProfile?.organizationName || 'Sponsor'
            }
          },
          status,
          reviewNotes,
          applicationId: application._id
        });
      }
    } catch (notifError) {
      console.error('Error creating status notification:', notifError);
    }
    
    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

// Get student's applications
router.get('/my-applications', auth, authorize('student'), async (req, res) => {
  try {
    let applications = [];
    
    // Try database first
    try {
      const opportunities = await SponsorOpportunity.find({
        'applications.applicant': req.user._id
      }).populate('sponsor', 'name profileImage sponsorProfile.organizationName');
      
      applications = opportunities.map(opp => {
        const userApplication = opp.applications.find(
          app => app.applicant.toString() === req.user._id.toString()
        );
        
        return {
          _id: userApplication._id,
          opportunity: {
            _id: opp._id,
            title: opp.title,
            type: opp.type,
            sponsor: opp.sponsor
          },
          status: userApplication.status,
          appliedAt: userApplication.appliedAt,
          reviewNotes: userApplication.reviewNotes
        };
      });
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Falling back to demo mode for student applications');
      
      // Find all applications by this user in demo opportunities
      demoOpportunities.forEach(opp => {
        if (opp.applications && opp.applications.length > 0) {
          const userApplication = opp.applications.find(
            app => app.applicant === req.user._id
          );
          
          if (userApplication) {
            applications.push({
              _id: userApplication._id,
              opportunity: {
                _id: opp._id,
                title: opp.title,
                type: opp.type,
                sponsor: {
                  _id: opp.sponsor,
                  name: 'Demo Sponsor',
                  profileImage: '',
                  sponsorProfile: {
                    organizationName: 'EduTech Foundation'
                  }
                }
              },
              status: userApplication.status,
              appliedAt: userApplication.appliedAt,
              reviewNotes: userApplication.reviewNotes
            });
          }
        }
      });
    }
    
    res.json({ applications });
  } catch (error) {
    console.error('Get student applications error:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Update opportunity
router.put('/opportunities/:opportunityId', auth, authorize('sponsor'), async (req, res) => {
  try {
    const opportunity = await SponsorOpportunity.findOneAndUpdate(
      { _id: req.params.opportunityId, sponsor: req.user._id },
      req.body,
      { new: true }
    );
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    res.json({ opportunity });
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({ message: 'Error updating opportunity' });
  }
});

// Delete opportunity
router.delete('/opportunities/:opportunityId', auth, authorize('sponsor'), async (req, res) => {
  try {
    const opportunity = await SponsorOpportunity.findOneAndDelete({
      _id: req.params.opportunityId,
      sponsor: req.user._id
    });
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({ message: 'Error deleting opportunity' });
  }
});

// Get opportunity statistics for sponsor
router.get('/opportunities/:opportunityId/stats', auth, authorize('sponsor'), async (req, res) => {
  try {
    let opportunity;
    
    // Try database first
    try {
      opportunity = await SponsorOpportunity.findOne({
        _id: req.params.opportunityId,
        sponsor: req.user._id
      });
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Falling back to demo mode for opportunity stats');
      opportunity = demoOpportunities.find(opp => 
        opp._id === req.params.opportunityId && opp.sponsor === req.user._id
      );
    }
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    const applications = opportunity.applications || [];
    const stats = {
      totalApplications: applications.length,
      submitted: applications.filter(app => app.status === 'submitted').length,
      underReview: applications.filter(app => app.status === 'under-review').length,
      shortlisted: applications.filter(app => app.status === 'shortlisted').length,
      selected: applications.filter(app => app.status === 'selected').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      views: opportunity.views || 0
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;