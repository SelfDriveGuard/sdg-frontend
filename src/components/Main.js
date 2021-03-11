import React, {useState, useContext, useRef, useEffect} from "react";
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/base16-dark.css';
import {Select, Spin, message} from 'antd';
import ObstacleModal from "./ObstacleModal";
import EgoModal from "./EgoModal";
import MapModal from "./MapModal";
import Menu from "./Menu";

import {GeoJsonLayer} from "@deck.gl/layers";
import {COORDINATE_SYSTEM} from "@deck.gl/core";
import {
    LogViewer,
    XVIZPanel,
    XVIZLiveLoader,
    VIEW_MODE,
} from "streetscape.gl";
import {XVIZ_STYLE, CAR, VIEW_OFFSET, VIEW_STATE} from "../constants";

import IndexContext from "../context";
import {myServerApi} from "../api";

let WS_IP = '';

const {Option} = Select;
let carlaLog, ws;
let mapLayer, mapLayerBig;
let index = 0;

const outputLog = [];

const myComponentProps = {
    video: {
        height: 225,
        width: 300,
    }
};
const Main = () => {
    const {operateStatus, loginStatus, code, myServer, loading, dispatch} = useContext(IndexContext);
    const codeMirror = useRef();
    const [obstacleVisible, setObstacleVisible] = useState(false);
    const [egoVisible, setEgoVisible] = useState(false);
    const [mapVisible, setMapVisible] = useState(false);

    const [mapName, setMapName] = useState('');
    const [lang, setLang] = useState('scenest');

    const [log, setLog] = useState('');
    const [customLayers, setCustomLayers] = useState([]);
    const [bigLayers, setBigLayers] = useState([]);
    const [hoverLog, setHoverLog] = useState({});

    useEffect(() => {
        if (loginStatus) {
            (async () => {
                await getMyServer();
            })()
        }
    }, [loginStatus]);

    const handleCodeBlur = () => {
        // const code = codeMirror.current.editor.getValue();
        // dispatch({type: 'SET_CODE', code});
    };

    const _onLayerHover = (info) => {
        if (info.object) {
            setHoverLog({
                hoverObject: {
                    roadId: info.object.properties.name,
                    laneId: info.object.properties.laneId,
                    positionX: info.object.geometry.coordinates ? info.object.geometry.coordinates[0][0].toFixed(2) : '',
                    positionY: info.object.geometry.coordinates ? info.object.geometry.coordinates[0][1].toFixed(2) : '',
                    x: info.x,
                    y: info.y
                },
                showHover: true
            });
        } else {
            setHoverLog({
                showHover: false
            });
        }
    };

    const handleSocket = () => {
        if (carlaLog) return;
        carlaLog = new XVIZLiveLoader({
            logGuid: "mock",
            bufferLength: 10,
            serverConfig: {
                defaultLogLength: 50,
                serverUrl: `ws://${WS_IP}:8091`,
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
                    id: `carla_map${index}`,
                });
                mapLayerBig = new GeoJsonLayer({
                    ...config,
                    id: `carla_map_big${index}`,
                    pickable: true,
                    onClick: info => _onLayerHover(info),
                    onHover: info => _onLayerHover(info)
                });
                // textLayer = new TextLayer({
                //     id: `text-layer${index}`,
                //     data: metadata.map.features,
                //     billboard: false,
                //     fontFamily: 'sans-serif',
                //     sizeUnits: 'meters',
                //     coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
                //     coordinateOrigin: [0, 0, 0],
                //     getPosition: d => d.geometry.coordinates[1],
                //     getText: d => d.properties.name,
                //     getColor: [255, 255, 0, 255],
                //     getSize: 0.3,
                //     getAngle: 0,
                //     getTextAnchor: 'middle',
                //     getAlignmentBaseline: 'center',
                // });
                index += 1;
                setCustomLayers([mapLayer]);
                // setBigLayers([mapLayerBig, textLayer]);
                setBigLayers([mapLayerBig]);
            }
        })
            .on("error", console.error)
            .on('update', () => {
            })
            .on('finish', () => {
                console.log('finish');
            })
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
    };

    const serverChange = (val) => {
        WS_IP = val;
        const currentCode = codeMirror.current.editor.getValue();
        linkSocket(currentCode, mapName, false);
        //handleSocket();
    };

    const getMyServer = async () => {
        const {data} = await myServerApi();
        data.forEach((item, index) => {
            item.key = index;
        });
        dispatch({type: 'SET_MY_SERVER', myServer: data});
    };

    const linkSocket = (code, map, is_load_map) => {
        if (!ws) {
            ws = new WebSocket(`ws://${WS_IP}:8093`);
        } else {
            ws.send(JSON.stringify({
                cmd: "run",
                lang: lang,
                code,
                map_name: map,
                is_load_map: is_load_map
            }));
        }
        ws.onopen = () => {
            ws.send(JSON.stringify({}));
        };
        ws.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            const { state, msg, cmd } = data;
            if (cmd && cmd !== 'ASSERT') {
                outputLog.push({cmd, msg});
                dispatch({type: 'SET_OUTPUT_MSG', outputMsg: outputLog});
            }
            if (cmd === 'READY') dispatch({type: 'SET_LOADING', loading: false});
            if (state === 'isRunning') {
                dispatch({type: 'SET_OPERATE_STATUS', status: true});
                if(cmd === 'DRIVING') {
                    const wrapper = document.querySelectorAll('.item-inner');
                    const wrapper1 = wrapper[1];
                    const wrapper2 = wrapper[2];
                    const select = wrapper1.querySelector('select');
                    const option = wrapper1.querySelectorAll('option')[2];
                    select.value = option.innerText;
                    const evt = document.createEvent("Events");
                    evt.initEvent('change',true,true);
                    select.dispatchEvent(evt);

                    const select1 = wrapper2.querySelector('select');
                    const option1 = wrapper2.querySelectorAll('option')[1];
                    select1.value = option1.innerText;
                    const evt1 = document.createEvent("Events");
                    evt1.initEvent('change',true,true);
                    select1.dispatchEvent(evt1);
                }
            } else if (state === 'notRunning') {
                dispatch({type: 'SET_OPERATE_STATUS', status: false});
                if (cmd === 'ASSERT') dispatch({type: 'SET_ASSERTION', cont: msg});
            }
        };
        ws.onclose = () => {
            ws = new WebSocket(`ws://${WS_IP}:8093`);
        };
    };

    // 运行
    const submit = () => {
        if (!loginStatus) {
            dispatch({type: 'SET_LOGIN', status: true});
            return;
        }
        if (!WS_IP) {
            message.warning('请选择服务器');
            return;
        }
        if (!code) {
            message.warning('代码不能为空');
            return;
        }
        handleSocket();
        dispatch({type: 'SET_LOADING', loading: true});
        if (operateStatus) {
            ws.send(JSON.stringify({
                cmd: "stop",
            }));
            if (log) {
                carlaLog.close();
                carlaLog = null;
                setLog(carlaLog);
            }
            dispatch({type: 'SET_LOADING', loading: false});
        } else {
            const currentCode = codeMirror.current.editor.getValue();
            ws.send(JSON.stringify({
                cmd: "run",
                lang: lang,
                code: currentCode,
                map_name: mapName,
                is_load_map: false,
            }));
            outputLog.push({cmd: '', msg: '正在启动...'});
            dispatch({type: 'SET_OUTPUT_MSG', outputMsg: outputLog});
        }
    };

    // 切换地图
    const mapChange = async (map_name) => {
        if (!loginStatus) {
            dispatch({type: 'SET_LOGIN', status: true});
            return;
        }
        if (!WS_IP) {
            message.warning('请选择服务器');
            return;
        }
        dispatch({type: 'SET_LOADING', loading: true});
        outputLog.push({cmd: '', msg: '正在启动...'});
        dispatch({type: 'SET_OUTPUT_MSG', outputMsg: outputLog});
        setCustomLayers([]);
        setBigLayers([]);
        handleSocket();
        setTimeout(() => {
            linkSocket('', map_name, true);
            setMapName(map_name);
        }, 1000);
    };

    // 项目管理 保存
    const getCode = () => {
        return new Promise((resolve) => {
            const code = codeMirror.current.editor.getValue();
            resolve(code);
        });
    };

    return (
        <>
            <Menu getCode={getCode}/>
            <Spin spinning={loading} size="large">
                <div className="main">
                    <div className="main-left">
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
                                        onChange={serverChange}
                                        className="select-left select-server" defaultValue={undefined}>
                                    {myServer.map((item) => {
                                        return <Option value={item.ip} key={item.key}>
                                            {item.ip}
                                        </Option>
                                    })}
                                </Select>
                                <div className="main-top-label">地图：</div>
                                <Select placeholder="请选择地图"
                                        onChange={mapChange}
                                        className="select-left" defaultValue={undefined}>
                                    <Option value={'Town01'}>Town01</Option>
                                    <Option value={'Town02'}>Town02</Option>
                                    <Option value={'Town03'}>Town03</Option>
                                    <Option value={'Town04'}>Town04</Option>
                                    <Option value={'Town05'}>Town05</Option>
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
                            {/*<Select placeholder="快速添加"*/}
                            {/*        onChange={objectChange}*/}
                            {/*        className="select-right" defaultValue={undefined}>*/}
                            {/*    <Option value={1}>地图</Option>*/}
                            {/*    <Option value={2}>控制车辆</Option>*/}
                            {/*    <Option value={3}>NPC车辆</Option>*/}
                            {/*    <Option value={4}>行人</Option>*/}
                            {/*    <Option value={5}>障碍物</Option>*/}
                            {/*</Select>*/}
                            <CodeMirror
                                value={code}
                                onBlur={handleCodeBlur}
                                ref={codeMirror}
                                options={{
                                    theme: 'base16-dark',
                                    mode: 'jsx',
                                    lineWrapping: true,
                                }}
                            />
                        </div>
                    </div>
                    <div className="main-right">
                        <div className="main-right-item">
                            <div className="item-inner">
                                {(log && (mapName || operateStatus)) ? <LogViewer
                                    onClick={() => {
                                        setMapVisible(true)
                                    }}
                                    log={log}
                                    showMap={false}
                                    car={CAR}
                                    xvizStyles={XVIZ_STYLE}
                                    showTooltip={true}
                                    viewMode={VIEW_MODE["TOP_DOWN"]}
                                    viewOffset={VIEW_OFFSET}
                                    viewState={VIEW_STATE}
                                    customLayers={customLayers}
                                /> : <i className="iconfont iconpic"/>}
                            </div>
                        </div>
                        <div className="main-right-item">
                            <div className="item-inner">
                                {(operateStatus && log)
                                    ? <XVIZPanel log={log} name="Camera" className="camera-wrapper" componentProps={myComponentProps}/>
                                    : <i className="iconfont iconpic"/>
                                }
                            </div>
                        </div>
                        <div className="main-right-item">
                            <div className="item-inner">
                                {(operateStatus && log)
                                    ? <XVIZPanel log={log} name="Camera" className="camera-wrapper" componentProps={myComponentProps}/>
                                    : <i className="iconfont iconpic"/>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
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
                hoverLog={hoverLog}
                visible={mapVisible} cancel={() => {
                setMapVisible(false)
            }}
            />
        </>
    )
};

export default Main;
