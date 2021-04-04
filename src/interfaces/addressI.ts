import geolocationI from "./geolocationI";

export default interface addressI {
    street: string,
    suite: string,
    city: string,
    zipcode: string,
    geo: geolocationI
}