import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { SiteConfig } from '@shared/schema';

interface ConfigContextType {
  config: SiteConfig | null;
  isLoading: boolean;
  updateConfig: (updates: Partial<SiteConfig>) => Promise<void>;
  refetchConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: config, isLoading, refetch } = useQuery<SiteConfig>({
    queryKey: ['/api/config'],
    staleTime: 0, // Always fetch fresh data for real-time sync
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<SiteConfig>) => {
      const response = await apiRequest('PUT', '/api/config', updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
    },
  });

  const updateConfig = async (updates: Partial<SiteConfig>) => {
    await updateConfigMutation.mutateAsync(updates);
  };

  const value: ConfigContextType = {
    config: config || null,
    isLoading,
    updateConfig,
    refetchConfig: refetch,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
