import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';
import App from './App.vue';
import Home from './Home.vue';
import Events from './Events.vue';
import EventsPage from './SingleEventsPage';
import RegisterPage from './register';
import LoginPage from './login';
import CreateEvent from './createEvent';
import Profile from './profile';

import axios from 'axios';
import ElementPlus from 'element-plus'

const routes = [
    {
        path: "/",
        name: "home",
        component: Home
    },
    {
        path: "/events/:eventId",
        name: 'event',
        component: EventsPage
    },
    {
        path: "/events",
        name: 'events',
        component: Events
    },
    {
        path: "/register",
        name: "register",
        component: RegisterPage
    },
    {
        path: "/login",
        name: "login",
        component: LoginPage
    },
    {
        path: "/createEvent",
        name: "createevent",
        component: CreateEvent
    },
    {
        path: "/profile",
        name: "profile",
        component: Profile
    }
];

const router = createRouter({
    routes,
    history: createWebHistory()
});

const app = createApp(App);
app.use(ElementPlus)

app.use(router);
app.config.globalProperties.axios = axios;
app.mount('#app');