import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "project"] }).default("project").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  slug: varchar("slug").unique().notNull(),
  accessToken: varchar("access_token").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// IDO Metrics data
export const idoMetrics = pgTable("ido_metrics", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  whitelistingDate: timestamp("whitelisting_date"),
  whitelistingDateStatus: varchar("whitelisting_date_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  tokenPrice: varchar("token_price"),
  tokenPriceStatus: varchar("token_price_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  totalAllocation: varchar("total_allocation"),
  totalAllocationStatus: varchar("total_allocation_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  vestingPeriod: integer("vesting_period"),
  vestingPeriodStatus: varchar("vesting_period_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  cliffPeriod: integer("cliff_period"),
  cliffPeriodStatus: varchar("cliff_period_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  tgePercentage: integer("tge_percentage"),
  tgePercentageStatus: varchar("tge_percentage_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  transactionId: varchar("transaction_id"),
  transactionIdStatus: varchar("transaction_id_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform Content data
export const platformContent = pgTable("platform_content", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  tagline: text("tagline"),
  taglineStatus: varchar("tagline_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  description: text("description"),
  descriptionStatus: varchar("description_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  twitterUrl: varchar("twitter_url"),
  twitterUrlStatus: varchar("twitter_url_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  telegramUrl: varchar("telegram_url"),
  telegramUrlStatus: varchar("telegram_url_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  discordUrl: varchar("discord_url"),
  discordUrlStatus: varchar("discord_url_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  roadmapUrl: varchar("roadmap_url"),
  roadmapUrlStatus: varchar("roadmap_url_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  teamPageUrl: varchar("team_page_url"),
  teamPageUrlStatus: varchar("team_page_url_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  tokenomicsUrl: varchar("tokenomics_url"),
  tokenomicsUrlStatus: varchar("tokenomics_url_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FAQ data
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  status: varchar("status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  order: integer("order").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// L2E Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  question: text("question").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  correctAnswer: varchar("correct_answer", { enum: ["a", "b", "c"] }).notNull(),
  status: varchar("status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  order: integer("order").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketing Assets
export const marketingAssets = pgTable("marketing_assets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  logoUrl: varchar("logo_url"),
  logoStatus: varchar("logo_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  heroBannerUrl: varchar("hero_banner_url"),
  heroBannerStatus: varchar("hero_banner_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  driveFolder: varchar("drive_folder"),
  driveFolderStatus: varchar("drive_folder_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  additionalAssets: jsonb("additional_assets").default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project whitelist for team member access control
export const projectWhitelist = pgTable("project_whitelist", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  email: varchar("email").notNull(),
  addedBy: varchar("added_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_project_whitelist_project").on(table.projectId),
  index("idx_project_whitelist_email").on(table.email),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  idoMetrics: one(idoMetrics),
  platformContent: one(platformContent),
  faqs: many(faqs),
  quizQuestions: many(quizQuestions),
  marketingAssets: one(marketingAssets),
  whitelist: many(projectWhitelist),
}));

export const idoMetricsRelations = relations(idoMetrics, ({ one }) => ({
  project: one(projects, {
    fields: [idoMetrics.projectId],
    references: [projects.id],
  }),
}));

export const platformContentRelations = relations(platformContent, ({ one }) => ({
  project: one(projects, {
    fields: [platformContent.projectId],
    references: [projects.id],
  }),
}));

export const faqsRelations = relations(faqs, ({ one }) => ({
  project: one(projects, {
    fields: [faqs.projectId],
    references: [projects.id],
  }),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  project: one(projects, {
    fields: [quizQuestions.projectId],
    references: [projects.id],
  }),
}));

export const marketingAssetsRelations = relations(marketingAssets, ({ one }) => ({
  project: one(projects, {
    fields: [marketingAssets.projectId],
    references: [projects.id],
  }),
}));

export const projectWhitelistRelations = relations(projectWhitelist, ({ one }) => ({
  project: one(projects, {
    fields: [projectWhitelist.projectId],
    references: [projects.id],
  }),
  addedByUser: one(users, {
    fields: [projectWhitelist.addedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIdoMetricsSchema = createInsertSchema(idoMetrics).omit({
  id: true,
  updatedAt: true,
});

export const insertPlatformContentSchema = createInsertSchema(platformContent).omit({
  id: true,
  updatedAt: true,
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  updatedAt: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
  updatedAt: true,
});

export const insertMarketingAssetsSchema = createInsertSchema(marketingAssets).omit({
  id: true,
  updatedAt: true,
});

export const insertProjectWhitelistSchema = createInsertSchema(projectWhitelist).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertIdoMetrics = z.infer<typeof insertIdoMetricsSchema>;
export type IdoMetrics = typeof idoMetrics.$inferSelect;
export type InsertPlatformContent = z.infer<typeof insertPlatformContentSchema>;
export type PlatformContent = typeof platformContent.$inferSelect;
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertMarketingAssets = z.infer<typeof insertMarketingAssetsSchema>;
export type MarketingAssets = typeof marketingAssets.$inferSelect;
export type InsertProjectWhitelist = z.infer<typeof insertProjectWhitelistSchema>;
export type ProjectWhitelist = typeof projectWhitelist.$inferSelect;

export type ProjectWithData = Project & {
  idoMetrics?: IdoMetrics;
  platformContent?: PlatformContent;
  faqs: Faq[];
  quizQuestions: QuizQuestion[];
  marketingAssets?: MarketingAssets;
  whitelist?: ProjectWhitelist[];
  user: User;
};
