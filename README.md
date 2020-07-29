# smap-plugins-shsmi
上海市测绘院smap jsapi 扩展模块功能集

## 注意事项
由于smap-plugins-shsmi 属于smap-shsmi或者smap-shsmi-aa扩展模块,再使用过程中需要先引用smap-shsmi或者smap-shsmi-aa。

## 目录
- [轨迹播放](#轨迹播放)
   - [轨迹播放调用示例](#轨迹播放调用示例)
      - [三维轨迹播放](#三维轨迹播放)
      - [二维轨迹播放](#二维轨迹播放)
      - [清除轨迹播放](#清除轨迹播放)
   - [轨迹播放参数说明](#轨迹播放参参数说明)
- [轨迹播放Plus](#漫游)
   - [轨迹播放Plus调用示例](#轨迹播放Plus调用示例)
      - [三维轨迹播放Plus](#三维轨迹播放Plus)
      - [二维轨迹播放Plus](#二维轨迹播放Plus)
      - [清除轨迹播放Plus](#清除轨迹播放Plus)
   - [轨迹播放Plus参数说明](#轨迹播放Plus参数说明)
- [迁徙图](#迁徙图)
   - [迁徙图调用示例](#迁徙图调用示例)
     - [添加迁徙图](#添加迁徙图)
     - [移除迁徙图](#移除迁徙图)
   - [迁徙图参数说明](#迁徙图参数说明)

## 轨迹播放
### 轨迹播放调用示例
#### 三维轨迹播放
```js
import SMap from 'smap-shsmi' // 引用SMAP
import Plugins from 'smap-plugins-shsmi' // 引用Plugins
 const map = new SMap.Map('container', {
        viewMode: '3D',
        center: [0, 0],
        zoom: 4,
        zooms: [0, 12],
        pitch: 60,
        mapStyle: 'smap://styles/dark',
        showBuildingBlock: true
      })
```
```js
      const routedata = [
        {
          x: 358.5185,
          y: -77.2235
        },
        {
          x: 267.4522,
          y: 99.1188
        },
        {
          x: 234.90484,
          y: 212.834811
        },
        {
          x: 181.7233,
          y: 381.1000
        },
        {
          x: 138.1169,
          y: 527.79151
        },
        {
          x: 88.0071,
          y: 647.4898
        },
        {
          x: 63.1774,
          y: 692.2989
        },
        {
          x: 94.5310,
          y: 706.0872
        },
        {
          x: 143.59157,
          y: 595.3354
        },
        {
          x: 182.1127,
          y: 481.7369
        },
        {
          x: 223.4553,
          y: 323.6532
        },
        {
          x: 248.4933,
          y: 203.5321
        },
        {
          x: 325.065,
          y: 31.37497
        },
        {
          x: 546.1844,
          y: -355.09700
        }
      ]
      const trajectory = new Plugins.Trajectory(map.view)
      trajectory.play({
        coords: routedata,
        showtrail: true,
        trailsymbol: {
          type: 'simple-line',
          color: [255, 255, 255, 0.5],
          width: '10px',
          style: 'solid'
        },
        mobilesymbol: {
          type: 'point-3d',
          symbolLayers: [{
            type: 'icon',
            size: '50px',
            resource: {
              href: require('@/assets/car.png')
            }
          }],
          verticalOffset: {
            screenLength: 50,
            maxWorldLength: 2000,
            minWorldLength: 20
          },
          callout: {
            type: 'line',
            color: [0, 0, 0],
            size: 2,
            border: {
              color: [255, 255, 255]
            }
          }
          }
        })
```
![三维轨迹播放](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/3d/%E8%BD%A8%E8%BF%B9%E6%92%AD%E6%94%BE/trajectoryplayback.png)
![三维轨迹播放](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/3d/%E8%BD%A8%E8%BF%B9%E6%92%AD%E6%94%BE/trajectoryplayback1.png)
![三维轨迹播放](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/3d/%E8%BD%A8%E8%BF%B9%E6%92%AD%E6%94%BE/trajectory.gif)
#### 二维轨迹播放
```js
import SMap from 'smap-shsmi' // 引用SMAP
import Plugins from 'smap-plugins-shsmi' // 引用Plugins
 const map = new SMap.Map('container', {
        viewMode: '2D',
        center: [0, 0],
        zoom: 4,
        zooms: [0, 12],
        mapStyle: 'smap://styles/dark'
      })
```
```js
      const routedata = [
        {
          x: 358.5185,
          y: -77.2235
        },
        {
          x: 267.4522,
          y: 99.1188
        },
        {
          x: 234.90484,
          y: 212.834811
        },
        {
          x: 181.7233,
          y: 381.1000
        },
        {
          x: 138.1169,
          y: 527.79151
        },
        {
          x: 88.0071,
          y: 647.4898
        },
        {
          x: 63.1774,
          y: 692.2989
        },
        {
          x: 94.5310,
          y: 706.0872
        },
        {
          x: 143.59157,
          y: 595.3354
        },
        {
          x: 182.1127,
          y: 481.7369
        },
        {
          x: 223.4553,
          y: 323.6532
        },
        {
          x: 248.4933,
          y: 203.5321
        },
        {
          x: 325.065,
          y: 31.37497
        },
        {
          x: 546.1844,
          y: -355.09700
        }
      ]
      const trajectory = new Plugins.Trajectory(map.view)
      trajectory.play({
        coords: routedata,
        showtrail: true,
        trailsymbol: {
          type: 'simple-line',
          color: [255, 255, 255, 0.5],
          width: '10px',
          style: 'solid'
        },
        mobilesymbol: {
          type: 'picture-marker',
          url: require('@/assets/car.png'),
          width: '64px',
          height: '64px'
          }
        })
```
![二维轨迹播放](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/2d/%E8%BD%A8%E8%BF%B9%E6%92%AD%E6%94%BE/trajectoryplayback.png)
![二维轨迹播放](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/2d/%E8%BD%A8%E8%BF%B9%E6%92%AD%E6%94%BE/trajectoryplayback1.png)
![二维轨迹播放](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/2d/%E8%BD%A8%E8%BF%B9%E6%92%AD%E6%94%BE/trajectoryplayback.gif)
#### 清除轨迹播放
```js
trajectory.remove()
```
### 轨迹播放参数说明
```js
coords：轨迹坐标（上海坐标系统） //二三维都不支持Z（高程）值
showtrail: 是否显示轨迹
trailsymbol： 轨迹符号   //二三维模式下自行定义 参考以上示例
mobilesymbol：移动符号 //二三维模式下自行定义  参考以上示例
```
## 轨迹播放Plus
### 轨迹播放Plus调用示例
#### 三维轨迹播放Plus
```js
import SMap from 'smap-shsmi' // 引用SMAP
import Plugins from 'smap-plugins-shsmi' // 引用Plugins
 const map = new SMap.Map('container', {
        viewMode: '3D',
        center: [0, 0],
        zoom: 4,
        zooms: [0, 12],
        pitch: 60,
        mapStyle: 'smap://styles/dark',
        showBuildingBlock: true
      })
```
```js
  const routedata = [
        {
          x: 358.5185,
          y: -77.2235,
          z: 1000   //z 值有效
        },
        {
          x: 267.4522,
          y: 99.1188,
          z: 900
        },
        {
          x: 234.90484,
          y: 212.834811,
          z: 800
        },
        {
          x: 181.7233,
          y: 381.1000,
          z: 700
        },
        {
          x: 138.1169,
          y: 527.79151,
          z: 600
        },
        {
          x: 88.0071,
          y: 647.4898,
          z: 500
        },
        {
          x: 63.1774,
          y: 692.2989,
          z: 400
        },
        {
          x: 94.5310,
          y: 706.0872,
          z: 300
        },
        {
          x: 143.59157,
          y: 595.3354,
          z: 200
        },
        {
          x: 182.1127,
          y: 481.7369,
          z: 100
        },
        {
          x: 223.4553,
          y: 323.6532,
          z: 0
        },
        {
          x: 248.4933,
          y: 203.5321,
          z: 100
        },
        {
          x: 325.065,
          y: 31.37497,
          z: 200
        },
        {
          x: 546.1844,
          y: -355.09700,
          z: 300
        }
      ]
      const trajectoryplus = new Plugins.TrajectoryPlus(map.view)
      trajectoryplus.play({
        duration: 3000,
        speedFactor: 1,
        coords: routedata,
        showtrail: true,
        trailsymbol: {
          type: 'simple-line',
          color: [255, 255, 255, 0.5],
          width: '10px',
          style: 'solid'
        },
        mobilesymbol: {
          type: 'point-3d',
          symbolLayers: [{
            type: 'icon',
            size: '50px',
            resource: {
              href: require('@/assets/car.png')
            }
          }],
          verticalOffset: {
            screenLength: 50,
            maxWorldLength: 2000,
            minWorldLength: 20
          },
          callout: {
            type: 'line',
            color: [0, 0, 0],
            size: 2,
            border: {
              color: [255, 255, 255]
            }
          }
          }
        })
```
![三维轨迹播放](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/3d/%E8%BD%A8%E8%BF%B9%E6%92%AD%E6%94%BE/trajectoryPlus.png)
![三维轨迹播放](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/3d/%E8%BD%A8%E8%BF%B9%E6%92%AD%E6%94%BE/trajectoryPlus.gif)
#### 二维轨迹播放Plus
```js
import SMap from 'smap-shsmi' // 引用SMAP
import Plugins from 'smap-plugins-shsmi' // 引用Plugins
 const map = new SMap.Map('container', {
        viewMode: '2D',
        center: [0, 0],
        zoom: 4,
        zooms: [0, 11]
        mapStyle: 'smap://styles/dark'
      })
```
```js
  const routedata = [
        {
          x: 358.5185,
          y: -77.2235,
          z: 1000  //2D中z值不生效
        },
        {
          x: 267.4522,
          y: 99.1188,
          z: 900
        },
        {
          x: 234.90484,
          y: 212.834811,
          z: 800
        },
        {
          x: 181.7233,
          y: 381.1000,
          z: 700
        },
        {
          x: 138.1169,
          y: 527.79151,
          z: 600
        },
        {
          x: 88.0071,
          y: 647.4898,
          z: 500
        },
        {
          x: 63.1774,
          y: 692.2989,
          z: 400
        },
        {
          x: 94.5310,
          y: 706.0872,
          z: 300
        },
        {
          x: 143.59157,
          y: 595.3354,
          z: 200
        },
        {
          x: 182.1127,
          y: 481.7369,
          z: 100
        },
        {
          x: 223.4553,
          y: 323.6532,
          z: 0
        },
        {
          x: 248.4933,
          y: 203.5321,
          z: 100
        },
        {
          x: 325.065,
          y: 31.37497,
          z: 200
        },
        {
          x: 546.1844,
          y: -355.09700,
          z: 300
        }
      ]
      const trajectoryplus = new Plugins.TrajectoryPlus(map.view)
      trajectoryplus.play({
        duration: 3000,
        speedFactor: 1,
        coords: routedata,
        showtrail: true,
        trailsymbol: {
          type: 'simple-line',
          color: [255, 255, 255, 0.5],
          width: '10px',
          style: 'solid'
        },
        mobilesymbol: {
           type: 'picture-marker',
           url: require('@/assets/car.png'),
           width: '64px',
           height: '64px'
          }
        })
```
![二维轨迹播放](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/2d/%E8%BD%A8%E8%BF%B9%E6%92%AD%E6%94%BE/trajectoryplus.gif)
### 轨迹播放Plus参数说明
```js
duration: 3000  //移动持续时间
speedFactor: 1  //移动速度
coords：轨迹坐标（上海坐标系统） //三维支持Z值
showtrail: 是否显示轨迹
trailsymbol： 轨迹符号   //二三维模式下自行定义 参考以上示例
mobilesymbol：移动符号 //二三维模式下自行定义  参考以上示例
```
## 迁徙图
### 迁徙图调用示例
#### 添加迁徙图
```js
import SMap from 'smap-shsmi' // 引用SMAP
import Plugins from 'smap-plugins-shsmi' // 引用Plugins
 const map = new SMap.Map('container', {
        viewMode: '3D', // '2D'
        center: [0, 0],
        zoom: 4,
        zooms: [0, 11],
        pitch: 60,   //三维生效
        mapStyle: 'smap://styles/dark',
        showBuildingBlock: true //三维生效
      })
```
```js
 const migrationMap = new Plugins.MigrationMap(map.view)
 const geoCoordMap = {
        '浦东区': [21704.88, -10564.32],
        '奉贤区': [6530.67, -36110.78],
        '金山区': [-22281.12, -45138.47],
        '松江区': [-27275.16, -25354.37],
        '青浦区': [-34189.99, -7491.07],
        '闵行区': [-3073.26, -17863.31],
        '徐汇区': [-2719.02, -6646.5],
        '长宁区': [-8459.18, -3172.19],
        '黄浦区': [1812.68, -1611.27],
        '普陀区': [-6344.38, 2719.02],
        '闸北区': [-2064.44, 5740.16],
        '虹口区': [1913.39, 4128.88],
        '杨浦区': [5488.4, 7804.6],
        '嘉定区': [-20936.57, 15750.44],
        '崇明区': [4225.73, 46675.1],
        '静安区': [-2265.85, -654.68],
        '宝山区': [-4417.81, 19207.86]
      }
const PDData = [
        [{
          name: '浦东区'
        }, {
          name: '嘉定区',
          value: 95
        }],
        [{
          name: '浦东区'
        }, {
          name: '静安区',
          value: 90
        }],
        [{
          name: '浦东区'
        }, {
          name: '金山区',
          value: 80
        }],
        [{
          name: '浦东区'
        }, {
          name: '徐汇区',
          value: 70
        }],
        [{
          name: '浦东区'
        }, {
          name: '杨浦区',
          value: 60
        }],
        [{
          name: '浦东区'
        }, {
          name: '崇明区',
          value: 50
        }],
        [{
          name: '浦东区'
        }, {
          name: '虹口区',
          value: 40
        }],
        [{
          name: '浦东区'
        }, {
          name: '长宁区',
          value: 30
        }],
        [{
          name: '浦东区'
        }, {
          name: '普陀区',
          value: 20
        }],
        [{
          name: '浦东区'
        }, {
          name: '青浦区',
          value: 10
        }]
      ]
const JDData = [
        [{
          name: '嘉定区'
        }, {
          name: '青浦区',
          value: 95
        }],
        [{
          name: '嘉定区'
        }, {
          name: '普陀区',
          value: 90
        }],
        [{
          name: '嘉定区'
        }, {
          name: '虹口区',
          value: 80
        }],
        [{
          name: '嘉定区'
        }, {
          name: '闸北区',
          value: 70
        }],
        [{
          name: '嘉定区'
        }, {
          name: '徐汇区',
          value: 60
        }],
        [{
          name: '嘉定区'
        }, {
          name: '杨浦区',
          value: 50
        }],
        [{
          name: '嘉定区'
        }, {
          name: '崇明区',
          value: 40
        }],
        [{
          name: '嘉定区'
        }, {
          name: '宝山区',
          value: 30
        }],
        [{
          name: '嘉定区'
        }, {
          name: '浦东区',
          value: 20
        }],
        [{
          name: '嘉定区'
        }, {
          name: '长宁区',
          value: 10
        }]
      ]
const XHData = [
        [{
          name: '徐汇区'
        }, {
          name: '浦东区',
          value: 95
        }],
        [{
          name: '徐汇区'
        }, {
          name: '嘉定区',
          value: 90
        }],
        [{
          name: '徐汇区'
        }, {
          name: '崇明区',
          value: 80
        }],
        [{
          name: '徐汇区'
        }, {
          name: '长宁区',
          value: 70
        }],
        [{
          name: '徐汇区'
        }, {
          name: '闵行区',
          value: 60
        }],
        [{
          name: '徐汇区'
        }, {
          name: '闸北区',
          value: 50
        }],
        [{
          name: '徐汇区'
        }, {
          name: '金山区',
          value: 40
        }],
        [{
          name: '徐汇区'
        }, {
          name: '普陀区',
          value: 30
        }],
        [{
          name: '杨浦区'
        }, {
          name: '普陀区',
          value: 20
        }],
        [{
          name: '徐汇区'
        }, {
          name: '奉贤区',
          value: 10
        }]
      ]
  const planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z'
  const color = ['#a6c84c', '#ffa022', '#46bee9']
  migrationMap.add({
        id: 'echart',
        symbol: 'diamond',
        geoCoordMap: geoCoordMap,
        planePath: planePath,
        color: color,
        datas: [
          ['浦东区', PDData],
          ['嘉定区', JDData],
          ['徐汇区', XHData]
        ]
      })
```
![三维迁徙图](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/3d/%E8%BF%81%E7%A7%BB%E5%9B%BE/MigrationMap.png)
![三维迁徙图](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/3d/%E8%BF%81%E7%A7%BB%E5%9B%BE/MigrationMap.gif)
![二维迁徙图](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/2d/%E8%BF%81%E7%A7%BB%E5%9B%BE/MigrationMap.png)
![二维迁徙图](https://gitee.com/thiswildidea/images/raw/master/smiapi/ts/4x/2d/%E8%BF%81%E7%A7%BB%E5%9B%BE/MigrationMap.gif)
#### 移除迁徙图
```js
 migrationMap.remove('echart')
```
### 迁徙图参数说明
```js
  id:  //迁移图id 对应对应cavasid
  symbol: // 闪烁点样式 支持以下几种类型格式

  symbol: 'diamond', //'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow',
  symbol: 'image://data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7'
  symbol:'path://M30.9,53.2C16.8,53.2,5.3,41.7,5.3,27.6S16.8,2,30.9,2C45,2,56.4,13.5,56.4,27.6S45,53.2,30.9,53.2z M30.9,3.5C17.6,3.5,6.8,14.4,6.8,27.6c0,13.3,10.8,24.1,24.101,24.1C44.2,51.7,55,40.9,55,27.6C54.9,14.4,44.1,3.5,30.9,3.5z M36.9,35.8c0,0.601-0.4,1-0.9,1h-1.3c-0.5,0-0.9-0.399-0.9-1V19.5c0-0.6,0.4-1,0.9-1H36c0.5,0,0.9,0.4,0.9,1V35.8z M27.8,35.8 c0,0.601-0.4,1-0.9,1h-1.3c-0.5,0-0.9-0.399-0.9-1V19.5c0-0.6,0.4-1,0.9-1H27c0.5,0,0.9,0.4,0.9,1L27.8,35.8L27.8,35.8z',
  
  geoCoordMap:// 位置坐标字典
  planePath: //飞行样式,
  color:  //多类别颜色,
  datas:  //类别数据
```
