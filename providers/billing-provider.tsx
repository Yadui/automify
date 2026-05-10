"use client";

import React from "react";

type BillingProviderProps = {
  credits: string;
  tier: string;
  setCredits: React.Dispatch<React.SetStateAction<string>>;
  setTier: React.Dispatch<React.SetStateAction<string>>;
};

const initialValues: BillingProviderProps = {
  credits: "",
  setCredits: () => undefined,
  tier: "",
  setTier: () => undefined,
};

type WithChildProps = {
  children: React.ReactNode;
  initialCredits?: string | null;
  initialTier?: string | null;
};

const context = React.createContext(initialValues);
const { Provider } = context;

export const BillingProvider = ({ children, initialCredits, initialTier }: WithChildProps) => {
  const [credits, setCredits] = React.useState(initialCredits ?? initialValues.credits);
  const [tier, setTier] = React.useState(initialTier ?? initialValues.tier);

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
