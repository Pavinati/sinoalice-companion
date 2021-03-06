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

import './App.css';

import clsx from 'clsx';
import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route
} from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import MenuIcon from '@material-ui/icons/Menu';

import AboutPage from './AboutPage.js';
import Menu from './Menu.js';
import OptimizationPage from './OptimizationPage.js';
import YourDeck from './YourDeck.js';
import YourStats from './YourStats.js';

// Style
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
  hide: {
    display: 'none',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

const App = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [showMenu, setShowMenu] = useState(true);
  const [playerStats, setPlayerStats] = useState({
    weaponlessPAtk: 0,
    weaponlessMAtk: 0,
    weaponlessPDef: 0,
    weaponlessMDef: 0,
    maxCost: 0,
  });
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
    <Router>
      <div className={classes.root} theme={theme}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: showMenu,
          })}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={setMenuState(true)}
              className={clsx(classes.menuButton, showMenu && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h5">Pavij&apos;s SINoALICE companion</Typography>
            <Box ml={1}>
              <Typography variant="caption">v0.1</Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <Menu
          width={drawerWidth}
          open={showMenu}
          onClose={setMenuState(false)}
          onSaveData={handleSaveData}
          onDeleteData={handleDeleteData}
        />
        <main
          className={clsx(classes.content, {
            [classes.contentShift]: showMenu,
          })}
        >
          <div className={classes.drawerHeader} />
          <Routes>
            <Route path="deck" element={
              <YourDeck weapons={weapons} onWeaponsChange={(weaps) => setWeapons(weaps)} />
            } />
            <Route path="stats" element={
              <YourStats playerStats={playerStats} onPlayerStatsChange={(stats) => setPlayerStats(stats)} />
            } />
            <Route path="optimize" element={
              <OptimizationPage weapons={weapons} playerStats={playerStats} />
            } />
            <Route path="about" element={
              <AboutPage />
            } />
              <Navigate to="deck" />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
