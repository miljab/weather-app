import "./styles.css";

function importAll(r) {
  let images = {};
  r.keys().map((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
}

const icons = importAll(
  require.context("./icons_svg", false, /\.(png|jpe?g|svg)$/),
);

async function getData(location) {
  try {
    location = location.replace(/\s/g, "%20");
    const startDate = new Date();
    const endDate = new Date(new Date().setDate(new Date().getDate() + 6));
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${startDate.toJSON().slice(0, 10)}/${endDate.toJSON().slice(0, 10)}?unitGroup=metric&include=days%2Ccurrent%2Chours&key=666P6XP95XJS8NXGCEGYPERCJ&contentType=json`,
      { mode: "cors" },
    );

    if (!response.ok) {
      if (response.status === 400)
        throw new Error(
          "Error 400, Bad request! Make sure you have entered correct location name.",
        );
      else throw new Error("An error occurred! Please, try again later.");
    }

    const data = await response.json();
    console.log(data);

    buildCurrentWeatherInfo(data);
    buildWeatherTiles(data);
  } catch (error) {
    const errorSpan = document.querySelector("#response-span");
    errorSpan.className = "error";
    errorSpan.textContent = error.message;
  }
}

function searchHandler() {
  const searchInput = document.querySelector("#search-input");
  const searchButton = document.querySelector("#search-button");
  const responseSpan = document.querySelector("#response-span");

  searchButton.addEventListener("click", () => {
    responseSpan.textContent = "";
    responseSpan.className = "";
    getData(searchInput.value);
  });

  searchInput.addEventListener("keyup", (e) => {
    e.preventDefault();
    if (e.keyCode === 13) {
      searchButton.click();
    }
  });
}

function buildCurrentWeatherInfo(data) {
  if (
    data.currentConditions.datetime < data.currentConditions.sunset &&
    data.currentConditions.datetime > data.currentConditions.sunrise
  ) {
    document.querySelector("body").style.backgroundColor = "rgb(8, 76, 136)";
  } else {
    document.querySelector("body").style.backgroundColor = "rgb(13, 39, 68)";
  }

  const locationSpan = document.querySelector("#response-span");
  locationSpan.className = "location-name";
  locationSpan.textContent = data.resolvedAddress;

  const currentWeatherDiv = document.querySelector("#current-weather");
  currentWeatherDiv.classList.remove("hidden");
  currentWeatherDiv.textContent = "";

  const currentDate = document.createElement("span");
  currentDate.className = "date-span";
  currentDate.textContent = data.days[0].datetime;
  currentWeatherDiv.appendChild(currentDate);

  const currentIcon = document.createElement("img");
  currentIcon.src = icons[`${data.currentConditions.icon}.svg`];
  currentIcon.className = "current-icon";
  currentWeatherDiv.appendChild(currentIcon);

  const currentTemp = document.createElement("span");
  currentTemp.className = "current-temp-span";
  currentTemp.textContent = `${data.currentConditions.temp}\xB0C`;
  currentWeatherDiv.appendChild(currentTemp);

  const minMaxDiv = document.createElement("div");
  minMaxDiv.className = "min-max-div";

  const minTemp = document.createElement("span");
  minTemp.className = "current-min-temp";
  minTemp.textContent = `min: ${data.days[0].tempmin}\xB0C`;
  minMaxDiv.appendChild(minTemp);

  const maxTemp = document.createElement("span");
  maxTemp.className = "current-max-temp";
  maxTemp.textContent = `max: ${data.days[0].tempmax}\xB0C`;
  minMaxDiv.appendChild(maxTemp);

  currentWeatherDiv.appendChild(minMaxDiv);

  const currentConditions = document.createElement("span");
  currentConditions.className = "current-conditions-span";
  currentConditions.textContent = data.currentConditions.conditions;
  currentWeatherDiv.appendChild(currentConditions);

  const windDiv = document.createElement("div");
  windDiv.className = "current-weather-small-info wind";
  const windLabel = document.createElement("span");
  windLabel.textContent = "Wind:";
  const windValue = document.createElement("span");
  windValue.textContent = `${data.currentConditions.windspeed}km/h`;
  windDiv.appendChild(windLabel);
  windDiv.appendChild(windValue);
  currentWeatherDiv.appendChild(windDiv);

  const humidityDiv = document.createElement("div");
  humidityDiv.className = "current-weather-small-info humidity";
  const humidityLabel = document.createElement("span");
  humidityLabel.textContent = "Humidity:";
  const humidityValue = document.createElement("span");
  humidityValue.textContent = `${data.currentConditions.humidity}%`;
  humidityDiv.appendChild(humidityLabel);
  humidityDiv.appendChild(humidityValue);
  currentWeatherDiv.appendChild(humidityDiv);

  const PoPDiv = document.createElement("div");
  PoPDiv.className = "current-weather-small-info pop";
  const PoPLabel = document.createElement("span");
  PoPLabel.textContent = "PoP:";
  const PoPValue = document.createElement("span");
  PoPValue.textContent = `${data.currentConditions.precipprob}%`;
  PoPDiv.appendChild(PoPLabel);
  PoPDiv.appendChild(PoPValue);
  currentWeatherDiv.appendChild(PoPDiv);
}

function buildWeatherTiles(data) {
  const dailyButton = document.querySelector("#daily-button");
  const hourlyButton = document.querySelector("#hourly-button");

  let textColor;
  if (
    data.currentConditions.datetime < data.currentConditions.sunset &&
    data.currentConditions.datetime > data.currentConditions.sunrise
  ) {
    textColor = "rgb(8, 76, 136)";
  } else {
    textColor = "rgb(13, 39, 68)";
  }

  document.querySelector(".unselected-button").style.color = textColor;

  dailyButton.addEventListener("click", () => {
    dailyButton.className = "selected-button";
    hourlyButton.className = "unselected-button";
    dailyButton.style.color = "white";
    hourlyButton.style.color = textColor;
    dailyTiles(data);
  });

  hourlyButton.addEventListener("click", () => {
    hourlyButton.className = "selected-button";
    dailyButton.className = "unselected-button";
    hourlyButton.style.color = "white";
    dailyButton.style.color = textColor;
    hourlyTiles(data);
  });

  document.querySelector(".selected-button").click();
}

function dailyTiles(data) {
  const tilesDiv = document.querySelector("#weather-tiles");
  tilesDiv.textContent = "";

  for (let i = 1; i < 7; i++) {
    const tileDiv = document.createElement("div");
    tileDiv.className = "daily-tile";

    const dateSpan = document.createElement("span");
    dateSpan.className = "tile-date-span";
    dateSpan.textContent = data.days[i].datetime;
    tileDiv.appendChild(dateSpan);

    const weatherIcon = document.createElement("img");
    weatherIcon.src = icons[`${data.days[i].icon}.svg`];
    weatherIcon.className = "tile-weather-icon";
    tileDiv.appendChild(weatherIcon);

    const minMaxDiv = document.createElement("div");
    minMaxDiv.className = "tile-min-max-div";

    const minTemp = document.createElement("span");
    minTemp.className = "tile-min-temp";
    minTemp.textContent = `${data.days[i].tempmin}\xB0C`;
    minMaxDiv.appendChild(minTemp);

    const maxTemp = document.createElement("span");
    maxTemp.className = "tile-max-temp";
    maxTemp.textContent = `${data.days[i].tempmax}\xB0C`;
    minMaxDiv.appendChild(maxTemp);

    tileDiv.appendChild(minMaxDiv);

    tilesDiv.appendChild(tileDiv);
  }
}

function hourlyTiles(data) {
  console.log("hourly");
}

searchHandler();
getData("warsaw");
