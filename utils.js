import config from './config.js';

const sendError = (res, status, error) => {
  console.error(error);

  res.status(status).render('error', {
    layout: 'error',
    errorCode: status,
    errorMessage: config.ERRORS[status] || 'An unexpected error occurred.'
  });
}

export {
  sendError
};