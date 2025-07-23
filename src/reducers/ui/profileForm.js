
import * as TYPE from 'actions/types';

const initialState = {
  username: '',
  password: '',
  pin: '',
};

export default function profileForm(state = initialState, action) {
  switch (action.type) {
    case TYPE.UPDATE_PROFILE_FORM:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
