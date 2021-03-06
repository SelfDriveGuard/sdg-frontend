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
    XVIZLiveLoader,
    VIEW_MODE,
} from "streetscape.gl";
import {XVIZ_STYLE, CAR} from "../constants";

import IndexContext from "../context";
import {myServerApi} from "../api";
import {getDirection} from '../utils';
import { useI18n } from '../plugins/use-i18n';

const {TabPane} = Tabs;
let WS_IP = '';

const {Option} = Select;
let ws, carlaLog;
let mapLayer;
let index = 0;

const outputLog = [];

const Main = () => {
    const {operateStatus, userInfo, code, myServer, loading, dispatch} = useContext(IndexContext);
    const codeMirror = useRef();
    const overallView = useRef();
    const [tabVal, setTabVal] = useState('1');

    const [mapName, setMapName] = useState('');
    const [lang, setLang] = useState('scenest');

    const [log, setLog] = useState('');
    const [customLayers, setCustomLayers] = useState([]);
    const [hoverLog, setHoverLog] = useState({});

    const [currentStatus, setCurrentStatus] = useState({status: ''}); // 任务状态（树）
    const [server, setServer] = useState(undefined);

    const t = useI18n();

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

    // 获取服务器列表
    const getMyServer = async () => {
        const {data} = await myServerApi();
        data.forEach((item, index) => {
            item.key = index;
        });
        dispatch({type: 'SET_MY_SERVER', myServer: data});
    };

    useEffect(() => {
        if (userInfo) {
            (async () => {
                await getMyServer();
            })()
        }
    }, [userInfo]);

    // editor blur事件
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

    // 连接 8091
    const handleSocket = (ip) => {
        carlaLog = new XVIZLiveLoader({
            logGuid: "mock",
            bufferLength: 10,
            serverConfig: {
                defaultLogLength: 50,
                serverUrl: `ws://${ip}:8091`,
            },
            worker: true,
            maxConcurrency: 10
        });
        const currentCarlaLog = carlaLog;
        setLog(carlaLog);
        carlaLog.on("ready", () => {
            const metadata = currentCarlaLog.getMetadata();
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

    // 语言 select
    const langChange = (val) => {
        setLang(val);
    };

    // 服务器 select
    const serverChange = (val) => {
        setServer(val);
        WS_IP = val;
        linkSocket(WS_IP);
    };

    // 连接 8093
    const linkSocket = (ip) => {
        ws = new WebSocket(`ws://${ip}:8093`);
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
                setCurrentStatus({status: 'isRunning', ws_ip: ip});
            } else if (state === 'notRunning') {
                dispatch({type: 'SET_LOADING', loading: false});
                dispatch({type: 'SET_OPERATE_STATUS', status: false});
                setCurrentStatus({status: 'notRunning', ws_ip: ip});
                if (cmd === 'ASSERT') dispatch({type: 'SET_ASSERTION', cont: msg});
            }
        };
        ws.onclose = () => {
            ws = new WebSocket(`ws://${WS_IP}:8093`);
        };
    };

    // 运行
    const submit = () => {
        if (!userInfo) {
            dispatch({type: 'SET_LOGIN', status: true});
            return;
        }
        if (!server) {
            message.warning(t.chooseServer);
            return;
        }
        if (!code) {
            message.warning(t.codeEmpty);
            return;
        }
        closeLog();
        dispatch({type: 'SET_LOADING', loading: true});
        setTimeout(() => {
            if (operateStatus) {
                ws.send(JSON.stringify({
                    cmd: "stop",
                }));
                dispatch({type: 'SET_LOADING', loading: false});
            } else {
                dispatch({type: 'SET_ASSERTION', cont: []}); // 清空assertion
                const currentCode = codeMirror.current.editor.getValue();
                handleSocket(WS_IP);
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
        }, 2000);
    };

    // 切换地图
    const mapChange = async (map_name) => {
        if (!userInfo) {
            dispatch({type: 'SET_LOGIN', status: true});
            return;
        }
        if (!server) {
            message.warning(t.chooseServer);
            return;
        }
        dispatch({type: 'SET_LOADING', loading: true});
        outputLog.push({cmd: '', msg: t.isRunning});
        dispatch({type: 'SET_OUTPUT_MSG', outputMsg: outputLog});
        setCustomLayers([]);
        handleSocket(WS_IP);
        setTimeout(() => {
            ws.send(JSON.stringify({
                cmd: "run",
                lang: lang,
                code: '',
                map_name: map_name,
                is_load_map: true,
            }));
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

    // 拖拽 视频
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

    // 点击treeItem 切换地图视频
    const treeSelect = (ws_ip, runStatus) => {
        setServer(ws_ip);
        closeLog();
        if(!ws_ip || (runStatus !== 'isRunning')) return;
        setTimeout(() => {
            linkSocket(ws_ip);
            handleSocket(ws_ip);
        }, 200);
    };

    // 断开 8091
    const closeLog = () => {
        if (log) {
            carlaLog.close();
            carlaLog = null;
            setLog(null);
        }
    };

    return (
        <>
            <ProjectMenu getCode={getCode} currentStatus={currentStatus} treeSelect={treeSelect}/>
            <Spin spinning={loading} size="large">
                <div className="main">
                    <Tabs defaultActiveKey="1" onChange={tabCallback} activeKey={tabVal}>
                        <TabPane tab={t.code} key="1">
                            <div className="main-tab1">
                                <div className="main-top">
                                    <div className="main-top-left">
                                        <div className="main-top-label">{t.lang}：</div>
                                        <Select placeholder={t.chooseLang}
                                                onChange={langChange}
                                                className="select-left" defaultValue={'scenest'}>
                                            <Option value={'scenest'}># scenest</Option>
                                            <Option value={'scenic'}># scenic</Option>
                                            <Option value={'scenario'}># scenario</Option>
                                        </Select>
                                        <div className="main-top-label">{t.server}：</div>
                                        <Select placeholder={t.chooseServer}
                                                onChange={serverChange}
                                                value={server}
                                                className="select-left select-server">
                                            {myServer.map((item) => {
                                                return <Option value={item.ip} key={item.key}>
                                                    {item.ip}
                                                </Option>
                                            })}
                                        </Select>
                                        <div className="main-top-label">{t.map}：</div>
                                        <Select placeholder={t.chooseMap}
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
                                                operateStatus ? t.stop : t.run
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
                        <TabPane tab={t.overlook} key="2">
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
                        <TabPane tab={t.carFront} key="3">
                            <div className="main-item">
                                <div className="item-inner item-view3">
                                    {(log)
                                        ? <img src={`http://${WS_IP}:8096/front`}
                                               alt=""
                                               className="camera-wrapper"/>
                                        : <i className="iconfont iconpic"/>
                                    }
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab={t.carBack} key="4">
                            <div className="main-item">
                                <div className="item-inner item-view4" ref={overallView} onMouseDown={handleMousedown}>
                                    {(log)
                                        ? <img src={`http://${WS_IP}:8096/global`}
                                               alt=""
                                               className="camera-wrapper"/>
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
