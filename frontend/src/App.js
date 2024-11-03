import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Switch, FormControlLabel, Box } from '@mui/material';
import TrafficForm from './components/TrafficForm';
import MapDisplay from './components/MapDisplay';

function App() {
    const [darkMode, setDarkMode] = useState(false);
    const [routes, setRoutes] = useState([]);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    const handleRouteFound = (foundRoutes) => {
        setRoutes(foundRoutes);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Traffic Flow Predictor
                    </Typography>
                    <FormControlLabel
                        control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
                        label="Dark Mode"
                    />
                </Toolbar>
            </AppBar>
            
            {/* Main container to hold the form and the map side by side */}
            <Box
                sx={{
                    display: 'flex',
                    height: 'calc(100vh - 64px)', // Adjust height based on AppBar height
                    overflow: 'hidden'
                }}
            >
                {/* Sidebar with TrafficForm */}
                <Box
                    sx={{
                        width: '30%', // Adjust width as needed
                        padding: 2,
                        overflowY: 'auto',
                        borderRight: '1px solid #ccc', // Optional, for a divider effect
                        boxSizing: 'border-box'
                    }}
                >
                    <TrafficForm onRouteFound={handleRouteFound} />
                </Box>
                
                {/* Map Display Area */}
                <Box
                    sx={{
                        width: '70%', // Adjust width as needed
                        height: '100%', // Ensures full height for the map container
                        overflow: 'hidden'
                    }}
                >
                    <MapDisplay routes={routes} />
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App;
