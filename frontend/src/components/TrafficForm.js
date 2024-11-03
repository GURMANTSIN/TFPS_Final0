import React, { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Button } from '@mui/material';
import axios from 'axios';

const TrafficForm = ({ onRouteFound }) => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [model, setModel] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [scatsSites, setScatsSites] = useState([]);

    useEffect(() => {
        const fetchScatsSites = async () => {
            try {
                const response = await axios.get('http://localhost:5000/get_scats_sites');
                setScatsSites(response.data);
            } catch (error) {
                console.error("Error fetching SCATS sites:", error);
            }
        };
        fetchScatsSites();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/calculate_route', {
                origin,
                destination,
                date,
                time,
                model
            });
            onRouteFound(response.data);
        } catch (error) {
            console.error("Error calculating route:", error);
            alert("Error calculating route. Please check your input.");
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="SCATS Origin"
                select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
            >
                {scatsSites.map((site) => (
                    <MenuItem key={site['SCATS Number']} value={site['SCATS Number']}>
                        {site['SCATS Number']}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                label="SCATS Destination"
                select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
            >
                {scatsSites.map((site) => (
                    <MenuItem key={site['SCATS Number']} value={site['SCATS Number']}>
                        {site['SCATS Number']}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                label="Model"
                select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
            >
                <MenuItem value="base_model">Base Model</MenuItem>
                <MenuItem value="gru">GRU</MenuItem>
                <MenuItem value="lstm">LSTM</MenuItem>
                <MenuItem value="saes">SAES</MenuItem>
                <MenuItem value="simplernn">SimpleRNN</MenuItem>
                <MenuItem value="advances_saes">Advanced SAES</MenuItem>
            </TextField>
            <TextField
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                inputProps={{ min: '2006-11-01', max: '2006-11-30' }}
            />
            <TextField
                label="Time (HH:MM)"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
            />
            <Button type="submit" variant="contained" color="primary">
                Get Directions
            </Button>
        </Box>
    );
};

export default TrafficForm;
