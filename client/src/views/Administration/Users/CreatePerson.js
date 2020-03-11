import React, { Component } from 'react';
import { Redirect } from 'react-router';

// ==================== Helpers ====================
import post from '../../../helpers/common/post'

// ==================== Components ====================
import TextInput from '../../../components/TextInput';

// ==================== MUI ====================
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import FaceIcon from '@material-ui/icons/Face';
import StatusMessage from '../../../components/StatusMessage';

const styles = theme => ({
    title: theme.title,
    form: theme.flexWrap,
    selection: theme.marginTop,
    error: theme.error,
    alignLeftSpacer: theme.alignLeftSpacer,
    spinner: theme.spinner,
    rightIcon: theme.rightIcon
});

class UsersInvite extends Component 
{	
    constructor(props)
    {
        super(props);

        this.state = {
            role: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            error: "",
            creating: false,
            redirect: false
        };
    }

    componentDidMount = () =>
    {
        this.props.ToggleDrawerClose();
        this.props.CheckAuthenticationValidity((tokenValid) => 
        {
            if(!tokenValid)
			{
				console.log("Redirecting ....");
			}
        });
    }

    HandleChange = event => 
    {
        this.setState({ 
            [event.target.name]: event.target.value 
        });
    };
    
    CreatePerson = () =>
    {
        let { appState } = this.props;
        let { role, password, firstName, lastName, phone, email, address, city, state, zip, country } = this.state;

        if(role === "" || firstName === "" || lastName === "" || phone === "" || email === "" || address === "" || city === "" || state === "" || zip === "" || country === "")
        {
            this.setState({
                error: "In order to create a person, please fill out ALL fields."
            });

            return;
        }

        var data = {
            email: email,
            role: role,
            password: password,
            enabled: true,
            facilityId: appState.facilityId,
            info: {
                name: firstName + ' ' + lastName,
                phone: phone,
                address: {
                    street: address,
                    city: city,
                    state: state,
                    code: zip,
                    country: country
                }
            }
        }

        post("users/register", appState.token, data, (error, response) => 
        {
            if(error)
            {
                this.setState({ 
                    error: "There was an error creating the patient.  Please try again later.",
                    inviting: false
                });
            }
            else
            {
                if(response.status === 201)
                {
                    this.setState({
                        inviting: false,
                        redirect: true
                    })
                }
                else
                {
                    this.setState({ 
                        error: "There was an error creating the patient.  Please try again later.",
                        inviting: false
                    });
                }
            }
        });
    }

    renderForm = () =>
    {
        let { role, password, confirmPassword, firstName, lastName, phone, email, address, city, state, zip, country } = this.state;
        
        return(
            <div>
                <Grid container spacing={24}>
                    <Grid item xs={12}>
                        <TextInput autoFocus id="email" fullWidth label="Email" onChange={this.HandleChange} value={email} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput id="password" fullWidth type="password" label="Password" onChange={this.HandleChange} value={password} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput id="confirmPassword" fullWidth type="password" label="Confirm Password" onChange={this.HandleChange} value={confirmPassword} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput id="firstName" fullWidth label="First Name" onChange={this.HandleChange} value={firstName} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput id="lastName" fullWidth label="Last Name" onChange={this.HandleChange} value={lastName} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput id="phone" fullWidth label="Phone" onChange={this.HandleChange} value={phone} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextInput id="address" fullWidth label="Address" onChange={this.HandleChange} value={address} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput id="city" fullWidth label="City" onChange={this.HandleChange} value={city} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput id="state" fullWidth label="State" onChange={this.HandleChange} value={state} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput id="zip" fullWidth label="Zip / Postal Code" onChange={this.HandleChange} value={zip} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput id="country" fullWidth label="Country" onChange={this.HandleChange} value={country} />
                    </Grid>
                </Grid>
                <FormControl component="fieldset" style={{ marginTop: 30 }}>
                    <FormLabel component="legend">Select a Role for this new Person</FormLabel>
                    <RadioGroup
                        name="role"
                        value={role}
                        onChange={this.HandleChange}
                    >
                        <FormControlLabel value="Admin" control={<Radio />} label="Administrator" />
                        <FormControlLabel value="Coordinator" control={<Radio />} label="Coordinator" />
                        <FormControlLabel value="Worker" control={<Radio />} label="Staff Member" />
                        <FormControlLabel value="Patient" control={<Radio />} label="Patient" />
                    </RadioGroup>
                </FormControl>
            </div>
        );
    }

	render()
	{
        let { classes } = this.props;
        let { creating, error, redirect } = this.state;

        if(redirect)
        {
            return(
                <Redirect to="/administration/users/management" />
            )
        }
        
		return (
            <Grid alignItems="center" container direction="column" justify="center">
                <Card style={{ maxWidth: '700px' }}>
                    <CardContent>
                        <Typography variant="h5" className={classes.title}>
                            Register a new Person
                        </Typography>
                        <form className={classes.form}>
                            {this.renderForm()}
                            <StatusMessage color={classes.error}>
                                {error}
                            </StatusMessage>
                        </form>
                    </CardContent>
                    <CardActions>
                        <div className={classes.alignLeftSpacer}>
                            { creating ? 
                                <CircularProgress className={classes.spinner}/> 
                            :
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    color="primary"
                                    onClick={this.CreatePerson}
                                >
                                    Register New Person
                                    <FaceIcon className={classes.rightIcon}>send</FaceIcon>
                                </Button>
                            }
                        </div>
                    </CardActions>
                </Card>
            </Grid>   
        );
	}
}

export default withStyles(styles)(UsersInvite);