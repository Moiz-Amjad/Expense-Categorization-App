"use client";

export const resourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
      loginWith: { email: true },
      signUpVerificationMethod: "code",
      oauth: {
        domain: process.env.NEXT_PUBLIC_AWS_USER_DOMAIN, // no https://
        scopes: ["email", "openid", "profile"],
        redirectSignIn: "http://localhost:3000/",
        redirectSignOut: "http://localhost:3000/",
        responseType: "code",
      },
    },
  },
};