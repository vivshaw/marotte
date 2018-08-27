const TYPES = {
  Logger: Symbol('Logger'),
  BrowserService: Symbol('BrowserService'),
  HostService: Symbol('HostService'),
  Renderer: Symbol('Renderer'),
  Options: Symbol('Options'),
  ServerProvider: Symbol('ServerProvider'),
  BrowserProvider: Symbol('BrowserProvider'),
};

interface IOptions {
  port: number;
  host: string;
  pathParams: {
    workingDir: string;
    distSubDir: string;
  };
  verbose: boolean;
}

export { TYPES, IOptions };
