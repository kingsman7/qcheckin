export default {
  shiftsIndex: {
    permission: 'icheckin.shifts.manage',
    activated: true,
    authenticated: true,
    path: '/checkin/shifts',
    name: 'qcheckin.admin.shifts.index',
    crud: import('@imagina/qcheckin/_crud/shifts'),
    page: () => import('@imagina/qcrud/_pages/admin/crudPage'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'qcheckin.sidebar.Shifts',
    icon: 'fas fa-user-clock',
    subHeader: {
      refresh: true,
    }
  },
}
