
import * as TYPE from 'actions/types';

const initialState = null;

export default function userProfile(state = initialState, action) {
  switch (action.type) {
    case TYPE.SET_USER_PROFILE:
      return action.payload;
    default:
      return state;
  }
}
