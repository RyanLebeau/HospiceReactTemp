import React, { Component } from 'react';

// ==================== MUI ====================
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    title: theme.title
});

class Dashboard404 extends Component 
{	
	render()
	{
        let { classes } = this.props;

		return (            
            <Card>
                <CardContent>
                    <Typography variant="h5" component="h2" className={classes.title}>
                        Error - 404.
                    </Typography>
                    <Typography>
                        The page you are looking for does not exist.
                    </Typography>
                </CardContent>
            </Card>
        );
	}
}

export default withStyles(styles)(Dashboard404);