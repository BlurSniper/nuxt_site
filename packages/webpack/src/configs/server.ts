import { ProvidePlugin } from 'webpack'
import { WebpackConfigContext, applyPresets, getWebpackConfig } from '../utils/config'
import { nuxt } from '../presets/nuxt'
import { node } from '../presets/node'

export function server (ctx: WebpackConfigContext) {
  ctx.name = 'server'
  ctx.isServer = true

  applyPresets(ctx, [
    nuxt,
    node,
    serverStandalone,
    serverPreset,
    serverPlugins
  ])

  return getWebpackConfig(ctx)
}

function serverPreset (ctx: WebpackConfigContext) {
  const { config } = ctx

  config.output.filename = 'server.js'
  config.devtool = 'cheap-module-source-map'

  config.optimization = {
    splitChunks: false,
    minimize: false
  }
}

function serverStandalone (ctx: WebpackConfigContext) {
  // TODO: Refactor this out of webpack
  const inline = [
    'src/',
    '@nuxt/app',
    'vuex5',
    '!',
    '-!',
    '~',
    '@/',
    '#',
    ...ctx.options.build.transpile
  ]

  if (!Array.isArray(ctx.config.externals)) { return }
  ctx.config.externals.push(({ request }, cb) => {
    if (
      request[0] === '.' ||
      request[0] === '/' ||
      inline.find(prefix => request.startsWith(prefix))
    ) {
      // console.log('Inline', request)
      return cb(null, false)
    }
    // console.log('Ext', request)
    return cb(null, true)
  })
}

function serverPlugins (ctx: WebpackConfigContext) {
  const { config, options } = ctx

  // Server polyfills
  if (options.build.serverURLPolyfill) {
    config.plugins.push(new ProvidePlugin({
      URL: [options.build.serverURLPolyfill, 'URL'],
      URLSearchParams: [options.build.serverURLPolyfill, 'URLSearchParams']
    }))
  }
}
