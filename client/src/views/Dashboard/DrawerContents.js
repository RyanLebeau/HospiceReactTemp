import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// ==================== MUI ====================
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import AddCircle from '@material-ui/icons/AddCircle';
import Assignment from '@material-ui/icons/Assignment';
import Ballot from '@material-ui/icons/Ballot';
import Book from '@material-ui/icons/Book';
import Dashboard from '@material-ui/icons/Dashboard';
import EventNote from '@material-ui/icons/EventNote';
import Mood from '@material-ui/icons/Mood';
import PersonPin from '@material-ui/icons/PersonPin';

const styles = theme => ({
	nested: {
	  	paddingLeft: theme.spacing.unit * 4,
	},
});

class DrawerContents extends Component 
{
	constructor(props)
	{
		super(props);
		
		this.state = {
			usersMenuOpen: false,
			surveysMenuOpen: false
		};
	}

	toggleUsersMenuOpen = () =>
	{
		this.setState({
			usersMenuOpen: !this.state.usersMenuOpen
		});
	}

	toggleSurveysMenuOpen = () =>
	{
		this.setState({
			surveysMenuOpen: !this.state.surveysMenuOpen
		});
	}

	render() 
	{
		let { appState, classes } = this.props;

        return (
			<div>
				<List>
					<ListItem button component={Link} to="/">
						<ListItemIcon><Dashboard /></ListItemIcon>
						<ListItemText primary="Dashboard" />
					</ListItem>
					<ListItem button component={Link} to="/start">
						<ListItemIcon><Ballot /></ListItemIcon>
						<ListItemText primary="Start a Booklet" />
					</ListItem>
					<ListItem button component={Link} to="/your" divider>
						<ListItemIcon><Mood /></ListItemIcon>
						<ListItemText primary="Your Patients" />
					</ListItem>
				</List>
				{appState.role === "Admin" &&
				<List>
					<ListItem button onClick={this.toggleUsersMenuOpen}>
						<ListItemIcon><PersonPin /></ListItemIcon>
						<ListItemText primary="Users" />
						{this.state.usersMenuOpen ? <ExpandLess /> : <ExpandMore />}
					</ListItem>
					<Collapse in={this.state.usersMenuOpen} timeout="auto" unmountOnExit>
						<List component="div" disablePadding>
							<ListItem button component={Link} to="/administration/users/invite" className={classes.nested}>
								<ListItemIcon><AddCircle /></ListItemIcon>
								<ListItemText primary="New Person" />
							</ListItem>
							<ListItem button component={Link} to="/administration/users/assign/patient" className={classes.nested}>
								<ListItemIcon><Assignment /></ListItemIcon>
								<ListItemText primary="Assign Patient" />
							</ListItem>
							<ListItem button component={Link} to="/administration/users/assign/staff" className={classes.nested}>
								<ListItemIcon><Assignment /></ListItemIcon>
								<ListItemText primary="Assign Staff" />
							</ListItem>
							<ListItem button component={Link} to="/administration/users/management" className={classes.nested}>
								<ListItemIcon><EventNote /></ListItemIcon>
								<ListItemText primary="Management" />
							</ListItem>
						</List>
        			</Collapse>
					<ListItem button onClick={this.toggleSurveysMenuOpen}>
						<ListItemIcon><Book /></ListItemIcon>
						<ListItemText primary="Booklets" />
						{this.state.surveysMenuOpen ? <ExpandLess /> : <ExpandMore />}
					</ListItem>
					<Collapse in={this.state.surveysMenuOpen} timeout="auto" unmountOnExit>
						<List component="div" disablePadding>
							<ListItem button component={Link} to="/administration/booklets/create" className={classes.nested}>
								<ListItemIcon><AddCircle /></ListItemIcon>
								<ListItemText primary="Create a Booklet" />
							</ListItem>
							<ListItem button component={Link} to="/administration/booklets/management" className={classes.nested}>
								<ListItemIcon><EventNote /></ListItemIcon>
								<ListItemText primary="Management" />
							</ListItem>
						</List>
        			</Collapse>
				</List>
				}
			</div>
        );
    }
}

export default withStyles(styles)(DrawerContents);