import './App.css';

import FileParser from './FileParser.js';

import {useState, useEffect} from 'react';

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from '@material-ui/icons/Delete';
import MenuIcon from '@material-ui/icons/Menu';
import SaveIcon from '@material-ui/icons/Save';

// data
import skillMultiplierTable from './SkillMultiplierTable.js';
import skillMultiplierTable2 from './SkillMultiplierTable2.js';
import weaponsTable from './WeaponsTable.js';

// Data mappings
const FIRE = 1;
const WATER = 2;
const WIND = 3;

const A = 3;
const S = 4;
const SR = 5;
const L = 6;

const HARP = 1;
const BOOK = 2;
const ORB = 3;
const STAFF = 4;
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
  if (level == 20) {
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
  const baseMultiplier = dcLevel == 1 ? 0.10 : 0.15;

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


const PlayerStatsForm = ({value, onChange}) => {
  const {
    weaponlessPAtk = 0,
    weaponlessMAtk = 0,
    weaponlessPDef = 0,
    weaponlessMDef = 0,
    job = 'breaker',
    jobLevel = 'std',
    maxCost = 0,
  } = value;

  return (
    <form
      id="player_stats_form"
      noValidate
      autoComplete="off"
      onSubmit={() => {}}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="legend">Your stats</Typography>
        </Grid>
        <Grid item xs={'auto'}>
          <InputLabel id="job-select-label">Class</InputLabel>
          <Select
            labelId="job-select-label"
            id="job-select"
            value={job}
            onChange={(e) => onChange({...value, job: e.target.value})}
          >
            <MenuItem value='breaker'>Breaker</MenuItem>
            <MenuItem value='crusher'>Crusher</MenuItem>
            <MenuItem value='gunner'>Gunner</MenuItem>
            <MenuItem value='paladin'>Paladin</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={'auto'}>
          <InputLabel id="job-level-select-label">Class level</InputLabel>
          <Select
            labelId="job-level-select-label"
            id="job-level-select"
            value={jobLevel}
            onChange={(e) => onChange({...value, jobLevel: e.target.value})}
          >
            <MenuItem value='std'>Standard (+10%)</MenuItem>
            <MenuItem value='hnm1'>Half nightmare lvl.10 (+30%)</MenuItem>
            <MenuItem value='hnm2'>Half nightmare lvl.12 (+35%)</MenuItem>
          </Select>
        </Grid>
        <Grid item xs>
          <TextField
            id="max_cost"
            label="Max cost"
            value={maxCost}
            onChange={(e) => onChange({...value, maxCost: parseInt(e.target.value)})}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs>
          <TextField
            id="weaponless_p_atk"
            label="Weaponless P.Atk"
            value={weaponlessPAtk}
            onChange={(e) => onChange({...value, weaponlessPAtk: parseInt(e.target.value)})}
          />
        </Grid>
        <Grid item xs>
          <TextField
            id="weaponless_m_atk"
            label="Weaponless M.Atk"
            value={weaponlessMAtk}
            onChange={(e) => onChange({...value, weaponlessMAtk: parseInt(e.target.value)})}
          />
        </Grid>
        <Grid item xs>
          <TextField
            id="weaponless_p_def"
            label="Weaponless P.Def"
            value={weaponlessPDef}
            onChange={(e) => onChange({...value, weaponlessPDef: parseInt(e.target.value)})}
          />
        </Grid>
        <Grid item xs>
          <TextField
            id="weaponless_m_def"
            label="Weaponless M.Def"
            value={weaponlessMDef}
            onChange={(e) => onChange({...value, weaponlessMDef: parseInt(e.target.value)})}
          />
        </Grid>
      </Grid>
    </form>
  );
};

const weaponImageId = (id) => {
  switch (id) {
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


const WeaponImage = ({ weapon }) => (
  <img
    className="weapon-icon"
    src={weaponImageUrl(weapon)}
    alt={weapon.name}
    onClick={() => {console.log(weapon)}}
  />
);

const WeaponsIcons = ({ weapons }) => (
  <div>
    <Grid container spacing={2}>
      {weapons.map((weapon) => (
        <Grid item xs="auto" key={weapon.id}>
          <WeaponImage weapon={weapon} />
        </Grid>
      ))}
    </Grid>
  </div>
);

const DeckForm = ({ weapons, onChange }) => {
  const [showDeck, setShowDeck] = useState(true);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    FileParser.parseBlueLibraryCSV({
      file,
      onParseFinish: (weaps) => {
        console.log(weaps);
        onChange(weaps);
      },
    });
  };

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
      { weapons.length !== 0 && (
        <Grid item xs="auto">
          <Button
            variant="contained"
            onClick={() => setShowDeck(!showDeck)}
          >
            { showDeck ? 'Hide deck' : 'Show deck' }
          </Button>
        </Grid>
      )}
      { weapons.length !== 0 && showDeck && (
        <Grid item xs={12}>
          <WeaponsIcons weapons={weapons} />
        </Grid>
      )}
    </Grid>
  );
};

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

const OptimizationBlock = ({ weapons, playerStats }) => {
  const [optimizer, setOptimizzer] = useState(null);
  const [progress, setProgress] = useState(null);
  const [optimalGrid, setOptimalGrid] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState({
    formula: 'max_damage',
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

  if (progress == null) {
    return (
      <form
        id="optimization_form"
        noValidate
        autoComplete="off"
        onSubmit={() => {}}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="legend">Optimization options</Typography>
            <FormControlLabel
              control={<Switch checked={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)} />}
              label="Advanced options"
            />
          </Grid>
          <Grid item xs={'auto'}>
            <InputLabel id="optimization-select-label">Optimize for</InputLabel>
            <Select
              labelId="optimization-select-label"
              id="optimization-select"
              value={options.formula}
              onChange={(e) => setOptions({...options, formula: e.target.value})}
            >
              <MenuItem value='max_damage'>Max lifeforce damage</MenuItem>
              <MenuItem value='max_single_damage'>Max single target damage</MenuItem>
              <MenuItem value='max_damage_sp'>Max lifeforce damage per SP spent</MenuItem>
              <MenuItem value='max_single_damage_sp'>Max single target damage per SP spent</MenuItem>
            </Select>
          </Grid>

          { showAdvanced && (
          <>
          <Grid item xs={12}>
            <Typography variant="h5" component="legend">Defence weighting</Typography>
          </Grid>
          <Grid item xs="auto">
            <FormControlLabel
              control={<Switch checked={true} onChange={() => {}} />}
              label="Consider def gained from weapons"
            />
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Def score multiplier"
              type="number"
              value={options.defWeight}
              onChange={(e) => setOptions({...options, defWeight: e.target.value})}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" component="legend">Target stats</Typography>
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Enemy P.Def"
              type="number"
              value={options.targetPDef}
              onChange={(e) => setOptions({...options, targetPDef: e.target.value})}
            />
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Enemy M.Def"
              type="number"
              value={options.targetMDef}
              onChange={(e) => setOptions({...options, targetMDef: e.target.value})}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" component="legend">Battle buffs (negative for debuffs)</Typography>
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Your P.Atk stack"
              type="number"
              value={options.expectedPStack}
              onChange={(e) => setOptions({...options, expectedPStack: e.target.value})}
            />
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Your M.Atk stack"
              type="number"
              value={options.expectedMStack}
              onChange={(e) => setOptions({...options, expectedMStack: e.target.value})}
            />
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Enemy P.Def stack"
              type="number"
              value={options.targetPDefStack}
              onChange={(e) => setOptions({...options, targetPDefStack: e.target.value})}
            />
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Enemy M.Def stack"
              type="number"
              value={options.targetMDefStack}
              onChange={(e) => setOptions({...options, targetMDefStack: e.target.value})}
            />
          </Grid>


          <Grid item xs={12}>
            <Typography variant="h5" component="legend">Minimum number of elemental weapons</Typography>
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Fire"
              type="number"
              value={options.minFire}
              onChange={(e) => setOptions({...options, minFire: e.target.value})}
            />
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Water"
              type="number"
              value={options.minWater}
              onChange={(e) => setOptions({...options, minWater: e.target.value})}
            />
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Wind"
              type="number"
              value={options.minWind}
              onChange={(e) => setOptions({...options, minWind: e.target.value})}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" component="legend">Minimum number of weapon types</Typography>
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Swords"
              type="number"
              value={options.minSwords}
              onChange={(e) => setOptions({...options, minSwords: e.target.value})}
            />
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Hammers"
              type="number"
              value={options.minHammers}
              onChange={(e) => setOptions({...options, minHammers: e.target.value})}
            />
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Bows"
              type="number"
              value={options.minBows}
              onChange={(e) => setOptions({...options, minBows: e.target.value})}
            />
          </Grid>
          <Grid item xs="auto">
            <TextField
              label="Poles"
              type="number"
              value={options.minPoles}
              onChange={(e) => setOptions({...options, minPoles: e.target.value})}
            />
          </Grid>
          </>
          )}

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={optimize}
            >
              Optimize
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }

  if (optimalGrid) {
    return (<OptimizedWeaponsTable weapons={optimalGrid} />);
  }

  return (
    <Box>
      <label htmlFor="worker-job-progress">Analizing</label>
      <LinearProgressWithLabel value={progress * 100} />
    </Box>
  );
};

function App() {
  const [showMenu, setShowMenu] = useState(false);
  const [playerStats, setPlayerStats] = useState({});
  const [weapons, setWeapons] = useState([]);

  useEffect(() => {
    const cachedWeapons = localStorage.pbo_weapons;
    if (cachedWeapons) {
      setWeapons(JSON.parse(cachedWeapons));
    }

    const cachedStats = localStorage.pbo_playerStats;
    if (cachedStats) {
      setPlayerStats(JSON.parse(cachedStats));
    }
  }, []);

  const handleSaveData = () => {
    localStorage.pbo_weapons = JSON.stringify(weapons);
    localStorage.pbo_playerStats = JSON.stringify(playerStats);
  };

  const handleDeleteData = () => {
    delete localStorage.pbo_weapons;
    delete localStorage.pbo_playerStats;
  };

  const setMenuState = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setShowMenu(open);
  };

  return (
    <>
    <AppBar position="sticky">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={setMenuState(true)}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h5">Pavij&apos;s build optimizer</Typography>
      </Toolbar>
    </AppBar>
    <Drawer
      anchor="left"
      open={showMenu}
      onClose={setMenuState(false)}
    >
      <List>
        <ListItem button
          onClick={handleSaveData}
        >
          <ListItemIcon>
            <SaveIcon />
          </ListItemIcon>
          <ListItemText primary="Save locally" />
        </ListItem>
        <ListItem button
          onClick={handleDeleteData}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary="Delete local data" />
        </ListItem>
      </List>
    </Drawer>
    <Box p={2}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <DeckForm
            weapons={weapons}
            onChange={(weaps) => setWeapons(weaps)}
          />
        </Grid>
        <Grid item xs={12}>
          <PlayerStatsForm
            value={playerStats}
            onChange={(newValue) => setPlayerStats(newValue)}
          />
        </Grid>
        <Grid item xs={12}>
          <OptimizationBlock
            weapons={weapons}
            playerStats={playerStats}
          />
        </Grid>
      </Grid>
    </Box>
    </>
  );
}

export default App;
