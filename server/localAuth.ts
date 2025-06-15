import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { config } from './config';

// Local development admin user
const LOCAL_ADMIN = {
  id: "local-admin",
  email: "admin@example.com",
  firstName: "Local",
  lastName: "Admin",
  role: "admin",
};

export function getSession() {
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: config.database.url,
    createTableIfMissing: true,
    ttl: config.auth.sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: config.auth.sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for local development
      maxAge: config.auth.sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Create local admin user in database
  await storage.upsertUser({
    id: LOCAL_ADMIN.id,
    email: LOCAL_ADMIN.email,
    firstName: LOCAL_ADMIN.firstName,
    lastName: LOCAL_ADMIN.lastName,
    role: "admin",
  });

  // Local strategy for development
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      if (email === LOCAL_ADMIN.email && password === "admin") {
        const user = {
          id: LOCAL_ADMIN.id,
          email: LOCAL_ADMIN.email,
          firstName: LOCAL_ADMIN.firstName,
          lastName: LOCAL_ADMIN.lastName,
          role: "admin",
          claims: { sub: LOCAL_ADMIN.id }
        };
        return done(null, user);
      }
      return done(null, false, { message: 'Incorrect credentials' });
    }
  ));

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Login route
  app.get("/api/login", (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Local Development Login</title>
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
            <h1>Local Development Login</h1>
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
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};