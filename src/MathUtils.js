/* global BigInt */

function factorial(n) {
  let result = BigInt(1);
  for (let i = BigInt(2); i <= n; i++) {
    result *= i;
  }
  return result;
}

function combinations(n, r) {
  return factorial(n) / (factorial(r) * factorial(n-r));
}

export {
  combinations,
  factorial,
};
