/** Here are the routes defined that the app can navigate to */

const routes = [
  {
    // The main path, shows the index page by default
    path: '/',
    component: () => import('layouts/IndexLayout.vue'),
    children: [{ path: '', component: () => import('pages/Index.vue') }],
  },
  {
    // Lists all the models available in the app
    path: '/models',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Models.vue') }],
  },
  {
    // Generates a route for configured models in public/models
    path: '/models/:id',
    component: () => import('layouts/ARLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/Viewer.vue'),
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
