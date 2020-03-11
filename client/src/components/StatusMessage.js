import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';

const StatusMessage = props => {
    let { children, color } = props;

    return (
        <Typography component="p" className={color}>
            {children}
        </Typography>
    );
};

StatusMessage.propTypes = {
    color: PropTypes.string.isRequired,
};

export default StatusMessage;