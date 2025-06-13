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
  placingIdoDate: z.string().optional(),
  placingIdoDateStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  claimingDate: z.string().optional(),
  claimingDateStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  initialDexListingDate: z.string().optional(),
  initialDexListingDateStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
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
  order: z.number().default(0),
  status: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
});

const quizQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  correctAnswer: z.enum(["a", "b", "c"]),
  order: z.number().default(0),
  status: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
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
  const [activeTab, setActiveTab] = useState("metrics");
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const { toast } = useToast();

  const tabs = [
    { id: "metrics", label: "IDO Metrics", icon: ChartBar },
    { id: "content", label: "Platform Content", icon: FileText },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "quiz", label: "Quiz", icon: FileText },
    { id: "assets", label: "Marketing Assets", icon: Images },
  ];

  // Form setup
  const idoMetricsForm = useForm<z.infer<typeof idoMetricsSchema>>({
    resolver: zodResolver(idoMetricsSchema),
    defaultValues: {
      whitelistingDate: project.idoMetrics?.whitelistingDate ? new Date(project.idoMetrics.whitelistingDate).toISOString().split('T')[0] : "",
      whitelistingDateStatus: project.idoMetrics?.whitelistingDateStatus || "not_confirmed",
      placingIdoDate: project.idoMetrics?.placingIdoDate ? new Date(project.idoMetrics.placingIdoDate).toISOString().split('T')[0] : "",
      placingIdoDateStatus: project.idoMetrics?.placingIdoDateStatus || "not_confirmed",
      claimingDate: project.idoMetrics?.claimingDate ? new Date(project.idoMetrics.claimingDate).toISOString().split('T')[0] : "",
      claimingDateStatus: project.idoMetrics?.claimingDateStatus || "not_confirmed",
      initialDexListingDate: project.idoMetrics?.initialDexListingDate ? new Date(project.idoMetrics.initialDexListingDate).toISOString().split('T')[0] : "",
      initialDexListingDateStatus: project.idoMetrics?.initialDexListingDateStatus || "not_confirmed",
      tokenPrice: project.idoMetrics?.tokenPrice?.toString() || "",
      tokenPriceStatus: project.idoMetrics?.tokenPriceStatus || "not_confirmed",
      totalAllocation: project.idoMetrics?.totalAllocationDollars?.toString() || "",
      totalAllocationStatus: project.idoMetrics?.totalAllocationDollarsStatus || "not_confirmed",
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

  const platformContentForm = useForm<z.infer<typeof platformContentSchema>>({
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

  const faqForm = useForm<z.infer<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      order: project.faqs.length + 1,
      status: "not_confirmed",
    },
  });

  const quizForm = useForm<z.infer<typeof quizQuestionSchema>>({
    resolver: zodResolver(quizQuestionSchema),
    defaultValues: {
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      correctAnswer: "a",
      order: project.quizQuestions.length + 1,
      status: "not_confirmed",
    },
  });

  const marketingAssetsForm = useForm<z.infer<typeof marketingAssetsSchema>>({
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
    mutationFn: async (data: z.infer<typeof idoMetricsSchema>) => {
      const payload = {
        ...data,
        whitelistingDate: data.whitelistingDate ? new Date(data.whitelistingDate) : null,
        placingIdoDate: data.placingIdoDate ? new Date(data.placingIdoDate) : null,
        claimingDate: data.claimingDate ? new Date(data.claimingDate) : null,
        initialDexListingDate: data.initialDexListingDate ? new Date(data.initialDexListingDate) : null,
        tokenPrice: data.tokenPrice ? parseFloat(data.tokenPrice) : null,
        totalAllocation: data.totalAllocation ? parseFloat(data.totalAllocation) : null,
        projectId: project.id,
      };
      return apiRequest(`/api/projects/${project.id}/ido-metrics`, "POST", payload);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      console.error("Failed to update IDO metrics:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  const updatePlatformContentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof platformContentSchema>) => {
      return apiRequest(`/api/projects/${project.id}/platform-content`, "POST", { ...data, projectId: project.id });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      console.error("Failed to update platform content:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  const updateMarketingAssetsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof marketingAssetsSchema>) => {
      return apiRequest(`/api/projects/${project.id}/marketing-assets`, "POST", { ...data, projectId: project.id });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      console.error("Failed to update marketing assets:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  const createFaqMutation = useMutation({
    mutationFn: async (data: z.infer<typeof faqSchema>) => {
      return apiRequest(`/api/projects/${project.id}/faqs`, "POST", { ...data, projectId: project.id });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      console.error("Failed to create FAQ:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
      setIsFaqDialogOpen(false);
      faqForm.reset();
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (faqId: number) => {
      return apiRequest(`/api/faqs/${faqId}`, "DELETE");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      console.error("Failed to delete FAQ:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  const createQuizQuestionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof quizQuestionSchema>) => {
      return apiRequest(`/api/projects/${project.id}/quiz-questions`, "POST", { ...data, projectId: project.id });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      console.error("Failed to create quiz question:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
      setIsQuizDialogOpen(false);
      quizForm.reset();
    },
  });

  const deleteQuizQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      return apiRequest(`/api/quiz-questions/${questionId}`, "DELETE");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      console.error("Failed to delete quiz question:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  const handleFormChange = (formType: string, data: any) => {
    // Auto-save functionality if needed
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* IDO Metrics Tab */}
        {activeTab === "metrics" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">IDO Metrics Configuration</h3>
            <Form {...idoMetricsForm}>
              <form
                onSubmit={idoMetricsForm.handleSubmit((data) => updateIdoMetricsMutation.mutate(data))}
                className="space-y-6"
              >
                {/* Dates Section */}
                <div className="mb-8">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Important Dates
                  </h4>
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
                          name="placingIdoDate"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Placing IDO Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={idoMetricsForm.control}
                          name="placingIdoDateStatus"
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
                          name="claimingDate"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Claiming Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={idoMetricsForm.control}
                          name="claimingDateStatus"
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
                          name="initialDexListingDate"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Initial DEX Listing Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={idoMetricsForm.control}
                          name="initialDexListingDateStatus"
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
                </div>

                {/* Token Economics Section */}
                <div className="mb-8">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Token Economics
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="flex space-x-3">
                        <FormField
                          control={idoMetricsForm.control}
                          name="tokenPrice"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Token Price (USD)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.000001"
                                  placeholder="0.50"
                                  {...field}
                                />
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
                              <FormLabel>Total Allocation (USD)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="1000000"
                                  {...field}
                                />
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
                                  placeholder="12"
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
                                  placeholder="3"
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
                              <FormLabel>TGE Percentage</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="20"
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
                </div>

                {/* Optional Transaction ID Section */}
                <div className="mb-8">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Transaction Information (Optional)
                  </h4>
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
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updateIdoMetricsMutation.isPending}>
                    {updateIdoMetricsMutation.isPending ? "Saving..." : "Save Progress"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Platform Content Tab */}
        {activeTab === "content" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Content Configuration</h3>
            <Form {...platformContentForm}>
              <form
                onSubmit={platformContentForm.handleSubmit((data) => updatePlatformContentMutation.mutate(data))}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex space-x-3">
                      <FormField
                        control={platformContentForm.control}
                        name="tagline"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Project Tagline</FormLabel>
                            <FormControl>
                              <Input placeholder="Catchy project description" {...field} />
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
                              <Textarea
                                {...field}
                                rows={4}
                                placeholder="Detailed project description"
                              />
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

                    <div className="flex space-x-3">
                      <FormField
                        control={platformContentForm.control}
                        name="twitterUrl"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Twitter URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://twitter.com/project" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={platformContentForm.control}
                        name="twitterUrlStatus"
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
                        name="telegramUrl"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Telegram URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://t.me/project" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={platformContentForm.control}
                        name="telegramUrlStatus"
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
                        control={platformContentForm.control}
                        name="discordUrl"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Discord URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://discord.gg/project" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={platformContentForm.control}
                        name="discordUrlStatus"
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
                        name="roadmapUrl"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Roadmap URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://project.com/roadmap" {...field} />
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
                        name="teamPageUrl"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Team Page URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://project.com/team" {...field} />
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
                        name="tokenomicsUrl"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tokenomics URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://project.com/tokenomics" {...field} />
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

                <div className="flex justify-end">
                  <Button type="submit" disabled={updatePlatformContentMutation.isPending}>
                    {updatePlatformContentMutation.isPending ? "Saving..." : "Save Progress"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">FAQ Management</h3>
              <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
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
                              <Textarea
                                {...field}
                                rows={4}
                                placeholder="Enter FAQ answer"
                              />
                            </FormControl>
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
              {project.faqs.map((faq: any, index: number) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                      <p className="text-gray-600 mb-3">{faq.answer}</p>
                      <Badge variant={faq.status === "confirmed" ? "default" : "secondary"}>
                        {faq.status === "confirmed" ? "Confirmed" : faq.status === "might_change" ? "Might Change" : "Not Confirmed"}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFaqMutation.mutate(faq.id)}
                      className="ml-4 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === "quiz" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Quiz Question Management</h3>
              <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Quiz Question
                  </Button>
                </DialogTrigger>
                <DialogContent>
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
                      <FormField
                        control={quizForm.control}
                        name="optionA"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Option A</FormLabel>
                            <FormControl>
                              <Input placeholder="First option" {...field} />
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
                              <Input placeholder="Second option" {...field} />
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
                              <Input placeholder="Third option" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={quizForm.control}
                        name="correctAnswer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correct Answer</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select correct answer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="a">Option A</SelectItem>
                                <SelectItem value="b">Option B</SelectItem>
                                <SelectItem value="c">Option C</SelectItem>
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
              {project.quizQuestions.map((question: any, index: number) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{question.question}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                        <div className={`p-2 rounded ${question.correctAnswer === 'a' ? 'bg-green-100 border-green-300' : 'bg-gray-100'}`}>
                          A: {question.optionA}
                        </div>
                        <div className={`p-2 rounded ${question.correctAnswer === 'b' ? 'bg-green-100 border-green-300' : 'bg-gray-100'}`}>
                          B: {question.optionB}
                        </div>
                        <div className={`p-2 rounded ${question.correctAnswer === 'c' ? 'bg-green-100 border-green-300' : 'bg-gray-100'}`}>
                          C: {question.optionC}
                        </div>
                      </div>
                      <Badge variant={question.status === "confirmed" ? "default" : "secondary"}>
                        {question.status === "confirmed" ? "Confirmed" : question.status === "might_change" ? "Might Change" : "Not Confirmed"}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteQuizQuestionMutation.mutate(question.id)}
                      className="ml-4 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketing Assets Tab */}
        {activeTab === "assets" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Marketing Assets Configuration</h3>
            <Form {...marketingAssetsForm}>
              <form
                onSubmit={marketingAssetsForm.handleSubmit((data) => updateMarketingAssetsMutation.mutate(data))}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex space-x-3">
                      <FormField
                        control={marketingAssetsForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/logo.png" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={marketingAssetsForm.control}
                        name="logoStatus"
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
                        control={marketingAssetsForm.control}
                        name="heroBannerUrl"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Hero Banner URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/banner.png" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={marketingAssetsForm.control}
                        name="heroBannerStatus"
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
                        control={marketingAssetsForm.control}
                        name="driveFolder"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Drive Folder URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://drive.google.com/..." 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
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
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updateMarketingAssetsMutation.isPending}>
                    {updateMarketingAssetsMutation.isPending ? "Saving..." : "Save Progress"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}