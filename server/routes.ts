import express, { type Express } from "express";
import http from "http";
import { isAuthenticated } from "./localAuth"; // Changed from replitAuth to localAuth
import { setupAuth } from "./localAuth"; // Changed from replitAuth to localAuth
import { storage } from "./storage";
import { config } from "./config";

// Import route modules
import progressRoutes from "./routes/progress";

export async function registerRoutes(app: Express) {
  const server = http.createServer(app);

  // Setup authentication
  await setupAuth(app);

  // API routes
  const apiRouter = express.Router();

  // User routes
  apiRouter.get("/user", isAuthenticated, async (req, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });

  // Projects routes
  apiRouter.get("/projects", isAuthenticated, async (req, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.role === "admin") {
      const projects = await storage.getAllProjects();
      return res.json(projects);
    } else {
      const projects = await storage.getProjectsByUserId(userId);
      return res.json(projects);
    }
  });

  apiRouter.get("/projects/first", isAuthenticated, async (req, res) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let project;
    if (user.role === "admin") {
      const projects = await storage.getAllProjects();
      project = projects[0];
    } else {
      const projects = await storage.getProjectsByUserId(userId);
      project = projects[0];
    }
    
    if (!project) {
      return res.status(404).json({ message: "No projects found" });
    }
    
    res.json(project);
  });

  apiRouter.get("/projects/:id", isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if user has access to this project
    if (user.role !== "admin" && project.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    res.json(project);
  });

  // Project IDO Metrics routes
  apiRouter.put("/projects/:id/ido-metrics", isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if user has access to this project
    if (user.role !== "admin" && project.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const idoMetrics = await storage.upsertIdoMetrics({
      projectId,
      ...req.body,
    });
    
    res.json(idoMetrics);
  });

  // Project Platform Content routes
  apiRouter.put("/projects/:id/platform-content", isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if user has access to this project
    if (user.role !== "admin" && project.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const platformContent = await storage.upsertPlatformContent({
      projectId,
      ...req.body,
    });
    
    res.json(platformContent);
  });

  // Project FAQs routes
  apiRouter.post("/projects/:id/faqs", isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if user has access to this project
    if (user.role !== "admin" && project.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Check if project already has 5 FAQs
    const existingFaqs = await storage.getFaqsByProjectId(projectId);
    if (existingFaqs.length >= 5) {
      return res.status(400).json({ message: "Maximum 5 FAQs allowed per project" });
    }
    
    const faq = await storage.createFaq({
      projectId,
      question: req.body.question,
      answer: req.body.answer,
      status: req.body.status || "not_confirmed",
      order: existingFaqs.length + 1,
    });
    
    res.json(faq);
  });

  apiRouter.put("/faqs/:id", isAuthenticated, async (req, res) => {
    const faqId = parseInt(req.params.id);
    if (isNaN(faqId)) {
      return res.status(400).json({ message: "Invalid FAQ ID" });
    }
    
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const faq = await storage.getFaqById(faqId);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    
    const project = await storage.getProjectById(faq.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if user has access to this project
    if (user.role !== "admin" && project.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const updatedFaq = await storage.updateFaq({
      id: faqId,
      question: req.body.question,
      answer: req.body.answer,
      status: req.body.status,
    });
    
    res.json(updatedFaq);
  });

  apiRouter.delete("/faqs/:id", isAuthenticated, async (req, res) => {
    const faqId = parseInt(req.params.id);
    if (isNaN(faqId)) {
      return res.status(400).json({ message: "Invalid FAQ ID" });
    }
    
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const faq = await storage.getFaqById(faqId);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    
    const project = await storage.getProjectById(faq.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if user has access to this project
    if (user.role !== "admin" && project.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    await storage.deleteFaq(faqId);
    
    res.json({ success: true });
  });

  // Project Quiz Questions routes
  apiRouter.post("/projects/:id/quiz-questions", isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if user has access to this project
    if (user.role !== "admin" && project.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Check if project already has 5 quiz questions
    const existingQuizQuestions = await storage.getQuizQuestionsByProjectId(projectId);
    if (existingQuizQuestions.length >= 5) {
      return res.status(400).json({ message: "Maximum 5 quiz questions allowed per project" });
    }
    
    // Prepare options
    const wrongAnswers = req.body.wrongAnswers || [];
    if (wrongAnswers.length < 3) {
      return res.status(400).json({ message: "At least 3 wrong answers are required" });
    }
    
    const quizQuestion = await storage.createQuizQuestion({
      projectId,
      question: req.body.question,
      optionA: req.body.correctAnswer,
      optionB: wrongAnswers[0],
      optionC: wrongAnswers[1],
      optionD: wrongAnswers[2],
      correctAnswer: "a", // Always set the first option as correct
      status: req.body.status || "not_confirmed",
      order: existingQuizQuestions.length + 1,
    });
    
    res.json(quizQuestion);
  });

  // Project Marketing Assets routes
  apiRouter.put("/projects/:id/marketing-assets", isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if user has access to this project
    if (user.role !== "admin" && project.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const marketingAssets = await storage.upsertMarketingAssets({
      projectId,
      ...req.body,
    });
    
    res.json(marketingAssets);
  });

  // Progress routes
  apiRouter.use("/progress", progressRoutes);

  // Register API routes
  app.use("/api", apiRouter);

  // Demo mode routes
  if (config.demo.enabled) {
    app.get("/api/demo/login", async (req, res) => {
      const adminUser = await storage.getUserById(config.demo.defaultAdminId);
      if (!adminUser) {
        await storage.upsertUser({
          id: config.demo.defaultAdminId,
          email: "demo-admin@example.com",
          firstName: "Demo",
          lastName: "Admin",
          role: "admin",
        });
      }
      
      req.login({ claims: { sub: config.demo.defaultAdminId } }, () => {
        res.redirect("/");
      });
    });
  }

  return server;
}