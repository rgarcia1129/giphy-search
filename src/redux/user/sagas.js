import {all, takeEvery, put, call} from 'redux-saga/effects';
import {LOGIN, REGISTER, LOGOUT, LOAD_CURRENT_USER, SET_STATE, CLEAR_ERRORS} from './actions';
import {CLOSE_MODAL} from '../application/actions';
import {GET_FAVORITES} from '../favorites/actions';
import {appLoading, appNotLoading} from '../application/actions';
import {fbRegister, fbUpdateName, fbLogin, fbLogout, fbCurrentUser} from '../../services/firebase';
import {createMongoUser} from '../../services/authentication';

export function* login({payload}){
  const {email, password} = payload;
  yield put({type: CLEAR_ERRORS});

  yield put({
    type: SET_STATE,
    payload: {
      loading: true
    }
  })

  const response = yield call(fbLogin, email, password);
  if (response) {
    yield put({
      type: LOAD_CURRENT_USER
    });
    yield put({
      type: CLOSE_MODAL
    });
  } else {
    yield put({
      type: SET_STATE,
      payload: {
        loginSubmitErrors: 'Invalid user name / password'
      }
    })
  }
}

export function* register({payload}){
  const {firstName, lastName, email, password} = payload;
  yield put({type: CLEAR_ERRORS});
  yield put({
    type: SET_STATE,
    payload: {
      loading: true
    }
  })

  //create user record in firebase
  const user = yield call(fbRegister, email, password);

  if (user) {

    //call server to create a user record in mongodb with newly generated firebase id
    const response = yield call(createMongoUser, user.uid, firstName, lastName, email);

    //if mongo user created, then update firebase first name and last name.
    if(response && response.message === 'User successfully created'){
      //update firebase record to include first and last name
      yield call(fbUpdateName, user, firstName, lastName);

      yield put({
        type: CLOSE_MODAL
      });
    }
  } else {
    yield put({
      type: SET_STATE,
      payload: {
        registerSubmitErrors: 'User creation failed. Please try again later.'
      }
    })
  }


  yield put({
    type: LOAD_CURRENT_USER,
  });
}

export function* logout(){
  yield call(fbLogout)
  window.localStorage.removeItem('hebCodeChallenge.accessToken');
  yield put({
    type: SET_STATE,
    payload: {
      id: '',
      name: '',
      email: '',
      authorized: false,
      loading: false
    }
  })
}

export function* loadCurrentUser(){
  yield put(appLoading());

  window.localStorage.removeItem('hebCodeChallenge.accessToken');
  yield put({
    type: SET_STATE,
    payload: {
      loading: true
    }
  });

  const response = yield call(fbCurrentUser);
  if (response && response.uid) {
    const {uid, displayName, email} = response;

    window.localStorage.setItem('hebCodeChallenge.accessToken', response.ra)

    yield put({
      type: SET_STATE,
      payload: {
        id: uid,
        name: displayName,
        email,
        authorized: true,
        loading: false
      }
    });

    yield put({type: GET_FAVORITES});
  } else {
    yield put({
      type: LOGOUT
    });
  }

  yield put(appNotLoading());

}

export function* clearErrors() {
  yield put({
    type: SET_STATE,
    payload: {
      loginSubmitErrors: null,
      registerSubmitErrors: null
    }
  });
}

export default function* rootSaga(){
  yield all([
    takeEvery(LOGIN, login ),
    takeEvery(REGISTER, register),
    takeEvery(LOGOUT, logout),
    takeEvery(LOAD_CURRENT_USER, loadCurrentUser),
    takeEvery(CLEAR_ERRORS, clearErrors),
    loadCurrentUser()//run once on app load
  ])
}
