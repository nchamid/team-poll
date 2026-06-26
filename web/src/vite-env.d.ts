/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AZURE_CLIENT_ID: string;
  readonly VITE_AZURE_TENANT_ID: string;
  readonly VITE_AZURE_REDIRECT_URI: string;
  readonly VITE_API_SCOPE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APPINSIGHTS_CONNECTION_STRING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Allow importing CSS modules with typed class maps.
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
