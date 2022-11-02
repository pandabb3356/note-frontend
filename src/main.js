import Vue from 'vue'

import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'


Vue.use(VueAxios, axios)

// vue extends
const eventBus = new Vue();
Vue.prototype.$eventBus = eventBus;

import './assets/main.css'
import {AnnotationEventMixin} from "./event/annotation";
import {currentUser} from "./config";
import {getUser} from "./utils";

// global mixins
Vue.mixin(AnnotationEventMixin);
Vue.mixin({
  provide: {
    currentUser: currentUser
  },
  methods: {
    userName(userId) {
      const user = getUser(userId);
      return user && user.name;
    },
  }
});


new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
