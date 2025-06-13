import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Save } from "lucide-react";
import ProjectFormTabs from "@/components/project-form-tabs";
import type { ProjectWithData } from "@shared/schema";

export default function ProjectDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const projectId = params.id ? parseInt(params.id) : null;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // For admin users viewing a specific project
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: projectId ? ["/api/projects", projectId] : ["/api/projects"],
    queryFn: async () => {
      if (projectId) {
        const response = await fetch(`/api/projects/${projectId}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
        return response.json();
      } else {
        // For project users, get their projects
        const response = await fetch("/api/projects", {
          credentials: "include",
        });
        if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
        const projects = await response.json();
        return projects[0]; // Return first project for project users
      }
    },
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleSaveProgress = () => {
    toast({
      title: "Success",
      description: "Progress saved successfully!",
    });
  };

  const calculateProgress = (project: ProjectWithData) => {
    let total = 0;
    let completed = 0;

    // IDO Metrics (19 fields - excluding optional Transaction ID)
    const metrics = project.idoMetrics;
    if (metrics) {
      const fields = [
        metrics.whitelistingDateStatus,
        metrics.placingIdoDateStatus,
        metrics.claimingDateStatus,
        metrics.initialDexListingDateStatus,
        metrics.totalAllocationDollarsStatus,
        metrics.tokenPriceEventStatus,
        metrics.totalAllocationNativeTokenStatus,
        metrics.availableAtTgeStatus,
        metrics.cliffLockStatus,
        metrics.vestingDurationStatus,
        metrics.tokenTickerStatus,
        metrics.networkStatus,
        metrics.gracePeriodStatus,
        metrics.minimumTierStatus,
        metrics.tokenContractAddressStatus,
        metrics.initialMarketCapExLiquidityStatus,
        metrics.initialMarketCapStatus,
        metrics.fullyDilutedMarketCapStatus,
        metrics.circulatingSupplyTgeStatus,
        // Note: tokenTransferTxIdStatus is excluded as it's optional
      ];
      total += fields.length;
      completed += fields.filter(status => status === "confirmed").length;
    }

    // Platform Content (8 fields)
    const content = project.platformContent;
    if (content) {
      const fields = [
        content.taglineStatus,
        content.descriptionStatus,
        content.twitterUrlStatus,
        content.telegramUrlStatus,
        content.discordUrlStatus,
        content.roadmapUrlStatus,
        content.teamPageUrlStatus,
        content.tokenomicsUrlStatus,
      ];
      total += fields.length;
      completed += fields.filter(status => status === "confirmed").length;
    }

    // Marketing Assets (3 fields)
    const assets = project.marketingAssets;
    if (assets) {
      const fields = [
        assets.logoStatus,
        assets.heroBannerStatus,
        assets.driveFolderStatus,
      ];
      total += fields.length;
      completed += fields.filter(status => status === "confirmed").length;
    }

    // FAQs and Quiz Questions (check if they exist)
    total += 2; // FAQ and Quiz sections
    if (project.faqs.length > 0) completed += 1;
    if (project.quizQuestions.length > 0) completed += 1;

    return Math.round((completed / total) * 100);
  };

  const getSectionProgress = (project: ProjectWithData) => {
    const sections = {
      metrics: 0,
      content: 0,
      faq: 0,
      assets: 0,
    };

    // IDO Metrics
    if (project.idoMetrics) {
      const fields = [
        project.idoMetrics.whitelistingDateStatus,
        project.idoMetrics.tokenPriceStatus,
        project.idoMetrics.totalAllocationStatus,
        project.idoMetrics.vestingPeriodStatus,
        project.idoMetrics.cliffPeriodStatus,
        project.idoMetrics.tgePercentageStatus,
        project.idoMetrics.transactionIdStatus,
      ];
      sections.metrics = Math.round((fields.filter(s => s === "confirmed").length / fields.length) * 100);
    }

    // Platform Content
    if (project.platformContent) {
      const fields = [
        project.platformContent.taglineStatus,
        project.platformContent.descriptionStatus,
        project.platformContent.roadmapUrlStatus,
        project.platformContent.teamPageUrlStatus,
        project.platformContent.tokenomicsUrlStatus,
      ];
      sections.content = Math.round((fields.filter(s => s === "confirmed").length / fields.length) * 100);
    }

    // FAQ & L2E
    sections.faq = (project.faqs.length > 0 && project.quizQuestions.length > 0) ? 100 : 
                  (project.faqs.length > 0 || project.quizQuestions.length > 0) ? 50 : 0;

    // Marketing Assets
    if (project.marketingAssets) {
      const fields = [
        project.marketingAssets.logoStatus,
        project.marketingAssets.heroBannerStatus,
        project.marketingAssets.driveFolderStatus,
      ];
      sections.assets = Math.round((fields.filter(s => s === "confirmed").length / fields.length) * 100);
    }

    return sections;
  };

  if (isLoading || projectLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">No Project Found</h1>
              <p className="text-gray-600 mb-4">
                {user?.role === "admin" ? "The requested project does not exist." : "You don't have any projects yet."}
              </p>
              {user?.role === "admin" && (
                <Button onClick={() => setLocation("/")}>
                  Back to Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress(project);
  const sectionProgress = getSectionProgress(project);
  const initials = project.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-semibold">{initials}</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-500">IDO Preparation Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Progress: <span className="font-medium text-gray-900">{progress}%</span>
              </div>
              <Button onClick={handleSaveProgress}>
                <Save className="mr-2 h-4 w-4" />
                Save Progress
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-xl text-white p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to your IDO Preparation Hub</h2>
              <p className="text-blue-100 mb-4">Complete all sections to ensure a successful launch on Decubate</p>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">$3.2M+</div>
                  <div className="text-sm text-blue-100">Rewards Distributed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">34+</div>
                  <div className="text-sm text-blue-100">Successful Launches</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">6.8x</div>
                  <div className="text-sm text-blue-100">Average ROI</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-3xl font-bold">{progress}%</div>
                <div className="text-sm">Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Form Tabs */}
        <ProjectFormTabs project={project} />

        {/* Progress Summary Card */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                  <div className={`absolute inset-0 rounded-full ${sectionProgress.metrics >= 90 ? 'bg-green-100' : sectionProgress.metrics >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}></div>
                  <div className={`relative z-10 font-semibold ${sectionProgress.metrics >= 90 ? 'text-green-600' : sectionProgress.metrics >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {sectionProgress.metrics}%
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">IDO Metrics</p>
                <p className={`text-xs ${sectionProgress.metrics >= 90 ? 'text-green-600' : sectionProgress.metrics >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {sectionProgress.metrics >= 90 ? 'Ready' : sectionProgress.metrics >= 60 ? 'In Progress' : 'Needs Attention'}
                </p>
              </div>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                  <div className={`absolute inset-0 rounded-full ${sectionProgress.content >= 90 ? 'bg-green-100' : sectionProgress.content >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}></div>
                  <div className={`relative z-10 font-semibold ${sectionProgress.content >= 90 ? 'text-green-600' : sectionProgress.content >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {sectionProgress.content}%
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">Platform Content</p>
                <p className={`text-xs ${sectionProgress.content >= 90 ? 'text-green-600' : sectionProgress.content >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {sectionProgress.content >= 90 ? 'Ready' : sectionProgress.content >= 60 ? 'In Progress' : 'Needs Attention'}
                </p>
              </div>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                  <div className={`absolute inset-0 rounded-full ${sectionProgress.faq >= 90 ? 'bg-green-100' : sectionProgress.faq >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}></div>
                  <div className={`relative z-10 font-semibold ${sectionProgress.faq >= 90 ? 'text-green-600' : sectionProgress.faq >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {sectionProgress.faq}%
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">FAQ & L2E</p>
                <p className={`text-xs ${sectionProgress.faq >= 90 ? 'text-green-600' : sectionProgress.faq >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {sectionProgress.faq >= 90 ? 'Ready' : sectionProgress.faq >= 60 ? 'In Progress' : 'Needs Attention'}
                </p>
              </div>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                  <div className={`absolute inset-0 rounded-full ${sectionProgress.assets >= 90 ? 'bg-green-100' : sectionProgress.assets >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}></div>
                  <div className={`relative z-10 font-semibold ${sectionProgress.assets >= 90 ? 'text-green-600' : sectionProgress.assets >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {sectionProgress.assets}%
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">Marketing Assets</p>
                <p className={`text-xs ${sectionProgress.assets >= 90 ? 'text-green-600' : sectionProgress.assets >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {sectionProgress.assets >= 90 ? 'Ready' : sectionProgress.assets >= 60 ? 'In Progress' : 'Needs Attention'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
