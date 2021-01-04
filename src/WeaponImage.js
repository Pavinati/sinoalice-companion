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

const weaponImageId = (id) => {
  switch (id) {
    case 989:
      return 575;

    case 990:
      return 576;

    default:
      return id;
  }
};

const weaponImageUrl = (weapon) => {
  const stringId = weaponImageId(weapon.id).toString().padStart(4, '0');
  return `https://sinoalice.game-db.tw/images/card/CardS${stringId}.png`
};


const WeaponImage = ({ weapon, onClick }) => (
  <img
    className="weapon-icon"
    src={weaponImageUrl(weapon)}
    alt={weapon.name}
    onClick={onClick}
  />
);

export default WeaponImage;
