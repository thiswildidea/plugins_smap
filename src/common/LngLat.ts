export default class LngLat {
    public X: number;
    public Y: number;
    public Z: number;
    constructor(x: number, y: number, z?: number) {
        this.X = x;
        this.Y = y;
        this.Z = z === undefined ? 0 : z;
    }
}
