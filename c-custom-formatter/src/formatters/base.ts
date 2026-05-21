export default class BaseFormatter {
  name: string;
  constructor() {
    this.name = "base";
  }
  format(text: string): string {
    return text;
  }
}
