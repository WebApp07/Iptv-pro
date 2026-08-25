"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useFreeTrial } from "@/components/free-trial/free-trial-context";

export type FreeTrialButtonProps = Omit<ButtonProps, "onClick" | "type">;

/**
 * Opens the shared free-trial modal. Accepts the same props as Button so
 * every CTA keeps its existing variant, size and styling.
 */
export function FreeTrialButton({
  children,
  ...props
}: FreeTrialButtonProps) {
  const { openFreeTrial } = useFreeTrial();

  return (
    <Button type="button" onClick={openFreeTrial} {...props}>
      {children}
    </Button>
  );
}
