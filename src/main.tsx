// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import type { ThemeConfig } from "antd";
import { ConfigProvider } from "antd";

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
  },
};

// Initialize AWS Amplify
Amplify.configure(awsconfig);

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <ConfigProvider theme={theme}>
    <App />
  </ConfigProvider>
  // </StrictMode>
);
