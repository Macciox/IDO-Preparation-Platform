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
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Common status enum for consistency
export const STATUS_ENUM = ["confirmed", "not_confirmed", "might_change"] as const;
export type StatusType = typeof STATUS_ENUM[number];

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

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
}, (table) => [
  // Add index for userId for faster user project lookups
  index("idx_projects_user_id").on(table.userId),
]);

// IDO Metrics data
export const idoMetrics = pgTable("ido_metrics", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  
  // Public Round (IDO) Metrics - Important Dates
  whitelistingDate: varchar("whitelisting_date"),
  whitelistingDateStatus: varchar("whitelisting_date_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  placingIdoDate: varchar("placing_ido_date"),
  placingIdoDateStatus: varchar("placing_ido_date_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  claimingDate: varchar("claiming_date"),
  claimingDateStatus: varchar("claiming_date_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  initialDexListingDate: varchar("initial_dex_listing_date"),
  initialDexListingDateStatus: varchar("initial_dex_listing_date_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  
  // Token Economics
  idoPrice: varchar("ido_price"),
  idoPriceStatus: varchar("ido_price_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  tokensForSale: varchar("tokens_for_sale"),
  tokensForSaleStatus: varchar("tokens_for_sale_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  
  // Legacy fields to maintain compatibility
  totalAllocationDollars: varchar("total_allocation_dollars"),
  totalAllocationDollarsStatus: varchar("total_allocation_dollars_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  tokenPrice: varchar("token_price"),
  tokenPriceStatus: varchar("token_price_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  tokenPriceEvent: varchar("token_price_event"),
  tokenPriceEventStatus: varchar("token_price_event_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  vestingPeriod: varchar("vesting_period"),
  vestingPeriodStatus: varchar("vesting_period_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  vestingDuration: varchar("vesting_duration"),
  vestingDurationStatus: varchar("vesting_duration_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  cliffPeriod: varchar("cliff_period"),
  cliffPeriodStatus: varchar("cliff_period_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  tgePercentage: integer("tge_percentage"),
  tgePercentageStatus: varchar("tge_percentage_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  totalAllocationNativeToken: varchar("total_allocation_native_token"),
  totalAllocationNativeTokenStatus: varchar("total_allocation_native_token_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  
  transactionId: varchar("transaction_id"),
  transactionIdStatus: varchar("transaction_id_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  availableAtTge: varchar("available_at_tge"),
  availableAtTgeStatus: varchar("available_at_tge_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  cliffLock: varchar("cliff_lock"),
  cliffLockStatus: varchar("cliff_lock_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  
  // Additional comprehensive form fields
  network: varchar("network", { enum: ["not_selected", "ETH", "Base", "Polygon", "BSC", "Arbitrum"] }),
  networkStatus: varchar("network_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  minimumTier: varchar("minimum_tier", { enum: ["not_selected", "Base", "Bronze", "Silver", "Gold", "Platinum", "Diamond"] }),
  minimumTierStatus: varchar("minimum_tier_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  gracePeriod: varchar("grace_period"),
  gracePeriodStatus: varchar("grace_period_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  tokenTicker: varchar("token_ticker"),
  tokenTickerStatus: varchar("token_ticker_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  contractAddress: varchar("contract_address"),
  contractAddressStatus: varchar("contract_address_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  
  // Token Info tab fields
  initialMarketCapExLiquidity: varchar("initial_market_cap_ex_liquidity"),
  initialMarketCapExLiquidityStatus: varchar("initial_market_cap_ex_liquidity_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  initialMarketCap: varchar("initial_market_cap"),
  initialMarketCapStatus: varchar("initial_market_cap_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  fullyDilutedMarketCap: varchar("fully_diluted_market_cap"),
  fullyDilutedMarketCapStatus: varchar("fully_diluted_market_cap_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  circulatingSupplyTge: varchar("circulating_supply_tge"),
  circulatingSupplyTgeStatus: varchar("circulating_supply_tge_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  circulatingSupplyTgePercent: varchar("circulating_supply_tge_percent"),
  circulatingSupplyTgePercentStatus: varchar("circulating_supply_tge_percent_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  totalSupply: varchar("total_supply"),
  totalSupplyStatus: varchar("total_supply_status", { enum: ["confirmed", "not_confirmed", "might_change"] }).default("not_confirmed"),
  
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform Content data
export const platformContent = pgTable("platform_content", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  tagline: text("tagline"),
  taglineStatus: varchar("tagline_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  description: text("description"),
  descriptionStatus: varchar("description_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  telegramUrl: varchar("telegram_url"),
  telegramUrlStatus: varchar("telegram_url_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  discordUrl: varchar("discord_url"),
  discordUrlStatus: varchar("discord_url_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  twitterUrl: varchar("twitter_url"),
  twitterUrlStatus: varchar("twitter_url_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  youtubeUrl: varchar("youtube_url"),
  youtubeUrlStatus: varchar("youtube_url_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  linkedinUrl: varchar("linkedin_url"),
  linkedinUrlStatus: varchar("linkedin_url_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  roadmapUrl: varchar("roadmap_url"),
  roadmapUrlStatus: varchar("roadmap_url_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  teamPageUrl: varchar("team_page_url"),
  teamPageUrlStatus: varchar("team_page_url_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  tokenomicsUrl: varchar("tokenomics_url"),
  tokenomicsUrlStatus: varchar("tokenomics_url_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Add index for projectId for faster lookups
  index("idx_platform_content_project_id").on(table.projectId),
]);

// FAQ data
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  status: varchar("status", { enum: STATUS_ENUM }).default("not_confirmed"),
  order: integer("order").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Add index for projectId and order for faster lookups
  index("idx_faqs_project_id").on(table.projectId),
  index("idx_faqs_project_order").on(table.projectId, table.order),
]);

// L2E Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  question: text("question").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: varchar("correct_answer", { enum: ["a", "b", "c", "d"] }).notNull(),
  status: varchar("status", { enum: STATUS_ENUM }).default("not_confirmed"),
  order: integer("order").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Add index for projectId and order for faster lookups
  index("idx_quiz_questions_project_id").on(table.projectId),
  index("idx_quiz_questions_project_order").on(table.projectId, table.order),
]);

// Marketing Assets
export const marketingAssets = pgTable("marketing_assets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  logoUrl: varchar("logo_url"),
  logoStatus: varchar("logo_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  heroBannerUrl: varchar("hero_banner_url"),
  heroBannerStatus: varchar("hero_banner_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  driveFolder: varchar("drive_folder"),
  driveFolderStatus: varchar("drive_folder_status", { enum: STATUS_ENUM }).default("not_confirmed"),
  additionalAssets: jsonb("additional_assets").default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Add index for projectId for faster lookups
  index("idx_marketing_assets_project_id").on(table.projectId),
]);

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
  // Add a composite index for faster lookups when checking whitelist entries
  index("idx_project_whitelist_project_email").on(table.projectId, table.email),
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
export const insertUserSchema = createInsertSchema(users)
  .pick({
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    profileImageUrl: true,
    role: true,
  })
  .extend({
    // Add email validation
    email: z.string().email("Invalid email format").nullable().optional(),
    // Add URL validation for profile image
    profileImageUrl: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
  });

export const insertProjectSchema = createInsertSchema(projects)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    // Add email validation
    email: z.string().email("Invalid email format"),
  });

import { 
  dateSchema, 
  numericStringSchema, 
  contractAddressSchema, 
  tokenTickerSchema 
} from "./validators";

export const insertIdoMetricsSchema = createInsertSchema(idoMetrics)
  .omit({
    id: true,
    updatedAt: true,
  })
  .extend({
    // Add date validation
    whitelistingDate: dateSchema,
    placingIdoDate: dateSchema,
    claimingDate: dateSchema,
    initialDexListingDate: dateSchema,
    
    // Add numeric validation
    idoPrice: numericStringSchema,
    tokensForSale: numericStringSchema,
    totalAllocationDollars: numericStringSchema,
    tokenPrice: numericStringSchema,
    tgePercentage: z.number().int().min(0).max(100).nullable().optional(),
    
    // Add contract address validation
    contractAddress: contractAddressSchema,
    
    // Add token ticker validation
    tokenTicker: tokenTickerSchema,
  });

export const insertPlatformContentSchema = createInsertSchema(platformContent)
  .omit({
    id: true,
    updatedAt: true,
  })
  .extend({
    // Add URL validation for social links
    telegramUrl: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
    discordUrl: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
    twitterUrl: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
    youtubeUrl: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
    linkedinUrl: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
    roadmapUrl: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
    teamPageUrl: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
    tokenomicsUrl: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
  });

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  updatedAt: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
  updatedAt: true,
});

export const insertMarketingAssetsSchema = createInsertSchema(marketingAssets)
  .omit({
    id: true,
    updatedAt: true,
  })
  .extend({
    // Add URL validation for asset links
    logoUrl: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
    heroBannerUrl: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
    driveFolder: z.string().regex(URL_REGEX, "Invalid URL format").nullable().optional(),
  });

export const insertProjectWhitelistSchema = createInsertSchema(projectWhitelist)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    // Add email validation
    email: z.string().email("Invalid email format"),
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
