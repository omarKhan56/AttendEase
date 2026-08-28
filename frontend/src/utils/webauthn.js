import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export const enrollDevice = async (label = 'My device') => {
  const { data: options } = await axios.get(`${API}/webauthn/register/options`);
  const attestationResponse = await startRegistration({ optionsJSON: options });
  await axios.post(`${API}/webauthn/register/verify`, { ...attestationResponse, label });
};

export const getBiometricAssertion = async (sessionId) => {
  const { data: options } = await axios.post(`${API}/webauthn/authenticate/options`, { sessionId });
  return await startAuthentication({ optionsJSON: options });
};