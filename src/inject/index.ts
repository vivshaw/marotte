import colors from '../util/colors.util';

export const TAG = colors.INJECT('SETUP: ');

export const TYPES = {
  Logger: Symbol('Logger'),
  BrowserService: Symbol('BrowserService'),
  HostService: Symbol('HostService'),
  Renderer: Symbol('Renderer'),
  Options: Symbol('Options'),
};
