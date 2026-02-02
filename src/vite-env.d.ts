/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CSV_URL?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
