export default interface IMaskOptions {
    boundaryType: string;
    boundaryDefinition: string;
    boundarydistance: number;
    bounarycount: number;
    boundaryColor: any;
    maskColor: any;
    inputgeometry: any;
    symbol: {
        size: number,
        type: string
    };
}
