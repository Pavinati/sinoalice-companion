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
  SWORD: 5,
  HAMMER: 6,
  BOW: 7,
  POLE: 8,
};

const isVGWeapon = (weapon) => {
  switch (weapon.card_detail_type) {
    case WeaponType.SWORD:
    case WeaponType.HAMMER:
    case WeaponType.BOW:
    case WeaponType.POLE:
      return true;

    default:
      return false;
  }
};

const StringConverter = {
  element: (element) => {
    switch (element) {
      case Element.FIRE:
        return 'Fire';

      case Element.WATER:
        return 'Water';

      case Element.WIND:
        return 'Wind';

      default:
        return '';
    }
  },
  weaponType: (type) => {
    switch (type) {
      case WeaponType.SWORD:
        return 'Sword';

      case WeaponType.HAMMER:
        return 'Hammer';

      case WeaponType.BOW:
        return 'Bow';

      case WeaponType.POLE:
        return 'Pole';

      default:
        return '';
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
        return '';
    }
 },
};

export {
  Element,
  Rarity,
  WeaponType,
  StringConverter,
  isVGWeapon,
};
