import IConOption from '../interface/IConOption';
import Size from '../Overlays/Size';
export default class Icon {
   public size: Size;
   public image: string;
   constructor(iconOption: IConOption) {
        this.size = iconOption.size;
        this.image = iconOption.image;
    }
}
