"use client";

import { Amplify } from "aws-amplify";
import { resourcesConfig } from "./aws-exports";

Amplify.configure(resourcesConfig);

export default function AmplifyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
