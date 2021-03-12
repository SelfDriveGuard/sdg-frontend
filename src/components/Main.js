import React, {useState, useContext, useRef, useEffect} from "react";
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/base16-dark.css';
import {Select, Spin, message, Tabs} from 'antd';
import ProjectMenu from "./ProjectMenu";

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
import {getDirection} from '../utils';

const {TabPane} = Tabs;
let WS_IP = '';

const {Option} = Select;
let carlaLog, ws;
let mapLayer;
let index = 0;

const outputLog = [];

const myComponentProps = {
    video: {
        height: 800,
        width: 1200,
    }
};

const Main = () => {
    const {operateStatus, loginStatus, code, myServer, loading, dispatch} = useContext(IndexContext);
    const codeMirror = useRef();
    const overallView = useRef();
    const [tabVal, setTabVal] = useState('1');

    const [mapName, setMapName] = useState('');
    const [lang, setLang] = useState('scenest');

    const [log, setLog] = useState('');
    const [customLayers, setCustomLayers] = useState([]);
    const [hoverLog, setHoverLog] = useState({});

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (tabVal !== '4' || !operateStatus) return;
            const keyMap = ['w', 'a', 's', 'd', 'q', 'e'];
            if (keyMap.indexOf(e.key) === -1) return;
            ws.send(JSON.stringify({
                cmd: "move",
                code: `key_${e.key}`,
            }));
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [tabVal, operateStatus]);

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

    const changeOption = (selector, tabVal) => {
        setTimeout(() => {
            const wrapper = document.querySelector(selector);
            const select = wrapper.querySelector('select');
            if(!select) return;
            let option = wrapper.querySelectorAll('option');
            const arr = [];
            option.forEach((item) => {
                arr.push(item.value.split('/')[3]);
            });
            arr.sort((a, b) => a - b);
            option = tabVal === '3' ? arr[arr.length - 1] :arr[0];
            select.value = `/camera/rgb/${option}`;
            const evt = document.createEvent("Events");
            evt.initEvent('change', true, true);
            select.dispatchEvent(evt);
        }, 300);
    };

    const tabCallback = (val) => {
        setTabVal(val);
        if(operateStatus && (val === "3" || val === '4')) changeOption(`.item-view${val}`, val);
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
                    pickable: true,
                    onClick: info => _onLayerHover(info),
                    onHover: info => _onLayerHover(info)
                });
                index += 1;
                setCustomLayers([mapLayer]);
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
            const {state, msg, cmd} = data;
            if (cmd && cmd !== 'ASSERT') {
                outputLog.push({cmd, msg});
                dispatch({type: 'SET_OUTPUT_MSG', outputMsg: outputLog});
            }
            if (cmd === 'READY') {
                dispatch({type: 'SET_LOADING', loading: false});
                setTabVal("4");
                changeOption(`.item-view4`, "4");
            }
            if (state === 'isRunning') {
                dispatch({type: 'SET_OPERATE_STATUS', status: true});
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
            dispatch({type: 'SET_ASSERTION', cont: []}); // 清空assertion
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

    const handleMousedown = (e) => {
        if (!operateStatus) return;
        e.preventDefault();
        let startX = e.pageX;
        let startY = e.pageY;
        overallView.current.onmouseup = (event) => {
            if (!operateStatus) return;
            let endX = event.pageX;
            let endY = event.pageY;
            const direction = getDirection(startX, startY, endX, endY);
            const obj = {
                1: 'u', // 上
                2: 'd', // 下
                3: 'l', // 左
                4: 'r', // 右
            };
            ws.send(JSON.stringify({
                cmd: "move",
                code: `drag_${obj[direction]}`,
            }));
        };
    };

    return (
        <>
            <ProjectMenu getCode={getCode}/>
            <Spin spinning={loading} size="large">
                <div className="main">
                    <Tabs defaultActiveKey="1" onChange={tabCallback} activeKey={tabVal}>
                        <TabPane tab="代码" key="1">
                            <div className="main-tab1">
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
                        </TabPane>
                        <TabPane tab="地图俯视" key="2">
                            <div className="main-item">
                                <div className="item-inner">
                                    {(log && (mapName || operateStatus)) ? <LogViewer
                                        log={log}
                                        showMap={false}
                                        car={CAR}
                                        xvizStyles={XVIZ_STYLE}
                                        showTooltip={!hoverLog.showHover}
                                        viewMode={VIEW_MODE["TOP_DOWN"]}
                                        customLayers={customLayers}
                                    />

                                    : <i className="iconfont iconpic"/>}
                                    {hoverLog.showHover ? (
                                        <div style={{

                                            left: hoverLog.hoverObject.x,
                                            top: hoverLog.hoverObject.y
                                        }} className="map-hover-modal">
                                            <p><span className="label">roadId:</span> {hoverLog.hoverObject.roadId}</p>
                                            <p><span className="label">laneId:</span> {hoverLog.hoverObject.laneId}</p>
                                            <p><span className="label">positionX:</span> {hoverLog.hoverObject.positionX}</p>
                                            <p><span className="label">positionY:</span> {-hoverLog.hoverObject.positionY}</p>
                                        </div>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab="车辆前角" key="3">
                            <div className="main-item">
                                <div className="item-inner item-view3">
                                    {(log)
                                        ? <XVIZPanel log={log} name="Camera" className="camera-wrapper"
                                                     componentProps={myComponentProps}
                                        />
                                        : <i className="iconfont iconpic"/>
                                    }
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab="全局视角" key="4">
                            <div className="main-item">
                                <div className="item-inner item-view4" ref={overallView} onMouseDown={handleMousedown}>
                                    {(log)
                                        ? <XVIZPanel log={log} name="Camera"
                                                     className="camera-wrapper"
                                                     componentProps={myComponentProps}/>
                                        : <i className="iconfont iconpic"/>
                                    }
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </Spin>
        </>
    )
};

export default Main;
