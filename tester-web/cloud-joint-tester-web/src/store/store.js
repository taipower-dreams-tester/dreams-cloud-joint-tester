import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers/rootReducer';
import rootSaga from './sagas/saga';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const saga = createSagaMiddleware();

function setStore() {
  const initState = {};
  const middlewares = [saga];

  const store = createStore(
    rootReducer,
    initState,
    composeEnhancers(applyMiddleware(...middlewares)),
  );

  saga.run(rootSaga);

  return store;
}

export default setStore();
