import React, { Component } from 'react';
import PropTypes from 'prop-types';

// ==================== Helpers ====================
import get from '../../helpers/common/get';
import patch from '../../helpers/common/patch';

// ==================== Components ====================
import StatusMessage from '../../components/StatusMessage';

// ==================== MUI ====================
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';

// ==================== SurveyJS ====================
import * as Survey from "survey-react";
import "survey-react/survey.css";

// ==================== Styles ====================
const styles = theme => ({
    title: theme.title,
    card: theme.card,
    success: theme.success,
    error: theme.error,
    alignLeftSpacer: theme.alignLeftSpacer,
    alignLeftSpacerRoot: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    buttonMargin: {
        marginLeft: 5
    }
});

class Booklet extends Component 
{
	constructor(props)
    {
        super(props);

        this.state = {
            loadError: "",
            saveError: "",
            saveSuccess: "",
            surveyApproved: false,
			render: false
        };
    }

    componentDidMount = () =>
    {
        this.surveyJSON = {};
        this.responseJSON = {};

        setTimeout(() => {
            this.props.CheckAuthenticationValidity((tokenValid) => 
            {
                if(tokenValid)
                {
                    this.loadSurvey();
                }
            });
        }, 200);
        
        Survey.StylesManager.applyTheme('darkblue');
    }

    loadSurvey = () =>
    {
        let { appState } = this.props;

        const memberSurveyID = this.props.match.params.memberSurveyID;

        if(memberSurveyID != null)
        {
            get("membersurveys/" + memberSurveyID, appState.token, (error, response) => 
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
                        var booklet = response.data.memberSurvey;                        

                        this.surveyJSON = JSON.parse(booklet.surveyJSON);
                        this.responseJSON = JSON.parse(booklet.responseJSON);

                        window.survey = new Survey.Model(this.surveyJSON);
                        window.survey.data = this.responseJSON;
                        window.survey.sendResultOnPageNext = true;
                        window.survey.onComplete.add((result) => {
                            this.saveSurvey(result);
                        });
                        window.survey.onPartialSend.add((result) => {
                            this.saveSurvey(result);
                        });

                        this.setState({
                            loadError: "",
                            surveyApproved: booklet.approved,
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

                this.removeMessages();
            });
        }
        else
        {
            this.setState({
                loadError: "Unable to load the survey.  Please make sure your Booklet ID is correct and you have proper permissions.",
                render: true
            });

            this.removeMessages();
        }
    }

    saveSurvey = (survey) =>
    {
        let { appState } = this.props;

        const memberSurveyID = this.props.match.params.memberSurveyID;

        var data = {
            responseJSON: JSON.stringify(survey.data)
        };

        console.log(survey.data);

        patch("membersurveys/" + memberSurveyID, appState.token, data, (error, response) => 
        {
            if(error)
            {
                this.setState({
                    saveError: "Cannot save survey.  Please try agian later.",
                    saveSuccess: "",
                    render: true
                });
            }
            else
            {
                if(response.status === 200 || response.status === 304)
                {
                    this.setState({
                        saveError: "",
                        saveSuccess: "Survey has been saved.",
                        render: true
                    });
                }
                else
                {
                    this.setState({
                        saveError: "Cannot save survey.  Please try agian later.",
                        saveSuccess: "",
                        render: true
                    });
                }
            }

            this.removeMessages();
        });
    }

    approveSurvey = () =>
    {
        let { surveyApproved } = this.state;
        let { appState } = this.props;
        
        const memberSurveyID = this.props.match.params.memberSurveyID;

        if(surveyApproved)
        {
            return;
        }

        var data = {
            approved: true
        };

        patch("membersurveys/" + memberSurveyID, appState.token, data, (error, response) => 
        {
            if(error)
            {
                this.setState({
                    saveError: "Cannot approve survey.  Please try agian later.",
                    saveSuccess: "",
                    render: true
                });
            }
            else
            {
                if(response.status === 200 || response.status === 304)
                {
                    this.setState({
                        saveError: "",
                        saveSuccess: "This survey has been approved.",
                        surveyApproved: true,
                        render: true
                    });
                }
                else
                {
                    this.setState({
                        saveError: "Cannot approve survey.  Please try agian later.",
                        saveSuccess: "",
                        render: true
                    });
                }
            }

            this.removeMessages();
        });
    }

    exportToPDF = () =>
    {
        const memberSurveyID = this.props.match.params.memberSurveyID;

        window.exportWindow = window.open("/pdf/" + memberSurveyID, "_blank", "toolbar=no,scrollbars=yes,resizable=no,top=20,width=850,height=900");
    }    

    removeMessages = () =>
    {
        setTimeout(() => {
            this.setState({
                saveError: "",
                saveSuccess: ""
            });
        }, 7500);
    }

    render()
    {
        let { appState, classes } = this.props;
        let { loadError, saveError, saveSuccess, render, surveyApproved } = this.state;
        
        var canApprove = true;
        var tooltip = "This survey has already been approved.";

        if(appState.role === "Worker")
        {
            canApprove = false;
        }

        if(!surveyApproved)
        {
            tooltip = "This survey is pending approval.";
        }

        if(window.survey != null)
        {
            return(
                <div>
                    { render ?
                        <div>
                            <Card className={classes.card}>
                                <CardContent className={classes.alignLeftSpacerRoot}>                                    
                                    {saveError !== "" &&
                                        <StatusMessage color={classes.error}>
                                            {saveError}
                                        </StatusMessage>
                                    }
                                    {saveSuccess !== "" &&
                                        <StatusMessage color={classes.saveSuccess}>
                                            {saveSuccess}
                                        </StatusMessage>
                                    }
                                    <div className={classes.alignLeftSpacer}>
                                        {canApprove &&
                                            <Tooltip title={tooltip} placement="left">
                                                <Button 
                                                    className={classes.buttonMargin}
                                                    size="small" 
                                                    variant="contained" 
                                                    color="secondary"
                                                    onClick={this.approveSurvey}
                                                >
                                                    Approve this Booklet
                                                </Button>
                                            </Tooltip>
                                        }
                                        <Button 
                                            className={classes.buttonMargin}
                                            size="small" 
                                            variant="contained" 
                                            color="primary"
                                            onClick={this.exportToPDF}
                                        >
                                            Export to PDF
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <Survey.Survey 
                                    model={window.survey}
                                />
                            </Card>
                        </div>
                    :
                        <CircularProgress />
                    }
                </div>
            );
        }
        else
        {
            return(
                <div>
                    { render &&
                        <Card>
                            {loadError !== "" &&
                                <StatusMessage color={classes.error}>
                                    {loadError}
                                </StatusMessage>
                            }
                        </Card>
                    }
                </div>
            );
        }
    }
}

Booklet.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Booklet);