export default {
  auth: {
    signOut: '/auth/sign-out',
    signIn: '/auth/sign-in'
  },
  app: {
    index: '/',
    monitors: {
      index: '/monitors',
      list: '/monitors',
      create: '/monitors/create',
      edit: '/monitors/:id/edit',
      delete: '/monitors/:id/delete',
    }
  }
}