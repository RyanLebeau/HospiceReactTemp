// ================================================
// Exports a PDF through a browser popup of a
// completed/saved patient survey that exists.
// ================================================
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// ==================== Helpers ====================
import get from '../../helpers/common/get';

// ==================== Components ====================
import StatusMessage from '../../components/StatusMessage';

// ==================== MUI ====================
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';

// ==================== SurveyJS ====================
import * as Survey from "survey-react";
import * as html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import "survey-react/survey.css";

// ==================== Styles ====================
const styles = theme => ({
    title: theme.title,
    card: theme.card,
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
            booklet: null,
			render: false
        };
    }

    componentDidMount = () =>
    {
        this.surveyJSON = {};
        this.responseJSON = {};
        this.booklet = {}

        this.props.toggleExportRender();

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

    // Loads saved patient survey that exists in the database
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
                        window.survey.isSinglePage = true;
                        window.survey.mode = "display";
                        window.survey.onComplete.add((result) => {
                            this.saveSurvey(result);
                        });

                        this.setState({
                            loadError: "",
                            booklet: booklet,
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

    saveSurvey = (survey) =>
    {
        console.log("Survey Cannot be saved.");
    }

    // Exports survey into a PDF file
    exportToPDF = () =>
    {
        var surveyHolder = document.getElementById("pdf");

        let { booklet } = this.state;

        console.log(this.state.booklet);
        console.log(booklet);
        html2canvas(surveyHolder).then(function (canvas) 
        {
            console.log("here");
            var doc = new jsPDF('p', 'pt', 'letter');
            var imgData = canvas.toDataURL('image/png');    
            doc.addImage(imgData, 'JPEG', 5, 10);
            doc.save(booklet.patientId + '.' + booklet._id + '.pdf');
            console.log("here");
        });
    }

    render = () =>
    {
        let { classes } = this.props;
        let { loadError, render } = this.state;

        if(window.survey != null)
        {
            return(
                <div style={{ width: '800px' }}>
                    { render ?
                        <div>
                            <Card className={classes.card}>
                                <CardContent className={classes.alignLeftSpacerRoot}>
                                    <div className={classes.alignLeftSpacer}>
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
                            <div style={{ width: '800px' }} id="pdf">
                                    <Survey.Survey 
                                        model={window.survey}
                                    />
                                </div>
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
                    { render ?
                        <Card>
                            {loadError !== "" &&
                                <StatusMessage color={classes.error}>
                                    {loadError}
                                </StatusMessage>
                            }
                        </Card>
                        :
                        <CircularProgress />
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