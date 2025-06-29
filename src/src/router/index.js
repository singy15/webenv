import { createRouter, createWebHashHistory } from "vue-router";
import Main from "../views/Editor.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Main,
    },
    {
      path: "/debug",
      name: "debug",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/DebugView.vue"),
    },
  ],
});

export default router;
