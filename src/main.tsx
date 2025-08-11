import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Amplify } from 'aws-amplify'
import awsconfig from './aws-exports'

// Initialize AWS Amplify
Amplify.configure(awsconfig)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
) 