import {
  users,
  projects,
  idoMetrics,
  platformContent,
  faqs,
  quizQuestions,
  marketingAssets,
  projectWhitelist,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type ProjectWithData,
  type InsertIdoMetrics,
  type IdoMetrics,
  type InsertPlatformContent,
  type PlatformContent,
  type InsertFaq,
  type Faq,
  type InsertQuizQuestion,
  type QuizQuestion,
  type InsertMarketingAssets,
  type MarketingAssets,
  type InsertProjectWhitelist,
  type ProjectWhitelist,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  createProject(project: Omit<InsertProject, "accessToken" | "slug">): Promise<Project>;
  getProjectById(id: number): Promise<ProjectWithData | undefined>;
  getProjectBySlug(slug: string): Promise<ProjectWithData | undefined>;
  getProjectByAccessToken(token: string): Promise<ProjectWithData | undefined>;
  getAllProjects(): Promise<ProjectWithData[]>;
  getUserProjects(userId: string): Promise<ProjectWithData[]>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // IDO Metrics operations
  upsertIdoMetrics(data: InsertIdoMetrics): Promise<IdoMetrics>;
  getIdoMetrics(projectId: number): Promise<IdoMetrics | undefined>;
  
  // Platform Content operations
  upsertPlatformContent(data: InsertPlatformContent): Promise<PlatformContent>;
  getPlatformContent(projectId: number): Promise<PlatformContent | undefined>;
  
  // FAQ operations
  upsertFaq(data: InsertFaq): Promise<Faq>;
  getProjectFaqs(projectId: number): Promise<Faq[]>;
  deleteFaq(id: number): Promise<boolean>;
  
  // Quiz Question operations
  upsertQuizQuestion(data: InsertQuizQuestion): Promise<QuizQuestion>;
  getProjectQuizQuestions(projectId: number): Promise<QuizQuestion[]>;
  deleteQuizQuestion(id: number): Promise<boolean>;
  
  // Marketing Assets operations
  upsertMarketingAssets(data: InsertMarketingAssets): Promise<MarketingAssets>;
  getMarketingAssets(projectId: number): Promise<MarketingAssets | undefined>;
  
  // Project Whitelist operations
  addToWhitelist(data: InsertProjectWhitelist): Promise<ProjectWhitelist>;
  removeFromWhitelist(projectId: number, email: string): Promise<boolean>;
  getProjectWhitelist(projectId: number): Promise<ProjectWhitelist[]>;
  isEmailWhitelisted(projectId: number, email: string): Promise<boolean>;
  getUserWhitelistedProjects(email: string): Promise<ProjectWithData[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Project operations
  async createProject(projectData: Omit<InsertProject, "accessToken" | "slug">): Promise<Project> {
    const slug = projectData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const accessToken = nanoid(32);
    
    const [project] = await db
      .insert(projects)
      .values({
        ...projectData,
        slug,
        accessToken,
      })
      .returning();
    
    // Initialize records with all status fields set to "not_confirmed"
    await this.upsertIdoMetrics({ 
      projectId: project.id,
      // Important Dates
      whitelistingDateStatus: "not_confirmed",
      placingIdoDateStatus: "not_confirmed", 
      claimingDateStatus: "not_confirmed",
      initialDexListingDateStatus: "not_confirmed",
      // Token Metrics (6 fields from user specification)
      totalAllocationDollarsStatus: "not_confirmed",
      tokenPriceEventStatus: "not_confirmed",
      totalAllocationNativeTokenStatus: "not_confirmed",
      availableAtTgeStatus: "not_confirmed",
      cliffLockStatus: "not_confirmed",
      vestingDurationStatus: "not_confirmed",
      // Project Details
      tokenTickerStatus: "not_confirmed",
      networkStatus: "not_confirmed",
      gracePeriodStatus: "not_confirmed",
      minimumTierStatus: "not_confirmed",
      transactionIdStatus: "not_confirmed",
      contractAddressStatus: "not_confirmed",
      // Token Info
      initialMarketCapExLiquidityStatus: "not_confirmed",
      initialMarketCapStatus: "not_confirmed",
      fullyDilutedMarketCapStatus: "not_confirmed",
      circulatingSupplyTgeStatus: "not_confirmed",
      circulatingSupplyTgePercentStatus: "not_confirmed",
      totalSupplyStatus: "not_confirmed"
    });
    
    await this.upsertPlatformContent({ 
      projectId: project.id,
      taglineStatus: "not_confirmed",
      descriptionStatus: "not_confirmed",
      twitterUrlStatus: "not_confirmed",
      telegramUrlStatus: "not_confirmed",
      discordUrlStatus: "not_confirmed",
      youtubeUrlStatus: "not_confirmed",
      linkedinUrlStatus: "not_confirmed",
      roadmapUrlStatus: "not_confirmed",
      teamPageUrlStatus: "not_confirmed",
      tokenomicsUrlStatus: "not_confirmed"
    });
    
    await this.upsertMarketingAssets({ 
      projectId: project.id,
      logoStatus: "not_confirmed",
      heroBannerStatus: "not_confirmed",
      driveFolderStatus: "not_confirmed"
    });
    
    return project;
  }

  async getProjectById(id: number): Promise<ProjectWithData | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .innerJoin(users, eq(projects.userId, users.id));
    
    if (!project) return undefined;
    
    const [idoMetricsData] = await db
      .select()
      .from(idoMetrics)
      .where(eq(idoMetrics.projectId, id));
    
    const [platformContentData] = await db
      .select()
      .from(platformContent)
      .where(eq(platformContent.projectId, id));
    
    const [marketingAssetsData] = await db
      .select()
      .from(marketingAssets)
      .where(eq(marketingAssets.projectId, id));
    
    const faqsData = await db
      .select()
      .from(faqs)
      .where(eq(faqs.projectId, id))
      .orderBy(faqs.order);
    
    const quizQuestionsData = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.projectId, id))
      .orderBy(quizQuestions.order);
    
    return {
      ...project.projects,
      user: project.users,
      idoMetrics: idoMetricsData,
      platformContent: platformContentData,
      marketingAssets: marketingAssetsData,
      faqs: faqsData,
      quizQuestions: quizQuestionsData,
    };
  }

  async getProjectBySlug(slug: string): Promise<ProjectWithData | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .innerJoin(users, eq(projects.userId, users.id));
    
    if (!project) return undefined;
    return this.getProjectById(project.projects.id);
  }

  async getProjectByAccessToken(token: string): Promise<ProjectWithData | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.accessToken, token))
      .innerJoin(users, eq(projects.userId, users.id));
    
    if (!project) return undefined;
    return this.getProjectById(project.projects.id);
  }

  async getAllProjects(): Promise<ProjectWithData[]> {
    // Optimize by using a single query with joins instead of N+1 queries
    const projectsData = await db
      .select({
        project: projects,
        user: users,
        idoMetrics: idoMetrics,
        platformContent: platformContent,
        marketingAssets: marketingAssets,
      })
      .from(projects)
      .innerJoin(users, eq(projects.userId, users.id))
      .leftJoin(idoMetrics, eq(projects.id, idoMetrics.projectId))
      .leftJoin(platformContent, eq(projects.id, platformContent.projectId))
      .leftJoin(marketingAssets, eq(projects.id, marketingAssets.projectId))
      .orderBy(desc(projects.updatedAt));
    
    const projectsWithData: ProjectWithData[] = [];
    
    for (const row of projectsData) {
      const projectFaqs = await db.select().from(faqs).where(eq(faqs.projectId, row.project.id));
      const projectQuizQuestions = await db.select().from(quizQuestions).where(eq(quizQuestions.projectId, row.project.id));
      
      projectsWithData.push({
        ...row.project,
        user: row.user,
        idoMetrics: row.idoMetrics || undefined,
        platformContent: row.platformContent || undefined,
        marketingAssets: row.marketingAssets || undefined,
        faqs: projectFaqs,
        quizQuestions: projectQuizQuestions,
      });
    }
    
    return projectsWithData;
  }

  async getUserProjects(userId: string): Promise<ProjectWithData[]> {
    // Optimize by using a single query with joins instead of N+1 queries
    const projectsData = await db
      .select({
        project: projects,
        user: users,
        idoMetrics: idoMetrics,
        platformContent: platformContent,
        marketingAssets: marketingAssets,
      })
      .from(projects)
      .where(eq(projects.userId, userId))
      .innerJoin(users, eq(projects.userId, users.id))
      .leftJoin(idoMetrics, eq(projects.id, idoMetrics.projectId))
      .leftJoin(platformContent, eq(projects.id, platformContent.projectId))
      .leftJoin(marketingAssets, eq(projects.id, marketingAssets.projectId))
      .orderBy(desc(projects.updatedAt));
    
    const projectsWithData: ProjectWithData[] = [];
    
    for (const row of projectsData) {
      const projectFaqs = await db.select().from(faqs).where(eq(faqs.projectId, row.project.id));
      const projectQuizQuestions = await db.select().from(quizQuestions).where(eq(quizQuestions.projectId, row.project.id));
      
      projectsWithData.push({
        ...row.project,
        user: row.user,
        idoMetrics: row.idoMetrics || undefined,
        platformContent: row.platformContent || undefined,
        marketingAssets: row.marketingAssets || undefined,
        faqs: projectFaqs,
        quizQuestions: projectQuizQuestions,
      });
    }
    
    return projectsWithData;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: number): Promise<boolean> {
    // Delete related data first
    await db.delete(faqs).where(eq(faqs.projectId, id));
    await db.delete(quizQuestions).where(eq(quizQuestions.projectId, id));
    await db.delete(marketingAssets).where(eq(marketingAssets.projectId, id));
    await db.delete(platformContent).where(eq(platformContent.projectId, id));
    await db.delete(idoMetrics).where(eq(idoMetrics.projectId, id));
    
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }
  
  // IDO Metrics operations
  async upsertIdoMetrics(data: InsertIdoMetrics): Promise<IdoMetrics> {
    // Check if record exists
    const existing = await this.getIdoMetrics(data.projectId);
    
    if (existing) {
      // Update existing record
      const [result] = await db
        .update(idoMetrics)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(idoMetrics.projectId, data.projectId))
        .returning();
      return result;
    } else {
      // Insert new record
      const [result] = await db
        .insert(idoMetrics)
        .values(data)
        .returning();
      return result;
    }
  }

  async getIdoMetrics(projectId: number): Promise<IdoMetrics | undefined> {
    const [result] = await db
      .select()
      .from(idoMetrics)
      .where(eq(idoMetrics.projectId, projectId));
    return result;
  }
  
  // Platform Content operations
  async upsertPlatformContent(data: InsertPlatformContent): Promise<PlatformContent> {
    // Check if record exists
    const existing = await this.getPlatformContent(data.projectId);
    
    if (existing) {
      // Update existing record
      const [result] = await db
        .update(platformContent)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(platformContent.projectId, data.projectId))
        .returning();
      return result;
    } else {
      // Insert new record
      const [result] = await db
        .insert(platformContent)
        .values(data)
        .returning();
      return result;
    }
  }

  async getPlatformContent(projectId: number): Promise<PlatformContent | undefined> {
    const [result] = await db
      .select()
      .from(platformContent)
      .where(eq(platformContent.projectId, projectId));
    return result;
  }
  
  // FAQ operations
  async upsertFaq(data: InsertFaq): Promise<Faq> {
    if (data.id) {
      const [result] = await db
        .update(faqs)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(faqs.id, data.id))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(faqs)
        .values(data)
        .returning();
      return result;
    }
  }

  async getProjectFaqs(projectId: number): Promise<Faq[]> {
    return db
      .select()
      .from(faqs)
      .where(eq(faqs.projectId, projectId))
      .orderBy(faqs.order);
  }

  async deleteFaq(id: number): Promise<boolean> {
    const result = await db.delete(faqs).where(eq(faqs.id, id));
    return result.rowCount > 0;
  }
  
  // Quiz Question operations
  async upsertQuizQuestion(data: InsertQuizQuestion): Promise<QuizQuestion> {
    if (data.id) {
      const [result] = await db
        .update(quizQuestions)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(quizQuestions.id, data.id))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(quizQuestions)
        .values(data)
        .returning();
      return result;
    }
  }

  async getProjectQuizQuestions(projectId: number): Promise<QuizQuestion[]> {
    return db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.projectId, projectId))
      .orderBy(quizQuestions.order);
  }

  async deleteQuizQuestion(id: number): Promise<boolean> {
    const result = await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
    return result.rowCount > 0;
  }
  
  // Marketing Assets operations
  async upsertMarketingAssets(data: InsertMarketingAssets): Promise<MarketingAssets> {
    // Check if record exists
    const existing = await this.getMarketingAssets(data.projectId);
    
    if (existing) {
      // Update existing record
      const [result] = await db
        .update(marketingAssets)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(marketingAssets.projectId, data.projectId))
        .returning();
      return result;
    } else {
      // Insert new record
      const [result] = await db
        .insert(marketingAssets)
        .values(data)
        .returning();
      return result;
    }
  }

  async getMarketingAssets(projectId: number): Promise<MarketingAssets | undefined> {
    const [result] = await db
      .select()
      .from(marketingAssets)
      .where(eq(marketingAssets.projectId, projectId));
    return result;
  }

  // Project Whitelist operations
  async addToWhitelist(data: InsertProjectWhitelist): Promise<ProjectWhitelist> {
    const [whitelist] = await db
      .insert(projectWhitelist)
      .values(data)
      .returning();
    return whitelist;
  }

  async removeFromWhitelist(projectId: number, email: string): Promise<boolean> {
    const result = await db
      .delete(projectWhitelist)
      .where(and(
        eq(projectWhitelist.projectId, projectId),
        eq(projectWhitelist.email, email)
      ));
    return (result.rowCount || 0) > 0;
  }

  async getProjectWhitelist(projectId: number): Promise<ProjectWhitelist[]> {
    return db.select().from(projectWhitelist).where(eq(projectWhitelist.projectId, projectId));
  }

  async isEmailWhitelisted(projectId: number, email: string): Promise<boolean> {
    const [entry] = await db
      .select()
      .from(projectWhitelist)
      .where(and(
        eq(projectWhitelist.projectId, projectId),
        eq(projectWhitelist.email, email)
      ));
    return !!entry;
  }

  async getUserWhitelistedProjects(email: string): Promise<ProjectWithData[]> {
    const whitelistedProjects = await db
      .select({
        project: projects,
        user: users,
        idoMetrics: idoMetrics,
        platformContent: platformContent,
        marketingAssets: marketingAssets,
      })
      .from(projectWhitelist)
      .innerJoin(projects, eq(projectWhitelist.projectId, projects.id))
      .innerJoin(users, eq(projects.userId, users.id))
      .leftJoin(idoMetrics, eq(projects.id, idoMetrics.projectId))
      .leftJoin(platformContent, eq(projects.id, platformContent.projectId))
      .leftJoin(marketingAssets, eq(projects.id, marketingAssets.projectId))
      .where(eq(projectWhitelist.email, email));

    const projectsWithData: ProjectWithData[] = [];

    for (const row of whitelistedProjects) {
      const projectFaqs = await db.select().from(faqs).where(eq(faqs.projectId, row.project.id));
      const projectQuizQuestions = await db.select().from(quizQuestions).where(eq(quizQuestions.projectId, row.project.id));

      projectsWithData.push({
        ...row.project,
        user: row.user,
        idoMetrics: row.idoMetrics || undefined,
        platformContent: row.platformContent || undefined,
        marketingAssets: row.marketingAssets || undefined,
        faqs: projectFaqs,
        quizQuestions: projectQuizQuestions,
      });
    }

    return projectsWithData;
  }
}

export const storage = new DatabaseStorage();
