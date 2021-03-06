module.exports = {
	mode: 'spa',
	head: {title: 'actualizaciones-electron'}, // Headers of the page
	loading: false, // Disable default loading bar
	pluginOptions: {
		electronBuilder: {
			builderOptions: {
				publish: ['github']
			}
		}
	},
	build: {
		extend (config, { isDev, isClient }) {
			if (isDev && isClient) {
				// Run ESLint on save
				config.module.rules.push({
					enforce: 'pre',
					test: /\.(js|vue)$/,
					exclude: /(node_modules)/
				})
			}
			// Extend only webpack config for client-bundle
			if (isClient) { config.target = 'electron-renderer' }
		}
	},
	dev: process.env.NODE_ENV === 'DEV',
	css: [
		'@/assets/css/global.css'
	]
}
