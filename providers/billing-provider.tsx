"use client";

import React from "react";
import { getBillingData } from "@/app/(main)/_actions/get-billing";

type BillingProviderProps = {
  credits: number;
  tier: string;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  setTier: React.Dispatch<React.SetStateAction<string>>;
};

const initialValues: BillingProviderProps = {
  credits: 0,
  setCredits: () => undefined,
  tier: "",
  setTier: () => undefined,
};

type WithChildProps = {
  children: React.ReactNode;
  /** @deprecated Pass is no-op; billing is fetched client-side on mount. */
  initialCredits?: string | null;
  /** @deprecated Pass is no-op; billing is fetched client-side on mount. */
  initialTier?: string | null;
};

const context = React.createContext(initialValues);
const { Provider } = context;

export const BillingProvider = ({ children }: WithChildProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [credits, setCredits] = React.useState<any>(initialValues.credits);
  const [tier, setTier] = React.useState<string>(initialValues.tier);

  // Fetch billing data client-side so the server layout doesn't need a DB
  // round-trip for billing on every initial page load.
  React.useEffect(() => {
    getBillingData()
      .then((data) => {
        if (!data) return;
        setCredits(data.credits ?? initialValues.credits);
        if (data.tier) setTier(data.tier);
      })
      .catch(() => {
        // Silently ignore — billing defaults (0 / "") are safe fallbacks.
      });
  }, []);

  const values = {
    credits,
    setCredits,
    tier,
    setTier,
  };

  return <Provider value={values}>{children}</Provider>;
};

export const useBilling = () => {
  const state = React.useContext(context);
  return state;
};
