import React, { Component } from 'react';
import PropTypes from 'prop-types';

// ==================== Helpers ====================
import get from '../../../helpers/common/get';
import patch from '../../../helpers/common/patch';

// ==================== Components ====================
import StatusMessage from '../../../components/StatusMessage';
import TextInput from '../../../components/TextInput';

// ==================== MUI ====================
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import Save from '@material-ui/icons/Save';

// ==================== SurveyJS ====================
import * as SurveyJSEditor from "surveyjs-editor";
import * as SurveyKo from "survey-knockout";
import "surveyjs-editor/surveyeditor.css";
import "jquery-ui/themes/base/all.css";
import "nouislider/distribute/nouislider.css";
import "select2/dist/css/select2.css";
import "bootstrap-slider/dist/css/bootstrap-slider.css";
import "jquery-bar-rating/dist/themes/css-stars.css";
import "jquery-bar-rating/dist/themes/fontawesome-stars.css";
import $ from "jquery";
import "jquery-ui/ui/widgets/datepicker.js";
import "select2/dist/js/select2.js";
import "jquery-bar-rating";
import "icheck/skins/square/blue.css";
import * as widgets from "surveyjs-widgets";

widgets.icheck(SurveyKo, $);
widgets.select2(SurveyKo, $);
widgets.inputmask(SurveyKo);
widgets.jquerybarrating(SurveyKo, $);
widgets.jqueryuidatepicker(SurveyKo, $);
widgets.nouislider(SurveyKo);
widgets.select2tagbox(SurveyKo, $);
widgets.signaturepad(SurveyKo);
widgets.sortablejs(SurveyKo);
widgets.ckeditor(SurveyKo);
widgets.autocomplete(SurveyKo, $);
widgets.bootstrapslider(SurveyKo);

// ==================== Styles ====================
const styles = theme => ({
    title: theme.title,
    card: theme.card,
    button: theme.button,
    div: theme.alignLeftSpacer,
    error: theme.error,
    save: theme.save
});

class EditBooklet extends Component 
{	
    editor;

    constructor(props)
    {
        super(props);

        this.state = {
            loadError: "",
            saveError: "",
            saveMessage: "",
            name: "",
            redner: false
        };
    }

    componentDidMount = () =>
    {
        this.props.ToggleDrawerClose();
        setTimeout(() => {
            this.props.CheckAuthenticationValidity((tokenValid) => 
            {
                if(tokenValid)
                {
                    this.loadSurvey();
                }
            });
        }, 200); 
    }

    loadSurvey = () =>
    {
        let { appState } = this.props
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

                        let editorOptions = {
                            showEmbededSurveyTab: false,
                            showTestSurveyTab: true,
                            showOptions: true
                        }
                        
                        SurveyJSEditor.StylesManager.applyTheme("darkblue");
                        this.editor = new SurveyJSEditor.SurveyEditor("surveyEditorContainer", editorOptions);

                        if(booklet.surveyJSON !== "")
                        {
                            var surveyJSON = JSON.parse(booklet.surveyJSON);
                            this.editor.text = surveyJSON;
                        }

                        var name = booklet.name;

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

    handleNameChange = (event) =>
    {
        this.setState({
            name: event.target.value,
        });
    }

    saveSurvey = () =>
    {
        let { name } = this.state;
        let { appState } = this.props;

        const bookletID = this.props.match.params.bookletID;

        var query = {
            name: name,
            surveyJSON: JSON.stringify(this.editor.text)
        }

        patch("surveys/" + bookletID, appState.token, query, (error, response) => 
        {
            if(error)
            {
                this.setState({
                    saveError: "There was an error saving the survey.  Please try again later."
                })
            }
            else
            {
                if(response.status === 200)
                {
                    this.setState({
                        saveMessage: "The survey has been updated succesfully.  You can stay on this page and continue editing, or navigate to another area of the application.",
                        saveError: ""
                    });
                }
                else
                {
                    this.setState({
                        saveError: "There was an error saving the survey. Please make sure you have proper authorization and try again later.",
                        saveMessage: ""
                    })
                }
            }
        });
    }

	render()
	{
        let { classes } = this.props;
        let { loadError, name, render, saveError, saveMessage } = this.state;
        
        return (
            <div>
                <Card className={classes.card}>
                    <CardContent>
                        <Typography variant="h5" component="h2" className={classes.title}>
                            Edit Booklet
                        </Typography>
                        { !render &&
                            <CircularProgress />
                        }
                        { loadError === "" && render && 
                            <Typography>
                                    Use this page to modify your booklet / survey.  Any information that a patient has answered in a previous suvery along with the questions they answered will still exist.  Only NEW booklets / surveys will be affected.
                            </Typography>
                        }
                        { loadError === "" && render && 
                            <div>
                                <Typography variant="h6" component="h2" className={classes.button}>
                                    Booklet Properties
                                </Typography>
                                <TextInput autoFocus id="name" label="Name" margin="normal" onChange={this.handleNameChange} value={name} />
                            </div>
                        }
                        {loadError !=="" &&
                            <StatusMessage color={classes.error}>
                                {loadError}
                            </StatusMessage>
                        }
                        {saveError !=="" &&
                            <StatusMessage color={classes.error}>
                                {saveError}
                            </StatusMessage>
                        }
                        {saveMessage !== "" &&
                            <StatusMessage color={classes.save}>
                                {saveMessage}
                            </StatusMessage>
                        }
                        { loadError === "" && render &&
                        <Button 
                            size="small" 
                            variant="contained" 
                            color="primary"
                            className={classes.button} 
                            onClick={this.saveSurvey}
                        >
                            Save Progress
                            <Save className={classes.rightIcon}>send</Save>
                        </Button>
                        }
                    </CardContent>
                    <div id="surveyEditorContainer" className={classes.card} />
                </Card>
            </div>
        );      
	}
}

EditBooklet.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditBooklet);