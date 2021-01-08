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

const SWORD = 5;
const HAMMER = 6;
const BOW = 7;
const POLE = 8;

const isVGWeapon = (weapon) => {
  switch (weapon.weapon_type) {
    case SWORD:
    case HAMMER:
    case BOW:
    case POLE:
      return true;

    default:
      return false;
  }
};

function toBool(str) {
  return str === 'TRUE';
}

function toInt(str) {
  return parseInt(str);
}

const parseLine = (line) => {
  const arr = line.split(',');
  return {
    name:                arr[0],
    // 1) rarity
    evo_level:           toInt(arr[2]),
    limit_breaks:        toInt(arr[3]),
    level:               toInt(arr[4]),
    skill_level:         toInt(arr[5]),
    support_skill_level: toInt(arr[6]),
    unused:              toBool(arr[7]),
    id:                  toInt(arr[34]),
    weapon_type:         toInt(arr[41]),
  }
};

const parseBlueLibraryCSV = ({ file, onParseFinish }) => {
  const onReadyRead = (e) => {
    const reader = e.target;
    const file = reader.result;
    const weaps = file
          .split('\n')
          .slice(2)
          .map(parseLine)
          .filter(weap => weap.name !== '' && isVGWeapon(weap));

    onParseFinish(weaps);
  };

  const reader = new FileReader();
  reader.onloadend = onReadyRead;
  reader.readAsText(file);
}

const FileParser = {
  parseBlueLibraryCSV,
};

export default FileParser;
