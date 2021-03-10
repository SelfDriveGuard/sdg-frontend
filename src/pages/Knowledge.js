import React, {useEffect, useRef, useState} from "react";
import '../static/style/knowledge.less';
import {getExampleApi} from '../api';
import {message, Select, Tree} from "antd";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {arrDeepCopy} from '../utils';
import CodeMirror from "@uiw/react-codemirror";
import 'codemirror/keymap/sublime';
import 'codemirror/theme/base16-dark.css';

const {Option} = Select;

let all = [];
const Knowledge = () => {
    const [treeData, setTreeData] = useState([]);
    const [selectNode, setSelectNode] = useState({
        key :'0-0-0',
    });
    const [lang, setLang] = useState('scenest');
    const codeMirror = useRef();

    useEffect(() => {
        (async () => {
            const data = await getTreeData();
            renderTreeData(data);
        })()
    }, []);

    const handleTreeSelect = (key, info) => {
        setSelectNode(info.node);
    };
    const handleCopy = () => {
        message.success('复制成功');
    };

    const langChange = (val) => {
        setLang(val);
        const arr = arrDeepCopy(all);
        arr.forEach((item) => {
            return item.children = item.children.filter((inner) => {
                return inner.name.indexOf(val) > -1
            })
        });
        renderTreeData(arr);
    };

    const getTreeData = async () => {
        const {data} = await getExampleApi();
        all = arrDeepCopy(data);
        data.forEach((item) => {
            item.children = item.children.filter((inner) => {
                return inner.name.indexOf(lang) > -1
            })
        });
        return data;
    };

    const renderTreeData = (data) => {
        data.forEach((item) => {
            item.title =
                <div className="father-tree">
                    <div>
                        <i className="iconfont iconxiangmu"/>
                        <span>{item.name}</span>
                    </div>
                </div>;
            item.children.forEach((innerItem) => {
                innerItem.title =
                    <div className="child-tree">
                        <div>
                            <i className="iconfont icondocument"/>
                            <span>{innerItem.name}</span>
                        </div>
                    </div>
            });
        });
        setTreeData(data);
        setSelectNode(data[0].children[0]);
    };

    return (
        <div className="knowledge">
            <div className="knowledge-menu">
                <div className="menu-top">场景库</div>
                <Tree
                    selectedKeys={[selectNode.key]}
                    onSelect={handleTreeSelect}
                    showIcon
                    expandedKeys={['0-0', '0-1']}
                    treeData={treeData}
                />
            </div>
            <div className="knowledge-main">
                <div className="main-top">
                    <div className="main-top-left">
                        <div className="knowledge-title">{selectNode.name && selectNode.name.split('.')[0]}</div>
                        <div className="main-top-label">语言：</div>
                        <Select placeholder="请选择语言"
                                onChange={langChange}
                                className="select-left" defaultValue={'scenest'}>
                            <Option value={'scenest'}># scenest</Option>
                            <Option value={'scenic'}># scenic</Option>
                        </Select>
                    </div>

                    <CopyToClipboard onCopy={handleCopy}
                                     text={selectNode.code}>
                        <div className="btn"><i className="iconfont icondocument"/>复制</div>
                    </CopyToClipboard>
                </div>
                <div className="main-code">
                    <CodeMirror
                        value={selectNode.code}
                        ref={codeMirror}
                        options={{
                            theme: 'base16-dark',
                            mode: 'jsx',
                            lineWrapping: true,
                        }}
                    />
                </div>
            </div>
        </div>
    )
};
export default Knowledge;
