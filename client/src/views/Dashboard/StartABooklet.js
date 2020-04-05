// ================================================
// Code associated with filling out an existing
// survey for an existing patient user that will be
// saved into the "membersurveys" collection in the
// database.
// ================================================
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

// ==================== Helpers ====================
import get from '../../helpers/common/get';
import post from '../../helpers/common/post';

// ==================== MUI ====================
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import Description from '@material-ui/icons/Description';
import StatusMessage from '../../components/StatusMessage';

const styles = theme => ({
    title: theme.title,
    card: theme.card,
    buttonIcon: {
        marginLeft: 5
    },
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing.unit,
    },
    alignLeftSpacer: theme.alignLeftSpacer,
    error: theme.error,
    success: theme.success
});

class StartBooklet extends Component 
{	
    constructor(props)
    {
        super(props);

        this.state = {
            patientID: "",
            bookletIndex: "",
            loadError: "",
            startError: "",
            render: false,
            starting: false,
            redirect: false,
            redirectTo: ""
        };
    }

    componentDidMount = () =>
    {
        this.users = {};
        this.users.library = {};
        this.users.length = 0;

        this.booklets = {};
        this.booklets.library = {};
        this.booklets.length = 0;

        this.props.CheckAuthenticationValidity((tokenValid) => 
        {
            if(tokenValid)
            {
                this.getAllAssignedPatients();
            }
        });
    }

    // Gets all patient users that are assigned to worker in the database
    getAllAssignedPatients = () =>
    {
        let { appState } = this.props;

        if(appState.patients.length <= 0)
        {
            this.setState({
                loadError: "You do not have any patients assigned.  In order to start a booklet, you must first be assigned a patient by an Administrator.",
                render: true
            });
        }
        else 
        {
            this.users.length = appState.patients.length;

            var query = {
                _id: {
                    $in: appState.patients
                }
            };
    
            post('users/query', appState.token, query, (error, response) => 
            {
                if(error)
                {
                    if(error.response.status === 500)
                    {
                        this.setState({
                            loadError: error.message,
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
    }

    // Gets all created booklets from the "survey" collection in the datbase
    getAllBooklets = () =>
    {
        let { appState } = this.props;

        get("surveys/",  appState.token, (error, response) => 
        {
            if(error)
            {
                this.setState({
                    loadError: error.message,
                    render: true
                });
            }
            else
            {
                if(response.status === 200)
                {
                    this.booklets.length = response.data.response.count;
                    this.populateBookletData(response.data.response);
                }
                else
                {
                    this.setState({
                        loadError: "Unable to retrieve booklets.  Please refresh and try agian.",
                        render: true
                    });
                }
            }
        });
    }

    populateUserData = (data) => 
    {
        if(this.users.length === 0)
        {
            this.setState({
                loadError: "You do not have any patients assigned.",
                render: true
            });
        }
        else
        {
            for (let index = 0; index < data.count; index++) 
            {
                this.users.library[index] = {
                    _id: data.users[index]._id,
                    name: data.users[index].info.name,
                    role: data.users[index].role,
                    email: data.users[index].email,
                    createdAt: data.users[index].createdAt
                };
            }
    
            this.getAllBooklets();
        }
    }

    populateBookletData = (data) => 
    {
        if(this.booklets.length === 0)
        {
            this.setState({
                loadError: "No booklets have been created yet.",
                render: true
            });
        }
        else
        {
            for (let index = 0; index < data.count; index++) 
            {
                this.booklets.library[index] = {
                    _id: data.surveys[index]._id,
                    name: data.surveys[index].name,
                    surveyJSON: data.surveys[index].surveyJSON,
                    createdAt: data.surveys[index].createdAt,
                    updatedAt: data.surveys[index].updatedAt
                };
            }

            this.setState({
                error: "",
                render: true
            });
        }
    }

    handleChange = event => {
        this.setState({ 
            [event.target.name]: event.target.value 
        });
    };

    // Ask user to select patient assigned to them and a booklet,
    // then create a new "membersurvey" document in the database
    // and display the survey with the ability to fill it out.
    handleStartBooklet = () =>
    {
        let { appState } = this.props;
        let { bookletIndex, patientID } = this.state;

        if(patientID === "")
        {
            this.setState({
                startError: "Please select a patient.",
                render: true
            });

            return;
        }

        if(bookletIndex === "")
        {
            this.setState({
                startError: "Please select a booklet.",
                render: true
            });

            return;
        }

        var data = {
            name: this.booklets.library[bookletIndex].name,
            patientId: patientID,
            surveyJSON: this.booklets.library[bookletIndex].surveyJSON,
            responseJSON: "{}",
            approved: false,
            createdBy: appState._id,
            modifiedBy: appState._id
        }

        this.setState({
            startError: "",
            starting: true
        });

        post("membersurveys/",  appState.token, data, (error, response) => 
        {
            if(error)
            {
                this.setState({
                    startError: error.message,
                    starting: false
                });
            }
            else
            {
                if(response.status === 201)
                {
                    const memberSurveyID = response.data.memberSurvey._id;

                    this.setState({
                        startError: "",
                        starting: false,
                        redirect: true,
                        redirectTo: "booklet/" + memberSurveyID
                    });
                }
                else
                {
                    this.setState({
                        startError: "Unable to start the booklet. Please try again later.",
                        starting: false
                    });
                }
            }
        });   
    }

    createRow = (_id, name) =>
    {
        return { _id, name }
    }

    renderSelect = () =>
    {
        let { classes } = this.props;
        let { bookletIndex, patientID } = this.state;

        var patientRows = [];
        var bookletRows = [];

        for (let index = 0; index < this.users.length; index++) 
        {
            patientRows.push(this.createRow(this.users.library[index]._id, this.users.library[index].name));
        }

        for (let index = 0; index < this.booklets.length; index++) 
        {
            bookletRows.push(this.createRow(this.booklets.library[index]._id, this.booklets.library[index].name));
        }

        return(
            <form className={classes.root} autoComplete="off">
                <FormControl className={classes.formControl} fullWidth>
                    <InputLabel htmlFor="selectPatient">Patients</InputLabel>
                    <Select
                        value={patientID}
                        onChange={this.handleChange}
                        inputProps={{
                            name: 'patientID',
                            id: 'selectPatient',
                        }}
                    >
                        <MenuItem value={""}>
                            <em>Select Patient</em>
                        </MenuItem>
                        {
                            patientRows.map((row, index) => 
                            {
                                return(
                                    <MenuItem value={row._id} key={index}>
                                        {row.name}
                                    </MenuItem>
                                );
                            })
                        }
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl} fullWidth>
                    <InputLabel htmlFor="selectBooklet">Booklets</InputLabel>
                    <Select
                        value={bookletIndex}
                        onChange={this.handleChange}
                        inputProps={{
                            name: 'bookletIndex',
                            id: 'selectBooklet',
                        }}
                    >
                        <MenuItem value={""}>
                            <em>Select Booklet</em>
                        </MenuItem>
                        {
                            bookletRows.map((row, index) => 
                            {
                                return(
                                    <MenuItem value={index} key={index}>
                                        {row.name}
                                    </MenuItem>
                                );
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
        let { assigning, loadError, render, redirect, redirectTo, startError } = this.state;

        if(redirect)
        {
            return(<Redirect to={redirectTo} />);
        }

        if(render)
        {
            if(this.users.length === 0 || this.booklets.length === 0)
            {
                return(
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography component="p" variant="h5" className={classes.title}>
                                Start a Booklet
                            </Typography>
                            {loadError !== "" &&
                                <StatusMessage color={classes.error}>
                                    {loadError}
                                </StatusMessage>
                            }
                        </CardContent>
                    </Card>
                );
            }

            return (
                <div>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography component="p" variant="h5" className={classes.title}>
                                Start a Booklet
                            </Typography>
                            <Typography component="p">
                                Select a patient and a booklet to begin conducting your questionairre.  If you wish to continue a booklet that has already been created, navigate to your patients, click on the member profile and continue one of the 'In Progress' survey.
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography component="p" variant="h6" className={classes.title}>
                                Select your assigned Patient & Booklet
                            </Typography>
                            {this.renderSelect()}
                            {startError !== "" &&
                                <StatusMessage color={classes.error}>
                                    {startError}
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
                                        onClick={this.handleStartBooklet}
                                    >
                                        Begin Booklet
                                        <Description className={classes.buttonIcon} />
                                    </Button>
                                }
                            </div>
                        </CardActions>
                    </Card>
                </div>
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

export default withStyles(styles)(StartBooklet);