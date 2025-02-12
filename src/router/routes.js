/** Here are the routes defined that the app can navigate to */

const routes = [
  {
    // The main path, shows the index page by default
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/ModelList.vue') }],
  },
  {
    // Lists all the models available in the app
    path: '/models',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/ModelList.vue') }],
  },
  /* Custom routes for objects */
  {
    path: '/models/flussmine',
    component: () => import('layouts/ARLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/ViewerFlussmine.vue'),
      },
    ],
  },
  {
    path: '/models/fehmarnbelt',
    component: () => import('layouts/ARLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/ViewerFehmarnbelt.vue'),
      },
    ],
  },
  {
    path: '/models/apex',
    component: () => import('layouts/ARLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/ViewerApex.vue'),
      },
    ],
  },
  {
    path: '/models/chronometer',
    component: () => import('layouts/ARLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/CustomViewerChronometer.vue'),
      },
    ],
  },

  // Always leave this as last one, shows an error page
  {
    path: '/:catchAll(.*)*',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Error404.vue') }],
  },
]

export default routes
