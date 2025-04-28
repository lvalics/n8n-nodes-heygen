import { HeyGenApi } from './credentials/HeyGenApi.credentials';
import { HeyGen } from './nodes/HeyGen/HeyGen.node';

export {
    HeyGenApi,
    HeyGen,
};

export const credentials = [HeyGenApi];
export const nodes = [HeyGen];
