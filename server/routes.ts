import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertProjectSchema,
  insertIdoMetricsSchema,
  insertPlatformContentSchema,
  insertFaqSchema,
  insertQuizQuestionSchema,
  insertMarketingAssetsSchema,
  insertProjectWhitelistSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Demo login route for testing
  app.post('/api/demo-login', async (req, res) => {
    try {
      const { role } = req.body;
      
      let userId, email;
      if (role === 'admin') {
        userId = 'demo-admin-123';
        email = 'admin@decubate.com';
      } else {
        userId = 'demo-project-456';
        email = 'project@example.com';
      }
      
      // Create or update demo user
      await storage.upsertUser({
        id: userId,
        email: email,
        firstName: role === 'admin' ? 'Admin' : 'Project',
        lastName: 'User',
        role: role as 'admin' | 'project',
      });
      
      // Set session
      (req as any).session.userId = userId;
      
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error with demo login:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for demo session first
      if (req.session?.userId) {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          return res.json(user);
        }
      }
      
      // Create demo user for development
      let user = await storage.getUser("demo-user-123");
      if (!user) {
        user = await storage.upsertUser({
          id: "demo-user-123",
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null
        });
      }
      return res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Custom authentication middleware that supports both Replit auth and demo sessions
  const isAuthenticatedOrDemo: RequestHandler = async (req: any, res, next) => {
    // Check for demo session first
    if (req.session?.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = { claims: { sub: user.id } };
        return next();
      }
    }
    
    // Create demo user for development
    try {
      let user = await storage.getUser("demo-user-123");
      if (!user) {
        user = await storage.upsertUser({
          id: "demo-user-123",
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null
        });
      }
      req.user = { claims: { sub: user.id } };
      return next();
    } catch (error) {
      console.error("Demo auth failed:", error);
      return res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Project routes
  app.get("/api/projects", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let projects;
      if (user.role === "admin") {
        projects = await storage.getAllProjects();
      } else {
        projects = await storage.getUserProjects(userId);
      }
      
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
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
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.get("/api/projects/access/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const project = await storage.getProjectByAccessToken(token);
      
      if (!project) {
        return res.status(404).json({ message: "Invalid access token" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project by token:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const validatedData = insertProjectSchema.omit({ userId: true }).parse(req.body);
      const project = await storage.createProject({
        ...validatedData,
        userId,
      });
      
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
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
      
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(projectId, validatedData);
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const success = await storage.deleteProject(projectId);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // IDO Metrics routes
  app.put("/api/projects/:id/ido-metrics", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
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
      
      const validatedData = {
        projectId: projectId,
        whitelistingDate: req.body.whitelistingDate ? new Date(req.body.whitelistingDate) : null,
        whitelistingDateStatus: req.body.whitelistingDateStatus || "not_confirmed",
        tokenPrice: req.body.tokenPrice || null,
        tokenPriceStatus: req.body.tokenPriceStatus || "not_confirmed",
        totalAllocation: req.body.totalAllocation || null,
        totalAllocationStatus: req.body.totalAllocationStatus || "not_confirmed",
        vestingPeriod: req.body.vestingPeriod || null,
        vestingPeriodStatus: req.body.vestingPeriodStatus || "not_confirmed",
        cliffPeriod: req.body.cliffPeriod || null,
        cliffPeriodStatus: req.body.cliffPeriodStatus || "not_confirmed",
        tgePercentage: req.body.tgePercentage || null,
        tgePercentageStatus: req.body.tgePercentageStatus || "not_confirmed",
        transactionId: req.body.transactionId || null,
        transactionIdStatus: req.body.transactionIdStatus || "not_confirmed",
      };
      
      const metrics = await storage.upsertIdoMetrics(validatedData);
      res.json(metrics);
    } catch (error) {
      console.error("Error updating IDO metrics:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update IDO metrics" });
    }
  });

  // Platform Content routes
  app.put("/api/projects/:id/platform-content", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
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
      
      const validatedData = {
        projectId: projectId,
        tagline: req.body.tagline || null,
        taglineStatus: req.body.taglineStatus || "not_confirmed",
        description: req.body.description || null,
        descriptionStatus: req.body.descriptionStatus || "not_confirmed",
        telegramUrl: req.body.telegramUrl || null,
        telegramUrlStatus: req.body.telegramUrlStatus || "not_confirmed",
        discordUrl: req.body.discordUrl || null,
        discordUrlStatus: req.body.discordUrlStatus || "not_confirmed",
        twitterUrl: req.body.twitterUrl || null,
        twitterUrlStatus: req.body.twitterUrlStatus || "not_confirmed",
        youtubeUrl: req.body.youtubeUrl || null,
        youtubeUrlStatus: req.body.youtubeUrlStatus || "not_confirmed",
        linkedinUrl: req.body.linkedinUrl || null,
        linkedinUrlStatus: req.body.linkedinUrlStatus || "not_confirmed",
        tokenomicsUrl: req.body.tokenomicsUrl || null,
        tokenomicsUrlStatus: req.body.tokenomicsUrlStatus || "not_confirmed",
        teamPageUrl: req.body.teamPageUrl || null,
        teamPageUrlStatus: req.body.teamPageUrlStatus || "not_confirmed",
        roadmapUrl: req.body.roadmapUrl || null,
        roadmapUrlStatus: req.body.roadmapUrlStatus || "not_confirmed",
      };
      
      const content = await storage.upsertPlatformContent(validatedData);
      res.json(content);
    } catch (error) {
      console.error("Error updating platform content:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update platform content" });
    }
  });

  // FAQ routes
  app.post("/api/projects/:id/faqs", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
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
      
      const validatedData = {
        projectId: projectId,
        question: req.body.question,
        answer: req.body.answer,
        order: req.body.order || project.faqs.length + 1,
        status: req.body.status || "not_confirmed",
      };
      
      const faq = await storage.upsertFaq(validatedData);
      res.status(201).json(faq);
    } catch (error) {
      console.error("Error creating FAQ:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });

  app.put("/api/faqs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const faqId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const validatedData = insertFaqSchema.partial().parse({
        ...req.body,
        id: faqId,
      });
      
      const faq = await storage.upsertFaq(validatedData);
      res.json(faq);
    } catch (error) {
      console.error("Error updating FAQ:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });

  app.delete("/api/faqs/:id", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const faqId = parseInt(req.params.id);
      const success = await storage.deleteFaq(faqId);
      
      if (!success) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      
      res.json({ message: "FAQ deleted successfully" });
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });

  // Quiz Questions routes
  app.post("/api/projects/:id/quiz-questions", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
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
      
      const validatedData = insertQuizQuestionSchema.parse({
        ...req.body,
        projectId,
      });
      
      const question = await storage.upsertQuizQuestion(validatedData);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating quiz question:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quiz question" });
    }
  });

  app.put("/api/quiz-questions/:id", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const validatedData = insertQuizQuestionSchema.partial().parse({
        ...req.body,
        id: questionId,
      });
      
      const question = await storage.upsertQuizQuestion(validatedData);
      res.json(question);
    } catch (error) {
      console.error("Error updating quiz question:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update quiz question" });
    }
  });

  app.delete("/api/quiz-questions/:id", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const success = await storage.deleteQuizQuestion(questionId);
      
      if (!success) {
        return res.status(404).json({ message: "Quiz question not found" });
      }
      
      res.json({ message: "Quiz question deleted successfully" });
    } catch (error) {
      console.error("Error deleting quiz question:", error);
      res.status(500).json({ message: "Failed to delete quiz question" });
    }
  });

  // Marketing Assets routes
  app.put("/api/projects/:id/marketing-assets", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
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
      
      const validatedData = insertMarketingAssetsSchema.partial().parse({
        ...req.body,
        projectId,
      });
      
      const assets = await storage.upsertMarketingAssets(validatedData);
      res.json(assets);
    } catch (error) {
      console.error("Error updating marketing assets:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update marketing assets" });
    }
  });

  // Stats endpoint for admin dashboard
  app.get("/api/stats", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const projects = await storage.getAllProjects();
      
      res.json({
        totalRewards: "$3.2M+",
        successfulLaunches: projects.length,
        avgROI: "6.8x",
        activeProjects: projects.filter(p => p.updatedAt && new Date(p.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Project Whitelist Management routes
  app.post("/api/projects/:id/whitelist", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only admins can manage whitelist
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const validatedData = insertProjectWhitelistSchema.parse({
        ...req.body,
        projectId,
        addedBy: userId,
      });
      
      const whitelistEntry = await storage.addToWhitelist(validatedData);
      res.status(201).json(whitelistEntry);
    } catch (error) {
      console.error("Error adding to whitelist:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to whitelist" });
    }
  });

  app.get("/api/projects/:id/whitelist", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only admins can view whitelist
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const whitelist = await storage.getProjectWhitelist(projectId);
      res.json(whitelist);
    } catch (error) {
      console.error("Error fetching whitelist:", error);
      res.status(500).json({ message: "Failed to fetch whitelist" });
    }
  });

  app.delete("/api/projects/:id/whitelist/:email", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const email = req.params.email;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only admins can manage whitelist
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      
      const success = await storage.removeFromWhitelist(projectId, email);
      
      if (!success) {
        return res.status(404).json({ message: "Email not found in whitelist" });
      }
      
      res.json({ message: "Email removed from whitelist successfully" });
    } catch (error) {
      console.error("Error removing from whitelist:", error);
      res.status(500).json({ message: "Failed to remove from whitelist" });
    }
  });

  // Get user's whitelisted projects (for project users)
  app.get("/api/user/whitelisted-projects", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role === "admin") {
        // Admins get all projects
        const projects = await storage.getAllProjects();
        return res.json(projects);
      }
      
      // Project users get only whitelisted projects
      const whitelistedProjects = await storage.getUserWhitelistedProjects(user.email || "");
      res.json(whitelistedProjects);
    } catch (error) {
      console.error("Error fetching whitelisted projects:", error);
      res.status(500).json({ message: "Failed to fetch whitelisted projects" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
