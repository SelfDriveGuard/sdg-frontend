const defaultState = {
    operateStatus: false,
};

const reducer = (state = defaultState, action) => {
    if (action.type === 'SET_STATUS') {
        return {
            ...state,
            operateStatus: action.status,
        };
    } else {
        return state;
    }
};

export {
    defaultState, reducer
}
