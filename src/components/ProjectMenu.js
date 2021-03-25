import React, {useState, useEffect, useContext} from "react";
import {Tree, Dropdown, message, Popconfirm} from 'antd';
import AddProjectModal from './AddProjectModal';
import RenameModal from "./RenameModal";
import {getTreeApi, deleteProjectApi, saveProjectApi} from '../api';
import IndexContext from "../context";
import {baseUrl} from '../plugins/axios';
import {useI18n} from "../plugins/use-i18n";

let currentNode;
const ProjectMenu = (props) => {
    const {getCode} = props;
    const {userInfo, dispatch} = useContext(IndexContext);
    const [addVisible, setAddVisible] = useState(false);
    const [renameVisible, setRenameVisible] = useState(false);
    const [treeData, setTreeData] = useState([]);
    const [selectNode, setSelectNode] = useState({});

    const t = useI18n();
    const handleRename = () => {
        setRenameVisible(true);
    };

    const handleDelete = async () => {
        await deleteProjectApi({
            filePath: currentNode.path,
        });
        message.success(t.deleteSuccess);
        await getTreeData();
    };

    const handleSave = async () => {
        const code = await getCode();
        await saveProjectApi({
            filePath: currentNode.path,
            code,
        });
        message.success(t.saveSuccess);
        await getTreeData();
    };

    const handleDownload = async () => {
        window.open(`${baseUrl}/user/downloadProject?filePath=${currentNode.path}&name=${currentNode.name}`)
    };

    const dropDownFather =
        <Dropdown
            overlay={
                <div className="tree-dropdown">
                    <p onClick={handleRename}>{t.rename}</p>
                </div>
            } placement="bottomCenter" trigger={['click']}>
            <i className="iconfont iconellipsis"/>
        </Dropdown>;

    const dropDownChild = <Dropdown
        overlay={
            <div className="tree-dropdown">
                <p onClick={handleRename}>{t.rename}</p>
                <Popconfirm
                    title={t.sureDelete}
                    onConfirm={handleDelete}
                    okText={t.ok}
                    cancelText={t.cancel}
                >
                    <p>{t.delete}</p>
                </Popconfirm>
                <p onClick={handleDownload}>{t.download}</p>
                <p onClick={handleSave}>{t.save}</p>
            </div>
        } placement="bottomCenter" trigger={['click']}>
        <i className="iconfont iconellipsis"/>
    </Dropdown>;

    const getTreeData = async () => {
        const {data} = await getTreeApi();
        data.forEach((item) => {
            item.title =
                <div className="father-tree">
                    <div className="name-wrapper">
                        <i className="iconfont iconxiangmu"/>
                        <span className="name">{item.name}</span>
                    </div>
                    {dropDownFather}
                </div>;
            item.children.forEach((innerItem) => {
                innerItem.title =
                    <div className="child-tree">
                        <div className="name-wrapper">
                            <i className="iconfont icondocument"/>
                            <span className="name">{innerItem.name}</span>
                        </div>
                        {dropDownChild}
                    </div>
            });
        });
        setTreeData(data);
    };

    useEffect(() => {
        if (userInfo) {
            (async () => {
                await getTreeData();
            })()
        }
    }, [userInfo]);

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
                <span>{t.projectManage}</span>
                <i className="iconfont iconplus-circle" onClick={() => {
                    if (!userInfo) {
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
