import React, {useState, useContext, useRef, useEffect} from "react";
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/base16-dark.css';
import {Select, Spin} from 'antd';
import ObstacleModal from "./ObstacleModal";
import EgoModal from "./EgoModal";
import MapModal from "./MapModal";

import pic2 from '../static/img/pic2.png';
import {GeoJsonLayer} from "@deck.gl/layers";
import {COORDINATE_SYSTEM} from "@deck.gl/core";
import {
    LogViewer,
    XVIZPanel,
    XVIZLiveLoader,
    VIEW_MODE,
} from "streetscape.gl";
import {XVIZ_STYLE, CAR} from "../constants";

import IndexContext from "../context";

const __HOST_IP__ = '172.16.203.135';

const {Option} = Select;

const defaultCode = '\n' +
    'map = "Town03";\n' +
    '\n' +
    'ego_init_position = (4.5, 214); //default coordinate frame is ENU\n' +
    'ego_target_position = (4.5, -200); //default coordinate frame is ENU\n' +
    'ego_init_state = (ego_init_position);\n' +
    'ego_target_state = (ego_target_position);\n' +
    '\n' +
    'car_model = "Lincoln MKZ 2017";\n' +
    'car_color = (255, 0, 0);\n' +
    'vehicle_type = (car_model, car_color);\n' +
    'ego_vehicle = AV(ego_init_state, ego_target_state, vehicle_type);\n' +
    '\n' +
    '//scenario1 = CreateScenario{load(map);\n' +
    '//         ego_vehicle;\n' +
    '//         {}; // no other vehicles;\n' +
    '//         {}; // no pedestrians;\n' +
    '//         {}; // no obstacles;\n' +
    '//         {}; // default environment\n' +
    '//         {}; // no traffic constraints\n' +
    '//};\n' +
    '\n' +
    'npc_init_state = (1->0.0, ,1.5) ;//the initial position is the start point of lane 1, the orientation of the vehicle is along with the lane direction, and the initial speed is 1.5m/s \n' +
    'motion = U(npc_init_state);\n' +
    'npc1 = Vehicle(npc_init_state, motion);\n' +
    'npc_init_state2 = (2->0.0, ,1.0);\n' +
    'npc_state = ((2->0.0, , 1.0), (2->50.0, ,1.0));\n' +
    'npc2 =Vehicle(npc_init_state2, Waypoint(npc_state), (4->100, ,0.0), vehicle_type);\n' +
    'heading = 45 deg related to EGO;\n' +
    'npc_init_state3 = ((8, 50), heading, 0.0);\n' +
    'npc3 = Vehicle(npc_init_state3);\n' +
    '\n' +
    '//npc = {npc1, npc2, npc3};\n' +
    'npc = {npc3};\n' +
    '\n' +
    'pedestrian_type = (1.65, black);\n' +
    'pedestrian = Pedestrian(((19,13), ,0.5), , ((0,13), ,0), pedestrian_type);\n' +
    'pedestrians={pedestrian};\n' +
    'time = 10:00;\n' +
    'weather = {rain: 0.1};\n' +
    'env = Environment(time, weather);\n' +
    '\n' +
    'speed_range = (0,20);\n' +
    'speed_limit = SpeedLimit(5, speed_range);\n' +
    'i1 = Intersection(1, 1, 0, 1);\n' +
    'traffic = {i1,speed_limit};\n' +
    '\n' +
    'scenario = CreateScenario{load(map);\n' +
    '        ego_vehicle;\n' +
    '        npc;\n' +
    '        pedestrians;\n' +
    '        {};\n' +
    '        env;\n' +
    '        traffic;\n' +
    '};\n';

let carlaLog, ws;
let mapLayer, mapLayerBig;
const Main = () => {
    const {operateStatus, dispatch} = useContext(IndexContext);
    const codeMirror = useRef();
    const [obstacleVisible, setObstacleVisible] = useState(false);
    const [egoVisible, setEgoVisible] = useState(false);
    const [mapVisible, setMapVisible] = useState(false);

    const [code, setCode] = useState(defaultCode);
    const [lang, setLang] = useState('scenest');
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState('');
    const [customLayers, setCustomLayers] = useState([]);
    const [bigLayers, setBigLayers] = useState([]);

    useEffect(() => {
        if(customLayers.length > 0) {
            dispatch({type: 'SET_STATUS', status: true});
        }
    }, [customLayers]);
    const handleSocket = (info) => {
        carlaLog = new XVIZLiveLoader({
            logGuid: "mock",
            bufferLength: 10,
            serverConfig: {
                defaultLogLength: 50,
                serverUrl: "ws://" + info.server_ip + ":" + info.server_port,
            },
            worker: true,
            maxConcurrency: 10
        });
        setLog(carlaLog);
        carlaLog.on("ready", () => {
            const metadata = carlaLog.getMetadata();
            if (metadata.map) {
                const config = {
                    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
                    coordinateOrigin: [0, 0, 0],
                    data: metadata.map,
                    stroked: true,
                    width: 200,
                    filled: true,
                    wireframe: true,
                    extruded: true,
                    getFillColor: [255, 255, 255, 255],
                    getLineColor: [255, 255, 255, 255],
                    getLineWidth: 0.1,
                    getRadius: 0.00001,
                    opacity: 10
                };
                mapLayer = new GeoJsonLayer({
                    ...config,
                    id: `carla_map`,
                });
                mapLayerBig = new GeoJsonLayer({
                    ...config,
                    id: `carla_map_big`,
                });
                setCustomLayers([mapLayer]);
                setBigLayers([mapLayerBig]);
            }
            carlaLog.socket.onclose = () => {
                // setMetadataReceived(false);
            };
            // setMetadataReceived(true);
        })
            .on("error", console.error)
            .connect();
    };

    const objectChange = (val) => {
        if (val === 2) {
            setEgoVisible(true);
        } else if (val === 5) {
            setObstacleVisible(true);
        }
    };
    const langChange = (val) => {
        setLang(val);
        if (val === 'scenest') {
            setCode(defaultCode);
        } else {
            setCode('');
        }
    };

    const submit = () => {
        if (operateStatus) {
            ws.send(JSON.stringify({
                cmd: "stop",
            }));
            log.close();
            dispatch({type: 'SET_STATUS', status: false});
        } else {
            const currentCode = codeMirror.current.editor.getValue();
            setLoading(true);
            if (!ws) {
                ws = new WebSocket(`ws://${__HOST_IP__}:8888`);
            } else {
                ws.send(JSON.stringify({
                    cmd: "run",
                    lang: lang,
                    code: currentCode,
                }));
            }
            ws.onopen = () => {
                ws.send(JSON.stringify({
                    cmd: "run",
                    lang: lang,
                    code: currentCode,
                }));
            };
            ws.onmessage = (evt) => {
                const data = JSON.parse(evt.data);
                if (data.state === 'init') {
                    setLoading(false);
                    handleSocket(data);
                } else if (data.state === 'finish') {

                }
            };
        }
    };
    return (
        <div className="main mg-auto">
            <div className="main-left">
                <Spin spinning={loading} size="large">
                    <div className="main-top">
                        <Select placeholder=""
                                onChange={langChange}
                                className="select-left" defaultValue={'scenest'}>
                            <Option value={'scenest'}># scenest</Option>
                            <Option value={'scenic'}># scenic</Option>
                            <Option value={'scenario'}># scenario</Option>
                        </Select>
                        <div className="main-top-right">
                            <Select placeholder="创建"
                                    onChange={objectChange}
                                    className="select-right" defaultValue={undefined}>
                                <Option value={1}>地图</Option>
                                <Option value={2}>控制车辆</Option>
                                <Option value={3}>NPC车辆</Option>
                                <Option value={4}>行人</Option>
                                <Option value={5}>障碍物</Option>
                            </Select>
                            <button className="submit" onClick={submit}>
                                {
                                    operateStatus ? '停止' : '运行'
                                }</button>
                        </div>
                    </div>
                    <div className="main-code">
                        <CodeMirror
                            value={code}
                            ref={codeMirror}
                            options={{
                                theme: 'base16-dark',
                                mode: 'jsx',
                                lineWrapping: true,
                            }}
                        />
                    </div>
                </Spin>
            </div>
            <div className="main-right">
                <div className="main-right-item">
                    <div className="item-inner">
                        {(log && operateStatus) ? <LogViewer
                            onClick={() => {
                                setMapVisible(true)
                            }}
                            log={log}
                            showMap={false}
                            car={CAR}
                            xvizStyles={XVIZ_STYLE}
                            showTooltip={true}
                            viewMode={VIEW_MODE["TOP_DOWN"]}
                            customLayers={customLayers}
                        /> : <i className="iconfont iconpic"/>}
                    </div>
                </div>
                <div className="main-right-item">
                    <div className="item-inner">
                        {operateStatus
                            ? <img src={pic2} alt=""/>
                            : <i className="iconfont iconpic"/>
                        }
                    </div>
                </div>
                <div className="main-right-item">
                    <div className="item-inner">
                        {operateStatus
                            ? <XVIZPanel log={log} name="Camera"/>
                            : <i className="iconfont iconpic"/>
                        }
                    </div>
                </div>
            </div>
            <ObstacleModal
                visible={obstacleVisible} cancel={() => {
                setObstacleVisible(false)
            }}
            />
            <EgoModal
                visible={egoVisible} cancel={() => {
                setEgoVisible(false)
            }}
            />
            <MapModal
                layers={bigLayers}
                log={log}
                visible={mapVisible} cancel={() => {
                setMapVisible(false)
            }}
            />

        </div>
    )
};

export default Main;
