// ================================================
// Code for top navigation bar of application.
// Include profile tab, toggling side bar menu and
// notifications.
// ================================================
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// ==================== MUI ====================
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { Divider } from '@material-ui/core';

const styles = theme => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    menuButton: {
        marginRight: 5,
    },
    grow: {
        flexGrow: 1,
    },
    sectionDesktop: {
        display: 'flex',
    }
});

class AppBarContent extends Component 
{
    constructor(props)
    {
        super(props);
        
        this.state = {
            accountMenuAnchor: null,
            accountMenuOpen: false
        };
    }

    handleAccountMenuOpen = event =>
    {
        this.setState({
            accountMenuAnchor: event.currentTarget,
            accountMenuOpen: true
        });
    }

    handleAccountMenuClose = () =>
    {
        this.setState({
            accountMenuAnchor: null,
            accountMenuOpen: false
        });
    }

    renderAccountMenu = () =>
    {
        return(
            <Menu
                anchorEl={this.state.accountMenuAnchor}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={this.state.accountMenuOpen}
                onClose={this.handleMenuClose}
            >
                <MenuItem component={Link} to="profile/" onClick={this.handleAccountMenuClose}>Profile</MenuItem>
                <MenuItem onClick={this.props.Logout}>Logout</MenuItem>
                <Divider />
                <MenuItem onClick={this.handleAccountMenuClose}>Close</MenuItem>
            </Menu>
        );
    }

    render() 
    {
        let { classes } = this.props;
        
        return (
            <AppBar position="fixed" color="primary" className={classes.appBar}>
                <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="Open drawer"
                    onClick={this.props.toggleDrawerOpen}
                    className={classes.menuButton}
                >
                    <MenuIcon />
                </IconButton>
                <div className={classes.grow}>
                <Typography variant="h6" color="inherit" noWrap>
                    Palliative IMS
                </Typography>
                </div>
                <div className={classes.sectionDesktop}>
                <IconButton color="inherit">
                    <NotificationsIcon />
                </IconButton>
                <IconButton 
                    color="inherit" 
                    aria-owns={this.state.accountMenuOpen ? 'material-appbar' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleAccountMenuOpen}
                >
                    <AccountCircle />
                </IconButton>
                {this.renderAccountMenu()}
                </div>
                </Toolbar>
            </AppBar>
        );
    }
}

AppBarContent.propTypes = {
    classes: PropTypes.object.isRequired
};
  
export default withStyles(styles)(AppBarContent);