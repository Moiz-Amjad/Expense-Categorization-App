import "./globals.css";
import AmplifyProvider from "./amplify-provider";

export const metadata = {
  title: "My Next.js App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
