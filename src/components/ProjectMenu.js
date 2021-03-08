import React, {useState, useEffect, useContext} from "react";
import {Tree, Dropdown, message, Popconfirm} from 'antd';
import AddProjectModal from './AddProjectModal';
import RenameModal from "./RenameModal";
import {getTreeApi, deleteProjectApi, saveProjectApi} from '../api';
import IndexContext from "../context";
import {baseUrl} from '../plugins/axios';

let currentNode;
const ProjectMenu = (props) => {
    const {getCode} = props;
    const {loginStatus, dispatch} = useContext(IndexContext);
    const [addVisible, setAddVisible] = useState(false);
    const [renameVisible, setRenameVisible] = useState(false);
    const [treeData, setTreeData] = useState([]);
    const [selectNode, setSelectNode] = useState({});
    const handleRename = () => {
        setRenameVisible(true);
    };

    const handleDelete = async () => {
        await deleteProjectApi({
            filePath: currentNode.path,
        });
        message.success('删除成功');
        await getTreeData();
    };

    const handleSave = async () => {
        const code = await getCode();
        await saveProjectApi({
            filePath: currentNode.path,
            code,
        });
        message.success('保存成功');
        await getTreeData();
    };

    const handleDownload = async () => {
        window.open(`${baseUrl}/user/downloadProject?filePath=${currentNode.path}&name=${currentNode.name}`)
    };

    const dropDownFather =
        <Dropdown
            overlay={
                <div className="tree-dropdown">
                    <p onClick={handleRename}>重命名</p>
                </div>
            } placement="bottomCenter" trigger={['click']}>
            <i className="iconfont iconellipsis"/>
        </Dropdown>;

    const dropDownChild = <Dropdown
        overlay={
            <div className="tree-dropdown">
                <p onClick={handleRename}>重命名</p>
                <Popconfirm
                    title="确定要删除吗?"
                    onConfirm={handleDelete}
                    okText="确定"
                    cancelText="取消"
                >
                    <p>删除</p>
                </Popconfirm>
                <p onClick={handleDownload}>下载</p>
                <p onClick={handleSave}>保存</p>
            </div>
        } placement="bottomCenter" trigger={['click']}>
        <i className="iconfont iconellipsis"/>
    </Dropdown>;

    const getTreeData = async () => {
        const {data} = await getTreeApi();
        data.forEach((item) => {
            item.title =
                <div className="father-tree">
                    <div>
                        <i className="iconfont iconxiangmu"/>
                        <span>{item.name}</span>
                    </div>
                    {dropDownFather}
                </div>;
            item.children.forEach((innerItem) => {
                innerItem.title =
                    <div className="child-tree">
                        <div>
                            <i className="iconfont icondocument"/>
                            <span>{innerItem.name}</span>
                        </div>
                        {dropDownChild}
                    </div>
            });
        });
        setTreeData(data);
    };

    useEffect(() => {
        if (loginStatus) {
            (async () => {
                await getTreeData();
            })()
        }
    }, [loginStatus]);

    const updateSuccess = async () => {
        await getTreeData();
    };

    const handleTreeSelect = (key, info) => {
        if (info.node.isLeaf) {
            dispatch({type: 'SET_CODE', code: info.node.code});
        }
        currentNode = info.node;
        setSelectNode(info.node);
    };

    return (
        <div className="main-menu">
            <div className="menu-top">
                <span>项目管理</span>
                <i className="iconfont iconplus-circle" onClick={() => {
                    if (!loginStatus) {
                        dispatch({type: 'SET_LOGIN', status: true});
                        return;
                    }
                    setAddVisible(true)
                }}/>
            </div>
            <div className="main-cont">
                <Tree
                    onSelect={handleTreeSelect}
                    showIcon
                    defaultExpandAll
                    defaultSelectedKeys={['0-0-0']}
                    treeData={treeData}
                />
            </div>
            <AddProjectModal visible={addVisible}
                             updateSuccess={updateSuccess}
                             cancel={() => {
                                 setAddVisible(false)
                             }}/>
            <RenameModal visible={renameVisible}
                         updateSuccess={updateSuccess}
                         selectNode={selectNode}
                         cancel={() => {
                             setRenameVisible(false)
                         }}/>
        </div>
    )
};
export default ProjectMenu;
