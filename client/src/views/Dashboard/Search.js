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
import IconButton from '@material-ui/core/IconButton';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import CloseIcon from '@material-ui/icons/Close';
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'

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

        this.state = {
            search: "",
            error: "",
            render: false
        };
    }

    componentDidMount = () =>
    {
        this.membersurveys = {};
        this.membersurveys.library = {};
        this.membersurveys.length = 0;

        this.props.ToggleDrawerClose();
        this.props.CheckAuthenticationValidity((tokenValid) => 
        {
            if(tokenValid)
			{
				this.getMemberSurveys();
			}
        });
    }

    // Get all documents from the "membersurvey" collection in database
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
                    this.populateStateData(response.data.response);
                }
                else
                {
                    this.setState({
                        error: "Unable to retrieve member surveys. Please refresh and try agian.",
                        render: true
                    });
                }
            }
        });
    }

    // Populates current survey state data with survey data from the database
    populateStateData = (data) => 
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

    //Updates search state when user types in search box
    updateSearch(event) {
        this.setState({search: event.target.value})
    }

    createMemberSurveysRow = (_id, approved, patientId, patientName, name, createdBy, modifiedBy, createdAt, updatedAt) =>
    {
        return { _id, approved, patientId, patientName, name, createdBy, modifiedBy, createdAt, updatedAt }
    }

    //Renders the table containing all the data onto the site
    renderMemberSurveysList = () =>
    {
        var rows = [];
        const length = this.membersurveys.length;

        for (let index = 0; index < length; index++) 
        {
            rows.push(this.createMemberSurveysRow(  this.membersurveys.library[index]._id,
                                                    this.membersurveys.library[index].approved,
                                                    this.membersurveys.library[index].patientId,
                                                    this.membersurveys.library[index].patientName,
                                                    this.membersurveys.library[index].name,
                                                    this.membersurveys.library[index].createdBy,
                                                    this.membersurveys.library[index].modifiedBy,
                                                    this.membersurveys.library[index].createdAt,
                                                    this.membersurveys.library[index].updatedAt));
        }

        //filteredSurvey contains the filtered data depending on the user's search
        let filteredSurveys = rows.filter(
            (row) => {
                return row.patientName.toLowerCase().indexOf(
                    this.state.search.toLowerCase()) !== -1;
            }
        );

        //Check that data isn't empty
        if(length === 0)
        {
            return(<Typography>There are no booklets for this user yet.</Typography>);
        }
        else
        {
            return(
                <div>
                    <Typography>
                        <label htmlFor="pname">Patient Name</label>
                        <input type="text"
                            id="pname"
                            value={this.state.search}
                            onChange={this.updateSearch.bind(this)}
                        />
                        <br></br>
                        <label htmlFor="bname">Booklet Name</label>
                        <input type="text"
                            id="bname"
                            value={this.state.search}
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