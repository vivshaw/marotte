// Symbolic identifiers for Inversify
const TYPES = {
  Logger: Symbol('Logger'),
  BrowserService: Symbol('BrowserService'),
  HostService: Symbol('HostService'),
  Renderer: Symbol('Renderer'),
  Options: Symbol('Options'),
  ServerProvider: Symbol('ServerProvider'),
  BrowserProvider: Symbol('BrowserProvider'),
};

// Options injected into components
interface IOptions {
  port: number;
  host: string;
  pathParams: {
    workingDir: string;
    distSubDir: string;
  };
  verbose: boolean;
}

// Arguments from CLI
interface IArgsType {
  workingdir?: string;
  port?: number;
  dist?: string;
}

// Any TypeScript class
type TsClass = new (...args: any[]) => any;

// Any identifier accepted by Inversify
type InjectIdentifier = TsClass | symbol | string;

// Any function
type Func = (...args: any[]) => any;

// Any Inversify provider
type Provider<T> = (...args: any[]) => Promise<T>;

// closeable component
interface ICloseable {
  onClose: () => Promise<void>;
}

// closeable component
interface IReadiable {
  Ready: Promise<any>;
}

export { TYPES, IArgsType, IOptions, TsClass, InjectIdentifier, Func, Provider, ICloseable, IReadiable };
