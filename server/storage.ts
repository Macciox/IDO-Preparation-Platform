import {
  users,
  projects,
  idoMetrics,
  platformContent,
  faqs,
  quizQuestions,
  marketingAssets,
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
    
    // Initialize empty records for all sections
    await this.upsertIdoMetrics({ projectId: project.id });
    await this.upsertPlatformContent({ projectId: project.id });
    await this.upsertMarketingAssets({ projectId: project.id });
    
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
    const projectsData = await db
      .select()
      .from(projects)
      .innerJoin(users, eq(projects.userId, users.id))
      .orderBy(desc(projects.updatedAt));
    
    const projectsWithData = await Promise.all(
      projectsData.map(p => this.getProjectById(p.projects.id))
    );
    
    return projectsWithData.filter(Boolean) as ProjectWithData[];
  }

  async getUserProjects(userId: string): Promise<ProjectWithData[]> {
    const projectsData = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .innerJoin(users, eq(projects.userId, users.id))
      .orderBy(desc(projects.updatedAt));
    
    const projectsWithData = await Promise.all(
      projectsData.map(p => this.getProjectById(p.projects.id))
    );
    
    return projectsWithData.filter(Boolean) as ProjectWithData[];
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
    const [result] = await db
      .insert(idoMetrics)
      .values(data)
      .onConflictDoUpdate({
        target: idoMetrics.projectId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return result;
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
    const [result] = await db
      .insert(platformContent)
      .values(data)
      .onConflictDoUpdate({
        target: platformContent.projectId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return result;
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
    const [result] = await db
      .insert(marketingAssets)
      .values(data)
      .onConflictDoUpdate({
        target: marketingAssets.projectId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  async getMarketingAssets(projectId: number): Promise<MarketingAssets | undefined> {
    const [result] = await db
      .select()
      .from(marketingAssets)
      .where(eq(marketingAssets.projectId, projectId));
    return result;
  }
}

export const storage = new DatabaseStorage();
