import React, { Component } from 'react';

// ==================== MUI ====================
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    title: theme.title
});

class Main extends Component 
{	
	render()
	{
        let { appState, classes } = this.props;

		return (            
            <Card>
                <CardContent>
                    <Typography variant="h5" component="h2" className={classes.title}>
                        Welcome back, {appState.name}
                    </Typography>
                </CardContent>
            </Card>
        );
	}
}

export default withStyles(styles)(Main);