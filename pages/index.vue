<template>
	<section class="container">
		<div>
			<img width="256" src="~/assets/img/logo.png">
			<h1>actualizaciones-electron</h1>
			<h2>Nuxt + Electron</h2>
			<a href="https://nuxtjs.org/" target="_blank" class="btn btn-primary">Documentation</a>
			<a href="https://github.com/nuxt/nuxt.js" target="_blank" class="btn btn-primary">GitHub</a>
			<a href="https://electronjs.org/" target="_blank" class="btn btn-secondary">Electron</a>
			<a href="https://github.com/electron-userland/electron-builder" target="_blank" class="btn btn-secondary">Electron Builder</a>
		</div>
    {{version}} del sistema
    <div id="notification" class="hidden"></div>
    <button @click="check">Buscar update</button>
	</section>
</template>

<script>
import {ipcRenderer} from "electron";
const notification = document.getElementById('notification');
export default {
  data(){
    return{
      version: '',
      mensaja: ''
    }
  },
  created(){
    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
      ipcRenderer.removeAllListeners('app_version');
      this.version = arg.version
    });
  },
  methods:{
    check(){
      ipcRenderer.send('check_updute');
    }
  }
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
}
.btn {
	margin: 0 8px;
}
#notification {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 200px;
  padding: 20px;
  border-radius: 5px;
  background-color: white;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}
.hidden {
  display: none;
}
</style>
