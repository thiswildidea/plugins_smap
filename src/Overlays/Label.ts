import ILabelOption from '../interface/ILabelOption';
export default class Label {
   public type: string = 'text';
   public text: string;
   public color: string = 'white';
   public visible: boolean = true;
   public size: number = 12;
   public weight: string = 'normal';
   public angle: number = 0;
   public backgroundColor: string = 'red';
   public borderLineColor: string = 'blue';
   public borderLineSize: number = 200;
   public haloColor: string = 'yellow';
   public haloSize: number = 20;
   public horizontalAlignment: string = 'right';
   public verticalAlignment: string = 'top';
   public kerning: boolean = true;
   public lineHeight: number = 25;
   public lineWidth: number = 200;
   public rotated: boolean = false;
   public xoffset: number = 0;
   public yoffset: number = 0;
   public zoffset: number = 0;
   public placement: string = "above-right";
   public maxScale: number = 0;
   public minScale: number = 0;
   public labelingInfo: any = null; // new
   public constructor(labeloption: ILabelOption) {
        this.text = labeloption.text === undefined ? '标注' : labeloption.text;
        this.color = labeloption.color === undefined ? 'white' : labeloption.color;
        this.visible = labeloption.visible === undefined ? true : labeloption.visible;
        this.size = labeloption.size === undefined ? 12 : labeloption.size;
        this.weight = labeloption.weight === undefined ? 'normal' : labeloption.weight;
        this.angle = labeloption.angle === undefined ? 0 : labeloption.angle;
        this.backgroundColor = labeloption.backgroundColor === undefined ? 'red' : labeloption.backgroundColor;
        this.borderLineColor = labeloption.borderLineColor === undefined ? 'blue' : labeloption.borderLineColor;
        this.borderLineSize = labeloption.borderLineSize === undefined ? 200 : labeloption.borderLineSize;
        this.haloColor = labeloption.haloColor === undefined ? 'yellow' : labeloption.haloColor;
        this.haloSize = labeloption.haloSize === undefined ? 0 : labeloption.haloSize;
        this.horizontalAlignment = labeloption.horizontalAlignment === undefined ? 'right' :
        labeloption.horizontalAlignment;
        this.verticalAlignment = labeloption.verticalAlignment === undefined ? 'top' :
            labeloption.verticalAlignment;
        this.kerning = labeloption.kerning === undefined ? true : labeloption.kerning;
        this.lineHeight = labeloption.lineHeight === undefined ? 25 : labeloption.lineHeight;
        this.lineWidth = labeloption.lineWidth === undefined ? 200 : labeloption.lineWidth;
        this.rotated = labeloption.rotated === undefined ? false : labeloption.rotated;
        this.xoffset = labeloption.xoffset === undefined ? 0 : labeloption.xoffset;
        this.yoffset = labeloption.yoffset === undefined ? 0 : labeloption.yoffset;
        this.zoffset = labeloption.zoffset === undefined ? 0 : labeloption.zoffset;
        this.placement = labeloption.placement === undefined ? "center-right" : labeloption.placement;
        this.maxScale = labeloption.maxScale === undefined ? 0 : labeloption.maxScale;
        this.minScale = labeloption.minScale === undefined ? 0 : labeloption.minScale;
        this.labelingInfo = labeloption.labelingInfo;
    }
}
