import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import type { ProjectWithData } from "@shared/schema";
import { insertIdoMetricsSchema, insertPlatformContentSchema } from "@shared/schema";
import { z } from "zod";

// Form schemas
const idoMetricsFormSchema = insertIdoMetricsSchema.extend({
  projectId: z.number(),
});

const platformContentFormSchema = insertPlatformContentSchema.extend({
  projectId: z.number(),
});

// Status options
const statusOptions = [
  { value: "confirmed", label: "Confirmed" },
  { value: "not_confirmed", label: "Not Confirmed" },
  { value: "might_change", label: "Might Change" },
];

// Network options
const networkOptions = [
  { value: "not_selected", label: "-" },
  { value: "ETH", label: "Ethereum" },
  { value: "Base", label: "Base" },
  { value: "Polygon", label: "Polygon" },
  { value: "BSC", label: "BSC" },
  { value: "Arbitrum", label: "Arbitrum" },
];

// Minimum tier options
const minimumTierOptions = [
  { value: "not_selected", label: "-" },
  { value: "Base", label: "Base" },
  { value: "Bronze", label: "Bronze" },
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
  { value: "Platinum", label: "Platinum" },
  { value: "diamond", label: "Diamond" },
];

interface ProjectFormTabsProps {
  project: ProjectWithData;
}

export default function ProjectFormTabs({ project }: ProjectFormTabsProps) {
  const queryClient = useQueryClient();

  // IDO Metrics Form
  const idoMetricsForm = useForm<z.infer<typeof idoMetricsFormSchema>>({
    resolver: zodResolver(idoMetricsFormSchema),
    defaultValues: {
      projectId: project.id,
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
      tgePercentage: project.idoMetrics?.tgePercentage || "",
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
      contractAddress: project.idoMetrics?.contractAddress || "",
      contractAddressStatus: project.idoMetrics?.contractAddressStatus || "not_confirmed",
      transactionId: project.idoMetrics?.transactionId || "",
      transactionIdStatus: project.idoMetrics?.transactionIdStatus || "not_confirmed",
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

  // Platform Content Form
  const platformContentForm = useForm<z.infer<typeof platformContentFormSchema>>({
    resolver: zodResolver(platformContentFormSchema),
    defaultValues: {
      projectId: project.id,
      tagline: project.platformContent?.tagline || "",
      taglineStatus: project.platformContent?.taglineStatus || "not_confirmed",
      description: project.platformContent?.description || "",
      descriptionStatus: project.platformContent?.descriptionStatus || "not_confirmed",
      features: project.platformContent?.features || "",
      featuresStatus: project.platformContent?.featuresStatus || "not_confirmed",
      roadmap: project.platformContent?.roadmap || "",
      roadmapStatus: project.platformContent?.roadmapStatus || "not_confirmed",
    },
  });

  // Mutations
  const updateIdoMetricsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof idoMetricsFormSchema>) => {
      await apiRequest(`/api/projects/${project.id}/ido-metrics`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  const updatePlatformContentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof platformContentFormSchema>) => {
      await apiRequest(`/api/projects/${project.id}/platform-content`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
  });

  return (
    <Tabs defaultValue="ido-metrics" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="ido-metrics">IDO Metrics</TabsTrigger>
        <TabsTrigger value="platform-content">Platform Content</TabsTrigger>
        <TabsTrigger value="faqs">FAQ & L2E</TabsTrigger>
        <TabsTrigger value="marketing">Marketing Assets</TabsTrigger>
      </TabsList>

      <TabsContent value="ido-metrics" className="mt-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Public Round IDO Configuration</h3>
          <Form {...idoMetricsForm}>
            <form onSubmit={idoMetricsForm.handleSubmit((data) => updateIdoMetricsMutation.mutate(data))} className="space-y-8">
              
              {/* Important Dates Section */}
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
                            <FormLabel>IDO Price</FormLabel>
                            <FormControl>
                              <Input placeholder="0.05" {...field} />
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
                        name="totalAllocationDollars"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Total Allocation ($)</FormLabel>
                            <FormControl>
                              <Input placeholder="50000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={idoMetricsForm.control}
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
                        control={idoMetricsForm.control}
                        name="vestingPeriod"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Vesting Period (months)</FormLabel>
                            <FormControl>
                              <Input placeholder="12" {...field} />
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
                              <Input placeholder="3" {...field} />
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
                            <FormLabel>TGE Percentage (%)</FormLabel>
                            <FormControl>
                              <Input placeholder="20" {...field} />
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

                  <div className="space-y-6">
                    <div className="flex space-x-3">
                      <FormField
                        control={idoMetricsForm.control}
                        name="availableAtTge"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Available at TGE (%)</FormLabel>
                            <FormControl>
                              <Input placeholder="20" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={idoMetricsForm.control}
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
                        control={idoMetricsForm.control}
                        name="cliffLock"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Cliff/Lock</FormLabel>
                            <FormControl>
                              <Input placeholder="6 months" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={idoMetricsForm.control}
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
                        control={idoMetricsForm.control}
                        name="vestingDuration"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Vesting Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="12 months" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={idoMetricsForm.control}
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

              {/* Token Details Section */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Token Details
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex space-x-3">
                      <FormField
                        control={idoMetricsForm.control}
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
                        control={idoMetricsForm.control}
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
                        control={idoMetricsForm.control}
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
                        control={idoMetricsForm.control}
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
                        control={idoMetricsForm.control}
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
                        control={idoMetricsForm.control}
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
                        control={idoMetricsForm.control}
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
                        control={idoMetricsForm.control}
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
                        control={idoMetricsForm.control}
                        name="tokenTransferTxId"
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
                        control={idoMetricsForm.control}
                        name="tokenTransferTxIdStatus"
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
                        name="tokenContractAddress"
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
                        control={idoMetricsForm.control}
                        name="tokenContractAddressStatus"
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
            <form onSubmit={platformContentForm.handleSubmit((data) => updatePlatformContentMutation.mutate(data))} className="space-y-6">
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
                </div>

                <div className="space-y-6">
                  <div className="flex space-x-3">
                    <FormField
                      control={platformContentForm.control}
                      name="features"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Key Features</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={4}
                              placeholder="List key project features"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={platformContentForm.control}
                      name="featuresStatus"
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
                      name="roadmap"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Roadmap</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={4}
                              placeholder="Project development roadmap"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={platformContentForm.control}
                      name="roadmapStatus"
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
    </div>
  );
}