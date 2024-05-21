interface AppConfig {
  brand: {
    appName: string;
    logoUrl: string;
  };
}

const appConfig: AppConfig = {
  brand: {
    appName: "RemixBreeze",
    logoUrl: "/images/logo.svg",
  },
};

export default appConfig;
