"use client";

import "@aws-amplify/ui-react/styles.css";
import { Button, withAuthenticator } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function Home({ signOut: signOutFromHOC, user }: any) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [gmailConnected, setGmailConnected] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  
  const searchParams = useSearchParams();

  // Check for OAuth callback params
  useEffect(() => {
    const connected = searchParams.get("gmail_connected");
    const token = searchParams.get("access_token");
    const refresh = searchParams.get("refresh_token");
    const oauthError = searchParams.get("error");
    const oauthMessage = searchParams.get("message");

    if (connected === "true" && token) {
      setGmailConnected(true);
      setAccessToken(token);
      if (refresh) {
        setRefreshToken(refresh);
      }
      setMessage("Gmail connected successfully! You can now fetch your expenses.");
      
      // Clean up URL params
      window.history.replaceState({}, "", "/");
    }

    if (oauthError) {
      setError(oauthMessage || "Failed to connect Gmail");
      // Clean up URL params
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  const handleConnectGmail = () => {
    // Redirect to OAuth initiation route
    window.location.href = "/api/auth/google";
  };

  const handleGetExpenses = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Invoke Lambda function to fetch Gmail expenses
      const response = await fetch("/api/ingest-gmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.username || "test-user",
          accessToken: gmailConnected ? accessToken : undefined,
          refreshToken: gmailConnected ? refreshToken : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch expenses");
      }

      const s3Location = data.data.s3Location 
        ? ` Data saved to S3.` 
        : '';
      setMessage(
        `Successfully ingested ${data.data.emailCount} emails!${s3Location}`
      );
    } catch (err: any) {
      console.error("Error fetching expenses:", err);
      setError(err.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {user?.username || "User"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Expense Manager
              </p>
            </div>
          </div>
          <Button
            onClick={async () => {
              await signOut();
              signOutFromHOC();
            }}
            variation="link"
            size="small"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Console */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Console
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Manage and track your expenses
          </p>

          {/* Action Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Your Expenses
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {!gmailConnected 
                    ? "Connect your Gmail account to start tracking expenses"
                    : "Fetch transaction emails from your Gmail inbox"}
                </p>
              </div>

              {/* Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Connect Gmail Button */}
                {!gmailConnected ? (
                  <button
                    onClick={handleConnectGmail}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Connect Gmail
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Gmail Connected</span>
                  </div>
                )}

                {/* Get Expenses Button - Only show when Gmail is connected */}
                {gmailConnected && (
                  <button
                    onClick={handleGetExpenses}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <span>Fetch Expenses</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Success Message */}
              {message && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {message}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
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
