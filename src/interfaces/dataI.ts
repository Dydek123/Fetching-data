import addressI from "./addressI";
import companyI from "./companyI";

export default interface dataI {
    post_title: string,
    post_body: string,
    name: string,
    username: string,
    email: string,
    address: addressI,
    phone: string,
    website: string,
    company: companyI
}