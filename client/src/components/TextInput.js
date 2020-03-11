import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';

const TextInput = props => {
    let { autoComplete, autoFocus, fullWidth, id, label, margin, onChange, type, value } = props;
    
    return(
        <FormControl margin={margin} required fullWidth={fullWidth}>
            <InputLabel htmlFor={id}>{label}</InputLabel>
            <Input
                id={id} 
                name={id}
                type={type}
                {... autoComplete !=="" && {autoComplete: autoComplete}} 
                value={value} 
                onChange={onChange}
                autoFocus={autoFocus}
            />
        </FormControl>
    );
};

TextInput.propTypes = {
    autoComplete: PropTypes.string,
    autoFocus: PropTypes.bool,
    fullWidth: PropTypes.bool,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    margin: PropTypes.string,
    onChange: PropTypes.func,
    type: PropTypes.string,
    value: PropTypes.string.isRequired
};

TextInput.defaultProps = {
    autoComplete: "",
    autoFocus: false,
    fullWidth: false,
    margin: "normal",
    type: ""
}

export default TextInput;