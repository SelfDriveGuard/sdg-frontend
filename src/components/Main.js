import React, {useState, useContext, useRef, useEffect} from "react";
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/base16-dark.css';
import {Select, Spin} from 'antd';
import ObstacleModal from "./ObstacleModal";
import EgoModal from "./EgoModal";
import MapModal from "./MapModal";
import Menu from "./Menu";

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
import {myServerApi} from "../api";

// const WS_IP = '172.16.203.135';
const WS_IP = '52.83.15.145';

const {Option} = Select;

let carlaLog, ws;
let mapLayer, mapLayerBig;
const Main = () => {
    const {operateStatus, loginStatus, code, dispatch} = useContext(IndexContext);
    const codeMirror = useRef();
    const [obstacleVisible, setObstacleVisible] = useState(false);
    const [egoVisible, setEgoVisible] = useState(false);
    const [mapVisible, setMapVisible] = useState(false);

    const [lang, setLang] = useState('scenest');
    const [loading, setLoading] = useState(false);
    const [myServer, setMyServer] = useState([]);

    const [log, setLog] = useState('');
    const [customLayers, setCustomLayers] = useState([]);
    const [bigLayers, setBigLayers] = useState([]);

    useEffect(() => {
        if (customLayers.length > 0) {
            dispatch({type: 'SET_STATUS', status: true});
        }
    }, [customLayers, dispatch]);

    useEffect(() => {
        if(loginStatus) {
            (async () => {
                await getMyServer();
            })()
        }
    }, [loginStatus]);
    const handleSocket = (info) => {
        carlaLog = new XVIZLiveLoader({
            logGuid: "mock",
            bufferLength: 10,
            serverConfig: {
                defaultLogLength: 50,
                serverUrl: `ws://${WS_IP}:8081`,
                //  info.server_ip + ":" + info.server_port,
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

            };
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
        // if (val === 'scenest') {
        //     setCode(defaultCode);
        // } else {
        //     setCode('');
        // }
    };

    const getMyServer = async () => {
        const {data} = await myServerApi();
        data.forEach((item, index) => {
            item.key = index;
        });
        setMyServer(data);
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
                ws = new WebSocket(`ws://${WS_IP}:8888`);
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
            ws.onclose = () => {
                ws = new WebSocket(`ws://${WS_IP}:8888`);
            };
        }
    };
    return (
        <div className="main">
            <Menu/>
            <div className="main-left">
                <Spin spinning={loading} size="large">
                    <div className="main-top">
                        <div className="main-top-left">
                            <div className="main-top-label">语言：</div>
                            <Select placeholder="请选择语言"
                                    onChange={langChange}
                                    className="select-left" defaultValue={'scenest'}>
                                <Option value={'scenest'}># scenest</Option>
                                <Option value={'scenic'}># scenic</Option>
                                <Option value={'scenario'}># scenario</Option>
                            </Select>
                            <div className="main-top-label">服务器：</div>
                            <Select placeholder="请选择服务器"
                                    className="select-left select-server" defaultValue={undefined}>
                                {myServer.map((item) => {
                                    return <Option value={item.ip} key={item.key}>
                                        {item.ip}
                                    </Option>
                                })}

                            </Select>
                        </div>

                        <div className="main-top-right">
                            <button className="submit" onClick={submit}>
                                {
                                    operateStatus ? '停止' : '运行'
                                }
                            </button>
                        </div>
                    </div>
                    <div className="main-code">
                        <Select placeholder="快速添加"
                                onChange={objectChange}
                                className="select-right" defaultValue={undefined}>
                            <Option value={1}>地图</Option>
                            <Option value={2}>控制车辆</Option>
                            <Option value={3}>NPC车辆</Option>
                            <Option value={4}>行人</Option>
                            <Option value={5}>障碍物</Option>
                        </Select>
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
