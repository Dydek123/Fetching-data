import addressI from "./addressI";
import companyI from "./companyI";
import postI from "./postI";

export default interface dataI {
    id: number,
    name: string,
    username: string,
    email: string,
    address: addressI,
    phone: string,
    website: string,
    company: companyI,
    posts?: postI[]
}