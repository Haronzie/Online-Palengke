/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Add more environment variables as needed
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_VERSION?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly hot?: import('vite/types/hot').ViteHotContext
  readonly glob: import('vite/types/importGlob').ImportGlobFunction
}

// Legacy support for process.env (for easier migration from CRA)
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly REACT_APP_API_URL?: string
    }
  }
}

// Testing library types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string | RegExp): R
      // Add other jest-dom matchers as needed
    }
  }
}
