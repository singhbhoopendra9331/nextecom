
/** todo: create re-usable logger functions, better logging, based on environment */

export const logger = {
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[LOG] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
};