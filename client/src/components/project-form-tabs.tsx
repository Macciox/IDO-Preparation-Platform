import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  { value: "confirmed", label: "✅ Confirmed" },
  { value: "not_confirmed", label: "❌ Not Confirmed" },
  { value: "might_change", label: "⚠️ Might Change" },
];

// Network options
const networkOptions = [
  { value: "ethereum", label: "Ethereum" },
  { value: "base", label: "Base" },
  { value: "polygon", label: "Polygon" },
  { value: "bsc", label: "BSC" },
  { value: "arbitrum", label: "Arbitrum" },
];

// Minimum tier options
const minimumTierOptions = [
  { value: "base", label: "Base" },
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "diamond", label: "Diamond" },
];

interface ProjectFormTabsProps {
  project: ProjectWithData;
  activeTab: string;
}

export default function ProjectFormTabs({ project, activeTab }: ProjectFormTabsProps) {
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
      idoPrice: project.idoMetrics?.idoPrice || "",
      idoPriceStatus: project.idoMetrics?.idoPriceStatus || "not_confirmed",
      tokensForSale: project.idoMetrics?.tokensForSale || "",
      tokensForSaleStatus: project.idoMetrics?.tokensForSaleStatus || "not_confirmed",
      availableAtTge: project.idoMetrics?.availableAtTge || "",
      availableAtTgeStatus: project.idoMetrics?.availableAtTgeStatus || "not_confirmed",
      cliffLock: project.idoMetrics?.cliffLock || "",
      cliffLockStatus: project.idoMetrics?.cliffLockStatus || "not_confirmed",
      vestingDuration: project.idoMetrics?.vestingDuration || "",
      vestingDurationStatus: project.idoMetrics?.vestingDurationStatus || "not_confirmed",
      tokenTicker: project.idoMetrics?.tokenTicker || "",
      tokenTickerStatus: project.idoMetrics?.tokenTickerStatus || "not_confirmed",
      network: project.idoMetrics?.network || "",
      networkStatus: project.idoMetrics?.networkStatus || "not_confirmed",
      gracePeriod: project.idoMetrics?.gracePeriod || "",
      gracePeriodStatus: project.idoMetrics?.gracePeriodStatus || "not_confirmed",
      minimumTier: project.idoMetrics?.minimumTier || "",
      minimumTierStatus: project.idoMetrics?.minimumTierStatus || "not_confirmed",
      tokenTransferTxId: project.idoMetrics?.tokenTransferTxId || "",
      tokenTransferTxIdStatus: project.idoMetrics?.tokenTransferTxIdStatus || "not_confirmed",
      tokenContractAddress: project.idoMetrics?.tokenContractAddress || "",
      tokenContractAddressStatus: project.idoMetrics?.tokenContractAddressStatus || "not_confirmed",
      transactionId: project.idoMetrics?.transactionId || "",
      transactionIdStatus: project.idoMetrics?.transactionIdStatus || "not_confirmed",
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
    <div>
      {/* IDO Metrics Tab */}
      {activeTab === "ido" && (
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
                        name="idoPrice"
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
                        name="idoPriceStatus"
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
                        name="tokensForSale"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tokens for Sale</FormLabel>
                            <FormControl>
                              <Input placeholder="1000000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={idoMetricsForm.control}
                        name="tokensForSaleStatus"
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