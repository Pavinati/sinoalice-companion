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

import { useState } from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import FileParser from './FileParser.js';
import WeaponImage from './WeaponImage.js';

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

const YourDeck = ({ weapons, onWeaponsChange }) => {
  const [showDeck, setShowDeck] = useState(true);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    FileParser.parseBlueLibraryCSV({
      file,
      onParseFinish: (weaps) => {
        onWeaponsChange(weaps);
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

export default YourDeck;

