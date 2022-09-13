import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Finder from '../views/Finder.vue'
import Assessor from '../views/Assessor.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/finder',
    name: 'finder',
    component: Finder
  },
  {
    path: '/assessor/:assessor',
    name: 'assessor',
    component: Assessor
  },
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
