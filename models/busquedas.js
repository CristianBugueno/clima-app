import fs from 'fs';
import dotenv from 'dotenv';
        dotenv.config();
import axios from 'axios';

class Busquedas{

    historial = [];
    dbPath = './db/database.json';

    constructor(){
        //TODO: leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado(){
        //Capitalizar cada palabra
        return this.historial.map (lugar =>{
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');
        })
    }

    get paramsMapbox(){
        return{
            'access_token': process.env.MAPBOX_KEY,
            'limit':5,
            'languaje': 'es'
        }
    }

    get paramsOpenWeather(){
        return{
            'appid': process.env.OPEMWEATHER_KEY,
            'lat':'-33.437776',
            'lon':'-70.65045'
        }
    }

    async ciudad(lugar = ''){

        try {
            //petición http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();
            return resp.data.features.map(lugar =>({  //retornar los lugares
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
            
        } catch (error) {
            return [];
        }

    }

    async climaLugar(lat,lon){
        try {
            //petición http
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather, lat, lon}
            });

            const resp = await instance.get();
            const {weather, main} = resp.data;

            return{
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    async agregarHistorial (lugar =''){

        if(this.historial.includes (lugar.toLocaleLowerCase())){
            return;
        }

        this.historial.unshift(lugar.toLocaleLowerCase());

        //Grabar en DB
        this.guardarBD();
    }

    guardarBD(){
        const payload = {
            historial: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify (payload));
    }

    leerDB(){
        //si no existe
        if(!fs.existsSync(this.dbPath)) return;

        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);

        this.historial = data.historial;

    }


}

export {
    Busquedas
} 