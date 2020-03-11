import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// ==================== Helpers ====================
import get from '../../../helpers/common/get';

// ==================== Components ====================
import StatusMessage from '../../../components/StatusMessage';

// ==================== MUI ====================
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles /*, MuiThemeProvider, createMuiTheme */} from '@material-ui/core/styles';
/*
// ==================== Colors ====================
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
*/
const styles = theme => ({
    userCardRoot: {
        flexGrow: 1,
        marginTop: 24
    },
    error: theme.error
});

/*
const enableTheme = createMuiTheme({
    palette: {
        primary: green
    }
});

const deleteTheme = createMuiTheme({
    palette: {
        primary: red
    }
});
*/
class UsersManagement extends Component 
{
    constructor(props)
    {
        super(props);

        this.state = {
            error: "",
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
				this.getUsers();
			}
        });
    }

    getUsers = () =>
    {
        let { appState } = this.props;

        get("users/", appState.token, (error, response) => 
        {
            if(error)
            {
                this.setState({
                    error: error.message,
                    render: true
                });
            }
            else
            {
                if(response.status === 200 || response.status === 304)
                {
                    this.users.length = response.data.response.count;
                    this.populateStateData(response.data.response);
                }
                else
                {
                    this.setState({
                        error: "Unable to retrieve users.  Please refresh and try agian.",
                        render: true
                    });
                }
            }
        });
    }

    populateStateData = (data) => 
    {
        for (let index = 0; index < data.count; index++) 
        {
            this.users.library[index] = {
                _id: data.users[index]._id,
                enabled: data.users[index].enabled,
                name: data.users[index].info.name,
                role: data.users[index].role,
                email: data.users[index].email,
                createdAt: data.users[index].createdAt
            };
        }

        this.setState({
            error: "",
            render: true
        });
    }

    createUserCard = ( _id, enabled, name, role, email, createdAt) =>
    {
        return { _id, enabled, name, role, email, createdAt }
    }

    renderCards = () =>
    {
        let { classes } = this.props;

        var rows = [];

        for (let index = 0; index < this.users.length; index++) 
        {
            rows.push(this.createUserCard(this.users.library[index]._id,
                                          this.users.library[index].enabled,
                                          this.users.library[index].name,
                                          this.users.library[index].role,
                                          this.users.library[index].email,
                                          this.users.library[index].createdAt));
        }

        if(this.users.length === 0)
        {
            return(
                <Typography>
                    There are no Users yet! Not sure how this is possible ...
                </Typography>
            );
        }
        else
        {
            return(
                <div className={classes.userCardRoot}>
                    <Grid container spacing={24}>
                        {rows.map((row, index) => {
                            var createdAt = new Date(row.createdAt);
                            return(
                                <Grid item xs={12} sm={12} md={6} lg={6} xl={4} key={index}>
                                    <Paper>
                                        <Card>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    {row.name}
                                                </Typography>
                                                <Typography component="p">
                                                    Role: {row.role}
                                                </Typography>
                                                <Typography component="p">
                                                    Email: {row.email}
                                                </Typography>
                                                <Typography component="p">
                                                    Status: {row.enabled ? "Enabled" : "Disabled"}
                                                </Typography>
                                                <Typography component="p">
                                                    Joined: {createdAt.getMonth() + 1} / {createdAt.getDate() } / {createdAt.getFullYear()}
                                                </Typography>
                                                <hr />
                                                <Grid container spacing={24}>
                                                    <Grid item xs={4}>
                                                        <Button size="small" variant="raised" fullWidth color="primary" component={Link} to={"/profile/" + row._id}>
                                                            View Profile
                                                        </Button>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Button size="small" variant="raised" fullWidth color="primary" component={Link} to={"/administration/users/edit/" + row._id}>
                                                            Edit Profile
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={24}>
                                                    {row.role === "Patient" &&
                                                        <Grid item xs={4}>
                                                            <Button size="small" variant="raised" fullWidth color="secondary" component={Link} disabled={row.role !== "Patient"} to={"/administration/users/research/" + row._id}>
                                                                Research
                                                            </Button>
                                                        </Grid>
                                                    }
                                                    <Grid item xs={4}>
                                                            <Button size="small" variant="raised" fullWidth color="secondary" component={Link} to={"/administration/users/ed/" + row._id}>
                                                                {row.enabled ? 
                                                                    "Disable"
                                                                :
                                                                    "Enable"
                                                                }
                                                            </Button>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                </div>
            );
        }
    }

	render()
	{
        let { classes } = this.props;
        let { error, render } = this.state;

		return (
            <div>
                { render ? 
                    <div>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h2" className={classes.title}>
                                    User Management
                                </Typography>
                                {error !== "" &&
                                    <StatusMessage color={classes.error}>
                                        {error}
                                    </StatusMessage>
                                }
                                {this.renderCards()}
                            </CardContent>
                        </Card>
                    </div>
                :
                    <CircularProgress />
                }
            </div>            
        );
	}
}

UsersManagement.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UsersManagement);