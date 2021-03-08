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

import { useCallback, useState, useEffect, useMemo, useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

import OptimizationWorker from "worker-loader!./Worker.js"; // eslint-disable-line import/no-webpack-loader-syntax
import WeaponImage from './WeaponImage.js';

// data
import skillMultiplierTable from './SkillMultiplierTable.js';
import skillMultiplierTable2 from './SkillMultiplierTable2.js';
import weaponsTable from './WeaponsTable.js';
import { combinations } from './MathUtils.js';
import {
  ClassType,
  ClassLevel,
  StringConverter,
  rarities,
  vgWeapons,
  elements,
  aoeMultiplier,
  skillLevelMultiplier,
  supportSkillDamageMultiplier,
  classBonuses,
  maxPossibleSkillLevel,
  weaponDamageType,
} from './DataConversion.js';

const HIGH_COMBINATION_NUMBER = 200_000_000;

const supportedClasses = [
  ClassType.BREAKER,
  ClassType.CRUSHER,
  ClassType.GUNNER,
  ClassType.PALADIN,
];

const classLevels = [
  ClassLevel.STANDARD,
  ClassLevel.HALF_NIGHTMARE_10,
  ClassLevel.HALF_NIGHTMARE_12,
];

const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  formControl: {
    minWidth: '100px',
  }
}));

const LinearProgressWithLabel = (props) => {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
};

const WeaponImageWithPopover = (attrs) => {
  const { weapon, ...otherAttrs } = attrs;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [delayTimer, setDelayTimer] = useState(null);

  const handlePopoverOpen = (e) => {
    if (!delayTimer) {
      const timer = setTimeout(() => {
        setAnchorEl(e.target);
      }, 1000);
      setDelayTimer(timer);
    }
  };

  const handlePopoverClose = () => {
    if (delayTimer) {
      clearInterval(delayTimer);
      setDelayTimer(null);
    }
    setAnchorEl(null);
  };

  const showPopover = Boolean(anchorEl);
  const htmlId = `weapon-${weapon.id}-mouse-over-popover`;

  const wInfo = weaponsTable[weapon.id];
  const mainSkill = skillMultiplierTable[wInfo.back_skill_id];
  const supportSkill = skillMultiplierTable2[wInfo.auto_skill_id];

  return (
    <div>
      <WeaponImage
        {...otherAttrs}
        weapon={weapon}
        aria-owns={showPopover ? htmlId : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      />
      <Popover
        className={classes.popover}
        id={htmlId}
        open={showPopover}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Box p={1}>
          <Typography variant="h5">{weapon.name}</Typography>
          <Typography>Level {weapon.level}</Typography>
          <Typography>{mainSkill.name}: {weapon.skill_level}</Typography>
          <Typography>{supportSkill.name}: {weapon.support_skill_level}</Typography>
        </Box>
      </Popover>
    </div>
  );
};

const OptimizedWeaponsTable = ({ weapons }) => {
  return (
    <Table size="small" aria-label="Your weapon library">
      <TableHead>
        <TableRow>
          <TableCell>N°</TableCell>
          <TableCell>Icon</TableCell>
          <TableCell>Name</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {weapons.map((weap, i) => (
          <TableRow key={weap.id}>
            <TableCell component="th" scope="row">
              {i+1}
            </TableCell>
            <TableCell>
              <WeaponImage weapon={weap} />
            </TableCell>
            <TableCell>
              {weap.name}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const comboCorrection = (combo) => {
  if (combo < 0) {
    return 0;

  } else if (combo <= 200) {
    return 1 + combo * 0.0007;

  } else if (combo <= 500) {
    return 1 + combo * 0.0005;

  } else if (combo <= 1000) {
    return 1 + combo * 0.00035;

  } else {
    return 1.465;
  }
}

const buffCorrection = (buff) => {
  if (buff < -20) {
    return 0.3;

  } else if (buff < -10) {
    return 0.7 + buff * 0.02;

  } else if (buff < 20) {
    return 1 + buff * 0.05;

  } else {
    return 2
  }
}

const buildDeckInfo = (options, deck, playerStats) => {
  const { maximizeForSingleTarget, maxSkillLevels } = options;
  const classBonus = classBonuses(options.classType, options.classLevel);

  return deck.map((w) => {
    const wInfo = weaponsTable[w.id];
    const mainSkill = skillMultiplierTable[wInfo.back_skill_id];
    const supportSkill = skillMultiplierTable2[wInfo.auto_skill_id];
    const targetMultiplier = maximizeForSingleTarget ? 1 : aoeMultiplier(mainSkill.range_icon);
    const maxSkillLevel = maxPossibleSkillLevel(w.limit_breaks);
    const skillLevel = maxSkillLevels ? maxSkillLevel : w.skill_level;
    const supportSkillLevel = maxSkillLevels ? maxSkillLevel : w.support_skill_level;

    return {
      ...w,
      p_atk: wInfo.max_p_atk - wInfo.add_p_atk * (wInfo.max_level - w.level),
      m_atk: wInfo.max_m_atk - wInfo.add_m_atk * (wInfo.max_level - w.level),
      p_def: wInfo.max_p_def - wInfo.add_p_def * (wInfo.max_level - w.level),
      m_def: wInfo.max_m_def - wInfo.add_m_def * (wInfo.max_level - w.level),
      skill_mult: mainSkill.damage_mult * skillLevelMultiplier(skillLevel) * targetMultiplier * classBonus[wInfo.card_detail_type],
      supp_skill_mult: supportSkillDamageMultiplier(supportSkill, supportSkillLevel),
      cost: wInfo.deck_cost,
      sp_cost: mainSkill.sp_cost,
      element: wInfo.attribute,
      type: wInfo.card_detail_type,
      damage_type: weaponDamageType(wInfo.card_detail_type),
    };
  });
};

const TogglableSection = ({ title, defaultOpen = false, children }) => {
  const [collapsed, setCollapsed] = useState(!defaultOpen);

  return (
    <Box mb={2}>
      <Button
        color="inherit"
        size="small"
        startIcon={collapsed ? <KeyboardArrowRightIcon /> : <KeyboardArrowDownIcon />}
        onClick={() => setCollapsed(!collapsed)}
      >
        {title}
      </Button>
      <Collapse in={!collapsed}>
        { children }
      </Collapse>
    </Box>
  );
};

const OptionsForm = ({ weapons, options, onOptionsChange }) => (
  <Box>
    <TogglableSection title="Your class" defaultOpen>
      <Grid container spacing={1}>
        <Grid item xs={'auto'}>
          <InputLabel id="class-select-label">Class</InputLabel>
          <Select
            labelId="class-select-label"
            id="class-select"
            value={options.classType}
            onChange={(e) => onOptionsChange({...options, classType: e.target.value})}
          >
            {supportedClasses.map((c) => (
              <MenuItem value={c} key={c}>{StringConverter.classType(c)}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={'auto'}>
          <InputLabel id="class-level-select-label">Class level</InputLabel>
          <Select
            labelId="class-level-select-label"
            id="class-level-select"
            value={options.classLevel}
            onChange={(e) => onOptionsChange({...options, classLevel: e.target.value})}
          >
            {classLevels.map((cl) => (
              <MenuItem value={cl} key={cl}>{StringConverter.classLevel(cl)}</MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>
    </TogglableSection>
    <TogglableSection title="Minimum weapon number">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <h5>Elements</h5>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Fire"
            type="number"
            value={options.minFire}
            onChange={(e) => onOptionsChange({...options, minFire: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Water"
            type="number"
            value={options.minWater}
            onChange={(e) => onOptionsChange({...options, minWater: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Wind"
            type="number"
            value={options.minWind}
            onChange={(e) => onOptionsChange({...options, minWind: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <h5>Weapon type</h5>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Swords"
            type="number"
            value={options.minSwords}
            onChange={(e) => onOptionsChange({...options, minSwords: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Hammers"
            type="number"
            value={options.minHammers}
            onChange={(e) => onOptionsChange({...options, minHammers: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Bows"
            type="number"
            value={options.minBows}
            onChange={(e) => onOptionsChange({...options, minBows: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Poles"
            type="number"
            value={options.minPoles}
            onChange={(e) => onOptionsChange({...options, minPoles: e.target.value})}
          />
        </Grid>
      </Grid>
    </TogglableSection>
    <TogglableSection title="Buffs and combos and enemy def">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <h5>Your expected buffs</h5>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Your P.Atk stack"
            type="number"
            value={options.expectedPStack}
            onChange={(e) => onOptionsChange({...options, expectedPStack: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Your M.Atk stack"
            type="number"
            value={options.expectedMStack}
            onChange={(e) => onOptionsChange({...options, expectedMStack: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <h5>Enemy stats and buffs</h5>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Enemy P.Def"
            type="number"
            value={options.targetPDef}
            onChange={(e) => onOptionsChange({...options, targetPDef: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Enemy M.Def"
            type="number"
            value={options.targetMDef}
            onChange={(e) => onOptionsChange({...options, targetMDef: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Enemy P.Def stack"
            type="number"
            value={options.targetPDefStack}
            onChange={(e) => onOptionsChange({...options, targetPDefStack: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Enemy M.Def stack"
            type="number"
            value={options.targetMDefStack}
            onChange={(e) => onOptionsChange({...options, targetMDefStack: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <h5>Combos</h5>
          <TextField
            label="Combo count"
            type="number"
            value={options.targetCombo}
            onChange={(e) => onOptionsChange({...options, targetCombo: e.target.value})}
          />
          <h6>Change this only if you want to optimize for early game, super lategame of if you know what you are doing</h6>
        </Grid>
      </Grid>
    </TogglableSection>
    <TogglableSection title="Pin or filter weapons" defaultOpen>
      <PinAndFilter
        weapons={weapons}
        options={options}
        onOptionsChange={onOptionsChange}
      />
    </TogglableSection>
    <TogglableSection title="Optimization type" defaultOpen>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={options.damagePerSP}
                onChange={(e) => onOptionsChange({...options, damagePerSP: e.target.checked})}
                name="damagePerSPCheck"
              />
            }
            label="Max damage per SP spent"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={options.singleTarget}
                onChange={(e) => onOptionsChange({...options, singleTarget: e.target.checked})}
                name="singleTargetCheck"
              />
            }
            label="Maximise for single target damage"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={options.maxSkillLevels}
                onChange={(e) => onOptionsChange({...options, maxSkillLevels: e.target.checked})}
                name="maxSkillLevelsCheck"
              />
            }
            label="Assume max skill levels"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={options.maximize19}
                onChange={(e) => onOptionsChange({...options, maximize19: e.target.checked})}
                name="maximize19"
              />
            }
            label="Maximize for 19 weapons grid"
          />
        </Grid>
      </Grid>
    </TogglableSection>
  </Box>
);


const WeaponGridCell = ({ index, weapon, onWeaponClick }) => {
  if (!weapon) {
    return (
      <Box className="empty-grid-slot">
        <Typography align="center">{index + 1}</Typography>
      </Box>
    );
  }

  return (
    <WeaponImage
      weapon={weapon}
      onClick={() => onWeaponClick(weapon)}
    />
  );
}

const PinnedGrid = ({ weapons, onWeaponClick }) => {
  const grid = weapons.slice();
  for (let i = weapons.length; i < 20; i++) {
    grid.push(null);
  }

  return (
    <Grid container spacing={2}>
      {grid.map((weapon, index) => (
        <Grid item xs="auto" key={index}>
          <WeaponGridCell
            index={index}
            weapon={weapon}
            onWeaponClick={onWeaponClick}
          />
        </Grid>
      ))}
    </Grid>
  );
};

const emptyFilters = {
  name: '',
  rarity: 0,
  weaponType: 0,
  element: 0,
};

const PinSearchBar = ({ filters, onFiltersChange }) => {
  const classes = useStyles();
  return (
    <Box display="flex">
      <Box pb={2}>
        <TextField
          label="Name"
          placeholder="Search by name"
          InputLabelProps={{
            shrink: true,
          }}
          value={filters.name}
          onChange={(e) => onFiltersChange({...filters, name: e.target.value})}
        />
      </Box>
      <Box pb={2}>
        <FormControl className={classes.formControl}>
          <InputLabel shrink id="weapon-rarity-select-label">
            Rarity
          </InputLabel>
          <Select
            labelId="weapon-rarity-select-label"
            id="weapon-rarity-select"
            value={filters.rarity}
            onChange={(e) => onFiltersChange({...filters, rarity: e.target.value})}
          >
            <MenuItem value={0}>Any</MenuItem>
            {rarities.map((rar) => (
              <MenuItem value={rar} key={rar}>{StringConverter.rarity(rar)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box pb={2}>
        <FormControl className={classes.formControl}>
          <InputLabel shrink id="weapon-type-select-label">
            Weapon type
          </InputLabel>
          <Select
            labelId="weapon-type-select-label"
            id="weapon-type-select"
            value={filters.weaponType}
            onChange={(e) => onFiltersChange({...filters, weaponType: e.target.value})}
          >
            <MenuItem value={0}>Any</MenuItem>
            {vgWeapons.map((wType) => (
              <MenuItem value={wType} key={wType}>{StringConverter.weaponType(wType)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box pb={2}>
        <FormControl className={classes.formControl}>
          <InputLabel shrink id="element-select-label">
            Element
          </InputLabel>
          <Select
            labelId="element-select-label"
            id="element-select"
            value={filters.element}
            onChange={(e) => onFiltersChange({...filters, element: e.target.value})}
          >
            <MenuItem value={0}>Any</MenuItem>
            {elements.map((ele) => (
              <MenuItem value={ele} key={ele}>{StringConverter.element(ele)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box p={1}>
        <Button
          variant="contained"
          onClick={() => onFiltersChange(emptyFilters)}
        >
          Clear search filters
        </Button>
      </Box>
    </Box>
  );
};

const PinAndFilter = ({ weapons, options, onOptionsChange }) => {
  const [filters, setFilters] = useState(emptyFilters);
  const { excludedWeapons, pinnedWeapons } = options;
  const pinned = new Set(pinnedWeapons); // shallow-copy
  const excluded = new Set(excludedWeapons); // shallow-copy

  const aviableWeaps = weapons.filter((w) => !pinned.has(w.id) && !excluded.has(w.id));
  const pinnedWeaps = weapons.filter((w) => pinned.has(w.id));
  const excludedWeaps = weapons.filter((w) => excluded.has(w.id));

  const showWeapon = (weapon) => {
    const { name, weaponType, element, rarity } = filters;
    const w = weaponsTable[weapon.id];

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
  };

  const handleAvaliableWeapClick = (e, weapon) => {
    if (aviableWeaps.length <= 2) {
      return;
    }

    if (e.shiftKey) {
      excluded.add(weapon.id);
      onOptionsChange({ ...options, excludedWeapons: excluded});
    } else if (pinnedWeaps.length <= 19) {
      pinned.add(weapon.id);
      onOptionsChange({ ...options, pinnedWeapons: pinned});
    }
  };

  const removeFromPinned = (weaponId) => {
    pinned.delete(weaponId);
    onOptionsChange({ ...options, pinnedWeapons: pinned});
  };

  const removeFromExcluded = (weaponId) => {
    excluded.delete(weaponId);
    onOptionsChange({ ...options, excludedWeapons: excluded});
  };

  return (
    <Box>
      <h5>Available weapons</h5>
      <h6>Click to pin, shift+click to exclude</h6>
      <PinSearchBar filters={filters} onFiltersChange={setFilters} />
      <Grid container spacing={2}>
        {aviableWeaps
            .filter(showWeapon)
            .map((weapon) => (
          <Grid item xs="auto" key={weapon.id}>
            <WeaponImageWithPopover
              weapon={weapon}
              onClick={(e) => handleAvaliableWeapClick(e, weapon)}
            />
          </Grid>
        ))}
      </Grid>
      <h5>Pinned weapons</h5>
      <PinnedGrid
        weapons={pinnedWeaps}
        onWeaponClick={(weapon) => removeFromPinned(weapon.id)}
      />
      {excludedWeaps.length > 0 &&
        <>
          <h5>Excluded weapons</h5>
          <Grid container spacing={2}>
            {excludedWeaps.map((weapon) => (
              <Grid item xs="auto" key={weapon.id}>
                <WeaponImage
                  weapon={weapon}
                  onClick={() => removeFromExcluded(weapon.id)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      }
    </Box>
  );
};

const ResultBox = ({combo, score}) => {
  if (!combo) {
    return (
      <Box>
        <h5>No valid combination possible.</h5>
        <p>Cost too low for selected weapons or not enough weapons matching current filters</p>
      </Box>
    );
  }

  return (
    <Box>
      <h5>Result</h5>
      <p>Score: <b>{score.toLocaleString()}</b></p>
      <OptimizedWeaponsTable weapons={combo} />
    </Box>
  );
};

const OptimizationPage = ({ playerStats, weapons }) => {
  const worker = useRef(null);
  const [progress, setProgress] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [showHighComboAlert, setShowHighComboAlert] = useState(false);
  const [options, setOptions] = useState({
    classType: ClassType.BREAKER,
    classLevel: ClassLevel.STANDARD,
    singleTarget: false,
    damagePerSP: false,
    maxSkillLevels: false,
    maximize19: false,
    defWeight: 0,
    targetPDef: 40000,
    targetMDef: 40000,
    expectedPStack: 10,
    expectedMStack: 10,
    targetPDefStack: 10,
    targetMDefStack: 10,
    targetCombo: 200,
    minFire: 0,
    minWater: 0,
    minWind: 0,
    minSwords: 0,
    minHammers: 0,
    minBows: 0,
    minPoles: 0,
    excludedWeapons: new Set(),
    pinnedWeapons: new Set(),
  });

  const pinnedCount = options.pinnedWeapons.size;
  const availableWeapCount = weapons.length - options.excludedWeapons.size - pinnedCount;
  const maxWeaponsNumber = options.maximize19 ? 19 : 20;
  const availableSlotsCount = maxWeaponsNumber - pinnedCount;

  const numberOfCombinations = useMemo(() => {
    return combinations(availableWeapCount, availableSlotsCount);
  }, [availableWeapCount, availableSlotsCount]);

  const formattedNumberOfCombinations = useMemo(() => {
    return numberOfCombinations.toLocaleString();
  }, [numberOfCombinations]);

  const closeHighComboAlert = () => {
    setShowHighComboAlert(false);
  };

  const cleanupWorker = useCallback(() => {
    if (worker.current) {
      console.log("terminating worker");
      worker.current.terminate();
      worker.current = null;
      setProgress(null);
    }
  }, [worker]);

  const optimize = () => {
    cleanupWorker();

    console.log("creating new web worker");
    const optimizer = new OptimizationWorker();
    worker.current = optimizer;
    optimizer.onerror = function(e) {
      console.log(e.message);
    };
    optimizer.onmessage = function(e) {
      const message = e.data;
      switch (message.type) {
        case 'progress':
          setProgress(message.data);
          break;

        case 'result':
          setOptimizationResult(message);
          cleanupWorker();
          break;

        default:
          console.log(message);
      }
    };

    const aviableWeapons = weapons.filter((w) => !options.pinnedWeapons.has(w.id) && !options.excludedWeapons.has(w.id));
    const pinnedWeapons = weapons.filter((w) => options.pinnedWeapons.has(w.id));
    const deck = pinnedWeapons.concat(aviableWeapons);

    const buildOptions = {
      ...options,
      pAtkCorrection: comboCorrection(options.targetCombo) * buffCorrection(options.expectedPStack),
      mAtkCorrection: comboCorrection(options.targetCombo) * buffCorrection(options.expectedMStack),
      effectiveEnemyPDef: options.targetPDef * buffCorrection(options.targetPDefStack) * 2 / 3,
      effectiveEnemyMDef: options.targetMDef * buffCorrection(options.targetMDefStack) * 2 / 3,
    };

    setProgress(0);
    optimizer.postMessage({
      command: 'start',
      deck: buildDeckInfo(options, deck, playerStats),
      pinLength: pinnedWeapons.length,
      playerStats,
      options: buildOptions,
    });
  };

  useEffect(() => {
    return cleanupWorker;
  }, [cleanupWorker]);

  return (
    <Box>
      <OptionsForm
        weapons={weapons}
        options={options}
        onOptionsChange={(opt) => setOptions(opt)}
      />
      <p>Number of possible combinations : {formattedNumberOfCombinations}</p>
      { progress == null ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (numberOfCombinations < HIGH_COMBINATION_NUMBER) {
              optimize();
            } else {
              setShowHighComboAlert(true);
            }
          }}
        >
          Optimize
        </Button>
      ) : (
        <Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={cleanupWorker}
          >
            Abort
          </Button>
          <LinearProgressWithLabel value={progress * 100} />
        </Box>
      )}
      { optimizationResult && (
        <ResultBox combo={optimizationResult.combo} score={optimizationResult.score} />
      )}
      <Dialog
        open={showHighComboAlert}
        onClose={closeHighComboAlert}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Possible high execution times</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            The amount of possible grid combinations to analyze is pretty high.
            Depending on your CPU power and browser available resources this may take some time.
            If that&apos;s not intended, consider pinning or exluding some weapons from the pool of available candidates.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={closeHighComboAlert}
            autoFocus
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => {
              closeHighComboAlert();
              optimize();
            }}
          >
            Optimize
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OptimizationPage;
