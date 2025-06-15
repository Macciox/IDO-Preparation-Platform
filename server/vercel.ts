import express, { type Request, Response } from "express";
import { config, validateConfig } from "./config";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { setupAuth } from "./localAuth";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use request logger middleware
app.use(requestLogger);

// Validate configuration
validateConfig();

// Setup session for Vercel (memory store for serverless)
app.use(session({
  secret: config.auth.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: config.auth.sessionTtl,
  },
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Setup local authentication
passport.use(require('passport-local').Strategy({
  usernameField: 'email'
}, async (email: string, password: string, done: any) => {
  if (email === "admin@example.com" && password === "admin") {
    const user = {
      id: "local-admin",
      email: "admin@example.com",
      firstName: "Local",
      lastName: "Admin",
      role: "admin",
      claims: { sub: "local-admin" }
    };
    return done(null, user);
  }
  return done(null, false, { message: 'Incorrect credentials' });
}));

passport.serializeUser((user: any, cb) => cb(null, user));
passport.deserializeUser((user: any, cb) => cb(null, user));

// Create admin user in database
app.use(async (req, res, next) => {
  try {
    await storage.upsertUser({
      id: "local-admin",
      email: "admin@example.com",
      firstName: "Local",
      lastName: "Admin",
      role: "admin",
    });
    next();
  } catch (error) {
    next(error);
  }
});

// Authentication routes
app.get("/api/login", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>IDO Platform Login</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f5f5f5; }
          .login-form { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 350px; }
          h1 { text-align: center; margin-bottom: 20px; }
          input { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
          button { width: 100%; padding: 10px; background-color: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; }
          button:hover { background-color: #3367d6; }
          .info { margin-top: 15px; font-size: 14px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="login-form">
          <h1>IDO Platform Login</h1>
          <form action="/api/login" method="post">
            <input type="email" name="email" placeholder="Email" value="admin@example.com" required>
            <input type="password" name="password" placeholder="Password" value="admin" required>
            <button type="submit">Login</button>
          </form>
          <p class="info">Default credentials:<br>Email: admin@example.com<br>Password: admin</p>
        </div>
      </body>
    </html>
  `);
});

app.post("/api/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/api/login",
}));

app.get("/api/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/api/login");
  });
});

// API routes
app.get("/api/user", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
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

app.get("/api/projects", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
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

// Use centralized error handler
app.use(errorHandler);

// Export for Vercel serverless function
export default app;