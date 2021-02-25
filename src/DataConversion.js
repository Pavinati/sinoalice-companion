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

const ClassType = {
  BREAKER: 1,
  CRUSHER: 2,
  GUNNER: 3,
  PALADIN: 4,
};

const ClassLevel = {
  STANDARD: 1,
  HALF_NIGHTMARE_10: 2,
  HALF_NIGHTMARE_12: 3,
};

const Element = {
  FIRE: 1,
  WATER: 2,
  WIND: 3,
};

const Rarity = {
  A: 3,
  S: 4,
  SR: 5,
  L: 6,
};

const WeaponType = {
  HARP: 1,
  BOOK: 2,
  ORB: 3,
  STAFF: 4,
  SWORD: 5,
  HAMMER: 6,
  BOW: 7,
  POLE: 8,
};

const DamageType = {
  PHYSICAL: 1,
  MAGICAL: 2,
};

const SkillID = {
  DC1: 1032,
  DC2: 972,
};

const rarities = [
  Rarity.A,
  Rarity.S,
  Rarity.SR,
  Rarity.L,
];

const vgWeapons = [
  WeaponType.SWORD,
  WeaponType.HAMMER,
  WeaponType.BOW,
  WeaponType.POLE,
];

const elements = [
  Element.FIRE,
  Element.WIND,
  Element.WATER,
];

const isVGWeaponType = (weaponType) => {
  switch (weaponType) {
    case WeaponType.HARP:
    case WeaponType.BOOK:
    case WeaponType.ORB:
    case WeaponType.STAFF:
      return false;

    case WeaponType.SWORD:
    case WeaponType.HAMMER:
    case WeaponType.BOW:
    case WeaponType.POLE:
      return true;

    default:
      return false;
  }
};

const weaponDamageType = (weaponType) => {
  switch (weaponType) {
    case WeaponType.SWORD:
    case WeaponType.HAMMER:
      return DamageType.PHYSICAL;

    case WeaponType.ORB:
    case WeaponType.BOW:
    case WeaponType.POLE:
      return DamageType.MAGICAL;

    default:
      throw new Error('Invalid damaging weapon type');
  }
};

const aoeMultiplier = (targets) => {
  return (1 + targets) / 2;
};

// Skill formulas

const skillLevelMultiplier = (level) => {
  if (level >= 20) {
    return 1.5;
  } else {
    return 1 + (level - 1) * 0.025
  }
};

const dcActivationChance = (level) => {
  let bonus;
  if (level >= 20) {
    bonus = 2;
  } else if (level >= 15) {
    bonus = 1;
  } else {
    bonus = 0;
  }

  return 0.04 + (level - 1 + bonus) * 0.005;
};

const supportSkillDamageChance = (skill, level) => {
  switch (skill.id) {
    case SkillID.DC1:
    case SkillID.DC2:
      return dcActivationChance(level);

    default:
      return 0;
  }
};

const dcDamageMultiplier = (dcLevel, level) => {
  const baseMultiplier = dcLevel === 1 ? 0.10 : 0.15;

  let bonus;
  if (level >= 20) {
    bonus = 1;
  } else {
    bonus = 0;
  }

  return baseMultiplier * (1 + (level - 1 + bonus) * 0.025);
};

const supportSkillDamageMult = (skill, level) => {
  switch (skill.id) {
    case SkillID.DC1:
      return dcDamageMultiplier(1, level);

    case SkillID.DC2:
      return dcDamageMultiplier(2, level);

    default:
      return 0;
  }
};

const supportSkillDamageMultiplier = (skillId, level) => {
  return supportSkillDamageChance(skillId, level) * supportSkillDamageMult(skillId, level);
};

const maxPossibleSkillLevel = (limitBreakCount) => {
  switch (limitBreakCount) {
    case 1:
      return 16;

    case 2:
      return 17;

    case 3:
      return 18;

    case 4:
      return 20;

    default:
      return 15;
  }
};

// Class bonuses

const weaponSpeciality = (classType) => {
  // returns [special, neutral, bad1, bad2]
  switch (classType) {
    case ClassType.BREAKER:
      return [WeaponType.SWORD, WeaponType.POLE, WeaponType.HAMMER, WeaponType.BOW];

    case ClassType.CRUSHER:
      return [WeaponType.HAMMER, WeaponType.BOW, WeaponType.POLE, WeaponType.SWORD];

    case ClassType.GUNNER:
      return [WeaponType.BOW, WeaponType.HAMMER, WeaponType.SWORD, WeaponType.POLE];

    case ClassType.PALADIN:
      return [WeaponType.POLE, WeaponType.SWORD, WeaponType.HAMMER, WeaponType.BOW];

    default:
      throw new Error("Input error, unexpected class type found");
  }
};

const classMultiplier = (classLevel) => {
  // returns [bonus, malus]
  switch (classLevel) {
    case ClassLevel.STANDARD:
      return [1.1, 1];

    case ClassLevel.HALF_NIGHTMARE_10:
      return [1.30, 0.25];

    case ClassLevel.HALF_NIGHTMARE_12:
      return [1.35, 0.25];

    default:
      throw new Error("Input error, unexpected class level found");
  }
};

const classBonuses = (classType, classLevel) => {
  const [special, neutral, bad1, bad2] = weaponSpeciality(classType);
  const [bonus, malus] = classMultiplier(classLevel);
  return {
    [special]: bonus,
    [neutral]: 1,
    [bad1]: malus,
    [bad2]: malus,
  };
};

// Sring confersions

const StringConverter = {
  classType: (classType) => {
    switch (classType) {
      case ClassType.BREAKER:
        return 'Breaker';

      case ClassType.CRUSHER:
        return 'Crusher';

      case ClassType.GUNNER:
        return 'Gunner';

      case ClassType.PALADIN:
        return 'Paladin';

      default:
        throw new Error("Input error, unexpected class type found");
    }
  },
  classLevel: (classLevel) => {
    switch (classLevel) {
      case ClassLevel.STANDARD:
        return 'Standard (+10%)';

      case ClassLevel.HALF_NIGHTMARE_10:
        return 'Half nightmare lvl.10 (+30%)';

      case ClassLevel.HALF_NIGHTMARE_12:
        return 'Half nightmare lvl.12 (+35%)';

      default:
        throw new Error("Input error, unexpected class level found");
    }
  },
  element: (element) => {
    switch (element) {
      case Element.FIRE:
        return 'Fire';

      case Element.WATER:
        return 'Water';

      case Element.WIND:
        return 'Wind';

      default:
        throw new Error("Input error, unexpected element found");
    }
  },
  weaponType: (type) => {
    switch (type) {
      case WeaponType.HARP:
        return 'Harp';

      case WeaponType.BOOK:
        return 'Book';

      case WeaponType.ORB:
        return 'Orb';

      case WeaponType.STAFF:
        return 'Staff';

      case WeaponType.SWORD:
        return 'Sword';

      case WeaponType.HAMMER:
        return 'Hammer';

      case WeaponType.BOW:
        return 'Bow';

      case WeaponType.POLE:
        return 'Pole';

      default:
        throw new Error("Input error, unexpected weapon type found");
    }
  },
  rarity: (rarity) => {
    switch (rarity) {
      case Rarity.A:
        return 'A';

      case Rarity.S:
        return 'S';

      case Rarity.SR:
        return 'SR';

      case Rarity.L:
        return 'L';

      default:
        throw new Error("Input error, unexpected rarity found");
    }
 },
};

export {
  ClassType,
  ClassLevel,
  Element,
  Rarity,
  WeaponType,
  StringConverter,
  rarities,
  vgWeapons,
  elements,
  isVGWeaponType,
  weaponDamageType,
  aoeMultiplier,
  skillLevelMultiplier,
  supportSkillDamageMultiplier,
  classBonuses,
  maxPossibleSkillLevel,
};
