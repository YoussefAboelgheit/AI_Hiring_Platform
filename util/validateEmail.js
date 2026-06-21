export const validateRealEmail = async (email) => {
  const response = await fetch(`https://api.mailcheck.ai/email/${email}`);
  const data = await response.json();

  // disposable = throwaway email, mx = domain has mail server
  if (data.disposable || !data.mx) {
    return false;
  }

  return true;
};