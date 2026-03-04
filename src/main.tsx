import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "./amplify";
import { ConsoleLogger } from 'aws-amplify/utils';
import type { ThemeConfig } from "antd";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#2351A3", // Primary color
    colorText: "#333333", // Default text color
    borderRadius: 5, // Border radius
    fontSize: 14, // Base font size
  },
  components: {
    Typography: {
      colorText: "#0056B3", // Override typography text color
      fontSize: 16,
    },
    Button: {
      colorPrimary: "#2351A3",
      colorPrimaryHover: "#2351A3",
      borderRadius: 5,
    },
    Input: {
      colorPrimary: "#C2CAD6",
      colorPrimaryHover: "#C2CAD6",
      borderRadius: 8,
    },
    Segmented: {
      trackBg: "#FFFFFF", // background of the "track"
      itemSelectedBg: "#2351a3", // selected item background
      itemHoverBg: "#F5f5f5", // selected item background
      itemSelectedColor: "#fff", // selected text color
    },
  },
};

ConsoleLogger.LOG_LEVEL = 'ERROR';
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#0b1220",
          color: "#E6EEF8",
          boxShadow: "0 6px 18px rgba(2,6,23,0.6)",
          borderRadius: "10px",
        },
      }}
    />
  </QueryClientProvider>
  // </StrictMode>
);
