import { FastifyInstance } from 'fastify';
import { locationsControllers } from './locations.controllers';
import {
  getCountry,
  getIsland,
  getMunicipality,
  getParish,
  getPlace,
  getZone,
  listCountries,
  listIslands,
  listMunicipalities,
  listParishes,
  listPlaces,
  listZones,
} from './locations.schemas';

export async function locationsRoutes(server: FastifyInstance) {
  server.get('/countries', {
    schema: listCountries,
    handler: locationsControllers.listCountries,
  });
  server.get('/countries/:id', {
    schema: getCountry,
    handler: locationsControllers.getCountry,
  });

  server.get('/islands', {
    schema: listIslands,
    handler: locationsControllers.listIslands,
  });
  server.get('/islands/:id', {
    schema: getIsland,
    handler: locationsControllers.getIsland,
  });

  server.get('/municipalities', {
    schema: listMunicipalities,
    handler: locationsControllers.listMunicipalities,
  });
  server.get('/municipalities/:id', {
    schema: getMunicipality,
    handler: locationsControllers.getMunicipality,
  });

  server.get('/parishes', {
    schema: listParishes,
    handler: locationsControllers.listParishes,
  });
  server.get('/parishes/:id', {
    schema: getParish,
    handler: locationsControllers.getParish,
  });

  server.get('/zones', {
    schema: listZones,
    handler: locationsControllers.listZones,
  });
  server.get('/zones/:id', {
    schema: getZone,
    handler: locationsControllers.getZone,
  });

  server.get('/places', {
    schema: listPlaces,
    handler: locationsControllers.listPlaces,
  });
  server.get('/places/:id', {
    schema: getPlace,
    handler: locationsControllers.getPlace,
  });
}
