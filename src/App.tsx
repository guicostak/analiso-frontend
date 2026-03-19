import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { GlossaryProvider } from "./components/glossary/glossary-context";

const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ??
  "443722990095-fssh39e39fr204tuphhlbnfu2rde3t7m.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <GlossaryProvider>
          <RouterProvider router={router} />
        </GlossaryProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
