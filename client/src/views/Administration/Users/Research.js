import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// ==================== Helpers ====================
import get from '../../../helpers/common/get';
import patch from '../../../helpers/common/patch';

// ==================== Components ====================
import StatusMessage from '../../../components/StatusMessage';

// ==================== MUI ====================
import { Button, Card, CardContent, CardActions, Typography, CircularProgress } from '@material-ui/core';
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

class Research extends Component 
{
    constructor(props) 
    {
        super(props);
    
        this.state = {
            profileID: "",
            name: "",
            research: {},
            error: "",
            success: "",
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
                        name: user.info.name,
                        research: user.research,
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

    createResearchId = () =>
    {
        let { profileID } = this.state;
        let { appState } = this.props;

        get("users/research/create/" + profileID, appState.token, (userError, userResponse) => 
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
                        research: user.research,
                        success: "A Research ID has been created for this person.",
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

    enableDisableResearchId = () =>
    {
        let { profileID, research } = this.state;
        let { appState } = this.props;

        var data = {
            research: research
        };

        data.research.enabled = !data.research.enabled;

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
                        research: user.research,
                        success: "Research ID status updated.",
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
        let { research } = this.state;

        if(research.full === "" || research.full === undefined || research.full === null)
        {
            return(
                <div>
                    <Typography>
                        This user currently does not have a research ID.
                    </Typography>
                    <Button
                        color="primary"
                        variant="raised"
                        style={{ margin: 10 }}
                        onClick={this.saveUserInformation}
                    >
                        Create Research ID
                    </Button>
                </div>
            );
        }
        else
        {
            if(!research.enabled)
            {
                return(
                    <div>
                        <Typography>
                            Unique Research ID: {research.full}<br />
                            This users research ID is currently disabled.<br />
                            Click below to enable it.
                        </Typography>
                        <Button
                            color="primary"
                            variant="raised"
                            style={{ margin: 10 }}
                            onClick={this.enableDisableResearchId}
                        >
                            Enable Research ID
                        </Button>
                    </div>
                );
            }
            else
            {
                return(
                    <div>
                        <Typography>
                            Unique Research ID: {research.full}<br />
                            This users research ID is currently enabled.<br />
                            Click below to disable it.
                        </Typography>
                        <Button
                            color="primary"
                            variant="raised"
                            style={{ margin: 10 }}
                            onClick={this.enableDisableResearchId}
                        >
                            Disable Research ID
                        </Button>
                    </div>
                );
            }
        }
    }

    render() 
    {
        let { classes } = this.props;
        let { error, render, success } = this.state;

        if(render)
        {
            return (
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
            );
        }
        else
        {
            return( <CircularProgress /> );
        }
        
    }
}

export default withStyles(styles)(Research);