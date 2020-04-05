// ================================================
// Code associated with assigning existing staff 
// members to existing coordinator accounts.
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
import SupervisedUserCircle from '@material-ui/icons/SupervisedUserCircle';
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
            worker: -1,
            workerUser: -1,
            workerError: "",
            loadError: "",
            workerSuccess: "",
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

    // Collects all documents from the "users" collection in the database
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

    // Assign reference worker ID to coordinator user in the database
    assignUserToWorker = () =>
    {
        let { worker, workerUser } = this.state;

        if(worker === -1)
        {
            this.setState({
                workerError: "Please select a worker to assign.",
                workerSuccess: ""
            });
            
            return;
        }

        if(workerUser === -1)
        {
            this.setState({
                workerError: "Please select a coordinator to assign to the specified worker.",
                workerSuccess: ""
            });

            return;
        }

        var currentWorkers = this.users.library[workerUser].workers;

        if(currentWorkers.includes(this.users.library[worker]._id))
        {
            this.setState({
                workerError: "This user is already assigned to this Worker.",
                workerSuccess: ""
            });

            return;
        }
        else
        {
            currentWorkers.push(this.users.library[worker]._id);
        }

        var data = {
            workers: currentWorkers
        };

        this.setState({
            assigning: true
        });

        patch("users/" + this.users.library[workerUser]._id, data, (error, response) => 
        {
            if(error)
            {
                if(error.response.status === 500)
                {
                    this.setState({
                        workerError: "There was an issue connecting to the server.",
                        workerSuccess: "",
                        assigning: false
                    });
                }
                else if(error.response.status === 401)
                {
                    this.setState({
                        workerError: "You are not authorized to use this page.  Please log in and try again.",
                        workerSuccess: "",
                        assigning: false
                    });
                }
                else
                {
                    this.setState({
                        workerError: "There was an issue contacting the server.",
                        workerSuccess: "",
                        assigning: false
                    });
                }
            }
            else
            {
                if(response.status === 200 || response.status === 304)
                {
                    this.setState({
                        workerError: "",
                        workerSuccess: "The worker has been assigned to the user.",
                        assigning: false
                    });
                }
                else
                {
                    this.setState({
                        workerError: "You are not authorized to use this page.  If you think this is a mistake, please log out and try again.",
                        workerSuccess: "",
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

    // Render worker assignment page and data
    renderWorkerAssign = () =>
    {
        let { classes } = this.props;
        let { worker, workerUser } = this.state;

        var rows = [];
        var workerCount = 0;

        for (let index = 0; index < this.users.length; index++) 
        {
            rows.push(this.createUserRow(this.users.library[index].name, this.users.library[index].role));
            if(this.users.library[index].role === "Worker")
            {
                workerCount++;
            }
        }
        
        if(workerCount === 0)
        {
            return(
                <StatusMessage color={classes.error}>
                    There are no staff members other than administrator(s) in the DB yet.  Please create a patient and try again.
                </StatusMessage>
            );
        }

        return(
            <form className={classes.root} autoComplete="off">
                <FormControl className={classes.formControl} fullWidth>
                <InputLabel htmlFor="selectWorker">Worker</InputLabel>
                    <Select
                        value={worker}
                        onChange={this.handleChange}
                        inputProps={{
                            name: 'worker',
                            id: 'selectWorker',
                        }}
                    >
                        <MenuItem value="">
                            <em>Select Worker</em>
                        </MenuItem>
                        {
                            rows.map((row, index) => {
                                if(row.role === "Worker")
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
                <InputLabel htmlFor="selectPersonal2">Personal</InputLabel>
                    <Select
                        value={workerUser}
                        onChange={this.handleChange}
                        inputProps={{
                            name: 'workerUser',
                            id: 'selectPersonal2',
                        }}
                    >
                        <MenuItem value="">
                            <em>Select Personal</em>
                        </MenuItem>
                        {
                            rows.map((row, index) => {
                                if(row.role !== "Patient" && row.role !== "Worker")
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
        let { assigning, loadError, render, workerError, workerSuccess } = this.state;

        if(render)
        {
            return (
                <Grid container spacing={24} align="center" justify="center">
                    <Grid item xs={12} sm={10} md={8} lg={6} xl={4}>
                        <Card className={classes.card}>
                            <CardContent>
                                <Typography component="p" variant="h6" className={classes.title}>
                                    Assign a Worker to a Coordinator or Administrator
                                </Typography>
                                {loadError !== "" && 
                                    <StatusMessage color={classes.error}>
                                        {loadError}
                                    </StatusMessage>
                                }
                                {this.renderWorkerAssign()}
                                {workerError !== ""  && 
                                    <StatusMessage color={classes.error}>
                                        {workerError}
                                    </StatusMessage>
                                }
                                {workerSuccess !== ""  && 
                                    <StatusMessage color={classes.success}>
                                        {workerSuccess}
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
                                            onClick={this.assignUserToWorker}
                                        >
                                            Assign Worker to Personal
                                            <SupervisedUserCircle className={classes.buttonIcon}>send</SupervisedUserCircle>
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