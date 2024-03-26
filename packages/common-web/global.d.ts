declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

interface Window {
  fathom: {
    trackEvent: (eventName: string, data?: object) => void;
  };
}