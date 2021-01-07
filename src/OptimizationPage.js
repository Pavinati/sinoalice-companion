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

import { useState, useEffect, useMemo } from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

import WeaponImage from './WeaponImage.js';

// data
import skillMultiplierTable from './SkillMultiplierTable.js';
import skillMultiplierTable2 from './SkillMultiplierTable2.js';
import weaponsTable from './WeaponsTable.js';
import { combinations } from './MathUtils.js';

// Data mappings
/*
const FIRE = 1;
const WATER = 2;
const WIND = 3;

const A = 3;
const S = 4;
const SR = 5;
const L = 6;
*/

//const HARP = 1;
//const BOOK = 2;
const ORB = 3;
//const STAFF = 4;
const SWORD = 5;
const HAMMER = 6;
const BOW = 7;
const POLE = 8;

const PHYSICAL = 1;
const MAGICAL = 2;

const HIGH_COMBINATION_NUMBER = 200_000_000;

const aoeMultiplier = (targets) => {
  return (1 + targets) / 2;
}

const skillLevelMultiplier = (level) => {
  if (level >= 20) {
    return 1.5;
  } else {
    return 1 + (level - 1) * 0.025
  }
}

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
}

const dcDamageMultiplier = (dcLevel, level) => {
  const baseMultiplier = dcLevel === 1 ? 0.10 : 0.15;

  let bonus;
  if (level >= 20) {
    bonus = 1;
  } else {
    bonus = 0;
  }

  return baseMultiplier * (1 + (level - 1 + bonus) * 0.025);
}

const supportSkillDamageChance = (skill, level) => {
  switch (skill.id) {
    case 972:
    case 1032:
      return dcActivationChance(level);

    default:
      return 0;
  }
}

const supportSkillDamageMult = (skill, level) => {
  switch (skill.id) {
    case 972:
      return dcDamageMultiplier(2, level);

    case 1032:
      return dcDamageMultiplier(1, level);

    default:
      return 0;
  }
}

const weaponDamageType = (weaponType) => {
  switch (weaponType) {
    case SWORD:
    case HAMMER:
      return PHYSICAL;

    case ORB:
    case BOW:
    case POLE:
      return MAGICAL;

    default:
      throw new Error('Invalid damaging weapon type');
  }
}

const weaponSpeciality = (job) => {
  // returns [special, neutral, bad1, bad2]
  switch (job) {
    case "breaker":
      return [SWORD, POLE, HAMMER, BOW];

    case "crusher":
      return [HAMMER, BOW, POLE, SWORD];

    case "gunner":
      return [BOW, HAMMER, SWORD, POLE];

    case "paladin":
      return [POLE, SWORD, HAMMER, BOW];

    default:
      throw new Error("Input error, unexpected job found");
  }
}

const classMultiplier = (jobLevel) => {
  // returns [bonus, malus]
  switch (jobLevel) {
    case "std":
      return [1.1, 1];

    case "hnm1":
      return [1.30, 0.25];

    case "hnm2":
      return [1.35, 0.25];

    default:
      throw new Error("Input error, unexpected job level found");
  }
}

const classBonuses = (job, jobLevel) => {
  const [special, neutral, bad1, bad2] = weaponSpeciality(job);
  const [bonus, malus] = classMultiplier(jobLevel);
  return {
    [special]: bonus,
    [neutral]: 1,
    [bad1]: malus,
    [bad2]: malus,
  }
}


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

const buildDeckInfo = (maximizeForSingleTarget, deck, playerStats) => {
  const jobBonus = classBonuses(playerStats.job, playerStats.jobLevel);

  return deck.map((w) => {
    const wInfo = weaponsTable[w.id];
    const mainSkill = skillMultiplierTable[wInfo.back_skill_id];
    const supportSkill = skillMultiplierTable2[wInfo.auto_skill_id];
    const targetMultiplier = maximizeForSingleTarget ? 1 : aoeMultiplier(mainSkill.range_icon);

    return {
      ...w,
      p_atk: wInfo.max_p_atk - wInfo.add_p_atk * (wInfo.max_level - w.level),
      m_atk: wInfo.max_m_atk - wInfo.add_m_atk * (wInfo.max_level - w.level),
      p_def: wInfo.max_p_def - wInfo.add_p_def * (wInfo.max_level - w.level),
      m_def: wInfo.max_m_def - wInfo.add_m_def * (wInfo.max_level - w.level),
      skill_mult: mainSkill.damage_mult * skillLevelMultiplier(w.skill_level) * targetMultiplier * jobBonus[wInfo.card_detail_type],
      supp_skill_mult: 1 + supportSkillDamageChance(supportSkill, w.support_skill_level) * supportSkillDamageMult(supportSkill, w.support_skill_level),
      cost: wInfo.deck_cost,
      sp_cost: mainSkill.sp_cost,
      element: wInfo.attribute,
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
    <TogglableSection title="Minimum number of elemental weapons">
      <Grid container spacing={1}>
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
      </Grid>
    </TogglableSection>
    <TogglableSection title="Minimum number of weapons per type">
      <Grid container spacing={1}>
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
    <TogglableSection title="Defence weighting">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            label="Def score multiplier"
            type="number"
            value={options.defWeight}
            onChange={(e) => onOptionsChange({...options, defWeight: e.target.value})}
          />
        </Grid>
      </Grid>
    </TogglableSection>
    <TogglableSection title="Dummy target">
      <Grid container spacing={1}>
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
      </Grid>
    </TogglableSection>
    <TogglableSection title="Battle buffs">
      <Grid container spacing={1}>
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
      </Grid>
    </TogglableSection>
    <TogglableSection title="Pin or filter weapons">
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
}

const PinAndFilter = ({ weapons, options, onOptionsChange }) => {
  const { excludedWeapons, pinnedWeapons } = options;
  const pinned = new Set(pinnedWeapons); // shallow-copy
  const excluded = new Set(excludedWeapons); // shallow-copy

  const aviableWeaps = weapons.filter((w) => !pinned.has(w.id) && !excluded.has(w.id));
  const pinnedWeaps = weapons.filter((w) => pinned.has(w.id));
  const excludedWeaps = weapons.filter((w) => excluded.has(w.id));

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
      <Grid container spacing={2}>
        {aviableWeaps.map((weapon) => (
          <Grid item xs="auto" key={weapon.id}>
            <WeaponImage
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
  const [optimizer, setOptimizzer] = useState(null);
  const [progress, setProgress] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [showHighComboAlert, setShowHighComboAlert] = useState(false);
  const [options, setOptions] = useState({
    singleTarget: false,
    damagePerSP: false,
    maximize19: false,
    defWeight: 0,
    targetPDef: 40000,
    targetMDef: 40000,
    expectedPStack: 0,
    expectedMStack: 0,
    targetPDefStack: 0,
    targetMDefStack: 0,
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

  useEffect(() => {
    const worker = new Worker('Worker.js');
    worker.onerror = function(e) {
      console.log(e.message);
    }
    worker.onmessage = function(e) {
      const message = e.data;
      switch (message.type) {
        case 'progress':
          setProgress(message.data);
          break;

        case 'result':
          setOptimizationResult(message);
          break;

        default:
          console.log(message);
      }
    }
    setOptimizzer(worker);
  }, []);

  const closeHighComboAlert = () => {
    setShowHighComboAlert(false);
  };

  const optimize = () => {
    const aviableWeapons = weapons.filter((w) => !options.pinnedWeapons.has(w.id) && !options.excludedWeapons.has(w.id));
    const pinnedWeapons = weapons.filter((w) => options.pinnedWeapons.has(w.id));
    const deck = pinnedWeapons.concat(aviableWeapons);

    setProgress(0);
    optimizer.postMessage({
      command: 'start',
      deck: buildDeckInfo(options.singleTarget, deck, playerStats),
      pinLength: pinnedWeapons.length,
      playerStats,
      options,
    });
  };

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
          <label htmlFor="worker-job-progress">Analizing</label>
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
