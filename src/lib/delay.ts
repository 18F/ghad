export default (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout));
