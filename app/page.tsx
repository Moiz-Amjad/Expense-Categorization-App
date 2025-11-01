"use client";

import "@aws-amplify/ui-react/styles.css";
import { Button, withAuthenticator } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth";

function Home({ signOut: signOutFromHOC, user }: any) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <section className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-semibold">
          Welcome, {user?.username || "user"} 👋
        </h1>
        <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-300">
          You’re authenticated with AWS Cognito!
        </p>

        <Button
          onClick={async () => {
            await signOut();
            signOutFromHOC();
          }}
          variation="primary"
        >
          Sign Out
        </Button>
      </section>
    </main>
  );
}

const formFields = {
  signUp: {
    name: {
      order: 1,
      label: "Name",
      placeholder: "Enter your full name",
      isRequired: true,
    },
    email: {
      order: 2,
    },
    password: {
      order: 3,
    },
  },
};

// Wrap with Amplify's Authenticator HOC (prebuilt login/signup UI)
export default withAuthenticator(Home, { formFields });
