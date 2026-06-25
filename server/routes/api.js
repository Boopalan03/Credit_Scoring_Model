const { spawn } = require('child_process');
const path = require('path');
const express = require('express');
const router = express.Router();
const dataService = require('../dataService');

const PYTHON_PATH = path.resolve(__dirname, '..', process.env.PYTHON_PATH || '../ml/venv/Scripts/python.exe');
const SCRIPT_PATH = path.resolve(__dirname, '..', '../ml/src/predict.py');

// POST /api/score-credit - Submits an application and runs the python ML scoring model
router.post('/score-credit', async (req, res) => {
  try {
    const applicantData = req.body;
    const { name, email, ...features } = applicantData;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required fields.' });
    }
    
    // Spawn python process to predict
    const jsonStr = JSON.stringify(features);
    console.log(`Executing prediction script at: ${SCRIPT_PATH}`);
    console.log(`Using Python path: ${PYTHON_PATH}`);
    
    const pythonProcess = spawn(PYTHON_PATH, [SCRIPT_PATH, '--json-str', jsonStr]);
    
    let stdoutData = '';
    let stderrData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}. Stderr: ${stderrData}`);
        return res.status(500).json({ error: 'Prediction script execution failed.', details: stderrData });
      }
      
      try {
        const mlResult = JSON.parse(stdoutData.trim());
        
        // Save to DB (dataService handles fallback file DB if Mongoose is disconnected)
        const appData = {
          name,
          email,
          ...features,
          creditScore: mlResult.credit_score,
          creditRating: mlResult.credit_rating,
          approved: mlResult.approved,
          probabilityGood: mlResult.probability_good_risk,
          probabilityBad: mlResult.probability_bad_risk
        };
        
        const savedApp = await dataService.saveApplication(appData);
        return res.status(201).json(savedApp);
      } catch (err) {
        console.error('Error parsing Python output or saving application:', err);
        return res.status(500).json({ error: 'Error parsing prediction result.', details: stdoutData });
      }
    });
  } catch (err) {
    console.error('Error in score-credit route:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/applications - Get all submitted credit applications
router.get('/applications', async (req, res) => {
  try {
    const apps = await dataService.getAllApplications();
    return res.json(apps);
  } catch (err) {
    console.error('Error getting applications list:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/applications/:id - Get single application
router.get('/applications/:id', async (req, res) => {
  try {
    const app = await dataService.getApplicationById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    return res.json(app);
  } catch (err) {
    console.error('Error getting application by ID:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/dashboard-stats - Get aggregated analytics for React Dashboard
router.get('/dashboard-stats', async (req, res) => {
  try {
    const apps = await dataService.getAllApplications();
    const count = apps.length;
    
    if (count === 0) {
      return res.json({
        totalApplications: 0,
        approvalRate: 0,
        averageScore: 0,
        averageLoanAmount: 0,
        ratingDistribution: { Excellent: 0, Good: 0, Fair: 0, Poor: 0 },
        decisionDistribution: { Approved: 0, Denied: 0 },
        ficoDistribution: [],
        recentApplications: []
      });
    }
    
    const approvedCount = apps.filter(a => a.approved).length;
    const approvalRate = parseFloat(((approvedCount / count) * 100).toFixed(2));
    
    const totalScore = apps.reduce((sum, a) => sum + (a.creditScore || 0), 0);
    const averageScore = Math.round(totalScore / count);
    
    const totalAmount = apps.reduce((sum, a) => sum + (a.credit_amount || 0), 0);
    const averageLoanAmount = Math.round(totalAmount / count);
    
    // FICO Rating breakdown
    const ratingDistribution = { Excellent: 0, Good: 0, Fair: 0, Poor: 0 };
    apps.forEach(a => {
      if (ratingDistribution[a.creditRating] !== undefined) {
        ratingDistribution[a.creditRating]++;
      }
    });
    
    // Approved vs Denied
    const decisionDistribution = { Approved: approvedCount, Denied: count - approvedCount };
    
    // FICO Score bands for histogram
    const bands = {};
    for (let b = 300; b <= 800; b += 50) {
      bands[`${b}-${b+49}`] = 0;
    }
    bands['800-850'] = 0;
    
    apps.forEach(a => {
      const score = a.creditScore || 300;
      if (score >= 800) {
        bands['800-850']++;
      } else {
        const floor = Math.floor(score / 50) * 50;
        const key = `${floor}-${floor+49}`;
        if (bands[key] !== undefined) {
          bands[key]++;
        }
      }
    });
    
    const ficoDistribution = Object.keys(bands).map(key => ({
      range: key,
      count: bands[key]
    }));
    
    const recentApplications = apps.slice(0, 5);
    
    return res.json({
      totalApplications: count,
      approvalRate,
      averageScore,
      averageLoanAmount,
      ratingDistribution,
      decisionDistribution,
      ficoDistribution,
      recentApplications
    });
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
