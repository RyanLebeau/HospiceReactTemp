import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// ==================== Helpers ====================
import del from '../../../helpers/common/delete';
import get from '../../../helpers/common/get'

// ==================== MUI ====================
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withStyles } from '@material-ui/core/styles';

// ==================== Icons ====================
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'

// ==================== Styles ====================
const styles = theme =>({
    title: theme.title,
    buttonView: theme.colorGreen,
    buttonEdit: theme.colorBlue,
    buttonDelete: theme.colorRed,
});

const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing.unit * 2,
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing.unit,
        top: theme.spacing.unit,
        color: theme.palette.grey[500],
    },
}))(props => {
    let { children, classes, onClose } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
            <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
                <CloseIcon />
            </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});
  

const DialogContent = withStyles(theme => ({
    root: {
        margin: 0,
        padding: theme.spacing.unit * 2,
    },
}))(MuiDialogContent);
  
const DialogActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing.unit,
    },
}))(MuiDialogActions);

class BookletsManagement extends Component 
{
    constructor(props)
    {
        super(props);

        this.state = {
            dialogId: "",
            dialogName: "",
            dialogOpen: false,
            deleting: false,
            error: "",
            render: false
        };
    }
    
    componentDidMount = () => 
    {
        this.booklets = {};
        this.booklets.library = {};
        this.booklets.length = 0;
        
        this.props.ToggleDrawerClose();
        this.props.CheckAuthenticationValidity((tokenValid) => 
        {
            if(tokenValid)
			{
				this.getSurveys();
			}
        });
    }

    getSurveys = () =>
    {
        let { appState } = this.props;

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
                    this.populateStateData(response.data.response);
                }
                else
                {
                    this.setState({
                        error: "Unable to retrieve booklets.  Please refresh and try agian.",
                        render: true
                    });
                }
            }
        });
    }

    handleDialogOpen = (_id, name) =>
    {
        this.setState({
            dialogId: _id,
            dialogName: name,
            dialogOpen: true
        });
    }

    handleDialogClose = () =>
    {
        this.setState({
            dialogOpen: false
        }); 
    }

    DeleteBooklet = () =>
    {
        let { appState } = this.props;
        let { dialogId } = this.state;

        this.setState({
            deleting: true
        },
        del("surveys/" + dialogId, appState.token, (error, response) => 
        {
            if(error)
            {
                this.setState({
                    deleting: false,
                    dialogOpen: false,
                    error: "Unable to delete booklet.  Please try again later."
                });
            }
            else
            {
                if(response.status === 200)
                {
                    this.setState({
                        deleting: false,
                        dialogOpen: false
                    });
                }   
                else
                {
                    this.setState({
                        deleting: false,
                        dialogOpen: false,
                        error: "Unable to delete booklet.  Please try again later."
                    });
                }
            }

            //TODO: React
            window.location.reload();
        }));
    }

    populateStateData = (data) => 
    {
        for (let index = 0; index < data.count; index++) 
        {
            this.booklets.library[index] = {
                _id: data.surveys[index]._id,
                name: data.surveys[index].name,
                createdAt: data.surveys[index].createdAt,
                updatedAt: data.surveys[index].updatedAt
            };
        }

        this.setState({
            error: "",
            render: true
        });
    }

    createTableRow = ( _id, name, dateCreated, dateLastModified) =>
    {
        return { _id, name, dateCreated, dateLastModified }
    }

    renderTable = () =>
    {
        let { 
            classes 
        } = this.props; 

        var rows = [];

        for (let index = 0; index < this.booklets.length; index++) 
        {
            rows.push(this.createTableRow(this.booklets.library[index]._id, 
                                          this.booklets.library[index].name, 
                                          this.booklets.library[index].createdAt,
                                          this.booklets.library[index].updatedAt));
        }

        if(this.booklets.length === 0)
        {
            return(
                <Typography>
                    There are no surveys / booklets created yet.
                </Typography>
            );
        }
        else
        {
            return(
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Date Created</TableCell>
                        <TableCell align="right">Date Last Modified</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => 
                        {
                            var viewURL = "/administration/booklets/view/" + row._id;
                            var editURL = "/administration/booklets/edit/" + row._id;
                            var createdAt = new Date(row.dateCreated);
                            var updatedAt = new Date(row.dateLastModified);
                            return (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row">
                                    {row.name}
                                    </TableCell>
                                    <TableCell align="right">
                                        {createdAt.getMonth() + 1} / {createdAt.getDate() } / {createdAt.getFullYear()}
                                    </TableCell>
                                    <TableCell align="right">
                                        {updatedAt.getMonth() + 1} / {updatedAt.getDate() } / {updatedAt.getFullYear()}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton aria-label="View" component={Link} to={viewURL} className={classes.buttonView}>
                                            <OpenInBrowser fontSize="small" />
                                        </IconButton>
                                        <IconButton aria-label="Edit" component={Link} to={editURL} className={classes.buttonEdit}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton aria-label="Delete" onClick={() => this.handleDialogOpen(row._id, row.name)}>
                                            <DeleteIcon fontSize="small" className={classes.buttonDelete} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            );
        }
    }

    renderDialog = () =>
    {
        let {
            dialogOpen,
            dialogName,
            deleting
        } = this.state;

        return(
            <div>
                <Dialog
                    onClose={this.handleDialogClose}
                    aria-labelledby="Delete-Dialog"
                    open={dialogOpen}
                >
                    <DialogTitle id="Delete-Dialog" onClose={this.handleDialogClose}>
                        Warning!
                    </DialogTitle>                
                        <DialogContent>
                            <Typography gutterBottom>
                            You have chosen to delete the booklet named {dialogName}.  Deleting booklets cannot be undone, so please make sure you have absolutely no use for it anymore.
                            </Typography>
                            <Typography gutterBottom>
                            Surveys, quizes, or booklets that have used this specific booklet that are already completed or in progress will still be able to use it.
                            </Typography>
                            <Typography gutterBottom>
                            Are you sure you want to delete {dialogName}?
                            </Typography>
                            { deleting &&
                                <CircularProgress />
                            }
                            </DialogContent>
                    <DialogActions>
                        <Button onClick={this.DeleteBooklet} disabled={deleting} color="primary">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
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
                        Booklet Management
                    </Typography>
                    { render ? 
                        <div>
                            {error === "" ? this.renderTable() : this.renderError() } 
                        </div>
                    : 
                        <CircularProgress />    
                    }
                    {this.renderDialog()}
                </CardContent>
            </Card>
        );
	}
}

BookletsManagement.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(BookletsManagement);