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

import { isVGWeaponType } from './DataConversion.js';
import weaponsTable from './WeaponsTable.js';

function toBool(str) {
  return str === 'TRUE';
}

function toInt(str) {
  return parseInt(str);
}

const parseLine = (line) => {
  const columns = [];

  let isString = false;
  let partialCol = '';
  let nextChar;
  for (let i = 0; i < line.length; i++) {
    nextChar = line[i];
    if (nextChar === '"' && isString) {
      isString = false;
    } else if (nextChar === '"' && !isString) {
      isString = true;
      partialCol = '';
    } else if (nextChar === ',' && !isString) {
      columns.push(partialCol);
      partialCol = '';
    } else {
      partialCol += nextChar;
    }
  }

  return {
    name:                columns[0],
    // 1) rarity
    evo_level:           toInt(columns[2]),
    limit_breaks:        toInt(columns[3]),
    level:               toInt(columns[4]),
    skill_level:         toInt(columns[5]),
    support_skill_level: toInt(columns[6]),
    unused:              toBool(columns[7]),
    id:                  toInt(columns[34]),
  };
};

const parseBlueLibraryCSV = ({ file, onParseFinish }) => {
  const onReadyRead = (e) => {
    const reader = e.target;
    const file = reader.result;
    const weaps = file
          .split('\n')
          .slice(2)
          .map(parseLine)
          .filter(weap => {
            if (!weap || weap.name === '') {
              return false;
            }

            const weaponInfo = weaponsTable[weap.id];
            if (!weaponInfo) {
              return false;
            }

            return isVGWeaponType(weaponInfo.card_detail_type);
          });

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
