const searchButton = document.querySelector(".search-btn")
const cityInput = document.querySelector(".city-input")
const weatherCardsDiv = document.querySelector(".weather-cards")
const currentWeatherDiv = document.querySelector(".current-weather")
const locationButton = document.querySelector(".location-btn")
const recentCitiesDropdown = document.getElementById("recent-cities");

const API = "b3ec7413bf391dbd37efad7484ef30cb"

let target = "delhi"

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return ` 
            <div class="leading-10 ">
                <h2>${cityName}(${weatherItem.dt_txt.split(" ")[0]})</h2>
                <p>temp:${(weatherItem.main.temp - 273.15).toFixed(2)}°C</p>
                <p>Wind:${weatherItem.wind.speed}</p>
                <p>Humidity:${weatherItem.main.humidity}%</p>
            </div>
            <div>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="condition" />
            </div>
        `
    } else {
        return `<div class="dayForecast mr-0 relative">
        <span>(${weatherItem.dt_txt.split(" ")[0]})</span>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="condition">
        <p>temp:${(weatherItem.main.temp - 273.15).toFixed(2)}°C</p>
        <p>Wind:${weatherItem.wind.speed}</p>
        <p>Humidity:${weatherItem.main.humidity}%</p>
    </div>`
    }

}

function updateRecentCities(city) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || []
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(cities))
    }
    populateRecentCitiesDropdown();
}

function populateRecentCitiesDropdown() {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    recentCitiesDropdown.innerHTML = "";
    cities.forEach(city => {
        let cityItem = document.createElement('div');
        cityItem.className = 'city-item p-2 hover:bg-gray-400 cursor-pointer';
        cityItem.textContent = city;
        cityItem.addEventListener('click', () => fetchData(city));
        recentCitiesDropdown.appendChild(cityItem);
    });

    if (cities.length > 0) {
        let clearButton = document.createElement('div');
        clearButton.className = 'clear-item p-2 m-2 mb-6 bg-red-400 hover:bg-gray-400 cursor-pointer';
        clearButton.textContent = 'Clear Recent Cities';
        clearButton.addEventListener('click', clearRecentCities);
        recentCitiesDropdown.appendChild(clearButton);
    }

}
const clearRecentCities = () => {
    localStorage.removeItem('recentCities');
    populateRecentCitiesDropdown();
}


async function fetchData(target) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${target}&appid=${API}`)
        const data = await response.json()
        console.log(data)
        console.log(data.list[0])
        const { city: { name } } = data

        const uniqueForecastDays = []

        const fiveDaysForcast = data.list.filter((forecast) => {
            const forcastDate = new Date(forecast.dt_txt).getDate()
            console.log(forcastDate)
            if (!uniqueForecastDays.includes(forcastDate)) {
                return uniqueForecastDays.push(forcastDate)
            }

        })


        //clearing the previous data
        cityInput.value = ""
        currentWeatherDiv.innerHTML = ""
        weatherCardsDiv.innerHTML = ""
        console.log(fiveDaysForcast)

        //   const {city:{name}} = data

        fiveDaysForcast.forEach((weatherItem, index) => {

            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(name, weatherItem, index))
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(name, weatherItem, index))
            }
        })

        updateRecentCities(name)

    } catch (error) {
        console.log(error)
    }
}

const getCityCoordinates = (e) => {
    e.preventDefault()
    target = cityInput.value
    if (!target) return;
    fetchData(target)
    console.log(target)
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API}`;
        fetch(url).then(res => res.json()).then(data => {
            const { name } = data[0]
            fetchData(name)
        })
    },
        error => {
            alert("Unable to retrieve your location")
        }
    )
}

locationButton.addEventListener('click', getUserCoordinates)
searchButton.addEventListener('click', getCityCoordinates)


// Populate recent cities on page load

populateRecentCitiesDropdown();