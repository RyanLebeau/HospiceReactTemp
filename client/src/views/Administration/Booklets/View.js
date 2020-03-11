import React, { Component } from 'react';
import PropTypes from 'prop-types';

// ==================== Helpers ====================
import get from '../../../helpers/common/get';

// ==================== Components ====================
import StatusMessage from '../../../components/StatusMessage';

// ==================== MUI ====================
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

// ==================== SurveyJS ====================
import * as Survey from "survey-react";
import "survey-react/survey.css";

// ==================== Styles ====================
const styles = theme => ({
    title: theme.title,
    card: theme.card,
    error: theme.error
});

class ViewBooklet extends Component 
{
    surveyJSON;

	constructor(props)
    {
        super(props);

        this.state = {
            name: "",
            loadError: "",
			render: false
        };
    }

    componentDidMount = () =>
    {
        this.props.ToggleDrawerClose();
        setTimeout(() => 
        {
            this.props.CheckAuthenticationValidity((tokenValid) => 
            {
                if(tokenValid)
                {
                    Survey.StylesManager.applyTheme('darkblue');
                    this.loadSurvey();
                }
            });
        }, 200); 
    }

    loadSurvey = () =>
    {
        let { appState } = this.props;
        const bookletID = this.props.match.params.bookletID;

        if(bookletID != null)
        {
            get("surveys/" + bookletID, appState.token, (error, response) => 
            {
                if(error)
                {
                    this.setState({
                        loadError: "Unable to load the survey.  Please make sure your Booklet ID is correct and you have proper permissions.",
                        render: true
                    });
                }
                else
                {
                    if(response.status === 200 || response.status === 304)
                    {
                        var booklet = response.data.survey;
                        var name = booklet.name;

                        if(booklet.surveyJSON !== "")
                        {
                            this.surveyJSON = JSON.parse(booklet.surveyJSON);
                        }
                        else
                        {
                            this.surveyJSON = JSON.parse("{ }");
                        }

                        console.log(this.surveyJSON);

                        this.setState({
                            loadError: "",
                            name: name,
                            render: true
                        });
                    }
                    else
                    {
                        this.setState({
                            loadError: "Unable to load the survey.  Please make sure your Booklet ID is correct and you have proper permissions.",
                            render: true
                        });
                    }
                }
            });
        }
        else
        {
            this.setState({
                loadError: "Unable to load the survey.  Please make sure your Booklet ID is correct and you have proper permissions.",
                render: true
            });   
        }
    }

    render()
    {
        let { classes } = this.props;
        let { name, render, loadError } = this.state;

        return(
            <div>
                <Card className={classes.card}>
                    <CardContent>
                        { render ?
                            <div>
                                <Typography variant="h5" component="h2" className={classes.title}>
                                    Viewing: '{name}'
                                </Typography>
                                { loadError === "" &&
                                    <Typography className={classes.title}>
                                        This page is to view the selected booklet.  The booklet here will be in READ-ONLY mode.  If you need to test your survey/booklet, please navigate to the 'Edit' page from the management directory and use the 'Test Survey' tab.
                                    </Typography>
                                }
                                
                            </div>
                        :
                            <CircularProgress />
                        }
                    </CardContent>
                </Card>
                { render &&
                    <Card>
                        {loadError !== "" &&
                            <StatusMessage color={classes.error}>
                                    {loadError}
                            </StatusMessage>
                        }
                        <Survey.Survey json={this.surveyJSON} mode="display" />
                    </Card>
                }
            </div>
        );
    }
}

ViewBooklet.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ViewBooklet);