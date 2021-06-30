let env;

export function getEnv() {
  try {
    if (!env) {
      const meta = document.querySelector('meta[type="env"]');
      env = Object.assign({}, meta.dataset);
      meta.remove();
    }
    return env;
  } catch (err) {
    throw new Error('Could not find environment variables');
  }
}