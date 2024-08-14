import config from './config.js';

const sendError = (res, status, error) => {
  console.error(error);

  res.status(status).render('error', {
    layout: 'error',
    errorCode: status,
    errorMessage: config.ERRORS[status] || 'An unexpected error occurred.'
  });
}

const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}

export default {
  sendError,
  generateRandomString
};