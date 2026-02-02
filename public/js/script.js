// Stock Chart Elements
const stockCtx = document.getElementById('stockChart');
const stockSelect = document.getElementById('stockSelect');
let stockChart;

// Crypto Chart Elements
const cryptoCtx = document.getElementById('cryptoChart');
const cryptoSelect = document.getElementById('cryptoSelect');
let cryptoChart;

console.log('Elements found:', { stockCtx, stockSelect, cryptoCtx, cryptoSelect });

// ===== STOCK CHART FUNCTIONS =====
function fetchAndUpdateStockChart(stockName) {
    console.log('=== Fetching stock data for:', stockName, '===');
    
    fetch(`/api/chart-data?stock=${stockName}`)
    .then(response => {
        console.log('Stock API Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Stock chart data received for', stockName, ':', data.length, 'rows');
        if (!data || data.length === 0) {
            console.warn('No stock data returned from API');
            return;
        }
        
        if (stockChart) {
            console.log('Destroying existing stock chart');
            stockChart.destroy();
        }
        
        createStockChart(data, stockName);
    })
    .catch(error => console.error('Error fetching stock chart data:', error));
}

function createStockChart(chartData, stockName) {
    const stockValues = chartData.map(row => parseFloat(row.stock));
    console.log(`Creating stock chart for ${stockName} with values:`, stockValues);
    
    stockChart = new Chart(stockCtx, {
        type: 'line',
        data: {
            labels: chartData.map(row => row.date ? row.date.toString() : 'N/A'),
            datasets: [{
                label: `${stockName} Stock Price`,
                data: stockValues,
                borderWidth: 2,
                borderColor: '#76C893',
                backgroundColor: 'rgba(118, 200, 147, 0.1)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${stockName} Stock Price: $${context.parsed.y.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Stock Price ($)' },
                    ticks: {
                        callback: function(value, index, values) {
                            return '$' + value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                },
                x: {
                    title: { display: true, text: 'Time' }
                }
            }
        }
    });
    console.log('Stock chart created successfully');
}

// ===== CRYPTO CHART FUNCTIONS =====
function fetchAndUpdateCryptoChart(cryptoName) {
    console.log('=== Fetching crypto data for:', cryptoName, '===');
    
    fetch(`/api/crypto-data?crypto=${cryptoName}`)
    .then(response => {
        console.log('Crypto API Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Crypto chart data received for', cryptoName, ':', data.length, 'rows');
        if (!data || data.length === 0) {
            console.warn('No crypto data returned from API');
            return;
        }
        
        if (cryptoChart) {
            console.log('Destroying existing crypto chart');
            cryptoChart.destroy();
        }
        
        createCryptoChart(data, cryptoName);
    })
    .catch(error => console.error('Error fetching crypto chart data:', error));
}

function createCryptoChart(chartData, cryptoName) {
    const cryptoValues = chartData.map(row => parseFloat(row.value));
    console.log(`Creating crypto chart for ${cryptoName} with values:`, cryptoValues);
    
    // Check if all values are 0, null, or undefined
    const validValues = cryptoValues.filter(val => val && val > 0);
    if (validValues.length === 0) {
        console.warn('No valid crypto values found for chart');
        // Create empty chart with message
        cryptoChart = new Chart(cryptoCtx, {
            type: 'line',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: `${cryptoName} Price - No Data Available`,
                    data: [0],
                    borderWidth: 2,
                    borderColor: '#F72585',
                    backgroundColor: 'rgba(247, 37, 133, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Crypto Price ($)' },
                        ticks: {
                            callback: function(value, index, values) {
                                return '$' + value.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    },
                    x: {
                        title: { display: true, text: 'Time' }
                    }
                }
            }
        });
        return;
    }
    
    cryptoChart = new Chart(cryptoCtx, {
        type: 'line',
        data: {
            labels: chartData.map(row => row.date ? row.date.toString() : 'N/A'),
            datasets: [{
                label: `${cryptoName} Price`,
                data: cryptoValues,
                borderWidth: 2,
                borderColor: '#F72585',
                backgroundColor: 'rgba(247, 37, 133, 0.1)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${cryptoName} Price: $${context.parsed.y.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Crypto Price ($)' },
                    ticks: {
                        callback: function(value, index, values) {
                            return '$' + value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                },
                x: {
                    title: { display: true, text: 'Time' }
                }
            }
        }
    });
    console.log('Crypto chart created successfully');
}

// ===== EVENT LISTENERS =====
if (stockSelect) {
    stockSelect.addEventListener('change', (e) => {
        console.log('Stock dropdown changed to:', e.target.value);
        fetchAndUpdateStockChart(e.target.value);
    });
}

if (cryptoSelect) {
    cryptoSelect.addEventListener('change', (e) => {
        console.log('Crypto dropdown changed to:', e.target.value);
        fetchAndUpdateCryptoChart(e.target.value);
    });
}

// ===== INITIALIZE CHARTS =====
fetchAndUpdateStockChart(stockSelect.value);
fetchAndUpdateCryptoChart(cryptoSelect.value);
