'use strict';

const d = document;
const API_KEY = "f3412604fc05c46d66a65dcf8f4244ea";
const URL_GEOCODING = "https://api.openweathermap.org/geo/1.0/direct";
const URL_CURRENT_W = "https://api.openweathermap.org/data/2.5/weather";
let lugar = "";
let temperaturaActual = 0;
let estadoDelTiempo = "";
let tempMax = 0;
let tempMin = 0;
let humedad = 0;
let sTermica = 0;
let presionAt = 0;
let viento = 0;
let png = "";
let timeUnix = 0;
let dataRecuperada = [];
let dataRec = [];
const fecha = new Date();
const hora = fecha.getHours();
const dia = fecha.getDate();
const mes = fecha.getMonth();

const btn = d.querySelector('.btn');
const inputElement = d.getElementById('search');
let divContenedor = d.createElement(`div`)
divContenedor.id = `contenedor`;
divContenedor.className = "container";
let divVIdeo = d.createElement(`div`);


function guardarLocal() {
    let datosGuardados = JSON.parse(localStorage.getItem("resultadoCiudades"));
    if (datosGuardados == null) datosGuardados = [];
    let data = {
        "ciudad": lugar,
        "clima": estadoDelTiempo,
        "temperatura": temperaturaActual,
        "hora": hora,
        "dia": dia,
        "mes": mes,
        "tMax": tempMax,
        "tMin": tempMin,
        "img": png,
        "humerad": humedad,
        "sesacionTermmica": sTermica,
        "presion": presionAt,
        "viento": viento
    };

    localStorage.setItem("data", JSON.stringify(data));
    datosGuardados.push(data);
    localStorage.setItem("resultadoCiudades", JSON.stringify(datosGuardados));

}

let city = "";

// FUNCION PARA RECORRER LA KEY EN LOCAL STORAGE-------->
function recorrerLocal() {
    dataRec = JSON.parse(localStorage.getItem("resultadoCiudades"));
    for (let index = 0; index < dataRec.length; index++) {
        city = dataRec[index];
        console.log(city);
    }
}

btn.addEventListener(`click`, (e) => {

    const valorDeInput = inputElement.value;
    console.log('valor del input: ', valorDeInput);
    lugar = valorDeInput;

    if (localStorage.getItem('resultadoCiudades') == null) {
        buscarClima(lugar);

    } else {
        recorrerLocal();
        if (lugar != city.ciudad) {
            buscarClima(lugar);
        } else {
            armarConLocal();
            if (hora <= 19 && hora >= 6) {
                video(city.clima)
            } else {
                videoNoche(city.clima)
            };
            console.log("RECUPERO EL DATO QUE EXISTE EN MEMORIA");
        };

    };




});



function buscarClima(valorABuscar) {

    //FETCH PARA OBTENER COORDENADAS------------------------>

    fetch(`${URL_GEOCODING}?q=${valorABuscar}&appid=${API_KEY}`)
        .then(function(response) {
            console.log(`respuesta en crudo OBJETO RESPONSE`, response)

            return response.json();

        })
        .then(function(json) {
            console.log(`json recibido`, json);
            console.log(`visualizo el atributo data `, json);
            const LAT = json[0].lat;
            const LON = json[0].lon;
            console.log(`latitud: ${json[0].lat} , longitud :${json[0].lat} `);

            //FETCH ANIDAD0----------------------->


            fetch(`${URL_CURRENT_W}?lat=${LAT}&lon=${LON}&appid=${API_KEY}`)
                .then(function(response) {
                    console.log(`respuesta en crudo OBJETO RESPONSE`, response)
                    return response.json();

                })
                .then(function(json) {
                    console.log(`json recibido`, json);
                    console.log(`visualizo el atributo data `, json);
                    let temp = json.main.temp;
                    let estado = json.weather[0].main;
                    let tMax = json.main.temp_max;
                    let tMin = json.main.temp_min;
                    let humidity = json.main.humidity;
                    let rFeel = json.main.feels_like;
                    let pressure = json.main.pressure;
                    let wind = json.wind.speed;
                    let icon = json.weather[0].icon;
                    let time = json.dt;




                    temperaturaActual = temperaturaEnCelsius(temp);
                    estadoDelTiempo = estado;
                    tempMax = temperaturaEnCelsius(tMax);
                    tempMin = temperaturaEnCelsius(tMin);
                    humedad = humidity;
                    sTermica = temperaturaEnCelsius(rFeel);
                    presionAt = pressure;
                    viento = wind;
                    png = icon;
                    timeUnix = time;


                    armarHtml();
                    if (hora <= 19 && hora >= 6) {
                        video(estadoDelTiempo)
                    } else {
                        videoNoche(estadoDelTiempo)
                    };

                    guardarLocal()


                })
                .catch(function(err) {
                    console.log("Something went wrong!", err);

                });


            ///////----------------------//////


        })

    .catch(function(err) {
        console.log("Something went wrong!", err);
    });


};

// PASAR A GRADOS CELSIUS---------------------->
function temperaturaEnCelsius(kelvin) {
    let celsius = parseInt(kelvin - 273.5);
    return celsius;
}


// ARMAR HTML------------------------>
function armarHtml() {
    divContenedor.innerHTML = `<div class="row col-xs-12  mt-5">
    <div class="card " id="card" style="width: 18rem;" >
    
    <div class="card-body">
    
    <img src="https://openweathermap.org/img/wn/${png}@2x.png" alt="foto" id="icon">
    <p id="pcurrent" class="card-text text-center">${estadoDelTiempo}<br/>${temperaturaActual}°C</p>
    
    
    </div>
    <ul class="list-group list-group-flush">
        <li class="list-group-item text-center">Max.: ${tempMax}°C</li>
        <li class="list-group-item text-center">Min.: ${tempMin}°C</li>
        <li class="list-group-item text-center">Humidity: ${humedad}%</li>
        <li class="list-group-item text-center">Feels like: ${sTermica}°C</li>
        <li class="list-group-item text-center">Pressure: ${presionAt}</li>
        <li class="list-group-item text-center">Wind: ${viento}m/s</li>
    </ul>
   </div>
    </div>`;
    d.querySelector(`main`).append(divContenedor);

}

// ARMAR HTML CON DATOS DE LOCAL STORAGE---------------------->
function armarConLocal() {
    divContenedor.innerHTML = `<div class="row col-xs-12  mt-5">
    <div class="card " id="card" style="width: 18rem;" >
    
    <div class="card-body">
    
    <img src="https://openweathermap.org/img/wn/${city.img}@2x.png" alt="foto" id="icon">
    <p id="pcurrent" class="card-text text-center">${city.clima}<br/>${city.temperatura}°C</p>
    
    
    </div>
    <ul class="list-group list-group-flush">
        <li class="list-group-item text-center">Max.: ${city.tMax}°C</li>
        <li class="list-group-item text-center">Min.: ${city.tMin}°C</li>
        <li class="list-group-item text-center">Humidity: ${city.humedad}%</li>
        <li class="list-group-item text-center">Feels like: ${city.sensacionTermica}°C</li>
        <li class="list-group-item text-center">Pressure: ${city.presion}</li>
        <li class="list-group-item text-center">Wind: ${city.viento}m/s</li>
    </ul>
   </div>
    </div>`;
    d.querySelector(`main`).append(divContenedor);

};


//MOSTRAR VIDEOS DIURNOS DE FONDO----------------------->
function video(estado) {

    switch (estado) {
        case `Clouds`:
            divVIdeo.innerHTML = `<video src="video/clouds.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
        case `Rain`:
            divVIdeo.innerHTML = `<video src="video/rain.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
        case `Clear`:
            divVIdeo.innerHTML = `<video src="video/clear.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
        case `Snow`:
            divVIdeo.innerHTML = `<video src="video/snow.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
        case `Thunderstorm`:
            divVIdeo.innerHTML = `<video src="video/thunder.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
        default:
            divVIdeo.innerHTML = `<video src="video/clouds.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
    }
}



//MOSTRAR VIDEOS NOCTURBOS DE FONDO----------------------->
function videoNoche(estado) {

    switch (estado) {
        case `Clouds`:
            divVIdeo.innerHTML = `<video src="video/noche/cloudsnoche.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
        case `Rain`:
            divVIdeo.innerHTML = `<video src="video/noche/lluvianoche.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
        case `Clear`:
            divVIdeo.innerHTML = `<video src="video/noche/clearnoche.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
        case `Snow`:
            divVIdeo.innerHTML = `<video src="video/noche/nievenoche.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
        case `Thunderstorm`:
            divVIdeo.innerHTML = `<video src="video/noche/tormentanoche.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
        default:
            divVIdeo.innerHTML = `<video src="video/noche/cloudsnoche.mp4" autoplay muted loop></video>`;
            d.querySelector(`main`).append(divVIdeo);
            break;
    }
}
