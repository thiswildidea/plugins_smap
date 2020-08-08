import IMarkOptions from '../interface/IMarkOptions';
import IOverlayerOptions from '../interface/IOverlayerOptions';
import Icon from '../Overlays/Icon';
import Guid from '../utils/Guid';
import Overlayerbase from './Overlayerbase';
export default class Marker extends Overlayerbase {
  public icon: Icon;
  public position: [number, number, number?];
  constructor(markeroption: IMarkOptions) {
     super(markeroption);
     this.overlaytype = 'Marker';
     this.icon = markeroption.icon;
     this.position = markeroption.position;
  }
}
