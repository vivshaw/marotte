const TYPES = {
  Logger: Symbol('Logger'),
  BrowserService: Symbol('BrowserService'),
  HostService: Symbol('HostService'),
  Renderer: Symbol('Renderer'),
  Options: Symbol('Options'),
};

interface IOptions {
  port: number;
  host: string;
  pathParams: {
    workingDir: string;
    distSubDir: string;
  };
}

export { TYPES, IOptions };
