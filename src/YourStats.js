import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const YourStats = ({ playerStats, onPlayerStatsChange }) => {
  const {
    weaponlessPAtk = 0,
    weaponlessMAtk = 0,
    weaponlessPDef = 0,
    weaponlessMDef = 0,
    job = 'breaker',
    jobLevel = 'std',
    maxCost = 0,
  } = playerStats;

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
            onChange={(e) => onPlayerStatsChange({...playerStats, job: e.target.value})}
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
            onChange={(e) => onPlayerStatsChange({...playerStats, jobLevel: e.target.value})}
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
            onChange={(e) => onPlayerStatsChange({...playerStats, maxCost: parseInt(e.target.value)})}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs>
          <TextField
            id="weaponless_p_atk"
            label="Weaponless P.Atk"
            value={weaponlessPAtk}
            onChange={(e) => onPlayerStatsChange({...playerStats, weaponlessPAtk: parseInt(e.target.value)})}
          />
        </Grid>
        <Grid item xs>
          <TextField
            id="weaponless_m_atk"
            label="Weaponless M.Atk"
            value={weaponlessMAtk}
            onChange={(e) => onPlayerStatsChange({...playerStats, weaponlessMAtk: parseInt(e.target.value)})}
          />
        </Grid>
        <Grid item xs>
          <TextField
            id="weaponless_p_def"
            label="Weaponless P.Def"
            value={weaponlessPDef}
            onChange={(e) => onPlayerStatsChange({...playerStats, weaponlessPDef: parseInt(e.target.value)})}
          />
        </Grid>
        <Grid item xs>
          <TextField
            id="weaponless_m_def"
            label="Weaponless M.Def"
            value={weaponlessMDef}
            onChange={(e) => onPlayerStatsChange({...playerStats, weaponlessMDef: parseInt(e.target.value)})}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default YourStats;
