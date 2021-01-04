const PHYSICAL = 1;

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

const evaluateDamagePerSP = (deck, playerStats, keys) => {
  let totalCost = 0;
  let totalSPCost = 0;
  let totalPhysicalAttack = playerStats.weaponlessPAtk;
  let totalMagicalAttack = playerStats.weaponlessMAtk;
  let totalPhysicalWeaponMult = 0;
  let totalMagicalWeaponMult = 0;
  let supportSkillMult = 1;

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
    supportSkillMult *= weapon.supp_skill_mult;
  });

  if (totalCost > playerStats.maxCost) {
    return 0;
  }

  // TODO use parameters
  const enemyPDef = 41000;
  const enemyMDef = 41000;
  const effectivePAtk = totalPhysicalAttack - (2 * enemyPDef / 3);
  const effectiveMAtk = totalMagicalAttack - (2 * enemyMDef / 3);

  const damage = (effectivePAtk * totalPhysicalWeaponMult + effectiveMAtk * totalMagicalWeaponMult)* supportSkillMult;
  return damage / totalSPCost;
};

const evaluateDamage = (deck, playerStats, keys) => {
  let totalCost = 0;
  let totalPhysicalAttack = playerStats.weaponlessPAtk;
  let totalMagicalAttack = playerStats.weaponlessMAtk;
  let totalPhysicalWeaponMult = 0;
  let totalMagicalWeaponMult = 0;
  let supportSkillMult = 1;

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
    supportSkillMult *= weapon.supp_skill_mult;
  });

  if (totalCost > playerStats.maxCost) {
    return 0;
  }

  // TODO use parameters
  const enemyPDef = 41000;
  const enemyMDef = 41000;
  const effectivePAtk = totalPhysicalAttack - (2 * enemyPDef / 3);
  const effectiveMAtk = totalMagicalAttack - (2 * enemyMDef / 3);

  const damage = (effectivePAtk * totalPhysicalWeaponMult + effectiveMAtk * totalMagicalWeaponMult)* supportSkillMult;
  return damage;
};

const dive = (buffer, i, k, n, callback) => {
  if (buffer.length == k) {
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
  const sourceLength = deck.length;
  const comboLength = 20 - pinLength;

  if (comboLength > sourceLength) {
    return null;
  }

  const max = combinations(sourceLength, comboLength);

  let i = BigInt(0);
  let progress = 0;
  let bestCombo = null;
  let bestDamage = 0;

  const damageEvaluator = (combo) => {
    return scoreFormula(deck, playerStats, combo, options);
  }

  const initialBuffer = [...Array(pinLength).keys()];
  dive(initialBuffer, pinLength, 20, deck.length, (combo) => {
    const comboDamage = damageEvaluator(combo);
    if (comboDamage > bestDamage) {
      bestCombo = combo.slice(); // clone
      bestDamage = comboDamage;
    }

    i++;
    const newProgress = Number(i * 100n / max) / 100;
    if (newProgress != progress) {
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
    const optimalGrid = combo.map((i) => deck[i]);

    postMessage({
      type: 'result',
      combo: optimalGrid,
      score,
    });
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
