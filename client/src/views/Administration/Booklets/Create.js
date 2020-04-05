// ========================================
// Code associated with creating a new blank
// booklet that is added into the database.
// Only a name for the booklet is asked from
// the user here for creation.
// ========================================
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';

// ==================== Helpers ====================
import post from '../../../helpers/common/post';

// ==================== Components ====================
import StatusMessage from '../../../components/StatusMessage';
import TextInput from '../../../components/TextInput';

// ==================== MUI ====================
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import Icon from '@material-ui/core/Icon';

// ==================== Styles ====================
const styles = theme => ({
    title: theme.title,
    rightIcon: theme.rightIcon,
    button: theme.button,
    div: theme.alignLeftSpacer,
    spinner: theme.spinner,
    error: theme.error
});

class CreateBooklet extends Component 
{
    constructor(props)
    {
        super(props);

        this.state = {
            name: "",
            creating: false,
            redirect: false,
            redirectTo: ""
        };
    }

    componentDidMount = () =>
    {
        this.props.ToggleDrawerClose();
        this.props.CheckAuthenticationValidity((tokenValid) => 
        {
            if(!tokenValid)
            {
                console.log("Redirecting ...");
            }
        });
    }

    HandleNameChange = (event) =>
    {
        this.setState({
            name: event.target.value,
        });
    }

    // Insert the new booklet into the database upon creation
    CreateBooklet = () =>
    {
        let { appState } = this.props;
        let { name } = this.state;

        if(name === "")
        {
            this.setState({
                error: "Please enter a name.",
                creating: false
            });

            return;
        }
        else
        {
            this.setState({
                error: "",
                creating: true
            });
        }

        var data = {
            name: name,
            surveyJSON: "",
            createdBy: appState._id,
            modifiedBy: appState._id
        };

        post("surveys/", appState.token, data, (error, response) =>
        {
            if(error)
            {
                this.setState({
                    error: "There was an error saving the survey.  Please try again.",
                    creating: false
                });
    
            }
            else
            {
                if(response.status === 201)
                {
                    const _id = response.data.survey._id;

                    this.setState({
                        creating: false,
                        redirect: true,
                        redirectTo: _id
                    });
                }   
                else
                {
                    this.setState({
                        error: "The booklet name already exists, or you are not authorized to do this action.",
                        creating: false
                    });
                }
            }
        });
    }

	render()
	{
        let { classes } = this.props;
        let { error, name, redirect, redirectTo, creating } = this.state;

        if(redirect)
        {
            const url = "/administration/booklets/edit/" + redirectTo;
            return(<Redirect to={url} />);
        }
        else
        {
            return (      
                <Grid container spacing={24} align="center" justify="center">
                    <Grid item xs={12} sm={10} md={8} lg={6} xl={4} align="left">
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h2" className={classes.title}>
                                    Design a new Booklet.
                                </Typography>
                                <Typography>
                                    Here you can create a brand new SurveyJS style Booklet.  The main purpose is to create questionaires for your patients, however you can adapt these to be any type of service that SurveyJS provides.
                                </Typography>
                                <TextInput autoFocus id="name" label="Name" margin="normal" onChange={this.HandleNameChange} value={name} />
                                {error !== "" &&
                                    <StatusMessage color={classes.error}>
                                        {error}
                                    </StatusMessage>
                                }
                            </CardContent>
                            <CardActions>
                                <div className={classes.div}>
                                { creating ? <CircularProgress className={classes.spinner}/> :
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    color="primary"
                                    className={classes.button} 
                                    onClick={this.CreateBooklet}
                                >
                                    Create Booklet!
                                    <Icon className={classes.rightIcon}>send</Icon>
                                </Button>
                                }
                                </div>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            );
        }
	}
}

CreateBooklet.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CreateBooklet);