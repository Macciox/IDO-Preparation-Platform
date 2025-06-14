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
  { value: "might_change", label: "Might Change" },
];

const networkOptions = [
  { value: "not_selected", label: "-" },
  { value: "ETH", label: "Ethereum" },
  { value: "Base", label: "Base" },
  { value: "Polygon", label: "Polygon" },
  { value: "BSC", label: "BSC" },
  { value: "Arbitrum", label: "Arbitrum" },
];

const minimumTierOptions = [
  { value: "not_selected", label: "-" },
  { value: "Base", label: "Base" },
  { value: "Bronze", label: "Bronze" },
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
  { value: "Platinum", label: "Platinum" },
  { value: "Diamond", label: "Diamond" },
];

export default function ProjectFormTabs({ project }: ProjectFormTabsProps) {
  const [activeTab, setActiveTab] = useState("ido-metrics");
  const { toast } = useToast();

  // Calculate progress
  const calculateProgress = () => {
    const metrics = project.idoMetrics;
    const content = project.platformContent;
    const faqs = project.faqs || [];
    const quizQuestions = project.quizQuestions || [];
    const assets = project.marketingAssets;

    let total = 0;
    let completed = 0;

    // IDO Metrics: 18 fields (excluding optional transactionId)
    if (metrics) {
      const fields = [
        metrics.whitelistingDateStatus,       // 2.94%
        metrics.placingIdoDateStatus,         // 2.94%
        metrics.claimingDateStatus,           // 2.94%
        metrics.initialDexListingDateStatus,  // 2.94%
        metrics.totalAllocationDollarsStatus, // 2.94%
        metrics.tokenPriceStatus,            // 2.94%
        metrics.totalAllocationNativeTokenStatus, // 2.94%
        metrics.availableAtTgeStatus,        // 2.94%
        metrics.cliffLockStatus,             // 2.94%
        metrics.vestingPeriodStatus,         // 2.94%
        metrics.networkStatus,               // 2.94%
        metrics.gracePeriodStatus,           // 2.94%
        metrics.minimumTierStatus,           // 2.94%
        metrics.contractAddressStatus,       // 2.94%
        metrics.initialMarketCapStatus,      // 2.94%
        metrics.fullyDilutedMarketCapStatus, // 2.94%
        metrics.circulatingSupplyTgeStatus,  // 2.94%
        metrics.totalSupplyStatus,           // 2.94%
        // Note: transactionIdStatus excluded as optional
      ];
      total += fields.length;
      completed += fields.filter(status => status === "confirmed").length;
    }

    // Platform Content: 10 fields
    if (content) {
      const fields = [
        content.taglineStatus,        // 2.94%
        content.descriptionStatus,    // 2.94%
        content.telegramUrlStatus,    // 2.94%
        content.discordUrlStatus,     // 2.94%
        content.twitterUrlStatus,     // 2.94%
        content.youtubeUrlStatus,     // 2.94%
        content.linkedinUrlStatus,    // 2.94%
        content.roadmapUrlStatus,     // 2.94%
        content.teamPageUrlStatus,    // 2.94%
        content.tokenomicsUrlStatus,  // 2.94%
      ];
      total += fields.length;
      completed += fields.filter(status => status === "confirmed").length;
    }

    // FAQ & L2E: 2 sections
    const hasFaqs = faqs.length > 0;
    const hasQuizzes = quizQuestions.length > 0;
    total += 2; // 2 sections
    completed += (hasFaqs ? 1 : 0) + (hasQuizzes ? 1 : 0);

    // Marketing Assets: 3 fields
    if (assets) {
      const fields = [
        assets.logoStatus,        // 2.94%
        assets.heroBannerStatus,  // 2.94%
        assets.driveFolderStatus, // 2.94%
      ];
      total += fields.length;
      completed += fields.filter(status => status === "confirmed").length;
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const tabs = [
    { id: "ido-metrics", label: "IDO Metrics", icon: ChartBar },
    { id: "platform-content", label: "Platform Content", icon: FileText },
    { id: "faqs", label: "FAQ & L2E", icon: HelpCircle },
    { id: "marketing", label: "Marketing Assets", icon: Images },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-medium text-gray-900">{calculateProgress()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Tab Content */}
      <Card>
        <CardContent className="p-6">
          {activeTab === "ido-metrics" && <IdoMetricsTab project={project} />}
          {activeTab === "platform-content" && <PlatformContentTab project={project} />}
          {activeTab === "faqs" && <FaqsTab project={project} />}
          {activeTab === "marketing" && <MarketingTab project={project} />}
        </CardContent>
      </Card>
    </div>
  );
}

// IDO Metrics Tab Component
function IdoMetricsTab({ project }: { project: ProjectWithData }) {
  const { toast } = useToast();

  const idoMetricsSchema = z.object({
    // Important Dates
    whitelistingDate: z.string().optional(),
    whitelistingDateStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    placingIdoDate: z.string().optional(),
    placingIdoDateStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    claimingDate: z.string().optional(),
    claimingDateStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    initialDexListingDate: z.string().optional(),
    initialDexListingDateStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    
    // Token Economics
    tokenPrice: z.string().optional(),
    tokenPriceStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    totalAllocationDollars: z.string().optional(),
    totalAllocationDollarsStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    vestingPeriod: z.string().optional(),
    vestingPeriodStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    cliffPeriod: z.string().optional(),
    cliffPeriodStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    tgePercentage: z.number().optional(),
    tgePercentageStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    
    // Additional Details
    totalAllocationNativeToken: z.string().optional(),
    totalAllocationNativeTokenStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    network: z.string().optional(),
    networkStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    minimumTier: z.string().optional(),
    minimumTierStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    gracePeriod: z.string().optional(),
    gracePeriodStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    tokenTicker: z.string().optional(),
    tokenTickerStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    transactionId: z.string().optional(),
    transactionIdStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    contractAddress: z.string().optional(),
    contractAddressStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    
    // Token Info
    initialMarketCap: z.string().optional(),
    initialMarketCapStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    fullyDilutedMarketCap: z.string().optional(),
    fullyDilutedMarketCapStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    circulatingSupplyTge: z.string().optional(),
    circulatingSupplyTgeStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    totalSupply: z.string().optional(),
    totalSupplyStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  });

  const form = useForm<z.infer<typeof idoMetricsSchema>>({
    resolver: zodResolver(idoMetricsSchema),
    defaultValues: {
      whitelistingDate: project.idoMetrics?.whitelistingDate || "",
      whitelistingDateStatus: project.idoMetrics?.whitelistingDateStatus || "not_confirmed",
      placingIdoDate: project.idoMetrics?.placingIdoDate || "",
      placingIdoDateStatus: project.idoMetrics?.placingIdoDateStatus || "not_confirmed",
      claimingDate: project.idoMetrics?.claimingDate || "",
      claimingDateStatus: project.idoMetrics?.claimingDateStatus || "not_confirmed",
      initialDexListingDate: project.idoMetrics?.initialDexListingDate || "",
      initialDexListingDateStatus: project.idoMetrics?.initialDexListingDateStatus || "not_confirmed",
      tokenPrice: project.idoMetrics?.tokenPrice || "",
      tokenPriceStatus: project.idoMetrics?.tokenPriceStatus || "not_confirmed",
      totalAllocationDollars: project.idoMetrics?.totalAllocationDollars || "",
      totalAllocationDollarsStatus: project.idoMetrics?.totalAllocationDollarsStatus || "not_confirmed",
      vestingPeriod: project.idoMetrics?.vestingPeriod || "",
      vestingPeriodStatus: project.idoMetrics?.vestingPeriodStatus || "not_confirmed",
      cliffPeriod: project.idoMetrics?.cliffPeriod || "",
      cliffPeriodStatus: project.idoMetrics?.cliffPeriodStatus || "not_confirmed",
      tgePercentage: project.idoMetrics?.tgePercentage || undefined,
      tgePercentageStatus: project.idoMetrics?.tgePercentageStatus || "not_confirmed",
      totalAllocationNativeToken: project.idoMetrics?.totalAllocationNativeToken || "",
      totalAllocationNativeTokenStatus: project.idoMetrics?.totalAllocationNativeTokenStatus || "not_confirmed",
      network: project.idoMetrics?.network || "",
      networkStatus: project.idoMetrics?.networkStatus || "not_confirmed",
      minimumTier: project.idoMetrics?.minimumTier || "",
      minimumTierStatus: project.idoMetrics?.minimumTierStatus || "not_confirmed",
      gracePeriod: project.idoMetrics?.gracePeriod || "",
      gracePeriodStatus: project.idoMetrics?.gracePeriodStatus || "not_confirmed",
      tokenTicker: project.idoMetrics?.tokenTicker || "",
      tokenTickerStatus: project.idoMetrics?.tokenTickerStatus || "not_confirmed",
      transactionId: project.idoMetrics?.transactionId || "",
      transactionIdStatus: project.idoMetrics?.transactionIdStatus || "not_confirmed",
      contractAddress: project.idoMetrics?.contractAddress || "",
      contractAddressStatus: project.idoMetrics?.contractAddressStatus || "not_confirmed",
      initialMarketCap: project.idoMetrics?.initialMarketCap || "",
      initialMarketCapStatus: project.idoMetrics?.initialMarketCapStatus || "not_confirmed",
      fullyDilutedMarketCap: project.idoMetrics?.fullyDilutedMarketCap || "",
      fullyDilutedMarketCapStatus: project.idoMetrics?.fullyDilutedMarketCapStatus || "not_confirmed",
      circulatingSupplyTge: project.idoMetrics?.circulatingSupplyTge || "",
      circulatingSupplyTgeStatus: project.idoMetrics?.circulatingSupplyTgeStatus || "not_confirmed",
      totalSupply: project.idoMetrics?.totalSupply || "",
      totalSupplyStatus: project.idoMetrics?.totalSupplyStatus || "not_confirmed",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof idoMetricsSchema>) => {
      await apiRequest("PUT", `/api/projects/${project.id}/ido-metrics`, { projectId: project.id, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
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
        description: "Failed to save changes",
        variant: "destructive",
      });
    },
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Public Round IDO Configuration</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-8">
          
          {/* Important Dates Section */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Important Dates
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
                    name="tokenPrice"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>IDO Price</FormLabel>
                        <FormControl>
                          <Input placeholder="$0.05" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="totalAllocationDollars"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Total Allocation ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="$100,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalAllocationDollarsStatus"
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
                    control={form.control}
                    name="vestingPeriod"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Vesting Period</FormLabel>
                        <FormControl>
                          <Input placeholder="12 months" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="cliffPeriod"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Cliff Period</FormLabel>
                        <FormControl>
                          <Input placeholder="3 months" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
              </div>

              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="tgePercentage"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>TGE Percentage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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

                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="totalAllocationNativeToken"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Total Allocation (Native Token)</FormLabel>
                        <FormControl>
                          <Input placeholder="2,000,000 TOKENS" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalAllocationNativeTokenStatus"
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

          {/* Additional Project Details Section */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Additional Project Details
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Network</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select network" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {networkOptions.map((option) => (
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
                  <FormField
                    control={form.control}
                    name="networkStatus"
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
                    control={form.control}
                    name="minimumTier"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Minimum Tier</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select minimum tier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {minimumTierOptions.map((option) => (
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
                  <FormField
                    control={form.control}
                    name="minimumTierStatus"
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
                    control={form.control}
                    name="gracePeriod"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Grace Period (Days)</FormLabel>
                        <FormControl>
                          <Input placeholder="7" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gracePeriodStatus"
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
                    control={form.control}
                    name="tokenTicker"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Token Ticker</FormLabel>
                        <FormControl>
                          <Input placeholder="TOKEN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tokenTickerStatus"
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
                    control={form.control}
                    name="contractAddress"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Token Contract Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractAddressStatus"
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

          {/* Transaction Information (Optional) */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Transaction Information (Optional)
            </h4>
            <div className="flex space-x-3">
              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Transaction ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="demo-tx-123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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

          {/* Token Info Tab */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Token Info
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="initialMarketCap"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Initial Market Cap</FormLabel>
                        <FormControl>
                          <Input placeholder="$5,000,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="initialMarketCapStatus"
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
                    control={form.control}
                    name="fullyDilutedMarketCap"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Fully Diluted Market Cap</FormLabel>
                        <FormControl>
                          <Input placeholder="$50,000,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fullyDilutedMarketCapStatus"
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
                    control={form.control}
                    name="circulatingSupplyTge"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Circulating Supply at TGE</FormLabel>
                        <FormControl>
                          <Input placeholder="10,000,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="circulatingSupplyTgeStatus"
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
                    control={form.control}
                    name="totalSupply"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Total Supply</FormLabel>
                        <FormControl>
                          <Input placeholder="100,000,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalSupplyStatus"
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

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Platform Content Tab Component
function PlatformContentTab({ project }: { project: ProjectWithData }) {
  const { toast } = useToast();

  const platformContentSchema = z.object({
    tagline: z.string().optional(),
    taglineStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    description: z.string().optional(),
    descriptionStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    telegramUrl: z.string().optional(),
    telegramUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    discordUrl: z.string().optional(),
    discordUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    twitterUrl: z.string().optional(),
    twitterUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    youtubeUrl: z.string().optional(),
    youtubeUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    linkedinUrl: z.string().optional(),
    linkedinUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    tokenomicsUrl: z.string().optional(),
    tokenomicsUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    teamPageUrl: z.string().optional(),
    teamPageUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    roadmapUrl: z.string().optional(),
    roadmapUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  });

  const form = useForm<z.infer<typeof platformContentSchema>>({
    resolver: zodResolver(platformContentSchema),
    defaultValues: {
      tagline: project.platformContent?.tagline || "",
      taglineStatus: project.platformContent?.taglineStatus || "not_confirmed",
      description: project.platformContent?.description || "",
      descriptionStatus: project.platformContent?.descriptionStatus || "not_confirmed",
      telegramUrl: project.platformContent?.telegramUrl || "",
      telegramUrlStatus: project.platformContent?.telegramUrlStatus || "not_confirmed",
      discordUrl: project.platformContent?.discordUrl || "",
      discordUrlStatus: project.platformContent?.discordUrlStatus || "not_confirmed",
      twitterUrl: project.platformContent?.twitterUrl || "",
      twitterUrlStatus: project.platformContent?.twitterUrlStatus || "not_confirmed",
      youtubeUrl: project.platformContent?.youtubeUrl || "",
      youtubeUrlStatus: project.platformContent?.youtubeUrlStatus || "not_confirmed",
      linkedinUrl: project.platformContent?.linkedinUrl || "",
      linkedinUrlStatus: project.platformContent?.linkedinUrlStatus || "not_confirmed",
      tokenomicsUrl: project.platformContent?.tokenomicsUrl || "",
      tokenomicsUrlStatus: project.platformContent?.tokenomicsUrlStatus || "not_confirmed",
      teamPageUrl: project.platformContent?.teamPageUrl || "",
      teamPageUrlStatus: project.platformContent?.teamPageUrlStatus || "not_confirmed",
      roadmapUrl: project.platformContent?.roadmapUrl || "",
      roadmapUrlStatus: project.platformContent?.roadmapUrlStatus || "not_confirmed",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof platformContentSchema>) => {
      await apiRequest("PUT", `/api/projects/${project.id}/platform-content`, { projectId: project.id, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
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
        description: "Failed to save changes",
        variant: "destructive",
      });
    },
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Content</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-8">
          
          {/* Basic Information */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Basic Information
            </h4>
            <div className="space-y-6">
              <div className="flex space-x-3">
                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Tagline/Subtitle</FormLabel>
                      <FormControl>
                        <Input placeholder="Revolutionary DeFi platform for the future" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="Brief description of the project..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
            </div>
          </div>

          {/* Social Media Links */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Social Media Links
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="telegramUrl"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Telegram URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://t.me/yourproject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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

                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="discordUrl"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Discord URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://discord.gg/yourproject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="twitterUrl"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Twitter URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/yourproject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
              </div>

              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>YouTube URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/@yourproject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="youtubeUrlStatus"
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
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/company/yourproject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedinUrlStatus"
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

          {/* Documentation Links */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Documentation & Resources
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="tokenomicsUrl"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Tokenomics File (Public)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://docs.yourproject.com/tokenomics.pdf" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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

                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="teamPageUrl"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Team Page</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourproject.com/team" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
              </div>

              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="roadmapUrl"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Roadmap Page</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourproject.com/roadmap" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// FAQs Tab Component  
function FaqsTab({ project }: { project: ProjectWithData }) {
  const [faqs, setFaqs] = useState(project.faqs || []);
  const [quizQuestions, setQuizQuestions] = useState(project.quizQuestions || []);
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [newQuizQuestion, setNewQuizQuestion] = useState("");
  const [newQuizOptionA, setNewQuizOptionA] = useState("");
  const [newQuizOptionB, setNewQuizOptionB] = useState("");
  const [newQuizOptionC, setNewQuizOptionC] = useState("");
  const [newQuizCorrectAnswer, setNewQuizCorrectAnswer] = useState("");
  const { toast } = useToast();

  const addFaq = useMutation({
    mutationFn: async (data: { question: string; answer: string }) => {
      await apiRequest("POST", `/api/projects/${project.id}/faqs`, {
        projectId: project.id,
        order: faqs.length + 1,
        question: data.question,
        answer: data.answer,
        status: "not_confirmed"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
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
        description: "Failed to add FAQ",
        variant: "destructive",
      });
    },
  });

  const updateFaq = useMutation({
    mutationFn: async (data: { id: number; question: string; answer: string; status: string }) => {
      await apiRequest("PUT", `/api/projects/${project.id}/faqs/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  const deleteFaq = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${project.id}/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  const addQuizQuestion = useMutation({
    mutationFn: async (data: { question: string; optionA: string; optionB: string; optionC: string; correctAnswer: string }) => {
      await apiRequest("POST", `/api/projects/${project.id}/quiz-questions`, {
        projectId: project.id,
        order: quizQuestions.length + 1,
        question: data.question,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        correctAnswer: data.correctAnswer,
        status: "not_confirmed"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  const updateQuizQuestion = useMutation({
    mutationFn: async (data: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/projects/${project.id}/quiz-questions/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  const deleteQuizQuestion = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${project.id}/quiz-questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">FAQ & Learn-to-Earn</h3>
      
      {/* FAQ Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-800 pb-2 border-b border-gray-200">
            Frequently Asked Questions
          </h4>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New FAQ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    placeholder="What is the project about?"
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    rows={4}
                    placeholder="Detailed answer to the question..."
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => {
                    if (newFaqQuestion && newFaqAnswer) {
                      addFaq.mutate({ question: newFaqQuestion, answer: newFaqAnswer });
                      setNewFaqQuestion("");
                      setNewFaqAnswer("");
                    }
                  }}
                  disabled={addFaq.isPending}
                >
                  {addFaq.isPending ? "Adding..." : "Add FAQ"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={faq.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">FAQ #{index + 1}</Badge>
                    <Select 
                      defaultValue={faq.status || "not_confirmed"}
                      onValueChange={(value) => 
                        updateFaq.mutate({ 
                          id: faq.id, 
                          question: faq.question, 
                          answer: faq.answer, 
                          status: value 
                        })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{faq.question}</p>
                    <p className="text-gray-600 mt-1">{faq.answer}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteFaq.mutate(faq.id)}
                  className="ml-4 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          
          {faqs.length === 0 && (
            <Card className="p-6 text-center text-gray-500">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No FAQs added yet</p>
              <p className="text-sm">Click "Add FAQ" to create your first FAQ</p>
            </Card>
          )}
        </div>
      </div>

      {/* Quiz Questions Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-800 pb-2 border-b border-gray-200">
            Learn-to-Earn Quiz Questions
          </h4>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Quiz Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quiz-question">Question</Label>
                  <Input
                    id="quiz-question"
                    placeholder="What is the main purpose of the token?"
                    onChange={(e) => setNewQuizQuestion(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="option-a">Option A</Label>
                    <Input
                      id="option-a"
                      placeholder="First option"
                      onChange={(e) => setNewQuizOptionA(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="option-b">Option B</Label>
                    <Input
                      id="option-b"
                      placeholder="Second option"
                      onChange={(e) => setNewQuizOptionB(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="option-c">Option C</Label>
                    <Input
                      id="option-c"
                      placeholder="Third option"
                      onChange={(e) => setNewQuizOptionC(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="correct-answer">Correct Answer</Label>
                  <Select onValueChange={setNewQuizCorrectAnswer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">Option A</SelectItem>
                      <SelectItem value="b">Option B</SelectItem>
                      <SelectItem value="c">Option C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => {
                    if (newQuizQuestion && newQuizOptionA && newQuizOptionB && newQuizOptionC && newQuizCorrectAnswer) {
                      addQuizQuestion.mutate({ 
                        question: newQuizQuestion, 
                        optionA: newQuizOptionA, 
                        optionB: newQuizOptionB, 
                        optionC: newQuizOptionC, 
                        correctAnswer: newQuizCorrectAnswer 
                      });
                      setNewQuizQuestion("");
                      setNewQuizOptionA("");
                      setNewQuizOptionB("");
                      setNewQuizOptionC("");
                      setNewQuizCorrectAnswer("");
                    }
                  }}
                  disabled={addQuizQuestion.isPending}
                >
                  {addQuizQuestion.isPending ? "Adding..." : "Add Question"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {quizQuestions.map((question, index) => (
            <Card key={question.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Question #{index + 1}</Badge>
                    <Select 
                      defaultValue={question.status || "not_confirmed"}
                      onValueChange={(value) => 
                        updateQuizQuestion.mutate({ 
                          id: question.id, 
                          status: value 
                        })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className={`p-2 rounded ${question.correctAnswer === 'a' ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                        <span className="font-medium">A:</span> {question.optionA}
                        {question.correctAnswer === 'a' && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                      <div className={`p-2 rounded ${question.correctAnswer === 'b' ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                        <span className="font-medium">B:</span> {question.optionB}
                        {question.correctAnswer === 'b' && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                      <div className={`p-2 rounded ${question.correctAnswer === 'c' ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}>
                        <span className="font-medium">C:</span> {question.optionC}
                        {question.correctAnswer === 'c' && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteQuizQuestion.mutate(question.id)}
                  className="ml-4 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          
          {quizQuestions.length === 0 && (
            <Card className="p-6 text-center text-gray-500">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No quiz questions added yet</p>
              <p className="text-sm">Click "Add Question" to create your first learn-to-earn question</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Marketing Tab Component
function MarketingTab({ project }: { project: ProjectWithData }) {
  const { toast } = useToast();

  const marketingAssetsSchema = z.object({
    logoUrl: z.string().optional(),
    logoStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    heroBannerUrl: z.string().optional(),
    heroBannerStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    driveFolder: z.string().optional(),
    driveFolderStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  });

  const form = useForm<z.infer<typeof marketingAssetsSchema>>({
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

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof marketingAssetsSchema>) => {
      await apiRequest("POST", `/api/projects/${project.id}/marketing-assets`, { projectId: project.id, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
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
        description: "Failed to save changes",
        variant: "destructive",
      });
    },
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Marketing Assets</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-8">
          
          {/* Visual Assets */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Visual Assets
            </h4>
            <div className="space-y-6">
              <div className="flex space-x-3">
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Logo URL</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input placeholder="https://your-domain.com/logo.png" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                // In a real app, this would upload to a file storage service
                                const mockUrl = `https://demo-storage.com/${file.name}`;
                                field.onChange(mockUrl);
                                toast({
                                  title: "File Selected",
                                  description: `Logo file: ${file.name}`,
                                });
                              }
                            };
                            input.click();
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                  control={form.control}
                  name="heroBannerUrl"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Hero Banner URL</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input placeholder="https://your-domain.com/hero-banner.png" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                // In a real app, this would upload to a file storage service
                                const mockUrl = `https://demo-storage.com/${file.name}`;
                                field.onChange(mockUrl);
                                toast({
                                  title: "File Selected",
                                  description: `Hero banner file: ${file.name}`,
                                });
                              }
                            };
                            input.click();
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
            </div>
          </div>

          {/* Asset Management */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Asset Management
            </h4>
            <div className="space-y-6">
              <div className="flex space-x-3">
                <FormField
                  control={form.control}
                  name="driveFolder"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Google Drive Folder / Asset Storage URL</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input placeholder="https://drive.google.com/drive/folders/..." {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Drive Integration",
                              description: "Google Drive integration would be configured here",
                            });
                          }}
                        >
                          <CloudUpload className="h-4 w-4 mr-2" />
                          Connect Drive
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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

          {/* Asset Preview */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Asset Preview
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Preview */}
              <div className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">Logo Preview</h5>
                {form.watch("logoUrl") ? (
                  <div className="border border-gray-200 rounded p-4 bg-gray-50 flex items-center justify-center h-32">
                    <img 
                      src={form.watch("logoUrl")} 
                      alt="Logo Preview" 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-gray-400 text-sm">Failed to load image</div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded p-4 text-center text-gray-400 h-32 flex items-center justify-center">
                    <div>
                      <Images className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No logo uploaded</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hero Banner Preview */}
              <div className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-700 mb-2">Hero Banner Preview</h5>
                {form.watch("heroBannerUrl") ? (
                  <div className="border border-gray-200 rounded p-4 bg-gray-50 flex items-center justify-center h-32">
                    <img 
                      src={form.watch("heroBannerUrl")} 
                      alt="Hero Banner Preview" 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-gray-400 text-sm">Failed to load image</div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded p-4 text-center text-gray-400 h-32 flex items-center justify-center">
                    <div>
                      <Images className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No hero banner uploaded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}