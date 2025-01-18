const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/survey/generate', async (req, res) => {
    try {
        const { productData, userActivity } = req.body;
        // TODO: Add LLM integration here

        // For now, return mock data
        const survey = {
            question: `What made you choose this ${productData.type.toLowerCase()}?`,
            options: ['Style', 'Price', 'Quality']
        };

        res.json(survey);
    } catch (error) {
        console.error('Error generating survey:', error);
        res.status(500).json({ error: 'Failed to generate survey' });
    }
});

app.post('/api/survey/submit', (req, res) => {
    const { response } = req.body;
    console.log('Survey response received:', response);
    res.json({ message: 'Survey response recorded' });
});

app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    const text = req.query.text || 'Product Image';
    res.send(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle">${text}</text>
    </svg>`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
