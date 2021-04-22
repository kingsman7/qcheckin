const pages = config('pages') // Get Pages from config

//Blog
export default [
  {
    title: 'qblog.sidebar.adminGroup',
    icon: 'fab fa-home',
    icon: 'fab fa-home',
    children: [
      // pages.qblog.posts, // posts setup
      // pages.qblog.categories, // categories setup
      // pages.qblog.postsInternal, // Post internal
    ]
  },
]
