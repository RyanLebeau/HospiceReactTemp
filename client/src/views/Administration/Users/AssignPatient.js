// ================================================
// Code associated with assigning an existing
// patient user to an existing authorized WECCC
// worker account.
// ================================================
import React, { Component } from 'react';

// ==================== Helpers ====================
import get from '../../../helpers/common/get';
import patch from '../../../helpers/common/patch';

// ==================== MUI ====================
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import SupervisorAccount from '@material-ui/icons/SupervisorAccount';
import StatusMessage from '../../../components/StatusMessage';

const styles = theme => ({
    title: theme.title,
    card: theme.card,
    buttonIcon: {
        marginLeft: 5
    },
    root: theme.flexWrap,
    formControl: {
        margin: theme.spacing.unit,
    },
    alignLeftSpacer: theme.alignLeftSpacer,
    error: theme.error,
    success: theme.success
});

class UsersAssign extends Component 
{	
    constructor(props)
    {
        super(props);

        this.state = {
            patient: -1,
            patientUser: -1,
            patientError: "",
            loadError: "",
            patientSuccess: "",
            assigning: false,
            render: false
        };
    }

    componentDidMount = () =>
    {
        this.users = {};
        this.users.library = {};
        this.users.length = 0;

        this.props.ToggleDrawerClose();
        this.props.CheckAuthenticationValidity((tokenValid) => 
        {
            if(tokenValid)
			{
				this.getAllUsers();
			}
        });
    }

    // Collects all documents from "users" collection in database
    getAllUsers = () =>
    {
        let { appState } = this.props;

        get('users/', appState.token, (error, response) => 
        {
            if(error)
            {
                if(error.response.status === 500)
                {
                    this.setState({
                        loadError: "There was an issue contacting the server.  Please try again later.",
                        render: true
                    });
                }
                else if(error.response.status === 401)
                {
                    this.setState({
                        loadError: "You are not authorized to use this page.",
                        render: true
                    });
                }
                else
                {
                    this.setState({
                        loadError: "There was an issue contacting the server.",
                        render: true
                    });
                }
            }
            else
            {
                if(response.status === 200 || response.status === 304)
                {
                    this.users.length = response.data.response.count;
                    this.populateUserData(response.data.response);
                }
                else
                {
                    this.setState({
                        loadError: "You are not authorized to use this page.  If you think this is a mistake, please log out and try again.",
                        render: true
                    });
                }
            }
        });
    }

    populateUserData = (data) =>
    {
        for (let index = 0; index < data.count; index++) 
        {
            this.users.library[index] = {
                _id: data.users[index]._id,
                name: data.users[index].info.name,
                role: data.users[index].role,
                patients: data.users[index].patients,
                workers: data.users[index].workers
            }
        }

        this.setState({
            loadError: "",
            render: true
        });
    }

    // Assign reference patient ID to worker user in database 
    assignUserToPatient = () =>
    {
        let { patient, patientUser } = this.state;
        let { appState } = this.props;

        if(patient === -1)
        {
            this.setState({
                patientError: "Please select a patient to assign.",
                patientSuccess: ""
            });
            
            return;
        }

        if(patientUser === -1)
        {
            this.setState({
                patientError: "Please select a patient to assign.",
                patientSuccess: ""
            });

            return;
        }

        var currentPatients = this.users.library[patientUser].patients;

        if(currentPatients.includes(this.users.library[patient]._id))
        {
            this.setState({
                patientError: "This user is already assigned to this patient.",
                patientSuccess: ""
            });

            return;
        }
        else
        {
            currentPatients.push(this.users.library[patient]._id);
        }

        var data = {
            patients: currentPatients
        };

        this.setState({
            assigning: true
        });

        patch("users/" + this.users.library[patientUser]._id, appState.token, data, (error, response) => 
        {
            if(error)
            {
                if(error.response.status === 500)
                {
                    this.setState({
                        patientError: "There was an issue connecting to the server.",
                        patientSuccess: "",
                        assigning: false
                    });
                }
                else if(error.response.status === 401)
                {
                    this.setState({
                        patientError: "You are not authorized to use this page.  Please log in and try again.",
                        patientSuccess: "",
                        assigning: false
                    });
                }
                else
                {
                    this.setState({
                        patientError: "There was an issue contacting the server.",
                        patientSuccess: "",
                        assigning: false
                    });
                }
            }
            else
            {
                if(response.status === 200 || response.status === 304)
                {
                    this.setState({
                        patientError: "",
                        patientSuccess: "The patient has been assigned to the user.",
                        assigning: false
                    });
                }
                else
                {
                    this.setState({
                        patientError: "You are not authorized to use this page.  If you think this is a mistake, please log out and try again.",
                        patientSuccess: "",
                        assigning: false
                    });
                }
            }
        });
    }

    createUserRow = (name, role) =>
    {
        return { name, role }
    }

    handleChange = event => {
        this.setState({ 
            [event.target.name]: event.target.value 
        });
    };

    // Render patient assignment page and data
    renderPatientAssign = () =>
    {
        let { classes } = this.props;
        let { patient, patientUser } = this.state;

        var rows = [];
        var patientCount = 0;

        for (let index = 0; index < this.users.length; index++) 
        {
            rows.push(this.createUserRow(this.users.library[index].name, this.users.library[index].role));
            if(this.users.library[index].role === "Patient")
            {
                patientCount++;
            }
        }
        
        if(patientCount === 0)
        {
            return(
                <StatusMessage color={classes.error}>
                    There are no patients in the DB yet.  Please create a patient and try again.
                </StatusMessage>
            );
        }

        return(
            <form className={classes.root} autoComplete="off">
                <FormControl className={classes.formControl} fullWidth>
                <InputLabel htmlFor="selectPatient">Patient</InputLabel>
                    <Select
                        value={patient}
                        onChange={this.handleChange}
                        inputProps={{
                            name: 'patient',
                            id: 'selectPatient',
                        }}
                    >
                        <MenuItem value="">
                            <em>Select Patient</em>
                        </MenuItem>
                        {
                            rows.map((row, index) => {
                                if(row.role === "Patient")
                                {
                                    return(
                                        <MenuItem value={index} key={index}>
                                            {row.name}
                                        </MenuItem>
                                    );
                                }
                                else
                                {
                                    return null;
                                }
                            })
                        }
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl} fullWidth>
                <InputLabel htmlFor="selectPersonal">Personal</InputLabel>
                    <Select
                        value={patientUser}
                        onChange={this.handleChange}
                        inputProps={{
                            name: 'patientUser',
                            id: 'selectPersonal',
                        }}
                    >
                        <MenuItem value="">
                            <em>Select Personal</em>
                        </MenuItem>
                        {
                            rows.map((row, index) => {
                                if(row.role !== "Patient")
                                {
                                    return(
                                        <MenuItem value={index} key={index}>
                                            {row.name}
                                        </MenuItem>
                                    );
                                }
                                else
                                {
                                    return null;
                                }
                            })
                        }
                    </Select>
                </FormControl>
            </form>
        );
    }

	render()
	{
        let { classes } = this.props;
        let { assigning, loadError, patientError, patientSuccess, render } = this.state;

        if(render)
        {
            return (
                <Grid container spacing={24} align="center" justify="center">
                    <Grid item xs={12} sm={10} md={8} lg={6} xl={4}>
                        <Card className={classes.card}>
                            <CardContent>
                                <Typography component="p" variant="h6" className={classes.title}>
                                    Assign a Patient to a Worker, Coordinator or Administrator
                                </Typography>
                                {loadError !== "" && 
                                <StatusMessage color={classes.error}>
                                    {loadError}
                                </StatusMessage>
                                }
                                {this.renderPatientAssign()}
                                {patientError !== ""  && 
                                    <StatusMessage color={classes.error}>
                                        {patientError}
                                    </StatusMessage>
                                }
                                {patientSuccess !== ""  && 
                                    <StatusMessage color={classes.success}>
                                        {patientSuccess}
                                    </StatusMessage>
                                }
                            </CardContent>
                            <CardActions>
                                <div className={classes.alignLeftSpacer}>
                                    { assigning ? <CircularProgress className={classes.spinner}/> :
                                        <Button
                                            size="small" 
                                            variant="contained" 
                                            color="primary"
                                            onClick={this.assignUserToPatient}
                                        >
                                            Assign Patient to Personal
                                            <SupervisorAccount className={classes.buttonIcon}>send</SupervisorAccount>
                                        </Button>
                                    }
                                </div>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            );
        }
        else
        {
            return(
                <CircularProgress />
            );
        }
	}
}

export default withStyles(styles)(UsersAssign);