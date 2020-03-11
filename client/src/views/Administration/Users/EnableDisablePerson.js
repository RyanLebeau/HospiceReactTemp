import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// ==================== Helpers ====================
import get from '../../../helpers/common/get';
import patch from '../../../helpers/common/patch';

// ==================== Components ====================
import StatusMessage from '../../../components/StatusMessage';

// ==================== MUI ====================
import { Button, Card, Grid, CardContent, CardActions, Typography, CircularProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import LeftArrow from '@material-ui/icons/ArrowLeft';

const styles = theme => ({
    title: theme.title,
    error: theme.error,
    success: theme.success,
    alignLeftSpacer: theme.alignLeftSpacer,
    spinner: theme.spinner,
    rightIcon: theme.rightIcon
});

class EnableDisablePerson extends Component 
{
    constructor(props) 
    {
        super(props);
    
        this.state = {
            profileID: "",
            name: "",
            error: "",
            success: "",
            enabled: true,
            render: false
        };
    }
    
    componentDidMount = () =>
    {
        const profileID = this.props.match.params.profileID;
        this.user = {};

        if(profileID != null)
        {
            this.setState({
                profileID: profileID
            }, () => {setTimeout(() => {
                this.props.ToggleDrawerClose();
                this.props.CheckAuthenticationValidity((tokenValid) => 
                {
                    if(tokenValid)
                    {
                        this.loadUserInformation();
                    }
                });
            }, 200)});
        }
        else
        {
            this.setState({
                error: "Please navigate to a proper profile id.",
                render: true
            });
        }
    }

    loadUserInformation = () =>
    {
        let { profileID } = this.state;
        let { appState } = this.props;

        get("users/" + profileID, appState.token, (userError, userResponse) => 
        {
            if(userError)
            {
                this.setState({
                    error: "Unable to load profile.",
                    render: true
                });
            }
            else
            {
                if(userResponse.status === 200 || userResponse.status === 304)
                {
                    this.user = userResponse.data;                    
                    let user = this.user.user;

                    this.setState({
                        error: "",
                        enabled: user.enabled,
                        name: user.info.name,
                        render: true
                    });
                }
                else
                {
                    this.setState({
                        error: "Unable to load profile.  Please make sure your User ID is correct and you have proper permissions.",
                        render: true
                    });
                }
            }
        });
    }

    saveUserInformation = () =>
    {
        let { enabled, profileID } = this.state;
        let { appState } = this.props;

        var data = {
            enabled: !enabled
        };

        patch("users/" + profileID, appState.token, data, (userError, userResponse) => 
        {
            if(userError)
            {
                this.setState({
                    error: "-",
                    success: "",
                    render: true
                });
            }
            else
            {
                if(userResponse.status === 200 || userResponse.status === 304)
                {
                    this.user = userResponse.data;                    
                    let user = this.user.user;

                    this.setState({
                        error: "",
                        enabled: user.enabled,
                        success: "This users account status has been succesfully changed.",
                        render: true
                    });
                }
                else
                {
                    this.setState({
                        error: "Unable to load profile.  Please make sure your User ID is correct and you have proper permissions.",
                        success: "",
                        render: true
                    });
                }
            }
        });
    }

    HandleChange = event => 
    {
        this.setState({ 
            [event.target.name]: event.target.value 
        });
    };

    renderForm = () =>
    {
        let { enabled, name } = this.state;

        return(
            <div>
                <Typography>
                    This user is currently {enabled ? "enabled" : "disabled"}. <br />
                    Click below if you wish to change this status.<br />
                    <Button
                        color="primary"
                        variant="raised"
                        style={{ margin: 10 }}
                        onClick={this.saveUserInformation}
                    >
                        {enabled ? "Disable " + name : "Enable " + name}
                    </Button>
                </Typography>
            </div>
        );
    }

    render() 
    {
        let { classes } = this.props;
        let { error, render, success } = this.state;

        if(render)
        {
            return (
                <Grid container spacing={24} align="center" justify="center">
                    <Grid item xs={12} sm={10} md={8} lg={6} xl={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" className={classes.title}>
                                    Enable / Disable User
                                </Typography>
                                {error !== "" &&
                                    <StatusMessage color={classes.error}>
                                        {error}
                                    </StatusMessage>
                                }
                                {this.renderForm()}
                                {success !== "" &&
                                    <StatusMessage color={classes.success}>
                                        {success}
                                    </StatusMessage>
                                }
                            </CardContent>
                            <CardActions>
                                <div className={classes.alignLeftSpacer}>
                                    <Button 
                                        size="small" 
                                        variant="contained" 
                                        color="default" 
                                        component={Link} 
                                        to="/administration/users/management"
                                        style={{ margin: 5 }}
                                    >
                                    <LeftArrow className={classes.rightIcon} />
                                        Back To Management Index
                                    </Button>
                                </div>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            );
        }
        else
        {
            return( <CircularProgress /> );
        }
        
    }
}

export default withStyles(styles)(EnableDisablePerson);