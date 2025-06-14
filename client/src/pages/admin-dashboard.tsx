import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Rocket,
  LogOut,
  Plus,
  Search,
  Eye,
  Link2,
  Edit,
  DollarSign,
  TrendingUp,
  Users,
  ChartLine,
  Copy,
} from "lucide-react";
import type { ProjectWithData } from "@shared/schema";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  email: z.string().email("Valid email is required"),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Type-safe user properties
  const userFirstName = (user as any)?.firstName || 'User';
  const userEmail = (user as any)?.email || 'No email';
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

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

  // Admin access is always available in demo mode
  // useEffect(() => {
  //   if (user && user.role !== "admin") {
  //     toast({
  //       title: "Access Denied",
  //       description: "Admin access required.",
  //       variant: "destructive",
  //     });
  //     setLocation("/");
  //   }
  // }, [user, setLocation, toast]);

  const { data: stats } = useQuery<{
    totalRewards: string;
    successfulLaunches: number;
    avgROI: string;
    activeProjects: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectWithData[]>({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/demo-logout";
  };

  const handleViewProject = (projectId: number) => {
    setLocation(`/project/${projectId}`);
  };

  const handleCopyAccessLink = async (project: ProjectWithData) => {
    const link = `${window.location.origin}/project/access/${project.accessToken}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Success",
        description: "Access link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  const calculateProgress = (project: ProjectWithData) => {
    let total = 0;
    let completed = 0;

    // IDO Metrics Tab - tutti i campi obbligatori (22 campi)
    const metrics = project.idoMetrics;
    if (metrics) {
      const fields = [
        metrics.whitelistingDateStatus,
        metrics.placingIdoDateStatus,
        metrics.claimingDateStatus,
        metrics.initialDexListingDateStatus,
        metrics.idoPriceStatus,
        metrics.tokensForSaleStatus,
        metrics.totalAllocationDollarsStatus,
        metrics.tokenPriceStatus,
        metrics.vestingPeriodStatus,
        metrics.cliffPeriodStatus,
        metrics.tgePercentageStatus,
        metrics.totalAllocationNativeTokenStatus,
        metrics.availableAtTgeStatus,
        metrics.cliffLockStatus,
        metrics.networkStatus,
        metrics.minimumTierStatus,
        metrics.gracePeriodStatus,
        metrics.contractAddressStatus,
        metrics.initialMarketCapStatus,
        metrics.fullyDilutedMarketCapStatus,
        metrics.circulatingSupplyTgeStatus,
        metrics.totalSupplyStatus,
        // transactionIdStatus escluso (opzionale)
      ];
      total += fields.length;
      completed += fields.filter(status => status === "confirmed").length;
    }

    // Platform Content Tab - 10 fields (5% each)
    const content = project.platformContent;
    if (content) {
      const fields = [
        content.taglineStatus,          // 5%
        content.descriptionStatus,      // 5%
        content.twitterUrlStatus,       // 5%
        content.telegramUrlStatus,      // 5%
        content.discordUrlStatus,       // 5%
        content.youtubeUrlStatus,       // 5%
        content.linkedinUrlStatus,      // 5%
        content.roadmapUrlStatus,       // 5%
        content.teamPageUrlStatus,      // 5%
        content.tokenomicsUrlStatus,    // 5%
      ];
      total += fields.length;
      completed += fields.filter(status => status === "confirmed").length;
    }

    // Marketing Assets Tab - 3 fields (10% each)
    const assets = project.marketingAssets;
    if (assets) {
      const fields = [
        assets.logoStatus,         // 10%
        assets.heroBannerStatus,   // 10%
        assets.driveFolderStatus,  // 10%
      ];
      total += fields.length;
      completed += fields.filter(status => status === "confirmed").length;
    }

    // FAQ & L2E Tab - 2 sections (2.5% each)
    total += 2;
    if (project.faqs.length > 0) completed += 1;       // 2.5%
    if (project.quizQuestions.length > 0) completed += 1; // 2.5%

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 90) {
      return <Badge className="bg-green-100 text-green-700">Ready for Launch</Badge>;
    } else if (progress >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-700">Needs Review</Badge>;
    }
  };

  const filteredProjects = projects.filter((project: ProjectWithData) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (statusFilter === "all") return true;
    
    const progress = calculateProgress(project);
    switch (statusFilter) {
      case "completed":
        return progress >= 90;
      case "in-progress":
        return progress >= 60 && progress < 90;
      case "needs-review":
        return progress < 60;
      default:
        return true;
    }
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <Rocket className="text-white h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Decubate IDO Platform</h1>
              <Badge variant="secondary" className="ml-3">
                Admin
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span>{userFirstName}</span>
              </div>

              <Button variant="outline" size="sm" onClick={() => window.location.href = '/api/demo-logout'}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.totalRewards || "$3.2M+"}
                    </p>
                    <p className="text-sm text-gray-500">Rewards Distributed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Rocket className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.successfulLaunches || projects.length}
                    </p>
                    <p className="text-sm text-gray-500">Successful Launches</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.avgROI || "6.8x"}
                    </p>
                    <p className="text-sm text-gray-500">Average ROI</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.activeProjects || projects.length}
                    </p>
                    <p className="text-sm text-gray-500">Active Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Project Management Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Project Management</CardTitle>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter project name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="Enter project email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createProjectMutation.isPending}>
                          {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="needs-review">Needs Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {projectsLoading ? (
              <div className="text-center py-8">Loading projects...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {projects.length === 0 ? "No projects yet. Create your first project!" : "No projects match your filters."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProjects.map((project: ProjectWithData) => {
                      const progress = calculateProgress(project);
                      const initials = project.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
                      
                      return (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {initials}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                <div className="text-sm text-gray-500">{project.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Progress value={progress} className="w-16 mr-3" />
                              <span className="text-sm font-medium text-gray-900">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(progress)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewProject(project.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyAccessLink(project)}
                              title="Copy Access Link"
                            >
                              <Link2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewProject(project.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
