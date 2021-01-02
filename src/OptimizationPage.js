import { useState, useEffect, useMemo } from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';
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

const OptionsForm = ({ options, onOptionsChange }) => (
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
      </Grid>
    </TogglableSection>
  </Box>
);

const OptimizationPage = ({ playerStats, weapons }) => {
  const [optimizer, setOptimizzer] = useState(null);
  const [progress, setProgress] = useState(null);
  const [optimalGrid, setOptimalGrid] = useState(null);
  const [options, setOptions] = useState({
    singleTarget: false,
    damagePerSP: false,
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
          setOptimalGrid(message.data);
          break;

        default:
          console.log(message);
      }
    }
    setOptimizzer(worker);
  }, []);

  const optimize = () => {
    setProgress(0);
    optimizer.postMessage({
      command: 'start',
      deck: buildDeckInfo(false, weapons, playerStats),
      playerStats,
      options: {},
    });
  };

  const numberOfCombinations = useMemo(() => {
    return combinations(weapons.length, 20).toLocaleString();
  }, [weapons.length]);

  return (
    <Box>
      <OptionsForm
        options={options}
        onOptionsChange={(opt) => setOptions(opt)}
      />
      <p>Number of possible combinations : {numberOfCombinations}</p>
      { progress == null ? (
        <Button
          variant="contained"
          color="primary"
          onClick={optimize}
        >
          Optimize
        </Button>
      ) : (
        <Box>
          <label htmlFor="worker-job-progress">Analizing</label>
          <LinearProgressWithLabel value={progress * 100} />
        </Box>
      )}
      { optimalGrid && (
        <OptimizedWeaponsTable weapons={optimalGrid} />
      )}
    </Box>
  );
};

export default OptimizationPage;
