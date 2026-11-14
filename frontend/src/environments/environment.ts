export const environment = {
  apiUrl: globalThis.location?.hostname.endsWith('.trycloudflare.com') ? '' : 'http://localhost:3000',
  googleClientId: '905830302065-0ms2h005ivs6e4glssapti1mprg4l28s.apps.googleusercontent.com'
};
