
import { combineReducers } from 'redux';
import inputValue from './inputValue';
import activeTab from './activeTab';
import profileForm from './profileForm';
import sessionForm from './sessionForm';
import userProfile from './userProfile';
import sessionStatus from './sessionStatus';

export default combineReducers({
  inputValue,
  activeTab,
  profileForm,
  sessionForm,
  userProfile,
  sessionStatus,
});
