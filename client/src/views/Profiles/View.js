import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// ==================== Helpers ====================
import get from '../../helpers/common/get';
import post from '../../helpers/common/post';

// ==================== Components ====================
import TextInput from '../../components/TextInput';

// ==================== MUI ====================
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'

const styles = theme => ({
    title: theme.title,
    error: theme.error,
    root: theme.flexWrap,
    tabRoot: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    alignLeftSpacer: theme.alignLeftSpacer,
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    margin: {
        margin: 10,
    }
});

const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing.unit * 2,
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing.unit,
        top: theme.spacing.unit,
        color: theme.palette.grey[500],
    },
}))(props => {
    let { children, classes, onClose } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
            <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
                <CloseIcon />
            </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles(theme => ({
    root: {
        margin: 0,
        padding: theme.spacing.unit * 2,
    },
}))(MuiDialogContent);
  
const DialogActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing.unit,
    },
}))(MuiDialogActions);

function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8}}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

class ViewProfile extends Component 
{	
    constructor(props)
    {
        super(props);

        this.state = {
            profileID: "",
            loadError: "",
            tabValue: 0,
            bookletDialogOpen: false,
            noteCreationDialogOpen: false,
            noteName: "",
            noteMessage: "",
            noteError: "",
            noteCreating: false,
            render: false
        };
    }

    componentDidMount = () =>
    {
        let { appState } = this.props;

        this.user = {};
        this.currentBooklet = {};

        const profileID = this.props.match.params.profileID;
        this.setState({ profileID });

        if(profileID != null)
        {
            if(appState.role !== "Admin")
            {
                if(appState.role === "Coordinator")
                {
                    if(!appState.patients.includes(profileID) && !appState.workers.includes(profileID))
                    {
                        this.setState({
                            loadError: "This user is not a member nor a worker that has been assigned to you.  You do not have permission to view this page.",
                            render: true
                        });
                    }
                    else
                    {
                        this.checkAuth();
                    }
                }
                else if(appState.role === "Worker")
                {
                    if(!appState.patients.includes(profileID))
                    {
                        this.setState({
                            loadError: "This user is not a member that has been assigned to you.  You do not have permission to view this page.",
                            render: true
                        });
                    }
                    else
                    {
                        this.checkAuth();
                    }
                }
            }
            else
            {
                this.checkAuth();
            }
        }
        else
        {
            this.checkAuth();
        }    
    }

    componentWillUpdate = () =>
    {
        let { profileID } = this.state;
        const newProfileID = this.props.match.params.profileID;

        if(newProfileID !== profileID)
        {
            this.setState({
                render: false,
                profileID: newProfileID,
            })
        }
    }

    checkAuth = () =>
    {
        setTimeout(() => {
            this.props.ToggleDrawerClose();
            this.props.CheckAuthenticationValidity((tokenValid) => 
            {
                if(tokenValid)
                {
                    this.loadUserInformation();
                }
            });
        }, 200);
    }

    loadUserInformation = () =>
    {
        let { appState } = this.props;
        const profileID = this.props.match.params.profileID;

        var _id = "";

        if(profileID == null)
        {
            _id = this.props.appState._id;
        }
        else
        {
            _id = profileID;
        }

        get("users/1/" + _id, appState.token, (userError, userResponse) => 
        {
            if(userError)
            {
                this.setState({
                    loadError: "Unable to load profile.  Please try again later.",
                    render: true
                });
            }
            else
            {
                if(userResponse.status === 200 || userResponse.status === 304)
                {
                    this.user = userResponse.data;                    

                    this.setState({
                        loadError: "Unable to load profile.  Please try again later.",
                        render: true
                    });
                }
                else
                {
                    this.setState({
                        loadError: "Unable to load profile.  Please make sure your User ID is correct and you have proper permissions.",
                        render: true
                    });
                }
            }
        });
    }

    createStickyNote = () =>
    {
        let { appState } = this.props;
        let { noteName, noteMessage } = this.state;

        const profileID = this.props.match.params.profileID;

        if(noteName === "" || noteMessage === "")
        {
            this.setState({
                noteError: "Please make sure a name and message are filled out."
            });

            return;
        }

        var newNote = {
            patientId: profileID,
            level: noteName,
            message: noteMessage,
            open: true,
            createdBy: appState._id,
            modifiedBy: appState._id
        }

        this.setState({
            noteCreating: true,
        })

        post("stickynotes/", appState.token, newNote, (error, response) => 
        {
            if(error)
            {
                this.setState({ 
                    noteError: "There was an error creating the note, please try again later.",
                    noteCreating: false
                });
            }
            else
            {
                if(response.status === 201)
                {
                    this.setState({
                        noteError: "",
                        noteCreating: false,
                        noteCreationDialogOpen: false
                    }, () => {window.location.reload();})
                }
                else
                {
                    this.setState({ 
                        noteError: "There was an error creating the note, please try again later.",
                        noteCreating: false
                    });
                }
            }
        });
    }

    createBookletRow = (_id, name, approved, approvedBy, approvedByName, dateCreated, createdBy, createdByName, dateLastModified, lastMofifiedBy, lastMofifiedByName) =>
    {
        return {_id, name, approved, approvedBy, approvedByName, dateCreated, createdBy, createdByName, dateLastModified, lastMofifiedBy, lastMofifiedByName}
    }

    createStickyNoteRow = (_id, level, message, open, dateCreated, createdBy, createdByName, dateLastModified, lastMofifiedBy, lastMofifiedByName) =>
    {
        return {_id, level, message, open, dateCreated, createdBy, createdByName, dateLastModified, lastMofifiedBy, lastMofifiedByName}
    }

    createUserRow = (_id, email, role, name, createdAt) =>
    {
        return { _id, email, role, name, createdAt }
    }

    handleTabChange = (event, tabValue) => 
    {
        this.setState({ tabValue });
    }

    HandleChange = event => 
    {
        this.setState({ 
            [event.target.name]: event.target.value 
        });
    };

    handleBookletDialogOpen = (currentBooklet) =>
    {
        this.currentBooklet = currentBooklet;

        this.setState({
            bookletDialogOpen: true
        });
    }

    handleBookletDialogClose = () =>
    {
        this.setState({
            bookletDialogOpen: false
        }); 
    }

    handleNoteCreationDialogOpen = () =>
    {
        this.setState({
            noteCreationDialogOpen: true
        });
    }

    handleNoteCreationDialogClose = () =>
    {
        this.setState({
            noteError: "",
            noteCreationDialogOpen: false
        });
    }

    renderBookletTab = () =>
    {
        let { memberSurveys } = this.user;

        var rows = [];
        const length = this.user.memberSurveys.length;

        for (let index = 0; index < length; index++) 
        {
            rows.push(this.createBookletRow(memberSurveys[index]._id,
                                            memberSurveys[index].name,
                                            memberSurveys[index].approved,
                                            memberSurveys[index].approvedBy,
                                            memberSurveys[index].approvedByname,
                                            memberSurveys[index].createdAt,
                                            memberSurveys[index].createdBy,
                                            memberSurveys[index].createdByName,
                                            memberSurveys[index].updatedAt,
                                            memberSurveys[index].modifiedBy,
                                            memberSurveys[index].modifiedByName));
        }

        if(length === 0)
        {
            return(<Typography>There are no booklets for this user yet.</Typography>);
        }
        else
        {
            return(
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Booklet Name</TableCell>
                            <TableCell align="right">Date Started</TableCell>
                            <TableCell align="right">Status</TableCell>
                            <TableCell align="right">Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => 
                        {
                            var bookletURL = "/booklet/" + row._id;
                            var createdAt = new Date(row.dateCreated);
                            var approved = "Pending Approval";

                            if(row.approved)
                            {
                                approved = "Approved"
                            }

                            return(
                            <TableRow key={index}>
                                <TableCell>
                                    <Typography component={Link} to={bookletURL}>
                                        {row.name}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    {createdAt.getMonth() + 1} / {createdAt.getDate() } / {createdAt.getFullYear()}
                                </TableCell>
                                <TableCell align="right">
                                    {approved}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton aria-label="View" onClick={() => this.handleBookletDialogOpen(row)}>
                                        <OpenInBrowser fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            );
        }
    }

    renderStickyNotesTab = () =>
    {        
        let { classes } = this.props;
        let { stickyNotes } = this.user;

        var rows = [];
        const length = stickyNotes.length;

        for (let index = 0; index < length; index++) 
        {
            rows.push(this.createStickyNoteRow(stickyNotes[index]._id,
                                               stickyNotes[index].level,
                                               stickyNotes[index].message,
                                               stickyNotes[index].open,
                                               stickyNotes[index].createdAt,
                                               stickyNotes[index].createdBy._id,
                                               stickyNotes[index].createdBy.info.name,
                                               stickyNotes[index].updatedAt,
                                               stickyNotes[index].modifiedBy._id,
                                               stickyNotes[index].modifiedBy.info.name));
        }

        if(length === 0)
        {
            return(
                <div className={classes.root}>
                    <Typography>
                        There are no sticky notes attatched to this user yet.
                    </Typography>
                    <div className={classes.alignLeftSpacer}>
                        <Button 
                            size="small" 
                            variant="contained" 
                            color="primary"
                            onClick={this.handleNoteCreationDialogOpen}
                        >
                            Create Sticky Note
                            <EditIcon className={classes.rightIcon}>send</EditIcon>
                        </Button>
                    </div>
                </div>
            );
        }
        else
        {
            return(
                <div>
                    <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Message</TableCell>
                            <TableCell align="right">Date Created</TableCell>
                            <TableCell align="right">Created By</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => 
                        {                            
                            var createdAt = new Date(row.dateCreated);
                            var url = "/profile/" + row.createdBy;
                            return(
                            <TableRow key={index}>
                                <TableCell>
                                    <Typography>
                                        {row.level}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography>
                                        {row.message}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    {createdAt.getMonth() + 1} / {createdAt.getDate() } / {createdAt.getFullYear()}
                                </TableCell>
                                <TableCell align="right">
                                    <Typography>
                                        <a href={url}>{row.createdByName}</a>
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            );
                        })}
                    </TableBody>
                    </Table>
                    <br />
                    <div className={classes.root}>
                        <div className={classes.alignLeftSpacer}>
                            <Button 
                                size="small" 
                                variant="contained" 
                                color="primary"
                                onClick={this.handleNoteCreationDialogOpen}
                            >
                                Create Sticky Note
                                <EditIcon className={classes.rightIcon}>send</EditIcon>
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    renderUserTab = (data) =>
    {
        let { classes } = this.props;
        
        var rows = [];
        const length = data.length;

        for (let index = 0; index < length; index++) 
        {
            rows.push(this.createUserRow(data[index]._id,
                                         data[index].email,
                                         data[index].role,
                                         data[index].info.name,
                                         data[index].createdAt));
        }

        if(length === 0)
        {
            return(
                <div className={classes.root}>
                    <Typography>
                        There are no patients assigned to this user.
                    </Typography>
                </div>
            );
        }
        else
        {
            return(
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Email</TableCell>
                            <TableCell align="right">Date Joined</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => 
                        {                            
                            var createdAt = new Date(row.createdAt);
                            var url = "/profile/" + row._id;
                            return(
                            <TableRow key={index}>
                                <TableCell>
                                    <Typography>
                                        <a href={url}>{row.name}</a>
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography>
                                        {row.email}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    {createdAt.getMonth() + 1} / {createdAt.getDate() } / {createdAt.getFullYear()}
                                </TableCell>
                            </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            );
        }
    }

    renderInfoTab = () =>
    {
        let user = this.user;

        return(
            <Grid spacing={24} container>
                <Grid item xs={6}>
                    <TextInput autoFocus id="email" fullWidth label="Email" value={user.user.email} />
                </Grid>
                <Grid item xs={6}>
                    <TextInput id="Name" fullWidth label="Name"  value={user.user.info.name} />
                </Grid>
                <Grid item xs={6}>
                    <TextInput id="phone" fullWidth label="Phone" value={user.user.info.phone} />
                </Grid>
                <Grid item xs={12}>
                    <TextInput id="address" fullWidth label="Address" value={user.user.info.currentAddress.street} />
                </Grid>
                <Grid item xs={6}>
                    <TextInput id="city" fullWidth label="City" value={user.user.info.currentAddress.city} />
                </Grid>
                <Grid item xs={6}>
                    <TextInput id="state" fullWidth label="State" value={user.user.info.currentAddress.state} />
                </Grid>
                <Grid item xs={6}>
                    <TextInput id="zip" fullWidth label="Zip / Postal Code" value={user.user.info.currentAddress.code} />
                </Grid>
                <Grid item xs={6}>
                    <TextInput id="country" fullWidth label="Country" value={user.user.info.currentAddress.country} />
                </Grid>
            </Grid>
        );
    }

    renderBookletDialog = () =>
    {
        let { bookletDialogOpen } = this.state;
        let { name } = this.user.user;

        return(
            <div>
                <Dialog
                    onClose={this.handleBookletDialogClose}
                    aria-labelledby="Delete-Dialog"
                    open={bookletDialogOpen}
                >
                    <DialogTitle id="Delete-Dialog" onClose={this.handleBookletDialogClose}>
                        {this.currentBooklet.name}
                    </DialogTitle>                
                        <DialogContent>
                            <Typography gutterBottom>
                                Here is all the important information for the {this.currentBooklet.name} for {name}:
                            </Typography>
                            <br />
                            <Typography gutterBottom>
                                Booklet Started: {this.currentBooklet.dateCreated}
                            </Typography>
                            <Typography gutterBottom>
                                Started By: {this.currentBooklet.createdByName}
                            </Typography>
                            <Typography gutterBottom>
                                Booklet Last Modified: {this.currentBooklet.dateLastModified}
                            </Typography>
                            <Typography gutterBottom>
                                Last Modified By: {this.currentBooklet.lastMofifiedByName}
                            </Typography>
                            <br />
                            {this.currentBooklet.approved ? 
                                <Typography gutterBottom>
                                    This booklet has been approved by {this.currentBooklet.approvedByName}.        
                                </Typography>
                            :
                                <Typography gutterBottom>
                                    This Booklet has not been approved yet.
                                </Typography>
                            }
                        </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={this.handleBookletDialogClose}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    renderNoteCreationDialog = () =>
    {
        let { classes } = this.props;
        let { noteCreationDialogOpen, noteName, noteMessage, noteError, noteCreating } = this.state;

        return(
            <div>
                <Dialog
                    onClose={this.handleNoteCreationDialogClose}
                    aria-labelledby="Creation-Dialog"
                    open={noteCreationDialogOpen}
                >
                    <DialogTitle id="Creation-Dialog" onClose={this.handleNoteCreationDialogClose}>
                        Create a new Sticky Note
                    </DialogTitle>                
                    <DialogContent>
                        <Typography gutterBottom>
                            Please provide a name for this sticky note as well as a message.  This note will be visible to all users who have access to this member.
                        </Typography>
                        <form className={classes.root}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="noteName">Priority</InputLabel>
                            <Select
                                value={noteName}
                                onChange={this.HandleChange}
                                inputProps={{
                                    name: 'noteName',
                                    id: 'noteName',
                                }}
                            >
                                <MenuItem value="">
                                    <em>Select Message Importance</em>
                                </MenuItem>
                                <MenuItem value={"Info"}>Info</MenuItem>
                                <MenuItem value={"Warning"}>Warning</MenuItem>
                                <MenuItem value={"Danger"}>Danger</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="noteMessage">Message</InputLabel>
                            <Input 
                                id="noteMessage" 
                                name="noteMessage"
                                value={noteMessage} 
                                onChange={this.HandleChange}
                            />
                        </FormControl>
                        </form>
                        { noteError !== "" &&
                            <Typography gutterBottom className={classes.error}>
                                {noteError}
                            </Typography>
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" onClick={this.createStickyNote} disabled={noteCreating}>
                            Create Note
                        </Button>
                        <Button color="primary" onClick={this.handleNoteCreationDialogClose}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

	render()
	{
        let { classes } = this.props;
        let { render, tabValue } = this.state;

        if(render)
        {
            let { createdAt, info, patients, role, workers } = this.user.user;

            var dateCreated = new Date(createdAt);
            
            return (
                <Card>
                    <CardContent>
                        <Grid spacing={24} container>
                            <Grid item xs={12}>
                                <div className={classes.margin}>
                                    <Typography variant="h3" gutterBottom color="secondary">
                                        {info.name}
                                    </Typography>
                                    <Typography gutterBottom>
                                        Role: {role}<br />
                                        Date Joined: {dateCreated.getMonth() + 1} / {dateCreated.getDate() } / {dateCreated.getFullYear()}<br />
                                    </Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12}>
                                {role === "Patient" &&
                                    <div className={classes.tabRoot}>
                                        <AppBar position="static">
                                            <Tabs value={tabValue} onChange={this.handleTabChange}>
                                                <Tab label="Booklets" />
                                                <Tab label="Sticky Notes" />
                                                <Tab label="Profile" />
                                            </Tabs>
                                        </AppBar>
                                        {tabValue === 0 && <TabContainer>{this.renderBookletTab()}</TabContainer>}
                                        {tabValue === 1 && <TabContainer>{this.renderStickyNotesTab()}</TabContainer>}
                                        {tabValue === 2 && <TabContainer>{this.renderInfoTab()}</TabContainer>}
                                    </div>
                                }
                                {role === "Worker" &&
                                    <div className={classes.tabRoot}>
                                        <AppBar position="static">
                                            <Tabs value={tabValue} onChange={this.handleTabChange}>
                                                <Tab label="Patients" />
                                                <Tab label="Profile" />
                                            </Tabs>
                                        </AppBar>
                                        {tabValue === 0 && <TabContainer>{this.renderUserTab(patients)}</TabContainer>}
                                        {tabValue === 1 && <TabContainer>{this.renderInfoTab()}</TabContainer>}
                                    </div>
                                }
                                {role === "Coordinator" &&
                                    <div className={classes.tabRoot}>
                                        <AppBar position="static">
                                            <Tabs value={tabValue} onChange={this.handleTabChange}>
                                                <Tab label="Patients" />
                                                <Tab label="Workers" />
                                                <Tab label="Profile" />
                                            </Tabs>
                                        </AppBar>
                                        {tabValue === 0 && <TabContainer>{this.renderUserTab(patients)}</TabContainer>}
                                        {tabValue === 1 && <TabContainer>{this.renderUserTab(workers)}</TabContainer>}
                                        {tabValue === 2 && <TabContainer>{this.renderInfoTab()}</TabContainer>}
                                    </div>
                                }
                                {role === "Admin" &&
                                    <div className={classes.tabRoot}>
                                        <AppBar position="static">
                                            <Tabs value={tabValue} onChange={this.handleTabChange}>
                                                <Tab label="Patients" />
                                                <Tab label="Workers" />
                                                <Tab label="Profile" />
                                            </Tabs>
                                        </AppBar>
                                        {tabValue === 0 && <TabContainer>{this.renderUserTab(patients)}</TabContainer>}
                                        {tabValue === 1 && <TabContainer>{this.renderUserTab(workers)}</TabContainer>}
                                        {tabValue === 2 && <TabContainer>{this.renderInfoTab()}</TabContainer>}
                                    </div>
                                }
                                {this.renderBookletDialog()}
                                {this.renderNoteCreationDialog()}
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            );
        }
        else
        {
            return(<CircularProgress />);
        }
	}
}

ViewProfile.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ViewProfile);