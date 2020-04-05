// ==================== MUI ====================
import { createMuiTheme } from '@material-ui/core/styles';

// ==================== Colors ====================
import pink from '@material-ui/core/colors/pink';
import purple from '@material-ui/core/colors/purple';
import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';
import spacing from '@material-ui/core/styles/spacing';

// ============================================
// Generate theme based on options assigned in
// createMuiTheme using the Material-UI API
// ============================================
export default createMuiTheme({
    palette : {
        primary: {
            light: pink[300],
            main: pink[500],
            dark: pink[700],
            contrastText: '#ffffff'
        },
        secondary: {
            light: purple[300],
            main: purple[500],
            dark: purple[700],
            contrastText: '#ffffff'
        },
        tertiary: {
            light: purple[300],
            main: purple[500],
            dark: purple[700],
            contrastText: '#ffffff'
        }
    },
    alignLeftSpacer: {
        marginLeft: "auto",
        marginRight: 0
    },
    button: {
        margin: spacing.unit
    },
    card: {
        marginBottom: 5
    },
    colorGreen: {
        color: green[500]
    },
    colorBlue: {
        color: blue[500]
    },
    colorRed: {
        color: red[800]
    },
    error: {
        color: red[500],
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 5
    },
    flex: {
        display: 'flex',
    },
    flexWrap: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    marginTop: {
        marginTop: 10
    },
    rightIcon: {
        marginLeft: spacing.unit
    },
    save: {
        color: blue[500]
    },
    spinner: {
        color: green[500]
    },
    success: {
        color: blue[500],
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 5
    },
    title: {
        marginBottom: 5
    },
    typography: {
        useNextVariants: true,
    },
});