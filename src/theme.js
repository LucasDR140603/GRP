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
        },
    },
    components:{
        MuiDialog:{
            styleOverrides:{
                paper:{
                    border:'1px solid #7b8181',
                    backgroundImage: 'none',
                    backgroundColor:'#0f131d',
                }
            }
        },
        MuiMenu:{
            styleOverrides:{
                paper:{
                    backgroundImage: 'none',
                    backgroundColor:'#0f131d',
                    border:'1px solid #7b8181',
                }
            }
        },
        
    }
})
export default theme;