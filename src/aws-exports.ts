const awsconfig = {
  "aws_project_region": "eu-west-1",
  "aws_cognito_region": "eu-west-1",
  "aws_user_pools_id": "eu-west-1_rSwSQrvsW",
  "aws_user_pools_web_client_id": "4ll37dkksjgjb65cp96fc70k71",
  "aws_cognito_username_attributes": ["EMAIL", "PHONE_NUMBER"], // Support both email and phone
  "aws_cognito_signup_attributes": ["EMAIL", "PHONE_NUMBER"], // Allow signup with email or phone
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": []
  },
  "aws_cognito_verification_mechanisms": ["EMAIL", "PHONE_NUMBER"] // Support verification via email or phone
};

export default awsconfig; 