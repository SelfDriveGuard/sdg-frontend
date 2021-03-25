const defaultState = {
    operateStatus: false, // 运行结果显示
    loginVisible: false, // 登陆弹框
    registerVisible: false, // 注册弹框
    userInfo: false, // 是否登录
    code: '',
    myServer: [], // 我的服务器列表,
    assertion: [],  //Assert关键点
    loading: false,
    outputMsg: [],
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
        case 'SET_USER_INFO':
            return {
                ...state,
                userInfo: action.userInfo,
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
        case 'SET_ASSERTION':
            return {
                ...state,
                assertion: action.cont,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.loading,
            };
        case 'SET_OUTPUT_MSG':
            return {
                ...state,
                outputMsg: action.outputMsg,
            };
        default:
            return state;
    }

};

export {
    defaultState, reducer
}
