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

import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const YourStats = ({ playerStats, onPlayerStatsChange }) => {
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
        <Grid item xs={12}>
          <TextField
            id="max_cost"
            label="Max cost"
            value={playerStats.maxCost}
            onChange={(e) => onPlayerStatsChange({...playerStats, maxCost: parseInt(e.target.value) || 0})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="weaponless_p_atk"
            label="Weaponless P.Atk"
            value={playerStats.weaponlessPAtk}
            onChange={(e) => onPlayerStatsChange({...playerStats, weaponlessPAtk: parseInt(e.target.value) || 0})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="weaponless_m_atk"
            label="Weaponless M.Atk"
            value={playerStats.weaponlessMAtk}
            onChange={(e) => onPlayerStatsChange({...playerStats, weaponlessMAtk: parseInt(e.target.value) || 0})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="weaponless_p_def"
            label="Weaponless P.Def"
            value={playerStats.weaponlessPDef}
            onChange={(e) => onPlayerStatsChange({...playerStats, weaponlessPDef: parseInt(e.target.value) || 0})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="weaponless_m_def"
            label="Weaponless M.Def"
            value={playerStats.weaponlessMDef}
            onChange={(e) => onPlayerStatsChange({...playerStats, weaponlessMDef: parseInt(e.target.value) || 0})}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default YourStats;
