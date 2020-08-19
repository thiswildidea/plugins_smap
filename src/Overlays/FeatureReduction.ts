import IFeatureReductionOption from '../interface/IFeatureReductionOption';
export default class FeatureReduction {
    public type: string = 'text';
    public clusterRadius: number;
    public clusterConfig: any;
    public constructor(froption: IFeatureReductionOption) {
        this.type = froption.type === undefined ? 'cluster' : froption.type;
        this.clusterRadius = froption.clusterRadius === undefined ? 100 : froption.clusterRadius;
        this.clusterConfig = froption.clusterConfig === undefined ? null : froption.clusterConfig;
    }
}
