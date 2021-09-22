interface Env {
  GATEWAY_API_URL: string;
  NODE_ENV: 'production'|'development';
	BUGSNAG_API_KEY: string;
  APP_VERSION: string;
  BUGSNAG_RELEASE_STAGE: string;
}

declare const env: Env;
