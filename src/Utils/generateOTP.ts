export const generateOTP = (): string => {
  return String(Math.floor(Math.random() * (900000 - 1000000) + 100000));
};
