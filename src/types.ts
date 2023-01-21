export interface DevicesResponse {
    items?: (ItemsEntity)[] | null;
    _links: Links;
}
export interface ItemsEntity {
    deviceId: string;
    name: string;
    label: string;
    manufacturerName: string;
    presentationId: string;
    deviceManufacturerCode: string;
    locationId: string;
    ownerId: string;
    roomId: string;
    deviceTypeName: string;
    components?: (ComponentsEntity)[] | null;
    createTime: string;
    profile: Profile;
    ocf: Ocf;
    type: string;
    restrictionTier: number;
    allowed?: (null)[] | null;
}
export interface ComponentsEntity {
    id: string;
    label: string;
    capabilities?: (CapabilitiesEntity)[] | null;
    categories?: (CategoriesEntity)[] | null;
}
export interface CapabilitiesEntity {
    id: string;
    version: number;
}
export interface CategoriesEntity {
    name: string;
    categoryType: string;
}
export interface Profile {
    id: string;
}
export interface Ocf {
    ocfDeviceType: string;
    name: string;
    specVersion: string;
    verticalDomainSpecVersion: string;
    manufacturerName: string;
    modelNumber: string;
    platformVersion: string;
    platformOS: string;
    hwVersion: string;
    firmwareVersion: string;
    vendorId: string;
    locale: string;
    lastSignupTime: string;
}
export interface Links {
}
