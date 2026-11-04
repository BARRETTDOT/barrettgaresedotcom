import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '5wv4afsl',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  // The Preview tab reuses the website's renderer and styles from ../src, so let the
  // dev server read files from the repo root as well as studio/.
  vite: (config) => ({
    ...config,
    server: {...config.server, fs: {...config.server?.fs, allow: [...(config.server?.fs?.allow ?? []), '..']}},
  }),
})
