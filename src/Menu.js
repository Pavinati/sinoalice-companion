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

import { Link }  from 'react-router-dom';

import { makeStyles, useTheme } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import BookIcon from '@material-ui/icons/MenuBook';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';
import PerformanceIcon from '@material-ui/icons/AvTimer';
import PersonIcon from '@material-ui/icons/Person';
import SaveIcon from '@material-ui/icons/Save';

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: props => props.drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: props => props.drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
}));


const Menu = ({ width = 240, open, onClose, onSaveData, onDeleteData }) => {
  const classes = useStyles({drawerWidth: width});
  const theme = useTheme();

  return (
    <Drawer
      className={classes.drawer}
      anchor="left"
      variant="persistent"
      open={open}
      onClose={onClose}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={onClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </div>
      <Divider />
      <List>
        <ListItem button to="deck" component={Link}>
          <ListItemIcon>
            <BookIcon />
          </ListItemIcon>
          <ListItemText primary="Your deck" />
        </ListItem>
        <ListItem button to="stats" component={Link}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Your stats" />
        </ListItem>
        <ListItem button to="optimize" component={Link}>
          <ListItemIcon>
            <PerformanceIcon />
          </ListItemIcon>
          <ListItemText primary="Optimizer" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button
          onClick={onSaveData}
        >
          <ListItemIcon>
            <SaveIcon />
          </ListItemIcon>
          <ListItemText primary="Save data locally" />
        </ListItem>
        <ListItem button
          onClick={onDeleteData}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary="Delete local data" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button to="about" component={Link}>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary="About" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Menu;
