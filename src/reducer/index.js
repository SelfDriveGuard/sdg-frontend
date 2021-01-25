const defaultState = {
    operateStatus: false, // 运行结果显示
    loginVisible: false, // 登陆弹框
    registerVisible: false, // 注册弹框
    loginStatus: false, // 是否登录
    code: '',
    myServer: [], // 我的服务器列表
};

const reducer = (state = defaultState, action) => {
    switch (action.type) {
        case 'SET_OPERATE_STATUS':
            return {
                ...state,
                operateStatus: action.status,
            };
        case 'SET_LOGIN':
            return {
                ...state,
                loginVisible: action.status,
            };
        case 'SET_REGISTER':
            return {
                ...state,
                registerVisible: action.status,
            };
        case 'SET_LOGIN_STATUS':
            return {
                ...state,
                loginStatus: action.status,
            };
        case 'SET_CODE':
            return {
                ...state,
                code: action.code,
            };
        case 'SET_MY_SERVER':
            return {
                ...state,
                myServer: action.myServer,
            };
        default:
            return state;
    }

};

export {
    defaultState, reducer
}
