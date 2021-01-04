/* global BigInt */
/*
SINoALICE companion
Copyright (C) 2021 Pavij

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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
