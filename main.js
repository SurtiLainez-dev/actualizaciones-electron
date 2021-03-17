/*
**  Nuxt
*/
const http = require('http')
const { Nuxt, Builder } = require('nuxt')
let config = require('./nuxt.config.js')
config.rootDir = __dirname // for electron-builder
// Init Nuxt.js
const nuxt = new Nuxt(config)
const builder = new Builder(nuxt)
const server = http.createServer(nuxt.render)
// Build only in dev mode
if (config.dev) {
	builder.build().catch(err => {
		console.error(err) // eslint-disable-line no-console
		process.exit(1)
	})
}
// Listen the server
server.listen()
const _NUXT_URL_ = `http://localhost:${server.address().port}`
console.log(`Nuxt working on ${_NUXT_URL_}`)

/*
** Electron
*/
let win = null // Current window
const electron = require('electron');
const path = require('path')
const app = electron.app
const log = require('electron-log');
const {dialog} = require('electron');
const { autoUpdater } = require('electron-updater')
autoUpdater.autoDownload = false
if(require('electron-squirrel-startup')) return;

const newWin = () => {
	win = new electron.BrowserWindow({
		icon: path.join(__dirname, 'static/icon.png')
	});

	win.maximize()

	// require('update-electron-app')({
	// 	host: 'https://github.com/',
	// 	repo: 'SurtiLainez-dev/actualizaciones-electron',
	// 	updateInterval: '5 minutes',
	// 	logger: require('electron-log'),
	// 	notifyUser: true
	// })

	win.on('closed', () => win = null)
	if (config.dev) {
		// Install vue dev tool and open chrome dev tools
		const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer')
		installExtension(VUEJS_DEVTOOLS.id).then(name => {
			console.log(`Added Extension:  ${name}`)
			win.webContents.openDevTools()
		}).catch(err => console.log('An error occurred: ', err))
		// Wait for nuxt to build
		const pollServer = () => {
			http.get(_NUXT_URL_, (res) => {
				if (res.statusCode === 200) { win.loadURL(_NUXT_URL_) } else { setTimeout(pollServer, 300) }
			}).on('error', pollServer)
		}
		pollServer()
	} else { return win.loadURL(_NUXT_URL_) }

	win.on('closed', () => win = null);

}

app.on('ready', newWin)
app.on('window-all-closed', () => app.quit())
app.on('activate', () => win === null && newWin())


electron.ipcMain.on('app_version', (event) => {
	event.sender.send('app_version', { version: app.getVersion() });
	log.info('version: '+app.getVersion())
});

autoUpdater.on('error', (error) => {
	dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})

electron.ipcMain.on('check_updute', ()=>{
	console.log("entro");
	log.info('entro a check1')
	autoUpdater.checkForUpdates();
	log.info('entro a check2')
});
