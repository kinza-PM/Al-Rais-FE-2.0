const awsconfig = {
  "aws_project_region": "eu-west-1",
  "aws_cognito_region": "eu-west-1",
  "aws_user_pools_id": "eu-west-1_rSwSQrvsW",
  "aws_user_pools_web_client_id": "4ll37dkksjgjb65cp96fc70k71",
  "aws_cognito_username_attributes": ["EMAIL"],
  "aws_cognito_signup_attributes": ["EMAIL"],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": []
  },
  "aws_cognito_verification_mechanisms": ["EMAIL"]
};

export default awsconfig; 