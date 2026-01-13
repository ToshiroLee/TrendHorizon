const ctx = document.getElementById('myChart');

console.log('Chart element found:', ctx); // Debug: Check if canvas exists

fetch('/api/chart-data')
.then(response => {
    console.log('API Response status:', response.status); // Debug: Check response code
    return response.json();
})
.then(data => {
    console.log('Chart data received:', data); // Debug: Log the data
    if (!data || data.length === 0) {
        console.warn('No data returned from API');
    }
    createChart(data, 'line');
})
.catch(error => console.error('Error fetching chart data:', error));

function createChart(chartData, type) {
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.map(row => row.date),
      datasets: [{
        label: '# of Votes',
        data: chartData.map(row => row.stock),
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}