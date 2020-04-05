// ================================================
// Code associated with allowing the editing of
// profile information, such as address, phone number,
// etc. and updated into the database.
// ================================================
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// ==================== Helpers ====================
import get from '../../../helpers/common/get';
import patch from '../../../helpers/common/patch';

// ==================== Components ====================
import TextInput from '../../../components/TextInput';
import StatusMessage from '../../../components/StatusMessage';

// ==================== MUI ====================
import { Button, Card, Grid, CardContent, CardActions, Typography, CircularProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import FaceIcon from '@material-ui/icons/Face';
import LeftArrow from '@material-ui/icons/ArrowLeft';


const styles = theme => ({
    title: theme.title,
    error: theme.error,
    success: theme.success,
    alignLeftSpacer: theme.alignLeftSpacer,
    spinner: theme.spinner,
    rightIcon: theme.rightIcon
});

class EditPerson extends Component 
{
    constructor(props) 
    {
        super(props);
    
        this.state = {
            profileID: "",
            error: "",
            success: "",
            name: "",
            email: "",
            role: "",
            phone: "",
            saving: false,
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
                        email: user.email,
                        name: user.info.name,
                        phone: user.info.phone,
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
        let { email, name, phone, profileID } = this.state;
        let { appState } = this.props;

        if(email === "" || name === "" || phone === "")
        {
            this.setState({
                error: "Please ensure all fields are filled out",
                success: ""
            });

            return;
        }
        else
        {
            this.setState({
                error: "",
                success: ""
            });
        }

        var data = {
            email: email,
            info: {
                name: name,
                phone: phone
            }
        };

        patch("users/" + profileID, appState.token, data, (userError, userResponse) => 
        {
            if(userError)
            {
                this.setState({
                    error: "Unable to save profile.",
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
                        success: "User profile information saved.",
                        email: user.email,
                        name: user.info.name,
                        phone: user.info.phone,
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
        let { email, name, phone } = this.state;

        return(
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <TextInput id="email" fullWidth label="Email" onChange={this.HandleChange} value={email}/>
                </Grid>
                <Grid item xs={12}>
                    <TextInput id="name" fullWidth label="Name" onChange={this.HandleChange} value={name}/>
                </Grid>
                <Grid item xs={12}>
                    <TextInput id="phone" fullWidth label="Phone" onChange={this.HandleChange} value={phone}/>
                </Grid>
            </Grid>
        );
    }

    render() 
    {
        let { classes } = this.props;
        let { error, render, saving, success } = this.state;

        if(render)
        {
            return (
                <Grid container spacing={24} align="center" justify="center">
                    <Grid item xs={12} sm={10} md={8} lg={6} xl={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" className={classes.title}>
                                    Edit User Profile
                                </Typography>
                                {error !== "" &&
                                    <StatusMessage color={classes.error}>
                                        {error}
                                    </StatusMessage>
                                }
                                {success !== "" &&
                                    <StatusMessage color={classes.success}>
                                        {success}
                                    </StatusMessage>
                                }
                                {this.renderForm()}
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
                                    { saving ? 
                                        <CircularProgress className={classes.spinner}/> 
                                    :
                                        <Button 
                                            size="small" 
                                            variant="contained" 
                                            color="secondary"
                                            onClick={this.saveUserInformation}
                                        >
                                            Save User Profile
                                            <FaceIcon className={classes.rightIcon}>send</FaceIcon>
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
            return( <CircularProgress /> );
        }
        
    }
}

export default withStyles(styles)(EditPerson);