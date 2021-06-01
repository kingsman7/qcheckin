const pages = config('pages') // Get Pages from config
//Blog
export default [
  {
    title: 'qcheckin.sidebar.checkin',
    icon: 'fas fa-stopwatch',
    children: [
      pages.mainqcheckin.shiftsIndex,
    ]
  },
]
