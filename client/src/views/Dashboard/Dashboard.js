import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// ==================== MUI ====================
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';

// ==================== Components ====================
import DrawerContents from './DrawerContents';
import AppBar from './AppBar';
import Main from './Main';
import Start from './StartABooklet';
import Booklet from './Booklet';
import YourPatients from './YourPatients';
import ViewProfile from '../Profiles/View';
import CreatePerson from '../Administration/Users/CreatePerson';
import PatientAssign from '../Administration/Users/AssignPatient';
import StaffAssign from '../Administration/Users/AssignStaff';
import UsersManagement from '../Administration/Users/Management';
import EditPerson from '../Administration/Users/EditPerson';
import EnableDisablePerson from '../Administration/Users/EnableDisablePerson';
import Research from '../Administration/Users/Research';
import CreateBooklet from '../Administration/Booklets/Create';
import EditBooklet from '../Administration/Booklets/Edit';
import ViewBooklet from '../Administration/Booklets/View';
import BookletsManagement from '../Administration/Booklets/Management';
import Dashboard404 from './404';
import PDFPopup from './PDFPopup';

const drawerWidth = 240;

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
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerPaper: {
        width: drawerWidth,
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
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
    }
});

class Dashboard extends Component 
{
    constructor(props)
    {
        super(props);

        this.state = {
            drawerOpen: false,
            renderForPDF: false
        };
    }
    
    toggleDrawerOpen = () =>
    {
        this.setState({
            drawerOpen: !this.state.drawerOpen
        });
    }

    toggleDrawerClose = () =>
    {
        this.setState({
            drawerOpen: false
        });
    }

    toggleExportRender = () =>
    {
        this.setState({  
            renderForPDF: true
        });
    }  

    render() 
    {
        let { classes } = this.props;
        let { renderForPDF } = this.state;

        return (
            <BrowserRouter>
                <div className={classes.root}>
                    <CssBaseline />
                    { !renderForPDF &&
                        <AppBar toggleDrawerOpen={this.toggleDrawerOpen} Logout={this.props.Logout} />
                    }
                        <Drawer
                            className={classes.drawer}
                            variant="persistent"
                            anchor="left"
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                            open={this.state.drawerOpen}
                        >
                            <div className={classes.toolbar} />
                            <Divider />
                            <DrawerContents appState={this.props.appState} />
                        </Drawer>
                    <main
                        className={classNames(classes.content, {
                            [classes.contentShift]: this.state.drawerOpen,
                        })}
                    >
                        <div className={classes.toolbar} />
                        <Switch>
                            <Route exact path="/" render={(props) => <Main {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/start" render={(props) => <Start {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/booklet/:memberSurveyID" render={(props) => <Booklet {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/pdf/:memberSurveyID" render={(props) => <PDFPopup {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose} toggleExportRender={this.toggleExportRender}/>} />
                            <Route path="/your" render={(props) => <YourPatients {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose} UpdateUser={this.props.UpdateUser}/> } />
                            <Route path="/profile/:profileID?" render={(props) => <ViewProfile {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/administration/users/invite" render={(props) => <CreatePerson {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/administration/users/assign/patient" render={(props) => <PatientAssign {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose} UpdateUser={this.props.UpdateUser}/>} />
                            <Route path="/administration/users/assign/staff" render={(props) => <StaffAssign {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose} UpdateUser={this.props.UpdateUser}/> } />
                            <Route path="/administration/users/management" render={(props) => <UsersManagement {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/administration/users/edit/:profileID?" render={(props) => <EditPerson {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/administration/users/ed/:profileID?" render={(props) => <EnableDisablePerson {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/administration/users/research/:profileID?" render={(props) => <Research {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/administration/booklets/create" render={(props) => <CreateBooklet {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/administration/booklets/edit/:bookletID" render={(props) => <EditBooklet {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/administration/booklets/view/:bookletID" render={(props) => <ViewBooklet {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route path="/administration/booklets/management" render={(props) => <BookletsManagement {...props} appState={this.props.appState} CheckAuthenticationValidity={this.props.CheckAuthenticationValidity} ToggleDrawerClose={this.toggleDrawerClose}/>} />
                            <Route component={Dashboard404} />
                        </Switch>
                    </main>
                </div>
            </BrowserRouter>
        );
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired
};
  
export default withStyles(styles)(Dashboard);