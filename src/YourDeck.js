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

import { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { Element, Rarity, WeaponType, StringConverter, isVGWeaponType } from './DataConversion.js';
import FileParser from './FileParser.js';
import WeaponImage from './WeaponImage.js';
import weaponsTable from './WeaponsTable.js';

const useStyles = makeStyles((theme) => ({
  selected: {
    background: '#5feccba6',
  },
}));

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
]

const elements = [
  Element.FIRE,
  Element.WIND,
  Element.WATER,
]

const bound = (min, val, max) => {
  return Math.max(min, Math.min(val, max));
}

const FullWeaponsTable = ({fullWeaponList, ownedWeapons, selectedWeaponId, onSelectionChange}) => {
  const classes = useStyles();
  const [filters, setFilters] = useState({
    rarity: 0,
    name: '',
    ownership: 0,
    weaponType: 0,
    element: 0,
  });

  const renderedWeapons = fullWeaponList
    .filter((w) => {
      const { name, ownership, weaponType, element, rarity } = filters;
      if (ownership === 'Owned' && !w.owned) {
        return false;
      }

      if (ownership === 'Not Owned' && w.owned) {
        return false;
      }

      if (weaponType && weaponType !== w.card_detail_type) {
        return false;
      }

      if (element && element !== w.attribute) {
        return false;
      }

      if (rarity && rarity !== w.rarity) {
        return false;
      }

      if (name.length > 2) {
        const s1 = name.toLowerCase();
        const s2 = w.name.toLowerCase();
        if (!s2.includes(s1)) {
          return false;
        }
      }

      return true;
    })
    .slice(0, 50);

  return (
    <Table aria-label="weapons table">
      <TableHead>
        <TableRow>
          <TableCell>Icon</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Element</TableCell>
          <TableCell>Owned</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
            <TableCell>
              <Select
                id="weapon-rarity-select"
                value={filters.rarity}
                onChange={(e) => setFilters({...filters, rarity: e.target.value})}
              >
                <MenuItem value={0}>Any</MenuItem>
                {rarities.map((rar) => (
                  <MenuItem value={rar} key={rar}>{StringConverter.rarity(rar)}</MenuItem>
                ))}
              </Select>
            </TableCell>
            <TableCell>
              <TextField
                value={filters.name}
                onChange={(e) => setFilters({...filters, name: e.target.value})}
              />
            </TableCell>
            <TableCell>
              <Select
                id="weapon-type-select"
                value={filters.weaponType}
                onChange={(e) => setFilters({...filters, weaponType: e.target.value})}
              >
                <MenuItem value={0}>Any</MenuItem>
                {vgWeapons.map((wType) => (
                  <MenuItem value={wType} key={wType}>{StringConverter.weaponType(wType)}</MenuItem>
                ))}
              </Select>
            </TableCell>
            <TableCell>
              <Select
                id="weapon-element-select"
                value={filters.element}
                onChange={(e) => setFilters({...filters, element: e.target.value})}
              >
                <MenuItem value={0}>Any</MenuItem>
                {elements.map((ele) => (
                  <MenuItem value={ele} key={ele}>{StringConverter.element(ele)}</MenuItem>
                ))}
              </Select>
            </TableCell>
            <TableCell>
              <Select
                id="weapon-ownership-select"
                value={filters.ownership}
                onChange={(e) => setFilters({...filters, ownership: e.target.value})}
              >
                <MenuItem value={0}>Any</MenuItem>
                <MenuItem value={'Owned'}>Owned</MenuItem>
                <MenuItem value={'Not owned'}>Not owned</MenuItem>
              </Select>
            </TableCell>
        </TableRow>
        {renderedWeapons.map((weapon) => (
          <TableRow
            className={weapon.id === selectedWeaponId ? classes.selected : ''}
            key={weapon.id}
            onClick={() => onSelectionChange(weapon)}
          >
            <TableCell>
              <WeaponImage weapon={weapon} />
            </TableCell>
            <TableCell>{weapon.name}</TableCell>
            <TableCell>{StringConverter.weaponType(weapon.card_detail_type)}</TableCell>
            <TableCell>{StringConverter.element(weapon.attribute)}</TableCell>
            <TableCell>{weapon.owned ? 'Yes' : 'No'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const SelectedWeaponDrawer = ({ ownedWeapons, selectedWeaponId, onWeaponsChange }) => {
  const weaponInfo = selectedWeaponId ? weaponsTable[selectedWeaponId] : null;
  const ownedWeapon = selectedWeaponId ? ownedWeapons.find(w => w.id === selectedWeaponId) : null;
  const [renderCount, forceRender] = useState(true); // used to rerender after editing objects // TODO remove this hack

  if (!selectedWeaponId) {
    return null;
  }

  if (!ownedWeapon) {
    return (
      <Box m={2}>
        <h4>{weaponInfo.name}</h4>
        <p>Weapon not owned.</p>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            const newWeap = {
              id: weaponInfo.id,
              name: weaponInfo.name,
              limit_breaks: 0,
              level: 1,
              skill_level: 1,
              support_skill_level: 1,
            };
            onWeaponsChange([...ownedWeapons, newWeap])
          }}
        >
          Add weapon to library
        </Button>
      </Box>
    );
  }

  return (
    <Box m={2}>
      <h4>{ownedWeapon.name}</h4>
      <Box mb={1}>
        <TextField
          label="Limit breaks"
          value={ownedWeapon.limit_breaks}
          onChange={(e) => {
            const newLB = parseInt(e.target.value);
            ownedWeapon.limit_breaks = bound(0, newLB, 4) || 0;
            forceRender(renderCount+1);
          }}
        />
      </Box>
      <Box mb={1}>
        <TextField
          label="Weapon level"
          value={ownedWeapon.level}
          onChange={(e) => {
            const newLevel = parseInt(e.target.value);
            ownedWeapon.level = bound(1, newLevel, 120) || 1;
            forceRender(renderCount+1);
          }}
        />
      </Box>
      <Box mb={1}>
        <TextField
          label="Skill level"
          value={ownedWeapon.skill_level}
          onChange={(e) => {
            const newSkillLevel = parseInt(e.target.value);
            ownedWeapon.skill_level = bound(1, newSkillLevel, 20) || 1;
            forceRender(renderCount+1);
          }}
        />
      </Box>
      <Box mb={2}>
        <TextField
          label="Support skill level"
          value={ownedWeapon.support_skill_level}
          onChange={(e) => {
            const newSupportSkillLevel = parseInt(e.target.value);
            ownedWeapon.support_skill_level = bound(1, newSupportSkillLevel, 20) || 1;
            forceRender(renderCount+1);
          }}
        />
      </Box>
      <Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            const updatedWeapons = ownedWeapons.filter(w => w.id !== selectedWeaponId);
            onWeaponsChange(updatedWeapons);
          }}
        >
          Remove from library
        </Button>
      </Box>
    </Box>
  );
};

const YourDeck = ({ weapons, onWeaponsChange }) => {
  const [selectedWeaponId, setSelectedWeaponId] = useState(null);
  const [fullWeaponList, setFullWeaponList] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    FileParser.parseBlueLibraryCSV({
      file,
      onParseFinish: (weaps) => {
        onWeaponsChange(weaps);
      },
    });
  };

  const ownedIDs = useMemo(() => {
    return new Set(weapons.map(w => w.id));
  }, [weapons]);

  useEffect(() => {
    const newList =  Object.values(weaponsTable)
      .map((val) => ({
        id: val.id,
        name: val.name,
        attribute: val.attribute,
        rarity: val.rarity,
        card_detail_type: val.card_detail_type,
        owned: ownedIDs.has(val.id),
      }))
      .filter((w) => isVGWeaponType(w.card_detail_type));
    setFullWeaponList(newList);
  }, [ownedIDs]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4">Your deck</Typography>
      </Grid>
      <Grid item xs>
        <Button
          variant="contained"
          component="label"
        >
          Import from Blue&apos;s library
          <input
            id="csv-inport-input"
            type="file"
            accept=".csv"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
      </Grid>
      <FullWeaponsTable
        fullWeaponList={fullWeaponList}
        ownedWeapons={weapons}
        selectedWeaponId={selectedWeaponId}
        onSelectionChange={(weapon) => setSelectedWeaponId(weapon.id)}
      />
      <Drawer anchor="right" open={selectedWeaponId != null} onClose={() => setSelectedWeaponId(null)}>
        <SelectedWeaponDrawer
          ownedWeapons={weapons}
          selectedWeaponId={selectedWeaponId}
          onWeaponsChange={onWeaponsChange}
        />
      </Drawer>
    </Grid>
  );
};

export default YourDeck;
