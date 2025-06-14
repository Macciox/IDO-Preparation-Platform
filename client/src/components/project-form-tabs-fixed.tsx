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
    const idoMetrics = project.idoMetrics;
    const platformContent = project.platformContent;
    const faqs = project.faqs || [];
    const quizQuestions = project.quizQuestions || [];
    const marketingAssets = project.marketingAssets;

    let totalFields = 0;
    let completedFields = 0;

    // IDO Metrics fields (excluding optional transactionId)
    if (idoMetrics) {
      const fields = [
        'whitelistingDate', 'placingIdoDate', 'claimingDate', 'initialDexListingDate',
        'tokenPrice', 'totalAllocationDollars', 'vestingPeriod', 'cliffPeriod', 'tgePercentage',
        'totalAllocationNativeToken', 'network', 'minimumTier', 'gracePeriod',
        'tokenTicker', 'contractAddress', 'initialMarketCap', 'fullyDilutedMarketCap',
        'circulatingSupplyTge', 'totalSupply'
      ];
      
      totalFields += fields.length;
      completedFields += fields.filter(field => {
        const value = idoMetrics[field as keyof typeof idoMetrics];
        return value && value !== "" && value !== "not_selected";
      }).length;
    }

    // Platform Content fields
    if (platformContent) {
      const fields = ['tagline', 'description', 'twitterUrl', 'telegramUrl', 'discordUrl', 'websiteUrl', 'roadmapUrl', 'tokenomicsUrl'];
      totalFields += fields.length;
      completedFields += fields.filter(field => {
        const value = platformContent[field as keyof typeof platformContent];
        return value && value !== "";
      }).length;
    }

    // FAQ fields
    totalFields += Math.max(1, faqs.length);
    completedFields += faqs.filter(faq => faq.question && faq.answer).length;

    // Quiz Questions fields
    totalFields += Math.max(1, quizQuestions.length);
    completedFields += quizQuestions.filter(q => q.question && q.optionA && q.optionB && q.optionC && q.correctAnswer).length;

    // Marketing Assets fields
    if (marketingAssets) {
      const fields = ['logoUrl', 'heroBannerUrl', 'driveFolder'];
      totalFields += fields.length;
      completedFields += fields.filter(field => {
        const value = marketingAssets[field as keyof typeof marketingAssets];
        return value && value !== "";
      }).length;
    }

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
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
      await apiRequest(`/api/projects/${project.id}/ido-metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, ...data }),
      });
    },
    onSuccess: () => {
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
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Content</h3>
      <p className="text-gray-600">Platform content management coming soon...</p>
    </div>
  );
}

// FAQs Tab Component  
function FaqsTab({ project }: { project: ProjectWithData }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">FAQ & L2E</h3>
      <p className="text-gray-600">FAQ and Learn-to-Earn management coming soon...</p>
    </div>
  );
}

// Marketing Tab Component
function MarketingTab({ project }: { project: ProjectWithData }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Marketing Assets</h3>
      <p className="text-gray-600">Marketing assets management coming soon...</p>
    </div>
  );
}