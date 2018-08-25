import colors from '../util/colors.util';

export const TAG = colors.RUN('-> ');

export interface IOptions {
  port: number;
  host: string;
  pathParams: {
    workingDir: string;
    distSubDir: string;
  };
}
