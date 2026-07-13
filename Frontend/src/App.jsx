import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/common/ScrollToTop";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: 14 },
            success: {
              style: { background: "#D1FAE5", color: "#065F46" },
              iconTheme: { primary: "#065F46", secondary: "#D1FAE5" },
            },
            error: {
              style: { background: "#FEE2E2", color: "#991B1B" },
              iconTheme: { primary: "#991B1B", secondary: "#FEE2E2" },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
