export default (reducer) => (initState) => (state = initState, action) => {
  let newState = {};

  if (Object.prototype.hasOwnProperty.call(reducer, action.type)) {
    newState = reducer[action.type](state, action);
  } else {
    newState = state;
  }

  return newState;
};
