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

import { combinations } from './MathUtils.js';

const PHYSICAL = 1;
const FIRE = 1;
const WATER = 2;
const WIND = 3;
const SWORD = 5;
const HAMMER = 6;
const BOW = 7;
const POLE = 8;

const evaluateDamagePerSP = (deck, playerStats, options, keys) => {
  let totalCost = 0;
  let totalSPCost = 0;
  let totalPhysicalAttack = playerStats.weaponlessPAtk;
  let totalMagicalAttack = playerStats.weaponlessMAtk;
  let totalPhysicalWeaponMult = 0;
  let totalMagicalWeaponMult = 0;
  let supportSkillMult = 0;

  let elementCount = [];
  elementCount[FIRE] = 0;
  elementCount[WATER] = 0;
  elementCount[WIND] = 0;
  let typeCount = [];
  typeCount[SWORD] = 0;
  typeCount[HAMMER] = 0;
  typeCount[BOW] = 0;
  typeCount[POLE] = 0;

  keys.forEach((k) => {
    const weapon = deck[k];

    totalCost += weapon.cost;
    totalSPCost += weapon.sp_cost;
    totalPhysicalAttack += weapon.p_atk;
    totalMagicalAttack += weapon.m_atk;
    if (weapon.damage_type === PHYSICAL) {
      totalPhysicalWeaponMult += weapon.skill_mult;
    } else {
      totalMagicalWeaponMult += weapon.skill_mult;
    }
    supportSkillMult += weapon.supp_skill_mult;

    elementCount[weapon.element]++;
    typeCount[weapon.type]++;
  });

  if (totalCost > playerStats.maxCost) {
    return 0;
  }

  if (elementCount[FIRE] < options.minFire ||
      elementCount[WATER] < options.minWater ||
      elementCount[WIND] < options.minWind ||
      typeCount[SWORD] < options.minSwords ||
      typeCount[HAMMER] < options.minHammers ||
      typeCount[BOW] < options.minBows ||
      typeCount[POLE] < options.minPoles) {
    return 0;
  }

  const effectivePAtk = Math.max(0, totalPhysicalAttack * options.pAtkCorrection - options.effectiveEnemyPDef);
  const effectiveMAtk = Math.max(0, totalMagicalAttack * options.mAtkCorrection - options.effectiveEnemyMDef);

  const damage = (effectivePAtk * totalPhysicalWeaponMult + effectiveMAtk * totalMagicalWeaponMult) * (1 + supportSkillMult);
  return damage / totalSPCost;
};

const evaluateDamage = (deck, playerStats, options, keys) => {
  let totalCost = 0;
  let totalPhysicalAttack = playerStats.weaponlessPAtk;
  let totalMagicalAttack = playerStats.weaponlessMAtk;
  let totalPhysicalWeaponMult = 0;
  let totalMagicalWeaponMult = 0;
  let supportSkillMult = 1;

  let elementCount = [];
  elementCount[FIRE] = 0;
  elementCount[WATER] = 0;
  elementCount[WIND] = 0;
  let typeCount = [];
  typeCount[SWORD] = 0;
  typeCount[HAMMER] = 0;
  typeCount[BOW] = 0;
  typeCount[POLE] = 0;

  keys.forEach((k) => {
    const weapon = deck[k];

    totalCost += weapon.cost;
    totalPhysicalAttack += weapon.p_atk;
    totalMagicalAttack += weapon.m_atk;
    if (weapon.damage_type === PHYSICAL) {
      totalPhysicalWeaponMult += weapon.skill_mult;
    } else {
      totalMagicalWeaponMult += weapon.skill_mult;
    }
    supportSkillMult += weapon.supp_skill_mult;

    elementCount[weapon.element]++;
    typeCount[weapon.type]++;
  });

  if (totalCost > playerStats.maxCost) {
    return 0;
  }

  if (elementCount[FIRE] < options.minFire ||
      elementCount[WATER] < options.minWater ||
      elementCount[WIND] < options.minWind ||
      typeCount[SWORD] < options.minSwords ||
      typeCount[HAMMER] < options.minHammers ||
      typeCount[BOW] < options.minBows ||
      typeCount[POLE] < options.minPoles) {
    return 0;
  }

  const effectivePAtk = Math.max(0, totalPhysicalAttack * options.pAtkCorrection - options.effectiveEnemyPDef);
  const effectiveMAtk = Math.max(0, totalMagicalAttack * options.mAtkCorrection - options.effectiveEnemyMDef);

  const damage = (effectivePAtk * totalPhysicalWeaponMult + effectiveMAtk * totalMagicalWeaponMult) * (1 + supportSkillMult);
  return damage;
};

const dive = (buffer, i, k, n, callback) => {
  if (buffer.length === k) {
    callback(buffer);
    return;
  }

  for (let j = i; j < n; j++) {
    buffer.push(j);
    dive(buffer, j+1, k, n, callback);
    buffer.pop();
  }
}

const generateCombinations = (deck, pinLength, playerStats, options, scoreFormula) => {
  const maxWeaponsNumber = options.maximize19 ? 19 : 20;
  const sourceLength = deck.length;
  const comboLength = maxWeaponsNumber - pinLength;

  if (comboLength > sourceLength) {
    return null;
  }

  const max = combinations(sourceLength, comboLength);

  let i = BigInt(0);
  let progress = 0;
  let bestCombo = null;
  let bestDamage = 0;

  const damageEvaluator = (combo) => {
    return scoreFormula(deck, playerStats, options, combo);
  }

  const initialBuffer = [...Array(pinLength).keys()];
  dive(initialBuffer, pinLength, maxWeaponsNumber, deck.length, (combo) => {
    const comboDamage = damageEvaluator(combo);
    if (comboDamage > bestDamage) {
      bestCombo = combo.slice(); // clone
      bestDamage = comboDamage;
    }

    i++;
    const newProgress = Number(i * 100n / max) / 100;
    if (newProgress !== progress) {
      // cache progress to avoid flooding messaged
      progress = newProgress;
      postMessage({
        type: 'progress',
        data: progress,
      });
    }
  });

  postMessage({
    type: 'progress',
    data: 1,
  });

  return {
    score: bestDamage,
    combo: bestCombo,
  }
}

onmessage = function(e) {
  const command = e.data.command;
  if (command === "start") {
    const { deck, pinLength, playerStats, options } = e.data;
    const scoreFormula = options.damagePerSP ? evaluateDamagePerSP : evaluateDamage;
    const { score, combo } = generateCombinations(deck, pinLength, playerStats, options, scoreFormula);

    if (combo) {
      const optimalGrid = combo.map((i) => deck[i]);

      postMessage({
        type: 'result',
        combo: optimalGrid,
        score,
      });
    } else {
      postMessage({
        type: 'result',
        msg: 'no combination met the criteria',
      });
    }
  } else if (command === "examine") {
    const { deck, playerStats, options, gridIndexes } = e.data;
    gridIndexes.forEach((i) => console.log(`${i}: ${deck[i].name}`));
    const damage = evaluateDamage(deck, playerStats, gridIndexes, options);

    postMessage({
      type: 'stats',
      damage,
    });
  }
}
