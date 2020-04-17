import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// ==================== Helpers ====================
import get from '../../helpers/common/get'

// ==================== Components ====================
import StatusMessage from '../../components/StatusMessage';

// ==================== MUI ====================
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

// ==================== Styles ====================
const styles = theme =>({
    title: theme.title,
    buttonView: theme.colorGreen,
    buttonEdit: theme.colorBlue,
    buttonDelete: theme.colorRed,
});

class Search extends Component 
{
    constructor(props)
    {
        super(props);

        // Contains states used to filter search
        this.state = {
            search: "",
            booklet: "",
            approval: "",
            date: "",
            error: "",
            render: false
        };
    }

    componentDidMount = () =>
    {
        this.membersurveys = {};
        this.membersurveys.library = {};
        this.membersurveys.length = 0;

        this.booklets = {};
        this.booklets.library = {};
        this.booklets.length = 0;

        this.props.ToggleDrawerClose();
        this.props.CheckAuthenticationValidity((tokenValid) => 
        {
            if(tokenValid)
			{
                this.getMemberSurveys();
			}
        });
    }

    // Get all merged documents from the "membersurvey" and "user" collections in database
    // Get all documents from "survey" collection in database
    getMemberSurveys = () =>
    {
        let { appState } = this.props;

        get("membersurveys/user/surveys/", appState.token, (error, response) => 
        {
            if(error)
            {
                this.setState({
                    error: error.message,
                    render: true
                });
            }
            else
            {
                if(response.status === 200)
                {
                    this.membersurveys.length = response.data.response.count;
                    this.populateMemberSurveyData(response.data.response);
                }
                else
                {
                    this.setState({
                        error: "Unable to retrieve member surveys. Please refresh and try again.",
                        render: true
                    });
                }
            }
        });

        get("surveys/", appState.token, (error, response) => 
        {
            if(error)
            {
                this.setState({
                    error: error.message,
                    render: true
                });
            }
            else
            {
                if(response.status === 200)
                {
                    this.booklets.length = response.data.response.count;
                    this.populateSurveyData(response.data.response);
                }
                else
                {
                    this.setState({
                        error: "Unable to retrieve surveys. Please refresh and try again.",
                        render: true
                    });
                }
            }
        });
    }

    // Populates merged "membersurvey" and "user" data from the database into membersurveys.library 
    populateMemberSurveyData = (data) => 
    {
        for (let index = 0; index < data.count; index++) 
        {
            this.membersurveys.library[index] = {
                _id: data.memberSurveys[index]._id,
                approved: data.memberSurveys[index].approved,
                patientId: data.memberSurveys[index].patientId,
                patientName: data.memberSurveys[index].patientName,
                name: data.memberSurveys[index].name,
                createdBy: data.memberSurveys[index].createdBy,
                modifiedBy: data.memberSurveys[index].modifiedBy,
                createdAt: data.memberSurveys[index].createdAt,
                updatedAt: data.memberSurveys[index].updatedAt
            };
        }

        this.setState({
            error: "",
            render: true
        });
    }

    // Populates data from "survey" collection into booklets.library
    populateSurveyData = (data) => 
    {
        for (let index = 0; index < data.count; index++) 
        {
            this.booklets.library[index] = {
                _id: data.surveys[index]._id,
                name: data.surveys[index].name
            };
        }

        this.setState({
            error: "",
            render: true
        });
    }

    //Updates search states 
    updateSearch(event) {
        this.setState({[event.target.name]: event.target.value})
    }

    createMemberSurveysRow = (_id, approved, patientId, patientName, name, createdBy, modifiedBy, createdAt, updatedAt) =>
    {
        return { _id, approved, patientId, patientName, name, createdBy, modifiedBy, createdAt, updatedAt }
    }

    createSurveysRow = (_id, name) =>
    {
        return { _id, name }
    }

    //Renders the table containing all the data onto the site
    renderMemberSurveysList = () =>
    {
        var mRows = [];
        const mLength = this.membersurveys.length;

        for (let index = 0; index < mLength; index++) 
        {
            mRows.push(this.createMemberSurveysRow(  this.membersurveys.library[index]._id,
                                                    this.membersurveys.library[index].approved,
                                                    this.membersurveys.library[index].patientId,
                                                    this.membersurveys.library[index].patientName,
                                                    this.membersurveys.library[index].name,
                                                    this.membersurveys.library[index].createdBy,
                                                    this.membersurveys.library[index].modifiedBy,
                                                    this.membersurveys.library[index].createdAt,
                                                    this.membersurveys.library[index].updatedAt));
        }

        var bRows = [];
        const bLength = this.booklets.length;

        for (let index = 0; index < bLength; index++) 
        {
            bRows.push(this.createSurveysRow(this.booklets.library[index]._id,
                                            this.booklets.library[index].name));
        }

        // filteredSurvey contains the filtered data depending on the user's search by checking
        // if each row passes the user's search criteria in the form of condition statements
        let filteredSurveys = mRows.filter(
            (row) => {
                var createdAt = new Date(row.createdAt);
                var inputDate = new Date(this.state.date);

                // Patient name check
                return (row.patientName.toLowerCase().indexOf(
                    this.state.search.toLowerCase()) !== -1) &&
                // Booklet name check
                    (row.name.toLowerCase().indexOf(
                        this.state.booklet.toLowerCase()) !== -1) &&
                // Approval check
                    (row.approved.toString().toLowerCase().indexOf(
                        this.state.approval.toLowerCase()) !== -1) &&
                // Created before certain date check
                    (createdAt <= inputDate || this.state.date === "");
            }
        );

        //Check that data isn't empty
        if(bLength === 0)
        {
            return(<Typography>No booklets exist yet.</Typography>);
        }
        else if(mLength === 0)
        {
            return(<Typography>No member surveys exist yet.</Typography>);
        }
        else
        {
            // Ensure all filter input elements have the same "name" value as their respective state name
            // and their "value" is the current state value of the corresponding state you're filtering.
            return(
                <div>
                    <Typography>
                        <label htmlFor="pname">Patient Name:</label>
                        <br></br>
                        <input type="text"
                            id="pname"
                            name="search"
                            value={this.state.search}
                            onChange={this.updateSearch.bind(this)}
                        />
                        <br></br>
                        <label htmlFor="bname">Booklet Name:</label>
                        <br></br>
                        <select id="bname" 
                                name="booklet" 
                                onChange={this.updateSearch.bind(this)}>
                            <option value="">All</option>
                            {bRows.map(row =>
                                {return(<option value={row.name}>{row.name}</option>)}
                            )}
                        </select>
                        <br></br>
                        <label htmlFor="approval">Approval Status:</label>
                        <br></br>
                        <select id="approval" 
                                name="approval" 
                                onChange={this.updateSearch.bind(this)}>
                            <option value="">All</option>
                            <option value="false">Pending Approval</option>
                            <option value="true">Approved</option>
                        </select>
                        <br></br>
                        <label htmlFor="date">Created Before:</label>
                        <br></br>
                        <input type="date" 
                               id="date" 
                               name="date"
                               onChange={this.updateSearch.bind(this)}       
                        />
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Patient Name</TableCell>
                                <TableCell align="right">Booklet Name</TableCell>
                                <TableCell align="right">Date Started</TableCell>
                                <TableCell align="right">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSurveys.map((row, index) => 
                            {
                                var userProfileURL = "/profile/" + row.patientId;
                                var bookletURL = "/booklet/" + row._id;
                                var createdAt = new Date(row.createdAt);
                                var approved = "Pending Approval";

                                if(row.approved)
                                {
                                    approved = "Approved"
                                }

                                return(
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography component={Link} to={userProfileURL}>
                                            {row.patientName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography component={Link} to={bookletURL}>
                                            {row.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {createdAt.getMonth() + 1} / {createdAt.getDate() } / {createdAt.getFullYear()}
                                    </TableCell>
                                    <TableCell align="right">
                                        {approved}
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            );
        }
    }

    renderError = () => 
    {
        return(
            <Typography>
                {this.state.error}
            </Typography>
        );
    }

	render()
	{
        let { 
            classes 
        } = this.props;

        let {
            error,
            render
        } = this.state;

		return (            
            <Card>
                <CardContent>
                    <Typography variant="h5" component="h2" className={classes.title}>
                        Search Filter
                    </Typography>
                    { render ? 
                        <div>
                            {error === "" ? this.renderMemberSurveysList() : this.renderError() } 
                        </div>
                    : 
                        <CircularProgress />    
                    }
                </CardContent>
            </Card>
        );
	}
}

Search.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Search);