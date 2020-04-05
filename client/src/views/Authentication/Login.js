// ================================================
// Code associated with login page for app. Contains
// normal login scenario and WECCC login scenario.
// ================================================
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// ==================== Helpers ====================
import login from '../../helpers/authorization/login';
import WECClogin from '../../helpers/authorization/WECClogin';
import WECCPost from '../../helpers/authorization/WECCPost';

// ==================== Components ====================
import StatusMessage from '../../components/StatusMessage';

// ==================== MUI ====================
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import LockIcon from '@material-ui/icons/LockOutlined';

// ==================== Colors ====================
import green from '@material-ui/core/colors/green';

const styles = theme => ({
    main: {
        width: 'auto',
        display: 'block', // Fix IE 11 issue.
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    },
    avatar: {
        margin: theme.spacing.unit,
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
    },
    spinner: {
        color: green[500],
        position: 'absolute',
        left: '50%',
        marginTop: 0,
        marginLeft: -12,
    }
});

class Login extends Component 
{
    constructor(props)
    {
        super(props);

        this.state = {
            email: "",
            password: "",
            loginValidText: "",
            redirectTo: "",
            authenticating: false,
            redirect: false,
        };
    }

    // Change state of user's email address
    handleEmailChange = (event) =>
    {
        this.setState({
            email: event.target.value,
        });
    }

    // Change state of user's password
    handlePasswordChange = (event) =>
    {
        this.setState({
            password: event.target.value
        });
    }

    // Normal login scenario
    handleLogin = () =>
    {
        let { email, password } = this.state;

        if(email === "")
        {
            this.setState({
                loginValidText: "Please enter an email."
            });

            return;
        }
        else
        {
            this.setState({
                loginValidText: ""
            });
        }

        if(password === "")
        {
            this.setState({
                loginValidText: "Please enter your password."
            });

            return;
        }
        else
        {
            this.setState({
                loginValidText: ""
            });
        }
        
        var data = {
            email: email,
            password: password
        };

        this.setState({
            authenticating: true
        });
        
        login(data, (error, response) => 
        {
            if(error)
            {
                if(error.status === 401)
                {
                    this.setState({
                        loginValidText: "Your email or password is incorrect.",
                        authenticating: false
                    });
                }
                else if(error.status === 400)
                {
                    this.setState({
                        loginValidText: "Your email or password is incorrect.",
                        authenticating: false
                    });
                }
                else if(error.status === 500)
                {
                    this.setState({
                        loginValidText: "There was a problem contacting the server.  Please try again later.",
                        authenticating: false
                    });
                }
                else
                {
                    this.setState({
                        loginValidText: "There was a problem contacting the server.  Please try again later.",
                        authenticating: false
                    });
                }
            }
            else
            {
                if(response.status === 200 || response.status === 304)
                {
                    this.props.Login(response.data.token, response.data.user);
                }
                else
                {
                    this.setState({
                        loginValidText: "Either your email or password is incorrect, or your Account is Disabled.",
                        authenticating: false
                    });
                }
            }
        });
    }

    // WECCC login scenario
    handleWECCLogin = () =>
    {
        let { email, password } = this.state;

        if(email === "")
        {
            this.setState({
                loginValidText: "Please enter an email/username for WECC."
            });

            return;
        }
        else
        {
            this.setState({
                loginValidText: ""
            });
        }

        if(password === "")
        {
            this.setState({
                loginValidText: "Please enter your password."
            });

            return;
        }
        else
        {
            this.setState({
                loginValidText: ""
            });
        }

        var data = {
            email: email,
            password: password
        };

        this.setState({
            authenticating: true
        });

        WECClogin(data, (error, response) => 
        {
            if(error)
            {
                this.setState({
                    loginValidText: "There was a problem contacting the WECC server.  Please try again later.",
                    authenticating: false
                });
            }
            else
            {
                if(response.status === 200 || response.status === 304)
                {
                    if(response.data.success)
                    {
                        var data = {
                            token: response.data.token,
                            email: email
                        };

                        WECCPost('users/wecc', data, (error, response) => 
                        {
                            console.log(error)

                            if(error)
                            {
                                if(error.response.status === 401)
                                {
                                    this.setState({
                                        loginValidText: "Your WECC email does not have an account associated with the Palliative IMS.",
                                        authenticating: false
                                    });
                                }
                                else
                                {
                                    this.setState({
                                        loginValidText: "There was a problem verifying your WECC email.",
                                        authenticating: false
                                    });
                                }
                            }
                            else
                            {
                                if(response.status === 200 || response.status === 304)
                                {
                                    console.log(response.data);
                                    this.props.Login(response.data.token, response.data.user);
                                }
                                else
                                {
                                    this.setState({
                                        loginValidText: "Your WECC email does not have an account associated with the Palliative IMS.",
                                        authenticating: false
                                    });
                                }
                            }
                        });
                    }
                    else
                    {
                        this.setState({
                            loginValidText: "Either your WECC email or password is incorrect.",
                            authenticating: false
                        });
                    }
                }
                else
                {
                    this.setState({
                        loginValidText: "Either your WECC email or password is incorrect.",
                        authenticating: false
                    });
                }
            }
        });
    }

    render() 
    {
        let { classes } = this.props;
        let { email, loginValidText, password, authenticating } = this.state;

        return(
            <div className={classes.main}>
                <CssBaseline />
                <Paper className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Palliative IMS
                    </Typography>
                    <div className={classes.form}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="email">Email Address</InputLabel>
                            <Input 
                                id="email" 
                                name="email" 
                                autoComplete="email" 
                                value={email} 
                                onChange={this.handleEmailChange} 
                                autoFocus
                            />
                        </FormControl>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <Input 
                                name="password" 
                                type="password" 
                                id="password"
                                value={password} 
                                onChange={this.handlePasswordChange} 
                                autoComplete="current-password"
                            />
                        </FormControl>
                        {loginValidText !== "" &&
                            <StatusMessage color={''}>
                                {loginValidText}
                            </StatusMessage>
                        }
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            disabled={authenticating}
                            onClick={this.handleLogin}
                        >
                            Sign in
                            {authenticating && <CircularProgress size={24} className={classes.spinner} />}
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="secondary"
                            className={classes.submit}
                            disabled={authenticating}
                            onClick={this.handleWECCLogin}
                        >
                            Sign in with WECC Credentials
                            {authenticating && <CircularProgress size={24} className={classes.spinner} />}
                        </Button>
                    </div>
                </Paper>
            </div>
        );
    }
}

Login.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Login);