export default  class Guid {
    public uuid: string;
    constructor() {
        this.uuid = this.get_uuid();
    }
    public S4() {
        // tslint:disable-next-line:no-bitwise
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    public get_uuid() {
        return (this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() +
            "-" + this.S4() + this.S4() + this.S4());
    }
}
