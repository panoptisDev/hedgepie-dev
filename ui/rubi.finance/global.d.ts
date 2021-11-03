type Env = {
  BUGSNAG_API_KEY: string;
  BUGSNAG_RELEASE_STAGE: string;
  APP_VERSION: string;
  TEAM_GATEWAY_ENDPOINT: string;
  PUBLIC_GATEWAY_ENDPOINT: string;
  NODE_ENV: string;
  MASQUERADE_REDIRECT_URL: string;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_DATABASE_URL: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_MEASUREMENT_ID: string;
  TEAM_MIMOBL_COM_BUGSNAG_API_KEY: string;
  COOKIE_DOMAIN: string;
  GATEWAY_API_URL: string;
  VAULT_ADDRESS: string;
}

declare const env: Env;

declare interface Window {
  ethereum: any;
  web3: any;
}

