import express from 'express';
import fetch from 'node-fetch'; 
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3001; 

app.use(cors());


app.get('/api/now-playing', async (req, res) => {
    const apiKey = process.env.API_KEY; 
    const url = 'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1';
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from the third-party API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/upcoming', async (req, res) => {
    const apiKey = process.env.API_KEY; 
    const url = 'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from the third-party API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/trending', async (req, res) => {
    const { type } = req.query;
    const apiKey = process.env.API_KEY; 
    let url = '';
    
    switch (type) {
        case 'movie':
            url = 'https://api.themoviedb.org/3/trending/movie/week?language=en-US';
            break;
        case 'tv':
            url = 'https://api.themoviedb.org/3/trending/tv/week?language=en-US';
            break;
        case 'all':
            url = 'https://api.themoviedb.org/3/trending/all/week?language=en-US';
            break;
        default:
            return res.status(400).send('Invalid type');
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from the third-party API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/movies', async (req, res) => {
    const { search } = req.query;
    const apiKey = process.env.API_KEY; 
    let url = `https://api.themoviedb.org/3/search/multi?query=${search}&language=en-US&page=1&include_adult=false`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from the third-party API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/trailer', async (req, res) => {
    const apiKey = process.env.API_KEY; 
    const {media, id} = req.query;
    const url = `https://api.themoviedb.org/3/${media}/${id}/videos?language=en-US`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from the third-party API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/hovertrailer', async (req, res) => {
    const apiKey = process.env.API_KEY; 
    const {media, id} = req.query;
    const url = `https://api.themoviedb.org/3/${media}/${id}/videos?language=en-US`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from the third-party API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/featuredtrailer', async (req, res) => {
    const apiKey = process.env.API_KEY; 
    const {media, id} = req.query;
    const url = `https://api.themoviedb.org/3/${media}/${id}/videos?language=en-US`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from the third-party API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/cast', async (req, res) => {
    const apiKey = process.env.API_KEY; 
    const {id} = req.query;
    const url = `https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from the third-party API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/reviews', async (req, res) => {
    const apiKey = process.env.API_KEY; 
    const {media, id} = req.query;
    const url = `https://api.themoviedb.org/3/${media}/${id}/reviews?language=en-US&page=1`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from the third-party API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/api/similar', async (req, res) => {
    const apiKey = process.env.API_KEY; 
    const {media, id} = req.query;
    const url = `https://api.themoviedb.org/3/${media}/${id}/similar?language=en-US&page=1`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from the third-party API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});