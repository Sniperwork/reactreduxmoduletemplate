
import * as TYPE from './types';

export const showConnections = () => ({
  type: TYPE.SHOW_CONNECTIONS,
});

export const hideConnections = () => ({
  type: TYPE.HIDE_CONNECTIONS,
});

export const updateInput = (inputValue) => ({
  type: TYPE.UPDATE_INPUT,
  payload: inputValue,
});

export const setActiveTab = (tab) => ({
  type: TYPE.SET_ACTIVE_TAB,
  payload: tab,
});

export const updateProfileForm = (formData) => ({
  type: TYPE.UPDATE_PROFILE_FORM,
  payload: formData,
});

export const updateSessionForm = (formData) => ({
  type: TYPE.UPDATE_SESSION_FORM,
  payload: formData,
});

export const setUserProfile = (profile) => ({
  type: TYPE.SET_USER_PROFILE,
  payload: profile,
});

export const setSessionStatus = (status) => ({
  type: TYPE.SET_SESSION_STATUS,
  payload: status,
});
