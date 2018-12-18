interface StringIndexer<T> {
  [name: string]: T;
}

interface HTTPInfo {
  headers: StringIndexer<string> & {
    length: number;
  };
  statusCode: number;
}

export class HTTPParser {
  static REQUEST: string;
  static RESPONSE: string;

  static kOnHeaders: number;
  static kOnHeadersComplete: number;
  static kOnBody: number;
  static kOnMessageComplete: number;

  static methods: string[];

  info: HTTPInfo;
  isUserCall: boolean;

  constructor(kind: string);

  [n: number]: Function; // state machine callbacks

  execute(buffer: Buffer): void;
}
