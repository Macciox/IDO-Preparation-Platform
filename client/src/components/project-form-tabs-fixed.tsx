import { useState, useEffect } from "react";
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
  const [currentProgress, setCurrentProgress] = useState(0);
  const { toast } = useToast();

  // Calculate progress based on current project data (updates when project changes)
  const calculateProgress = () => {
    const metrics = project.idoMetrics;
    const content = project.platformContent;
    const faqs = project.faqs || [];
    const quizQuestions = project.quizQuestions || [];
    const assets = project.marketingAssets;

    let total = 0;
    let completed = 0;

    // IDO Metrics: 22 fields (4 Important Dates + 6 Token Metrics + 6 Project Details + 6 Token Info)
    if (metrics) {
      const fields = [
        // Important Dates (4 fields)
        metrics.whitelistingDateStatus,
        metrics.placingIdoDateStatus,
        metrics.claimingDateStatus,
        metrics.initialDexListingDateStatus,
        // Token Metrics (6 fields)
        metrics.totalAllocationDollarsStatus,
        metrics.tokenPriceEventStatus,
        metrics.totalAllocationNativeTokenStatus,
        metrics.availableAtTgeStatus,
        metrics.cliffLockStatus,
        metrics.vestingDurationStatus,
        // Project Details (6 fields)
        metrics.tokenTickerStatus,
        metrics.networkStatus,
        metrics.gracePeriodStatus,
        metrics.minimumTierStatus,
        metrics.transactionIdStatus, // Token Transfer TX-ID
        metrics.contractAddressStatus,
        // Token Info (6 fields)
        metrics.initialMarketCapExLiquidityStatus,
        metrics.initialMarketCapStatus,
        metrics.fullyDilutedMarketCapStatus,
        metrics.circulatingSupplyTgeStatus,
        metrics.circulatingSupplyTgePercentStatus,
        metrics.totalSupplyStatus,
      ];
      total += fields.length;
      completed += fields.filter(status => status === "confirmed").length;
    }

    // Platform Content: 10 fields
    if (content) {
      const fields = [
        content.taglineStatus,        
        content.descriptionStatus,    
        content.telegramUrlStatus,    
        content.discordUrlStatus,     
        content.twitterUrlStatus,     
        content.youtubeUrlStatus,     
        content.linkedinUrlStatus,    
        content.roadmapUrlStatus,     
        content.teamPageUrlStatus,    
        content.tokenomicsUrlStatus,  
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
        assets.logoStatus,        
        assets.heroBannerStatus,  
        assets.driveFolderStatus, 
      ];
      total += fields.length;
      completed += fields.filter(status => status === "confirmed").length;
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Update progress whenever project data changes
  useEffect(() => {
    setCurrentProgress(calculateProgress());
  }, [project]);

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
          <span className="text-sm font-medium text-gray-900">{currentProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${currentProgress}%` }}
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
    idoPrice: z.string().optional(),
    idoPriceStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    tokensForSale: z.string().optional(),
    tokensForSaleStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    tokenPrice: z.string().optional(),
    tokenPriceStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    totalAllocationDollars: z.string().optional(),
    totalAllocationDollarsStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    tokenPriceEvent: z.string().optional(),
    tokenPriceEventStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    vestingPeriod: z.string().optional(),
    vestingPeriodStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    vestingDuration: z.string().optional(),
    vestingDurationStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    cliffPeriod: z.string().optional(),
    cliffPeriodStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    tgePercentage: z.number().optional(),
    tgePercentageStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    availableAtTge: z.string().optional(),
    availableAtTgeStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    cliffLock: z.string().optional(),
    cliffLockStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    
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
    initialMarketCapExLiquidity: z.string().optional(),
    initialMarketCapExLiquidityStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    initialMarketCap: z.string().optional(),
    initialMarketCapStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    fullyDilutedMarketCap: z.string().optional(),
    fullyDilutedMarketCapStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    circulatingSupplyTge: z.string().optional(),
    circulatingSupplyTgeStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    circulatingSupplyTgePercent: z.string().optional(),
    circulatingSupplyTgePercentStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
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
      idoPrice: project.idoMetrics?.idoPrice || "",
      idoPriceStatus: project.idoMetrics?.idoPriceStatus || "not_confirmed",
      tokensForSale: project.idoMetrics?.tokensForSale || "",
      tokensForSaleStatus: project.idoMetrics?.tokensForSaleStatus || "not_confirmed",
      tokenPrice: project.idoMetrics?.tokenPrice || "",
      tokenPriceStatus: project.idoMetrics?.tokenPriceStatus || "not_confirmed",
      totalAllocationDollars: project.idoMetrics?.totalAllocationDollars || "",
      totalAllocationDollarsStatus: project.idoMetrics?.totalAllocationDollarsStatus || "not_confirmed",
      tokenPriceEvent: project.idoMetrics?.tokenPriceEvent || "",
      tokenPriceEventStatus: project.idoMetrics?.tokenPriceEventStatus || "not_confirmed",
      vestingPeriod: project.idoMetrics?.vestingPeriod || "",
      vestingPeriodStatus: project.idoMetrics?.vestingPeriodStatus || "not_confirmed",
      vestingDuration: project.idoMetrics?.vestingDuration || "",
      vestingDurationStatus: project.idoMetrics?.vestingDurationStatus || "not_confirmed",
      cliffPeriod: project.idoMetrics?.cliffPeriod || "",
      cliffPeriodStatus: project.idoMetrics?.cliffPeriodStatus || "not_confirmed",
      tgePercentage: project.idoMetrics?.tgePercentage || undefined,
      tgePercentageStatus: project.idoMetrics?.tgePercentageStatus || "not_confirmed",
      availableAtTge: project.idoMetrics?.availableAtTge || "",
      availableAtTgeStatus: project.idoMetrics?.availableAtTgeStatus || "not_confirmed",
      cliffLock: project.idoMetrics?.cliffLock || "",
      cliffLockStatus: project.idoMetrics?.cliffLockStatus || "not_confirmed",
      totalAllocationNativeToken: project.idoMetrics?.totalAllocationNativeToken || "",
      totalAllocationNativeTokenStatus: project.idoMetrics?.totalAllocationNativeTokenStatus || "not_confirmed",
      network: project.idoMetrics?.network || "",
      networkStatus: project.idoMetrics?.networkStatus || "not_confirmed",
      minimumTier: project.idoMetrics?.minimumTier || "",
      minimumTierStatus: project.idoMetrics?.minimumTierStatus || "not_confirmed",
      gracePeriod: project.idoMetrics?.gracePeriod || "",
      gracePeriodStatus: project.idoMetrics?.gracePeriodStatus || "not_confirmed",

      transactionId: project.idoMetrics?.transactionId || "",
      transactionIdStatus: project.idoMetrics?.transactionIdStatus || "not_confirmed",
      contractAddress: project.idoMetrics?.contractAddress || "",
      contractAddressStatus: project.idoMetrics?.contractAddressStatus || "not_confirmed",
      initialMarketCapExLiquidity: project.idoMetrics?.initialMarketCapExLiquidity || "",
      initialMarketCapExLiquidityStatus: project.idoMetrics?.initialMarketCapExLiquidityStatus || "not_confirmed",
      initialMarketCap: project.idoMetrics?.initialMarketCap || "",
      initialMarketCapStatus: project.idoMetrics?.initialMarketCapStatus || "not_confirmed",
      fullyDilutedMarketCap: project.idoMetrics?.fullyDilutedMarketCap || "",
      fullyDilutedMarketCapStatus: project.idoMetrics?.fullyDilutedMarketCapStatus || "not_confirmed",
      circulatingSupplyTge: project.idoMetrics?.circulatingSupplyTge || "",
      circulatingSupplyTgeStatus: project.idoMetrics?.circulatingSupplyTgeStatus || "not_confirmed",
      circulatingSupplyTgePercent: project.idoMetrics?.circulatingSupplyTgePercent || "",
      circulatingSupplyTgePercentStatus: project.idoMetrics?.circulatingSupplyTgePercentStatus || "not_confirmed",
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
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", "first"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", "first"] });
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

          {/* Token Metrics Section */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Token Metrics
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="totalAllocationDollars"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Total allocation in $</FormLabel>
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
                    name="tokenPriceEvent"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Token price for an event $</FormLabel>
                        <FormControl>
                          <Input placeholder="$0.08" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tokenPriceEventStatus"
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
                        <FormLabel>Total allocation in native token</FormLabel>
                        <FormControl>
                          <Input placeholder="1,000,000 TOKENS" {...field} />
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

              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="availableAtTge"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Available at TGE (%)</FormLabel>
                        <FormControl>
                          <Input placeholder="10%" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availableAtTgeStatus"
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
                    name="cliffLock"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Cliff/Lock (month)</FormLabel>
                        <FormControl>
                          <Input placeholder="3 months" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cliffLockStatus"
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
                    name="vestingDuration"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Vesting duration (month)</FormLabel>
                        <FormControl>
                          <Input placeholder="24 months" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vestingDurationStatus"
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

          {/* Project Details Section */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Project Details
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
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

                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Network</FormLabel>
                        <FormControl>
                          <Input placeholder="Ethereum" {...field} />
                        </FormControl>
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
                    name="gracePeriod"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Grace Period (investment protection)</FormLabel>
                        <FormControl>
                          <Input placeholder="24 hours" {...field} />
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

              </div>

              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="minimumTier"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Minimum tier</FormLabel>
                        <FormControl>
                          <Input placeholder="Bronze" {...field} />
                        </FormControl>
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
                    name="transactionId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Token Transfer TX-ID</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." {...field} />
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

                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="contractAddress"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Token Contract address</FormLabel>
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

          {/* Token Info Section */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Token Info
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name="initialMarketCapExLiquidity"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Initial Market Cap (Ex. liquidity) in $</FormLabel>
                        <FormControl>
                          <Input placeholder="$1,000,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="initialMarketCapExLiquidityStatus"
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
                    name="initialMarketCap"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Initial Market Cap in $</FormLabel>
                        <FormControl>
                          <Input placeholder="$1,500,000" {...field} />
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
                        <FormLabel>Fully diluted market cap in $</FormLabel>
                        <FormControl>
                          <Input placeholder="$10,000,000" {...field} />
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
                        <FormLabel>Circulating supply TGE</FormLabel>
                        <FormControl>
                          <Input placeholder="15,000,000" {...field} />
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
                    name="circulatingSupplyTgePercent"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Circulating supply TGE %</FormLabel>
                        <FormControl>
                          <Input placeholder="15%" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="circulatingSupplyTgePercentStatus"
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
                        <FormLabel>Total supply</FormLabel>
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

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save IDO Metrics"}
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
    twitterUrl: z.string().optional(),
    twitterUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    telegramUrl: z.string().optional(),
    telegramUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    discordUrl: z.string().optional(),
    discordUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    youtubeUrl: z.string().optional(),
    youtubeUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    linkedinUrl: z.string().optional(),
    linkedinUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    roadmapUrl: z.string().optional(),
    roadmapUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    teamPageUrl: z.string().optional(),
    teamPageUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
    tokenomicsUrl: z.string().optional(),
    tokenomicsUrlStatus: z.enum(["confirmed", "not_confirmed", "might_change"]).default("not_confirmed"),
  });

  const form = useForm<z.infer<typeof platformContentSchema>>({
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
      youtubeUrl: project.platformContent?.youtubeUrl || "",
      youtubeUrlStatus: project.platformContent?.youtubeUrlStatus || "not_confirmed",
      linkedinUrl: project.platformContent?.linkedinUrl || "",
      linkedinUrlStatus: project.platformContent?.linkedinUrlStatus || "not_confirmed",
      roadmapUrl: project.platformContent?.roadmapUrl || "",
      roadmapUrlStatus: project.platformContent?.roadmapUrlStatus || "not_confirmed",
      teamPageUrl: project.platformContent?.teamPageUrl || "",
      teamPageUrlStatus: project.platformContent?.teamPageUrlStatus || "not_confirmed",
      tokenomicsUrl: project.platformContent?.tokenomicsUrl || "",
      tokenomicsUrlStatus: project.platformContent?.tokenomicsUrlStatus || "not_confirmed",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof platformContentSchema>) => {
      await apiRequest(`/api/projects/${project.id}/platform-content`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Platform content updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
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
        description: "Failed to update platform content. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Content</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
          <div className="space-y-4">
            <div className="flex space-x-3">
              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Project Tagline</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project tagline..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taglineStatus"
                render={({ field }) => (
                  <FormItem className="w-40">
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
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
                    </FormControl>
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
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter project description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionStatus"
                render={({ field }) => (
                  <FormItem className="w-40">
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {[
              { name: "twitterUrl", label: "Twitter URL", icon: Twitter },
              { name: "telegramUrl", label: "Telegram URL", icon: MessageSquare },
              { name: "discordUrl", label: "Discord URL", icon: MessageSquare },
              { name: "youtubeUrl", label: "YouTube URL", icon: ExternalLink },
              { name: "linkedinUrl", label: "LinkedIn URL", icon: ExternalLink },
              { name: "roadmapUrl", label: "Roadmap URL", icon: ExternalLink },
              { name: "teamPageUrl", label: "Team Page URL", icon: ExternalLink },
              { name: "tokenomicsUrl", label: "Tokenomics URL", icon: ExternalLink },
            ].map((item) => (
              <div key={item.name} className="flex space-x-3">
                <FormField
                  control={form.control}
                  name={item.name as any}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="flex items-center space-x-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={`Enter ${item.label.toLowerCase()}...`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${item.name}Status` as any}
                  render={({ field }) => (
                    <FormItem className="w-40">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Platform Content"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// FAQ & L2E Tab Component
function FaqsTab({ project }: { project: ProjectWithData }) {
  const { toast } = useToast();
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [newQuiz, setNewQuiz] = useState({ question: "", correctAnswer: "", wrongAnswers: ["", "", ""] });

  const addFaqMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string }) => {
      await apiRequest(`/api/projects/${project.id}/faqs`, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "FAQ added successfully!",
      });
      setNewFaq({ question: "", answer: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const addQuizMutation = useMutation({
    mutationFn: async (data: { question: string; correctAnswer: string; wrongAnswers: string[] }) => {
      await apiRequest(`/api/projects/${project.id}/quiz-questions`, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quiz question added successfully!",
      });
      setNewQuiz({ question: "", correctAnswer: "", wrongAnswers: ["", "", ""] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">FAQ & Learn-to-Earn Questions</h3>
      
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Frequently Asked Questions
        </h4>
        
        <div className="space-y-4 mb-6">
          {project.faqs && project.faqs.length > 0 ? (
            project.faqs.map((faq) => (
              <Card key={faq.id}>
                <CardContent className="p-4">
                  <h5 className="font-medium text-gray-900">{faq.question}</h5>
                  <p className="text-gray-700 mt-2">{faq.answer}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No FAQs added yet.</p>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <h5 className="font-medium text-gray-900 mb-4">Add New FAQ</h5>
            <div className="space-y-4">
              <Input
                placeholder="Enter question..."
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              />
              <Textarea
                placeholder="Enter answer..."
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
              />
              <Button
                onClick={() => addFaqMutation.mutate(newFaq)}
                disabled={!newFaq.question || !newFaq.answer || addFaqMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                {addFaqMutation.isPending ? "Adding..." : "Add FAQ"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Learn-to-Earn Quiz Questions
        </h4>
        
        <div className="space-y-4 mb-6">
          {project.quizQuestions && project.quizQuestions.length > 0 ? (
            project.quizQuestions.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="p-4">
                  <h5 className="font-medium text-gray-900">{quiz.question}</h5>
                  <div className="mt-2 space-y-1">
                    <p className="text-green-600">✓ {quiz.correctAnswer}</p>
                    <p className="text-gray-600">• {quiz.optionA}</p>
                    <p className="text-gray-600">• {quiz.optionB}</p>
                    <p className="text-gray-600">• {quiz.optionC}</p>
                    <p className="text-gray-600">• {quiz.optionD}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No quiz questions added yet.</p>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <h5 className="font-medium text-gray-900 mb-4">Add New Quiz Question</h5>
            <div className="space-y-4">
              <Input
                placeholder="Enter question..."
                value={newQuiz.question}
                onChange={(e) => setNewQuiz({ ...newQuiz, question: e.target.value })}
              />
              <Input
                placeholder="Correct answer..."
                value={newQuiz.correctAnswer}
                onChange={(e) => setNewQuiz({ ...newQuiz, correctAnswer: e.target.value })}
              />
              {newQuiz.wrongAnswers.map((wrong, index) => (
                <Input
                  key={index}
                  placeholder={`Wrong answer ${index + 1}...`}
                  value={wrong}
                  onChange={(e) => {
                    const updated = [...newQuiz.wrongAnswers];
                    updated[index] = e.target.value;
                    setNewQuiz({ ...newQuiz, wrongAnswers: updated });
                  }}
                />
              ))}
              <Button
                onClick={() => addQuizMutation.mutate(newQuiz)}
                disabled={!newQuiz.question || !newQuiz.correctAnswer || addQuizMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                {addQuizMutation.isPending ? "Adding..." : "Add Quiz Question"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Marketing Assets Tab Component
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
      await apiRequest(`/api/projects/${project.id}/marketing-assets`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Marketing assets updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
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
        description: "Failed to update marketing assets. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Marketing Assets</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
          <div className="space-y-4">
            {[
              { name: "logoUrl", label: "Project Logo", icon: Images, description: "Upload or provide URL for project logo" },
              { name: "heroBannerUrl", label: "Hero Banner", icon: Images, description: "Upload or provide URL for hero banner image" },
              { name: "driveFolder", label: "Marketing Drive Folder", icon: CloudUpload, description: "Google Drive folder containing all marketing assets" },
            ].map((item) => (
              <div key={item.name} className="border rounded-lg p-4">
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name={item.name as any}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={`Enter ${item.label.toLowerCase()}...`} {...field} />
                        </FormControl>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`${item.name}Status` as any}
                    render={({ field }) => (
                      <FormItem className="w-40">
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Marketing Assets"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
