const express = require('express');
const axios = require('axios');

const app = express();
app.set("view engine", "ejs")
const port = 9876;

const windowSize = 10;
let windowNumbers = [];

const fetchNumbersFromServer = async () => {
    try {
        const response = await axios.get("http://9876/numbers/e");
        return response.data.numbers || [];
    } catch (error) {
        console.error("Error fetching numbers from the server:", error);
        return [];
    }
};


const calculateAverage = (numbers) => {
    if (!numbers || numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
};

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;

    const start = Date.now();
    const serverNumbers = await fetchNumbersFromServer();
    const elapsed = Date.now() - start;

    if (elapsed > 500 || !serverNumbers) {
        return res.status(500).json({ error: "Error: Unable to fetch numbers from the server" });
    }

    windowNumbers.push(...serverNumbers);
    windowNumbers = [...new Set(windowNumbers)];
    if (windowNumbers.length > windowSize) {
        windowNumbers = windowNumbers.slice(-windowSize);
    }

    const avg = calculateAverage(windowNumbers);

    const response = {
        numbers: serverNumbers,
        windowPrevState: [],
        windowCurrState: windowNumbers,
        avg: avg.toFixed(2)
    };

    res.json(response);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});