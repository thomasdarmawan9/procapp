import { uuid } from './utils';

type CaptchaEntry = {
  id: string;
  answer: number;
  expiresAt: number;
};

const EXPIRATION_MS = 5 * 60 * 1000;

declare global {
  // eslint-disable-next-line no-var
  var __CAPTCHA_STORE__: Map<string, CaptchaEntry> | undefined;
}

const getStore = () => {
  if (!globalThis.__CAPTCHA_STORE__) {
    globalThis.__CAPTCHA_STORE__ = new Map<string, CaptchaEntry>();
  }
  return globalThis.__CAPTCHA_STORE__;
};

export const createCaptcha = () => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const id = uuid();
  const store = getStore();
  store.set(id, {
    id,
    answer: a + b,
    expiresAt: Date.now() + EXPIRATION_MS
  });
  return {
    id,
    question: `What is ${a} + ${b}?`,
    operands: [a, b] as const
  };
};

export const validateCaptcha = (id: string, answer: number) => {
  const store = getStore();
  const entry = store.get(id);
  if (!entry) {
    return false;
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(id);
    return false;
  }
  const isValid = entry.answer === answer;
  if (isValid) {
    store.delete(id);
  }
  return isValid;
};
