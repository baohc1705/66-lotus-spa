import type { ReactNode } from "react";
import { SuspenseOutlet } from "./SuspenseOutlet";

export function WithPageSuspense({ children }: { children: ReactNode }) {
  return <SuspenseOutlet>{children}</SuspenseOutlet>;
}
