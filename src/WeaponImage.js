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

import weaponsTable from './WeaponsTable.js';

const weaponImageUrl = (weaponId) => {
  const resourceId = weaponsTable[weaponId].resource_name;
  const stringId = resourceId.toString().padStart(4, '0');
  return `https://sinoalice.picobin.com/cards/cards${stringId}.png`
};


const WeaponImage = ({ weapon, onClick }) => (
  <img
    className="weapon-icon"
    src={weaponImageUrl(weapon.id)}
    alt={weapon.name}
    onClick={onClick}
  />
);

export default WeaponImage;
