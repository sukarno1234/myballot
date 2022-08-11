import Vue from 'vue'
import App from './App.vue'
import vuetify from "vuetify";
import VueSweetalert2 from 'vue-sweetalert2';
import 'vuetify/dist/vuetify.min.css';
// If you don't need the styles, do not connect
import 'sweetalert2/dist/sweetalert2.min.css';



Vue.use(vuetify);
Vue.use(VueSweetalert2);


Vue.config.productionTip = false

new Vue({
  vuetify: new vuetify(), //<-----
  render: h => h(App),
}).$mount('#app')
