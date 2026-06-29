import api from './axios';
import { getPayload, normalizeUser } from './helpers';

const unwrapAuth = (promise) =>
  promise.then((res) => {
    const payload = getPayload(res);
    if (payload?.user) {
      return { ...payload, user: normalizeUser(payload.user) };
    }
    if (payload?.accessToken) {
      return payload;
    }
    return payload;
  });

export const loginApi = (credentials) =>
  unwrapAuth(api.post('/auth/login', credentials));

export const registerApi = ({ companyName, name, email, password }) =>
  unwrapAuth(api.post('/auth/register', { companyName, name, email, password }));

export const logoutApi = () =>
  api.post('/auth/logout').then((res) => getPayload(res));

export const refreshTokenApi = ({ refreshToken }) =>
  unwrapAuth(api.post('/auth/refresh-token', { refreshToken }));

export const forgotPasswordApi = ({ email }) =>
  api.post('/auth/forgot-password', { email }).then((res) => getPayload(res));

export const resetPasswordApi = ({ token, password }) =>
  api.post('/auth/reset-password', { token, password }).then((res) => getPayload(res));

export const setInvitePasswordApi = ({ token, password }) =>
  api.post('/auth/set-password', { token, password }).then((res) => getPayload(res));

export const changePasswordApi = ({ oldPassword, newPassword }) =>
  api.post('/auth/change-password', { oldPassword, newPassword }).then((res) => getPayload(res));

export const getMeApi = () =>
  api.get('/auth/me').then((res) => normalizeUser(getPayload(res)));
