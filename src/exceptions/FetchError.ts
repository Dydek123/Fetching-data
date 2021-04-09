export class FetchError extends Error{
    constructor(message:string) {
        super(message);
        this.name = 'Fetch Error';
        Object.setPrototypeOf(this, FetchError.prototype)
    }
}