import React, {useState, useContext, useEffect} from "react";
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/base16-dark.css';
import {Select, Spin} from 'antd';
import ObstacleModal from "./ObstacleModal";
import EgoModal from "./EgoModal";

import pic1 from '../static/img/pic1.png';
import pic2 from '../static/img/pic2.png';

import {
    XVIZPanel,
    XVIZLiveLoader,
} from "streetscape.gl";

import IndexContext from "../context";

const __HOST_IP__ = '172.16.203.135';
const carlaLog = new XVIZLiveLoader({
    logGuid: "mock",
    bufferLength: 10,
    serverConfig: {
        defaultLogLength: 50,
        serverUrl: "ws://" + __HOST_IP__ + ":8081"
    },
    worker: true,
    maxConcurrency: 10
});

const {Option} = Select;

const defaultCode = '// map\n' +
    'map = "San Francisco";\n' +
    '\n' +
    '// ego vehicle\n' +
    'ego_init_position = (4.5, 214); //default coordinate frame is ENU\n' +
    'ego_target_position = (4.5, -200); //default coordinate frame is ENU\n' +
    'ego_init_state = (ego_init_position);\n' +
    'ego_target_state = (ego_target_position);\n' +
    'car_model = "Lincoln MKZ 2017";\n' +
    'car_color = (255, 0, 0);\n' +
    'vehicle_type = (car_model, car_color);\n' +
    'ego_vehicle = AV(ego_init_state, ego_target_state, vehicle_type);\n' +
    '\n' +
    '// npc vehicles\n' +
    'npc_init_state = (1->0.0, ,1.5) ;//the initial position is the start point of lane 1, the orientation of the vehicle is along with the lane direction, and the initial speed is 1.5m/s \n' +
    'motion = U(npc_init_state);\n' +
    'npc1 = Vehicle(npc_init_state, motion);\n' +
    'npc_init_state2 = (2->0.0, ,1.0);\n' +
    'npc_state = ((2->0.0, , 1.0), (2->50.0, ,1.0));\n' +
    'npc2 =Vehicle(npc_init_state2, Waypoint(npc_state), (4->100, ,0.0), vehicle_type);\n' +
    'heading = 45 deg related to EGO;\n' +
    'npc_init_state3 = ((9.5, 114), heading, 0.0);\n' +
    'npc3 = Vehicle(npc_init_state3);\n' +
    'npc = {npc1, npc2, npc3};\n' +
    '\n' +
    '// pedestrians\n' +
    'pedestrian_type = (1.65, black);\n' +
    'pedestrian = Pedestrian(((19,13), ,0.5), , ((0,13), ,0), pedestrian_type);\n' +
    'pedestrians={pedestrian};\n' +
    '\n' +
    '// environment\n' +
    'time = 10:00;\n' +
    'weather = {rain: 0.1};\n' +
    'env = Environment(time, weather);\n' +
    '\n' +
    '// traffic\n' +
    'speed_range = (0,20);\n' +
    'speed_limit = SpeedLimit(5, speed_range);\n' +
    'i1 = Intersection(1, 1, 0, 1);\n' +
    'traffic = {i1,speed_limit};\n' +
    '\n' +
    'scenario = CreateScenario{load(map);\n' +
    '\t\t\t        ego_vehicle;\n' +
    '\t\t\t        npc;\n' +
    '\t\t\t        pedestrians;\n' +
    '\t\t\t        {};\n' +
    '\t\t\t        env;\n' +
    '\t\t\t        traffic;\n' +
    '};';

const Main = () => {
    const {operateStatus, dispatch} = useContext(IndexContext);
    const [obstacleVisible, setObstacleVisible] = useState(false);
    const [egoVisible, setEgoVisible] = useState(false);
    const [code, setCode] = useState(defaultCode);
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState(carlaLog);

    useEffect(() => {
        if(log) {
            log.on("ready", () => {
                // const metadata = log.getMetadata();
                log.socket.onclose = () => {
                    // setMetadataReceived(false);
                };
                // setMetadataReceived(true);
            })
                .on("error", console.error)
                .connect();
        }
    }, [log]);

    const objectChange = (val) => {
        if (val === 2) {
            setEgoVisible(true);
        } else if (val === 5) {
            setObstacleVisible(true);
        }
    };
    const langChange = (val) => {
        if (val === 1) {
            setCode(defaultCode);
        } else {
            setCode('');
        }
    };

    const submit = () => {
        setLoading(true);
        setTimeout(() => {
            dispatch({type: 'SET_STATUS', status: true});
            setLoading(false);
        }, 3000);
    };
    return (
        <div className="main mg-auto">
            <div className="main-left">
                <Spin spinning={loading} size="large">
                    <div className="main-top">
                        <Select placeholder=""
                                onChange={langChange}
                                className="select-left" defaultValue={1}>
                            <Option value={1}># scenest</Option>
                            <Option value={2}># scenic</Option>
                            <Option value={3}># scenario</Option>
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
                            <button className="submit" onClick={submit}>运行</button>
                        </div>
                    </div>
                    <div className="main-code">
                        <CodeMirror
                            value={code}
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
                        {operateStatus
                            ? <img src={pic1} alt=""/>
                            : <i className="iconfont iconpic"/>
                        }
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
        </div>
    )
};

export default Main;
