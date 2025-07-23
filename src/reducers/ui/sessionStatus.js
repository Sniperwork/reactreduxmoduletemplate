
import * as TYPE from 'actions/types';

const initialState = null;

export default function sessionStatus(state = initialState, action) {
  switch (action.type) {
    case TYPE.SET_SESSION_STATUS:
      return action.payload;
    default:
      return state;
  }
}
