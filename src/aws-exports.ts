import { VITE_APPSYNC_GRAPHQL_ENDPOINT } from "./config/publicEnv";

const awsconfig = {
  "aws_project_region": "eu-west-1",
  "aws_cognito_region": "eu-west-1",
  "aws_user_pools_id": "eu-west-1_6V6YQGAMZ",
  "aws_user_pools_web_client_id": "5thiq72rpontg9l2bq7fu3rhle",
  "aws_cognito_username_attributes": ["EMAIL", "PHONE_NUMBER"], // Support both email and phone
  "aws_cognito_signup_attributes": ["EMAIL", "PHONE_NUMBER"],   // Allow signup with email or phone
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": []
  },
  "aws_cognito_verification_mechanisms": ["EMAIL", "PHONE_NUMBER"] // Support verification via email or phone
  ,
  // AppSync Notification API
  API: {
    GraphQL: {
      endpoint: VITE_APPSYNC_GRAPHQL_ENDPOINT,
      region: "eu-west-1",
      defaultAuthMode: "userPool",
      additionalAuthModes: ["iam"],
    },
  },
};

export default awsconfig;
