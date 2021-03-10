import http from "../plugins/axios";

// 注册
export function registerApi(data) {
    return http({
        url: '/user/register',
        method: "POST",
        data,
    });
}

// 登录
export function loginApi(data) {
    return http({
        url: '/user/login',
        method: "POST",
        data,
    });
}

// 登出
export function logoutApi() {
    return http({
        url: '/user/logout',
        method: "POST",
    });
}

// 查看是否登录
export function meApi() {
    return http({
        url: '/user/me',
        method: "GET",
    });
}

// 获取服务器列表
export function getServersApi() {
    return http({
        url: '/server/list',
        method: "GET",
    });
}

// 购买服务器
export function buyServerApi(data) {
    return http({
        url: '/server/purchase',
        method: "POST",
        data,
    });
}

// 获取我的服务器列表
export function myServerApi() {
    return http({
        url: '/server/me',
        method: "GET",
    });
}

// 项目管理 获取树
export function getTreeApi() {
    return http({
        url: '/user/getProject',
        method: "GET",
    });
}

// 项目管理 新建项目
export function addProjectApi(data) {
    return http({
        url: '/user/addProject',
        method: "POST",
        data,
    });
}

// 项目管理 重命名
export function updateProjectApi(data) {
    return http({
        url: '/user/updateProject',
        method: "POST",
        data,
    });
}

// 项目管理 删除
export function deleteProjectApi(data) {
    return http({
        url: '/user/deleteProject',
        method: "POST",
        data,
    });
}

// 项目管理 保存
export function saveProjectApi(data) {
    return http({
        url: '/user/saveProject',
        method: "POST",
        data,
    });
}

// 知识库
export function getExampleApi() {
    return http({
        url: '/example',
        method: "GET",
    });
}

