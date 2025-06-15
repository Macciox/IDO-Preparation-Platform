import { Router } from 'express';
import { storage } from '../storage';
import { getProjectProgress, getMissingFields } from '../utils/progressTracker';
import { isAuthenticatedOrDemo } from '../replitAuth';

const router = Router();

/**
 * Get progress statistics for a specific project
 * GET /api/progress/:projectId
 */
router.get('/:projectId', isAuthenticatedOrDemo, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const project = await storage.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check access permissions
    if (user.role !== "admin" && project.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Calculate progress for all sections
    const progress = getProjectProgress(project);
    
    // Get missing fields for each section
    const missingFields = {
      idoMetrics: getMissingFields(project, 'idoMetrics'),
      platformContent: getMissingFields(project, 'platformContent'),
      faqs: getMissingFields(project, 'faqs'),
      quizQuestions: getMissingFields(project, 'quizQuestions'),
      marketingAssets: getMissingFields(project, 'marketingAssets'),
    };
    
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({
      progress,
      missingFields,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error calculating project progress:", error);
    res.status(500).json({ message: "Failed to calculate project progress" });
  }
});

/**
 * Force recalculation of progress for a specific project
 * POST /api/progress/:projectId/recalculate
 */
router.post('/:projectId/recalculate', isAuthenticatedOrDemo, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const project = await storage.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check access permissions
    if (user.role !== "admin" && project.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Calculate progress for all sections
    const progress = getProjectProgress(project);
    
    // Get missing fields for each section
    const missingFields = {
      idoMetrics: getMissingFields(project, 'idoMetrics'),
      platformContent: getMissingFields(project, 'platformContent'),
      faqs: getMissingFields(project, 'faqs'),
      quizQuestions: getMissingFields(project, 'quizQuestions'),
      marketingAssets: getMissingFields(project, 'marketingAssets'),
    };
    
    res.json({
      progress,
      missingFields,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error recalculating project progress:", error);
    res.status(500).json({ message: "Failed to recalculate project progress" });
  }
});

export default router;