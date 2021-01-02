import { useState } from 'react';

import Box from '@material-ui/core/Box';
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

