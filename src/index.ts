import { h } from 'preact'
import { renderToString } from 'preact-render-to-string'
import beautifyHTML from 'js-beautify'
import _escaperegexp from 'lodash.escaperegexp'
import { EngineOptions } from './interface'

const OPTIONS: EngineOptions = {
  doctype: '<!DOCTYPE html>',
  beautify: false,
  transformViews: true,
  babel: {
    presets: [
      'preact',
      [
        'env',
        {
          targets: {
            node: 'current'
          }
        }
      ]
    ]
  }
}

// invalidate require
declare const require: any;

const createEngine = (engineOptions: EngineOptions) => {
  let registered: boolean = false
  let moduleDetectRegEx: InstanceType<typeof RegExp>

  engineOptions = Object.assign({}, OPTIONS, engineOptions || {})

  const renderFile = (filename: string, options: any, cb: (err:string | null, markup?: string) => {}) => {
    if (!moduleDetectRegEx) {
      moduleDetectRegEx = new RegExp(
        []
        .concat(options.settings.views)
        .map(viewPath => '^' + _escaperegexp(viewPath))
        .join('|')
      )
    }

    if (engineOptions.transformViews && !registered) {
      // Passing a RegExp to Babel results in an issue on Windows so we'll just pass the view path.
      require('babel-register') (
        Object.assign({ only: options.settings.views}, engineOptions.babel)
      )
      registered = true
    }

    let markup: string = engineOptions.doctype
    let component = require(filename)

    component = component.default || component
    markup += renderToString(h(component, options))

    try {
      markup = engineOptions.doctype
    } catch (err: any) {
      return cb(err)
    } finally {
      if (options.settings.env === 'development') {
        // Remove all files from the module cache that are in the view folder.
        Object.keys(require.cache).forEach((module) => {
          if (moduleDetectRegEx.test(require.cache[module].filename)) delete require.cache[module]
        })
      }

      if (engineOptions.beautify) {
        markup = beautifyHTML(markup);
      }

      cb(null, markup);
    }
    return renderFile
  }
}

export default createEngine