import IFeatureReductionOption from '../interface/IFeatureReductionOption';
export default class FeatureReduction {
    public type: string = 'text';
    public clusterRadius: number;
    public clusterConfig: any;
    public clusterImgSrc: any;
    public criticalZoom: any;
    public clustertype: any;
    public clusterLabelPosition: any;
    public clusterLabelSym: any;
    public constructor(froption: IFeatureReductionOption) {
        this.type = froption.type === undefined ? 'cluster' : froption.type;
        this.clusterRadius = froption.clusterRadius === undefined ? 100 : froption.clusterRadius;
        this.clusterConfig = froption.clusterConfig === undefined ? null : froption.clusterConfig;
        this.clusterImgSrc = froption.clusterImgSrc;
        this.criticalZoom = froption.criticalZoom || 6;
        this.clustertype = froption.clustertype || "single";
        this.clusterLabelPosition = froption.clusterLabelPosition || "center-right";
        this.clusterLabelSym = froption.clusterLabelSym || {
            type: 'text',
            color: '#fff',
            font: {
                weight: "bold",
                size: "16px"
            }
        };
    }
}
