"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

export interface AvailableService {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  frontendUrl: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

interface ServiceContextValue {
  services: AvailableService[];
  currentSlug: string | null;
  switchService: (slug: string) => void;
  loading: boolean;
}

const ServiceContext = createContext<ServiceContextValue>({
  services: [],
  currentSlug: null,
  switchService: () => {},
  loading: true,
});

export function useService() {
  return useContext(ServiceContext);
}

const STORAGE_KEY = "epn_admin_service_slug";

export function getServiceSlug(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function ServiceProvider({
  children,
  fetchServices,
}: {
  children: ReactNode;
  fetchServices: () => Promise<AvailableService[]>;
}) {
  const [services, setServices] = useState<AvailableService[]>([]);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices()
      .then((list) => {
        setServices(list);
        const saved = localStorage.getItem(STORAGE_KEY);
        const valid = list.find((s) => s.slug === saved);
        const slug = valid ? saved : list[0]?.slug ?? null;
        setCurrentSlug(slug);
        if (slug) localStorage.setItem(STORAGE_KEY, slug);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchServices]);

  const switchService = useCallback((slug: string) => {
    setCurrentSlug(slug);
    localStorage.setItem(STORAGE_KEY, slug);
  }, []);

  return (
    <ServiceContext.Provider value={{ services, currentSlug, switchService, loading }}>
      {children}
    </ServiceContext.Provider>
  );
}
