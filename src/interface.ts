export interface EngineOptions {
  doctype: string,
  beautify: boolean,
  transformViews: boolean,
  babel: {
    presets: Array < string | number | Array<string | object> >
  }
}