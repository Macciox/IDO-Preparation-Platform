import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ChartBar,
  FileText,
  HelpCircle,
  Images,
  Plus,
  Trash2,
  Upload,
  Twitter,
  MessageSquare,
  ExternalLink,
  CloudUpload,
} from "lucide-react";
import type { ProjectWithData } from "@shared/schema";

interface ProjectFormTabsProps {
  project: ProjectWithData;
}

const statusOptions = [
  { value: "confirmed", label: "Confirmed" },
  { value: "not_confirmed", label: "Not Confirmed" },
  { value: "might_change", label: "Might Still Change" },
];

const idoMetricsSchema = z.object({
  whitelistingDate: z.string().optional(),
  whitelistingDateStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  tokenPrice: z.string().optional(),
  tokenPriceStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  totalAllocation: z.string().optional(),
  totalAllocationStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  vestingPeriod: z.number().optional(),
  vestingPeriodStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  cliffPeriod: z.number().optional(),
  cliffPeriodStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  tgePercentage: z.number().optional(),
  tgePercentageStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  transactionId: z.string().optional(),
  transactionIdStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
});

const platformContentSchema = z.object({
  tagline: z.string().optional(),
  taglineStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  description: z.string().optional(),
  descriptionStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  twitterUrl: z.string().optional(),
  twitterUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  telegramUrl: z.string().optional(),
  telegramUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  discordUrl: z.string().optional(),
  discordUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  roadmapUrl: z.string().optional(),
  roadmapUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  teamPageUrl: z.string().optional(),
  teamPageUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  tokenomicsUrl: z.string().optional(),
  tokenomicsUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
});

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  status: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  order: z.number(),
});

const quizQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  correctAnswer: z.enum(["a", "b", "c"]),
  status: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  order: z.number(),
});

const marketingAssetsSchema = z.object({
  logoUrl: z.string().optional(),
  logoStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  heroBannerUrl: z.string().optional(),
  heroBannerStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  driveFolder: z.string().optional(),
  driveFolderStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
});

export default function ProjectFormTabs({ project }: ProjectFormTabsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("metrics");
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);

  // IDO Metrics Form
  const idoMetricsForm = useForm({
    resolver: zodResolver(idoMetricsSchema),
    defaultValues: {
      whitelistingDate: project.idoMetrics?.whitelistingDate ? new Date(project.idoMetrics.whitelistingDate).toISOString().split('T')[0] : "",
      whitelistingDateStatus: project.idoMetrics?.whitelistingDateStatus || "not_confirmed",
      tokenPrice: project.idoMetrics?.tokenPrice || "",
      tokenPriceStatus: project.idoMetrics?.tokenPriceStatus || "not_confirmed",
      totalAllocation: project.idoMetrics?.totalAllocation || "",
      totalAllocationStatus: project.idoMetrics?.totalAllocationStatus || "not_confirmed",
      vestingPeriod: project.idoMetrics?.vestingPeriod || undefined,
      vestingPeriodStatus: project.idoMetrics?.vestingPeriodStatus || "not_confirmed",
      cliffPeriod: project.idoMetrics?.cliffPeriod || undefined,
      cliffPeriodStatus: project.idoMetrics?.cliffPeriodStatus || "not_confirmed",
      tgePercentage: project.idoMetrics?.tgePercentage || undefined,
      tgePercentageStatus: project.idoMetrics?.tgePercentageStatus || "not_confirmed",
      transactionId: project.idoMetrics?.transactionId || "",
      transactionIdStatus: project.idoMetrics?.transactionIdStatus || "not_confirmed",
    },
  });

  // Platform Content Form
  const platformContentForm = useForm({
    resolver: zodResolver(platformContentSchema),
    defaultValues: {
      tagline: project.platformContent?.tagline || "",
      taglineStatus: project.platformContent?.taglineStatus || "not_confirmed",
      description: project.platformContent?.description || "",
      descriptionStatus: project.platformContent?.descriptionStatus || "not_confirmed",
      twitterUrl: project.platformContent?.twitterUrl || "",
      twitterUrlStatus: project.platformContent?.twitterUrlStatus || "not_confirmed",
      telegramUrl: project.platformContent?.telegramUrl || "",
      telegramUrlStatus: project.platformContent?.telegramUrlStatus || "not_confirmed",
      discordUrl: project.platformContent?.discordUrl || "",
      discordUrlStatus: project.platformContent?.discordUrlStatus || "not_confirmed",
      roadmapUrl: project.platformContent?.roadmapUrl || "",
      roadmapUrlStatus: project.platformContent?.roadmapUrlStatus || "not_confirmed",
      teamPageUrl: project.platformContent?.teamPageUrl || "",
      teamPageUrlStatus: project.platformContent?.teamPageUrlStatus || "not_confirmed",
      tokenomicsUrl: project.platformContent?.tokenomicsUrl || "",
      tokenomicsUrlStatus: project.platformContent?.tokenomicsUrlStatus || "not_confirmed",
    },
  });

  // FAQ Form
  const faqForm = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      status: "not_confirmed",
      order: project.faqs.length + 1,
    },
  });

  // Quiz Question Form
  const quizForm = useForm({
    resolver: zodResolver(quizQuestionSchema),
    defaultValues: {
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      correctAnswer: "a",
      status: "not_confirmed",
      order: project.quizQuestions.length + 1,
    },
  });

  // Marketing Assets Form
  const marketingAssetsForm = useForm({
    resolver: zodResolver(marketingAssetsSchema),
    defaultValues: {
      logoUrl: project.marketingAssets?.logoUrl || "",
      logoStatus: project.marketingAssets?.logoStatus || "not_confirmed",
      heroBannerUrl: project.marketingAssets?.heroBannerUrl || "",
      heroBannerStatus: project.marketingAssets?.heroBannerStatus || "not_confirmed",
      driveFolder: project.marketingAssets?.driveFolder || "",
      driveFolderStatus: project.marketingAssets?.driveFolderStatus || "not_confirmed",
    },
  });

  // Mutations
  const updateIdoMetricsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/projects/${project.id}/ido-metrics`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
      toast({ title: "Success", description: "IDO metrics updated successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update IDO metrics.", variant: "destructive" });
    },
  });

  const updatePlatformContentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/projects/${project.id}/platform-content`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
      toast({ title: "Success", description: "Platform content updated successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update platform content.", variant: "destructive" });
    },
  });

  const createFaqMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/projects/${project.id}/faqs`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
      setIsFaqDialogOpen(false);
      faqForm.reset();
      toast({ title: "Success", description: "FAQ added successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to add FAQ.", variant: "destructive" });
    },
  });

  const createQuizQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/projects/${project.id}/quiz-questions`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
      setIsQuizDialogOpen(false);
      quizForm.reset();
      toast({ title: "Success", description: "Quiz question added successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to add quiz question.", variant: "destructive" });
    },
  });

  const updateMarketingAssetsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/projects/${project.id}/marketing-assets`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
      toast({ title: "Success", description: "Marketing assets updated successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update marketing assets.", variant: "destructive" });
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (faqId: number) => {
      await apiRequest("DELETE", `/api/faqs/${faqId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
      toast({ title: "Success", description: "FAQ deleted successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete FAQ.", variant: "destructive" });
    },
  });

  const deleteQuizQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      await apiRequest("DELETE", `/api/quiz-questions/${questionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Quiz question deleted successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete quiz question.", variant: "destructive" });
    },
  });

  // Auto-save functionality
  const handleFormChange = (formType: string, data: any) => {
    // Debounce auto-save
    setTimeout(() => {
      switch (formType) {
        case "idoMetrics":
          updateIdoMetricsMutation.mutate(data);
          break;
        case "platformContent":
          updatePlatformContentMutation.mutate(data);
          break;
        case "marketingAssets":
          updateMarketingAssetsMutation.mutate(data);
          break;
      }
    }, 1000);
  };

  const tabs = [
    { id: "metrics", label: "IDO Metrics", icon: ChartBar },
    { id: "content", label: "Platform Content", icon: FileText },
    { id: "faq", label: "FAQ & L2E", icon: HelpCircle },
    { id: "assets", label: "Marketing Assets", icon: Images },
  ];

  return (
    <Card>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="mr-2 h-4 w-4 inline" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <CardContent className="p-6">
        {/* IDO Metrics Tab */}
        {activeTab === "metrics" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">IDO Metrics Configuration</h3>
            <Form {...idoMetricsForm}>
              <form
                onSubmit={idoMetricsForm.handleSubmit((data) => updateIdoMetricsMutation.mutate(data))}
                onChange={idoMetricsForm.handleSubmit((data) => handleFormChange("idoMetrics", data))}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex space-x-3">
                      <FormField
                        control={idoMetricsForm.control}
                        name="whitelistingDate"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Whitelisting Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={idoMetricsForm.control}
                        name="whitelistingDateStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <FormField
                        control={idoMetricsForm.control}
                        name="tokenPrice"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Token Price (USD)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={idoMetricsForm.control}
                        name="tokenPriceStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <FormField
                        control={idoMetricsForm.control}
                        name="totalAllocation"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Total Allocation</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Total tokens for IDO" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={idoMetricsForm.control}
                        name="totalAllocationStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex space-x-3">
                      <FormField
                        control={idoMetricsForm.control}
                        name="vestingPeriod"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Vesting Period (months)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Vesting duration"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={idoMetricsForm.control}
                        name="vestingPeriodStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <FormField
                        control={idoMetricsForm.control}
                        name="cliffPeriod"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Cliff Period (months)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Cliff duration"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={idoMetricsForm.control}
                        name="cliffPeriodStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <FormField
                        control={idoMetricsForm.control}
                        name="tgePercentage"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>TGE % Release</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                max="100"
                                placeholder="Percentage at TGE"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={idoMetricsForm.control}
                        name="tgePercentageStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <FormField
                    control={idoMetricsForm.control}
                    name="transactionId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Transaction ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Transaction hash for verification" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={idoMetricsForm.control}
                    name="transactionIdStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Platform Content Tab */}
        {activeTab === "content" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Content & Information</h3>
            <Form {...platformContentForm}>
              <form
                onSubmit={platformContentForm.handleSubmit((data) => updatePlatformContentMutation.mutate(data))}
                onChange={platformContentForm.handleSubmit((data) => handleFormChange("platformContent", data))}
                className="space-y-6"
              >
                <div className="flex space-x-3">
                  <FormField
                    control={platformContentForm.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Project Tagline</FormLabel>
                        <FormControl>
                          <Input placeholder="Short, compelling tagline" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={platformContentForm.control}
                    name="taglineStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex space-x-3">
                  <FormField
                    control={platformContentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea rows={4} placeholder="Detailed project description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={platformContentForm.control}
                    name="descriptionStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-4">Social Links</h4>
                    <div className="space-y-3">
                      <div className="flex space-x-3">
                        <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-lg">
                          <Twitter className="h-4 w-4 text-blue-400" />
                        </div>
                        <FormField
                          control={platformContentForm.control}
                          name="twitterUrl"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Twitter URL" {...field} className="rounded-l-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-lg">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                        </div>
                        <FormField
                          control={platformContentForm.control}
                          name="telegramUrl"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Telegram URL" {...field} className="rounded-l-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-lg">
                          <MessageSquare className="h-4 w-4 text-purple-500" />
                        </div>
                        <FormField
                          control={platformContentForm.control}
                          name="discordUrl"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Discord URL" {...field} className="rounded-l-none" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-4">Resource Links</h4>
                    <div className="space-y-3">
                      <div className="flex space-x-3">
                        <FormField
                          control={platformContentForm.control}
                          name="roadmapUrl"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Roadmap URL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={platformContentForm.control}
                          name="roadmapUrlStatus"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <FormField
                          control={platformContentForm.control}
                          name="teamPageUrl"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Team Page URL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={platformContentForm.control}
                          name="teamPageUrlStatus"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <FormField
                          control={platformContentForm.control}
                          name="tokenomicsUrl"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Tokenomics File URL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={platformContentForm.control}
                          name="tokenomicsUrlStatus"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* FAQ & L2E Tab */}
        {activeTab === "faq" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">FAQ & Learn-to-Earn Questions</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* FAQ Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-800">Frequently Asked Questions</h4>
                  <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add FAQ
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New FAQ</DialogTitle>
                      </DialogHeader>
                      <Form {...faqForm}>
                        <form onSubmit={faqForm.handleSubmit((data) => createFaqMutation.mutate(data))} className="space-y-4">
                          <FormField
                            control={faqForm.control}
                            name="question"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Question</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter FAQ question" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={faqForm.control}
                            name="answer"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Answer</FormLabel>
                                <FormControl>
                                  <Textarea rows={3} placeholder="Enter FAQ answer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={faqForm.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {statusOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsFaqDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createFaqMutation.isPending}>
                              {createFaqMutation.isPending ? "Adding..." : "Add FAQ"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-4">
                  {project.faqs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No FAQs yet. Add your first FAQ!
                    </div>
                  ) : (
                    project.faqs.map((faq, index) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-700">FAQ #{index + 1}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant={faq.status === "confirmed" ? "default" : "secondary"}>
                              {faq.status.replace("_", " ")}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFaqMutation.mutate(faq.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-2">{faq.question}</div>
                        <div className="text-sm text-gray-600">{faq.answer}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* L2E Questions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-800">Learn-to-Earn Quiz Questions</h4>
                  <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Quiz Question</DialogTitle>
                      </DialogHeader>
                      <Form {...quizForm}>
                        <form onSubmit={quizForm.handleSubmit((data) => createQuizQuestionMutation.mutate(data))} className="space-y-4">
                          <FormField
                            control={quizForm.control}
                            name="question"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Question</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter quiz question" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={quizForm.control}
                              name="optionA"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Option A</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Option A" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={quizForm.control}
                              name="optionB"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Option B</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Option B" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={quizForm.control}
                              name="optionC"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Option C</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Option C" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={quizForm.control}
                            name="correctAnswer"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Correct Answer</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-6">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="a" id="a" />
                                      <Label htmlFor="a">Option A</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="b" id="b" />
                                      <Label htmlFor="b">Option B</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="c" id="c" />
                                      <Label htmlFor="c">Option C</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={quizForm.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {statusOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsQuizDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createQuizQuestionMutation.isPending}>
                              {createQuizQuestionMutation.isPending ? "Adding..." : "Add Question"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-4">
                  {project.quizQuestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No quiz questions yet. Add your first question!
                    </div>
                  ) : (
                    project.quizQuestions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-700">Question #{index + 1}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant={question.status === "confirmed" ? "default" : "secondary"}>
                              {question.status.replace("_", " ")}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuizQuestionMutation.mutate(question.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-2">{question.question}</div>
                        <div className="space-y-1 text-sm">
                          <div className={`${question.correctAnswer === "a" ? "text-green-600 font-medium" : "text-gray-600"}`}>
                            A. {question.optionA}
                          </div>
                          <div className={`${question.correctAnswer === "b" ? "text-green-600 font-medium" : "text-gray-600"}`}>
                            B. {question.optionB}
                          </div>
                          <div className={`${question.correctAnswer === "c" ? "text-green-600 font-medium" : "text-gray-600"}`}>
                            C. {question.optionC}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Marketing Assets Tab */}
        {activeTab === "assets" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Marketing Assets & Media</h3>
            <Form {...marketingAssetsForm}>
              <form
                onSubmit={marketingAssetsForm.handleSubmit((data) => updateMarketingAssetsMutation.mutate(data))}
                onChange={marketingAssetsForm.handleSubmit((data) => handleFormChange("marketingAssets", data))}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Logo Upload */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-4">Project Logo</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/30 transition-colors duration-200">
                      <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                        {project.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Current logo preview</div>
                      <FormField
                        control={marketingAssetsForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Logo URL" {...field} className="mb-2" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="default" className="mb-2">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Logo
                      </Button>
                      <p className="text-xs text-gray-500 mb-3">PNG, JPG up to 2MB</p>
                      <FormField
                        control={marketingAssetsForm.control}
                        name="logoStatus"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="max-w-xs mx-auto">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Hero Banner Upload */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-4">Hero Banner</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/30 transition-colors duration-200">
                      <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                        <span className="text-white font-semibold">1200x400 Hero Banner</span>
                      </div>
                      <FormField
                        control={marketingAssetsForm.control}
                        name="heroBannerUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Hero Banner URL" {...field} className="mb-2" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="default" className="mb-2">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Hero Banner
                      </Button>
                      <p className="text-xs text-gray-500 mb-3">Recommended: 1200x400px, PNG/JPG up to 5MB</p>
                      <FormField
                        control={marketingAssetsForm.control}
                        name="heroBannerStatus"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="max-w-xs mx-auto">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Assets */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-4">Additional Marketing Materials</h4>
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <FormField
                        control={marketingAssetsForm.control}
                        name="driveFolder"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Google Drive Folder Link</FormLabel>
                            <FormControl>
                              <Input placeholder="Shared Google Drive folder with all assets" {...field} />
                            </FormControl>
                            <p className="text-xs text-gray-500 mt-1">
                              Include logos, banners, infographics, videos, and other marketing materials
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={marketingAssetsForm.control}
                        name="driveFolderStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Uploaded Files</h5>
                        <div className="text-center py-4 text-gray-500">
                          No files uploaded yet.
                        </div>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary/30 transition-colors duration-200">
                        <CloudUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Drop files here or click to upload</p>
                        <Button type="button" variant="outline" size="sm" className="mt-2">
                          Choose Files
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
