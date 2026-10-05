import {createTheme} from '@mui/material/styles'
const theme=createTheme({
    palette:{
        mode:'dark',
        primary:{
            main:'#ffd700',
            contrastText:'#000000'
        },
        secondary:{
            main:'#f0ffff',
            contrastText:'#000000'
        }
    }
})
export default theme;