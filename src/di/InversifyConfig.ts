import 'reflect-metadata';

import { Container } from 'inversify';
import { TYPES } from './Types';
import { ILicenseKeyService, LicenseKeyService } from '../service/LicenseKeyService';
import { ILicenseKeyRepository, LicenseKeyRepository } from '../repository/LicenseKeyRepository';


const container = new Container();

container
    .bind<ILicenseKeyService>(TYPES.LicenseKeyService)
    .to(LicenseKeyService);

container
    .bind<ILicenseKeyRepository>(TYPES.LicenseKeyRepository)
    .to(LicenseKeyRepository);

export default container;
