import { FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '@/utils/custom.errors';
import { buildPaginationMeta } from '@/shared/schemas';
import { locationsServices } from './locations.services';
import {
  GetCountryRequest,
  GetIslandRequest,
  GetMunicipalityRequest,
  GetParishRequest,
  GetPlaceRequest,
  GetZoneRequest,
  ListCountriesRequest,
  ListIslandsRequest,
  ListMunicipalitiesRequest,
  ListParishesRequest,
  ListPlacesRequest,
  ListZonesRequest,
} from './locations.schemas';

async function listCountries(req: ListCountriesRequest, reply: FastifyReply) {
  const { limit, offset } = req.query;
  const { result, total } = await locationsServices.listCountries(
    req.db,
    limit,
    offset,
  );

  return reply.code(StatusCodes.OK).send({
    data: result,
    meta: buildPaginationMeta(total, limit, offset, result.length),
  });
}

async function getCountry(req: GetCountryRequest, reply: FastifyReply) {
  const country = await locationsServices.getCountryById(
    req.db,
    req.params.id,
  );

  if (!country) throw new NotFoundError();

  return reply.code(StatusCodes.OK).send({ data: country });
}

async function listIslands(req: ListIslandsRequest, reply: FastifyReply) {
  const { limit, offset, countryId } = req.query;
  const { result, total } = await locationsServices.listIslands(
    req.db,
    limit,
    offset,
    countryId,
  );

  return reply.code(StatusCodes.OK).send({
    data: result,
    meta: buildPaginationMeta(total, limit, offset, result.length),
  });
}

async function getIsland(req: GetIslandRequest, reply: FastifyReply) {
  const island = await locationsServices.getIslandById(
    req.db,
    req.params.id,
  );

  if (!island) throw new NotFoundError();

  return reply.code(StatusCodes.OK).send({ data: island });
}

async function listMunicipalities(
  req: ListMunicipalitiesRequest,
  reply: FastifyReply,
) {
  const { limit, offset, islandId } = req.query;
  const { result, total } = await locationsServices.listMunicipalities(
    req.db,
    limit,
    offset,
    islandId,
  );

  return reply.code(StatusCodes.OK).send({
    data: result,
    meta: buildPaginationMeta(total, limit, offset, result.length),
  });
}

async function getMunicipality(
  req: GetMunicipalityRequest,
  reply: FastifyReply,
) {
  const municipality = await locationsServices.getMunicipalityById(
    req.db,
    req.params.id,
  );

  if (!municipality) throw new NotFoundError();

  return reply.code(StatusCodes.OK).send({ data: municipality });
}

async function listParishes(req: ListParishesRequest, reply: FastifyReply) {
  const { limit, offset, municipalityId } = req.query;
  const { result, total } = await locationsServices.listParishes(
    req.db,
    limit,
    offset,
    municipalityId,
  );

  return reply.code(StatusCodes.OK).send({
    data: result,
    meta: buildPaginationMeta(total, limit, offset, result.length),
  });
}

async function getParish(req: GetParishRequest, reply: FastifyReply) {
  const parish = await locationsServices.getParishById(
    req.db,
    req.params.id,
  );

  if (!parish) throw new NotFoundError();

  return reply.code(StatusCodes.OK).send({ data: parish });
}

async function listZones(req: ListZonesRequest, reply: FastifyReply) {
  const { limit, offset, parishId } = req.query;
  const { result, total } = await locationsServices.listZones(
    req.db,
    limit,
    offset,
    parishId,
  );

  return reply.code(StatusCodes.OK).send({
    data: result,
    meta: buildPaginationMeta(total, limit, offset, result.length),
  });
}

async function getZone(req: GetZoneRequest, reply: FastifyReply) {
  const zone = await locationsServices.getZoneById(req.db, req.params.id);

  if (!zone) throw new NotFoundError();

  return reply.code(StatusCodes.OK).send({ data: zone });
}

async function listPlaces(req: ListPlacesRequest, reply: FastifyReply) {
  const { limit, offset, zoneId } = req.query;
  const { result, total } = await locationsServices.listPlaces(
    req.db,
    limit,
    offset,
    zoneId,
  );

  return reply.code(StatusCodes.OK).send({
    data: result,
    meta: buildPaginationMeta(total, limit, offset, result.length),
  });
}

async function getPlace(req: GetPlaceRequest, reply: FastifyReply) {
  const place = await locationsServices.getPlaceById(req.db, req.params.id);

  if (!place) throw new NotFoundError();

  return reply.code(StatusCodes.OK).send({ data: place });
}

export const locationsControllers = {
  listCountries,
  getCountry,
  listIslands,
  getIsland,
  listMunicipalities,
  getMunicipality,
  listParishes,
  getParish,
  listZones,
  getZone,
  listPlaces,
  getPlace,
};
