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
let mainWindow = null // Current window
const electron = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path')
const app = electron.app
const log = require('electron-log');

function createdWindow (){
	mainWindow = new electron.BrowserWindow({
		icon: path.join(__dirname, 'static/icon.png'),
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			nodeIntegration: true,
		},
	});


	if (config.dev) {
		// Install vue dev tool and open chrome dev tools
		const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer')
		installExtension(VUEJS_DEVTOOLS.id).then(name => {
			console.log(`Added Extension:  ${name}`)
			mainWindow.webContents.openDevTools()
		}).catch(err => console.log('An error occurred: ', err))
		// Wait for nuxt to build
		const pollServer = () => {
			http.get(_NUXT_URL_, (res) => {
				if (res.statusCode === 200) { mainWindow.loadURL(_NUXT_URL_) } else { setTimeout(pollServer, 300) }
			}).on('error', pollServer);
			mainWindow.once('ready-to-show', () => {
				mainWindow.show();
				console.log("entro")
				log.info('verificando si hay actualizaciones1')
				autoUpdater.checkForUpdatesAndNotify();
				log.info('verificando si hay actualizaciones2')
			});
		}
		pollServer();
	} else {
		ready();
		return mainWindow.loadURL(_NUXT_URL_);
	}

	mainWindow.on('closed', () => mainWindow = null);

}

function ready(){
	mainWindow.once('ready-to-show', () => {
		console.log("entro")
		log.info('verificando si hay actualizaciones1')
		autoUpdater.checkForUpdatesAndNotify();
		log.info('verificando si hay actualizaciones2')
	});
}

app.on('ready', createdWindow)
app.on('window-all-closed', () => app.quit())
app.on('activate', () => mainWindow === null && createdWindow())


electron.ipcMain.on('app_version', (event) => {
	event.sender.send('app_version', { version: app.getVersion() });
	log.info('version: '+app.getVersion())
});

autoUpdater.on('update-available', () => {
	mainWindow.webContents.send('update_available');
	console.log("descargando actaulizacion");
	log.info('Hay actializacion pendiente')
});
autoUpdater.on('update-downloaded', () => {
	mainWindow.webContents.send('update_downloaded');
	log.info('Se esta descargando la actualizacion')
});
