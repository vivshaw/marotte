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

interface IArgsType {
  workingdir?: string;
  port?: number;
  dist?: string;
}

type TsClass = new (...args: any[]) => any;
type InjectIdentifier = TsClass | symbol;

type Func = (...args: any[]) => any;

type Provider<T> = (...args: any[]) => Promise<T>;

export { TYPES, IArgsType, IOptions, TsClass, InjectIdentifier, Func, Provider };
