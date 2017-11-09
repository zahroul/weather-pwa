const app = {
    isLoading: true,
    selectedCity: null,
    loadingIndicator: document.querySelector('.loading-indicator'),
    card: document.querySelector('.card'),

    getForecast: function(key, label) {
        const request = new XMLHttpRequest();

        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    const response = JSON.parse(request.response);
                    const results = response.query.results;

                    results.label = label;

                    app.updateForecastCard(results);
                }
            }
        };
        request.open(
            'GET',
            `https://query.yahooapis.com/v1/public/yql?format=json&q=SELECT * FROM weather.forecast WHERE woeid=${key}`
        );
        request.send();
    },

    updateForecastCard: function(weather) {
        const current = weather.channel.item.condition;
        const wind = weather.channel.wind;
        const astronomy = weather.channel.astronomy;

        this.card.querySelector('.location').textContent = weather.label;
        this.card.querySelector('.date').textContent = current.date;
        this.card.querySelector('.description').textContent = current.text;
        this.card.querySelector('.temperature .value').textContent = current.temp;
        this.card.querySelector('.humidity .value').textContent = weather.channel.atmosphere.humidity;
        this.card.querySelector('.wind .speed').textContent = wind.speed;
        this.card.querySelector('.wind .direction').textContent = wind.direction;
        this.card.querySelector('.sunrise .value').textContent = astronomy.sunrise;
        this.card.querySelector('.sunset .value').textContent = astronomy.sunset;
        this.card.removeAttribute('hidden');

        if (this.isLoading) {
            this.loadingIndicator.setAttribute('hidden', 'true');
            this.isLoading = false;
        }
    },

    saveSelectedCity: function() {
        const selectedCity = JSON.stringify(this.selectedCity);
        localStorage.selectedCity = selectedCity;
    }
};

document.getElementById('citySelector').addEventListener(
    'change',
    function(event) {
        const key = event.target.value;
        const value = event.target.options[event.target.selectedIndex].textContent;

        app.getForecast(key, value);
        app.selectedCity = {key: key, value: value}
        app.saveSelectedCity();
    }
);

/**
 * Fake weather data
 */
const fakeWeather = {
    key: '2459115',
    label: 'New York, NY',
    channel: {
        wind: {
            direction: '195',
            speed: '25'
        },
        atmosphere: {
            humidity: '56'
        },
        astronomy: {
            sunrise: '5:43 am',
            sunset: '8:21 pm'
        },
        item: {
            condition: {
                code: '24',
                date: 'Thu, 21 Jul 2016 09:00 PM EDT',
                temp: '56',
                text: 'Windy'
            }
        }
    }
};

// Test app with fake data
// app.updateForecastCard(fakeWeather);

// Startup code
app.selectedCity = localStorage.selectedCity;

if (app.selectedCity) {
    const selectedCity = JSON.parse(app.selectedCity);
    app.getForecast(selectedCity.key, selectedCity.value);
} else {
    app.updateForecastCard(fakeWeather);
    app.selectedCity = {key: fakeWeather.key, label: fakeWeather.label};
    app.saveSelectedCity();
}
