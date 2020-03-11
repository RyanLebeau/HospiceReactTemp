import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// ==================== Helpers ====================
import get from '../../helpers/common/get'

// ==================== Components ====================
import StatusMessage from '../../components/StatusMessage';

// ==================== MUI ====================
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    userCardRoot: {
        flexGrow: 1,
        marginTop: 24
    },
    error: theme.error
});

class YourPatients extends Component 
{
    constructor(props)
    {
        super(props);

        this.state = {
            error: "",
            render: false
        };
    }

    componentDidMount = async() =>
    {
        await this.props.UpdateUser();

        this.users = {};
        this.users.library = {};
        this.users.length = 0;
        this.users.patients = 0;

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
        let { appState } = this.props;
        let patientIndex = 0;

        for (let index = 0; index < data.count; index++) 
        {
            if(appState.patients.includes(data.users[index]._id))
            {
                this.users.library[patientIndex] = {
                    _id: data.users[index]._id,
                    name: data.users[index].info.name,
                    role: data.users[index].role,
                    email: data.users[index].email,
                    createdAt: data.users[index].createdAt
                };

                patientIndex++;
            }
        }

        this.users.length = patientIndex;

        this.setState({
            error: "",
            render: true
        });
    }

    createUserCard = ( _id, name, role, email, createdAt) =>
    {
        return { _id, name, role, email, createdAt }
    }

    renderCards = () =>
    {
        let { 
            classes 
        } = this.props;

        var rows = [];

        for (let index = 0; index < this.users.length; index++) 
        {
            rows.push(this.createUserCard(this.users.library[index]._id, 
                                          this.users.library[index].name, 
                                          this.users.library[index].role,
                                          this.users.library[index].email,
                                          this.users.library[index].createdAt));
        }

        if(this.users.length === 0)
        {
            return(
                <Typography>
                    You do not have any patients assigned to you yet.  Please wait for an asministrator to assign you your patients, or contact your administrator directly to ensure they know you currently have no one assigned to you.
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
                                <Grid item xs={12} sm={12} md={6} lg={4} xl={4} key={index}>
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
                                                    Joined: {createdAt.getMonth() + 1} / {createdAt.getDate() } / {createdAt.getFullYear()}
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button size="small" color="primary" component={Link} to={"/profile/" + row._id}>
                                                    View Profile
                                                </Button>
                                            </CardActions>
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
                                    Your Patients
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

YourPatients.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(YourPatients);