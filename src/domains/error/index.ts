export class BizError extends Error {
  messages: string[];
  code?: string | number;
  data: unknown | null = null;

  constructor(msg: string[], code?: string | number, data: unknown = null) {
    super(msg.join("\n"));

    this.messages = msg;
    this.code = code;
    this.data = data;
  }
}
