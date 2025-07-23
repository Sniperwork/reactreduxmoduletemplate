import { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { useSelector, useDispatch } from 'react-redux';
import {
  Panel,
  Button,
  TextField,
  FieldSet,
} from 'nexus-module';

// Access NEXUS utilities from the global object
const { 
  utilities: {
    confirm,
    apiCall,
    secureApiCall,
    showErrorDialog,
    showSuccessDialog,
    showNotification
  }
} = NEXUS;

import {
  setActiveTab,
  updateProfileForm,
  updateSessionForm,
  setUserProfile,
  setSessionStatus,
} from 'actions/actionCreators';

// Dark theme styled components
const DarkContainer = styled.div({
  background: 'linear-gradient(135deg, #0a0a1f 0%, #1a1a2e 50%, #16213e 100%)',
  minHeight: '100vh',
  color: '#e2e8f0',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 50% 0%, rgba(0, 212, 170, 0.03) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: -1,
  },
  // Enhanced scrollbar styles for better visibility
  '& *': {
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(0, 212, 170, 0.8) rgba(26, 32, 44, 0.6)',
  },
  '& *::-webkit-scrollbar': {
    width: '12px',
    height: '12px',
  },
  '& *::-webkit-scrollbar-track': {
    background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.8) 0%, rgba(45, 55, 72, 0.6) 100%)',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  '& *::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.9) 0%, rgba(0, 184, 148, 1) 100%)',
    borderRadius: '6px',
    border: '2px solid rgba(0, 212, 170, 0.4)',
    boxShadow: '0 3px 12px rgba(0, 212, 170, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
    minHeight: '30px',
  },
  '& *::-webkit-scrollbar-thumb:hover': {
    background: 'linear-gradient(135deg, rgba(0, 245, 184, 1) 0%, rgba(0, 200, 160, 1) 100%)',
    boxShadow: '0 6px 18px rgba(0, 212, 170, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
    border: '2px solid rgba(0, 245, 184, 0.6)',
  },
  '& *::-webkit-scrollbar-thumb:active': {
    background: 'linear-gradient(135deg, rgba(0, 200, 160, 1) 0%, rgba(0, 170, 140, 1) 100%)',
    boxShadow: '0 2px 8px rgba(0, 212, 170, 0.3)',
  },
  '& *::-webkit-scrollbar-corner': {
    background: 'rgba(26, 32, 44, 0.8)',
  },
});

const NavigationBar = styled.div({
  display: 'flex',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  padding: '0 32px',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.5), transparent)',
  },
});

const NavTab = styled.button(({ active }) => ({
  background: active 
    ? 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)' 
    : 'transparent',
  border: 'none',
  color: active ? '#ffffff' : '#cbd5e0',
  padding: '18px 28px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: active ? '600' : '500',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: '12px',
  margin: '12px 6px',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: '140px',
  justifyContent: 'center',
  textTransform: 'none',
  letterSpacing: '0.025em',
  boxShadow: active 
    ? '0 4px 20px rgba(0, 212, 170, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    color: active ? '#ffffff' : '#00d4aa',
    background: active 
      ? 'linear-gradient(135deg, #00e5bc 0%, #00c49a 100%)' 
      : 'rgba(0, 212, 170, 0.08)',
    transform: 'translateY(-1px)',
    boxShadow: active 
      ? '0 6px 25px rgba(0, 212, 170, 0.4)' 
      : '0 4px 15px rgba(0, 212, 170, 0.2)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&::before': active ? {
    content: '""',
    position: 'absolute',
    bottom: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '3px',
    background: 'linear-gradient(90deg, #00d4aa, #00b894)',
    borderRadius: '2px',
  } : {},
}));

const ContentArea = styled.div({
  padding: '24px',
  maxWidth: '1200px',
  margin: '0 auto',
  height: 'calc(100vh - 120px)',
  overflowY: 'auto',
  overflowX: 'hidden',
});

const Card = styled.div({
  background: 'linear-gradient(145deg, rgba(26, 32, 44, 0.8), rgba(45, 55, 72, 0.6))',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  padding: '28px',
  margin: '20px 0',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    borderRadius: '16px 16px 0 0',
  },
});

const StyledTextField = styled(TextField)({
  background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.9) 0%, rgba(45, 55, 72, 0.8) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  color: '#e2e8f0',
  padding: '16px 20px',
  fontSize: '15px',
  fontWeight: '400',
  width: '100%',
  minWidth: '320px',
  height: '52px',
  marginBottom: '18px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  display: 'block',
  boxSizing: 'border-box',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.3), transparent)',
    borderRadius: '12px 12px 0 0',
  },
  '&:focus': {
    borderColor: 'rgba(0, 212, 170, 0.5)',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(0, 212, 170, 0.25), 0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(45, 55, 72, 0.9) 100%)',
    transform: 'translateY(-1px)',
  },
  '&:hover': {
    borderColor: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0 10px 35px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
    transform: 'translateY(-1px)',
  },
  '&::placeholder': {
    color: '#94a3b8',
    fontWeight: '400',
  },
  // Ensure input styling
  '& input': {
    color: '#e2e8f0',
    fontSize: '15px',
    fontWeight: '400',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    '&::placeholder': {
      color: '#94a3b8',
      fontWeight: '400',
    },
  },
});

const ActionButton = styled(Button)(({ variant = 'primary' }) => ({
  background: variant === 'primary' 
    ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
    : variant === 'secondary'
    ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
    : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
  border: variant === 'secondary' 
    ? '1px solid rgba(45, 55, 72, 0.6)' 
    : variant === 'primary'
    ? '1px solid rgba(0, 212, 170, 0.3)'
    : 'none',
  color: variant === 'primary' ? '#00d4aa' : '#ffffff',
  padding: '14px 28px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  margin: '0 8px 8px 0',
  minWidth: '160px',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: variant === 'primary'
    ? '0 8px 25px rgba(0, 212, 170, 0.2), 0 4px 10px rgba(0, 0, 0, 0.3)'
    : variant === 'secondary'
    ? '0 8px 25px rgba(75, 85, 99, 0.3), 0 4px 10px rgba(0, 0, 0, 0.3)'
    : '0 8px 25px rgba(127, 29, 29, 0.3), 0 4px 10px rgba(0, 0, 0, 0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    background: variant === 'primary'
      ? 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)'
      : variant === 'secondary'
      ? 'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)'
      : 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)',
    color: variant === 'primary' ? '#00f5d4' : '#ffffff',
    textShadow: '0 3px 6px rgba(0, 0, 0, 0.5)',
    boxShadow: variant === 'primary'
      ? '0 12px 35px rgba(0, 212, 170, 0.3), 0 6px 15px rgba(0, 0, 0, 0.4)'
      : variant === 'secondary'
      ? '0 12px 35px rgba(75, 85, 99, 0.4), 0 6px 15px rgba(0, 0, 0, 0.4)'
      : '0 12px 35px rgba(127, 29, 29, 0.4), 0 6px 15px rgba(0, 0, 0, 0.4)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(-1px)',
    boxShadow: variant === 'primary'
      ? '0 4px 15px rgba(0, 212, 170, 0.2)'
      : variant === 'secondary'
      ? '0 4px 15px rgba(75, 85, 99, 0.3)'
      : '0 4px 15px rgba(127, 29, 29, 0.3)',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
    background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
    color: '#9ca3af',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(156, 163, 175, 0.2)',
    '&::before': {
      display: 'none',
    },
  },
}));

const StatusIndicator = styled.div(({ status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  background: status === 'connected' 
    ? 'rgba(0, 212, 170, 0.2)'
    : 'rgba(255, 107, 107, 0.2)',
  color: status === 'connected' ? '#00d4aa' : '#ff6b6b',
  border: `1px solid ${status === 'connected' ? '#00d4aa' : '#ff6b6b'}`,
}));

const GridContainer = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  marginTop: '20px',
});

export default function Main() {
  const activeTab = useSelector((state) => state.ui.activeTab);
  const profileForm = useSelector((state) => state.ui.profileForm);
  const sessionForm = useSelector((state) => state.ui.sessionForm);
  const userProfile = useSelector((state) => state.ui.userProfile);
  const sessionStatus = useSelector((state) => state.ui.sessionStatus);
  const userStatus = useSelector((state) => state.nexus.userStatus);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [marketStats, setMarketStats] = useState({
    lastPrice: 0,
    volume24h: 0,
    highPrice: 0,
    lowPrice: 0
  });
  const [orderHistory, setOrderHistory] = useState([]);
  const [bidPage, setBidPage] = useState(0);
  const [askPage, setAskPage] = useState(0);
  const [userAccounts, setUserAccounts] = useState([]);
  const ORDERS_PER_PAGE = 5;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'profile', label: 'Profile Management', icon: '👤' },
    { id: 'session', label: 'Session Control', icon: '🔐' },
    { id: 'marketplace', label: 'Carbon Credits', icon: '🌱' },
    { id: 'wallet', label: 'Wallet', icon: '💰' },
  ];

  // Profile Management Functions
  const createProfile = async () => {
    if (!profileForm.username || !profileForm.password || !profileForm.pin) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Required Fields',
        note: 'Please fill in username, password, and PIN',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await apiCall('profiles/create/master', {
        username: profileForm.username,
        password: profileForm.password,
        pin: profileForm.pin,
      });

      NEXUS.utilities.showSuccessDialog({
        message: 'Profile Created Successfully',
        note: `Transaction ID: ${result.txid}`,
      });

      dispatch(updateProfileForm({ username: '', password: '', pin: '' }));
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Profile Creation Failed',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProfileStatus = async () => {
    try {
      setLoading(true);
      const result = await NEXUS.utilities.apiCall('profiles/status/master');
      dispatch(setUserProfile(result));

      NEXUS.utilities.showSuccessDialog({
        message: 'Profile Status Retrieved',
        note: JSON.stringify(result, null, 2),
      });
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Failed to Get Profile Status',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  // Session Management Functions
  const createSession = async () => {
    if (!sessionForm.username || !sessionForm.password || !sessionForm.pin) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Required Fields',
        note: 'Please fill in username, password, and PIN',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await NEXUS.utilities.apiCall('sessions/create/local', {
        username: sessionForm.username,
        password: sessionForm.password,
        pin: sessionForm.pin,
      });

      NEXUS.utilities.showSuccessDialog({
        message: 'Session Created Successfully',
        note: `Session ID: ${result.session}`,
      });

      await getSessionStatus();
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Session Creation Failed',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const unlockSession = async () => {
    try {
      setLoading(true);
      const result = await NEXUS.utilities.apiCall('sessions/unlock/local', {
        pin: sessionForm.pin,
        mining: false,
        notifications: true,
        staking: false,
        transactions: true,
      });

      dispatch(setSessionStatus(result));
      NEXUS.utilities.showSuccessDialog({
        message: 'Session Unlocked Successfully',
        note: 'Session is now ready for transactions',
      });
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Failed to Unlock Session',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSessionStatus = async () => {
    try {
      const result = await NEXUS.utilities.apiCall('sessions/status/local');
      dispatch(setSessionStatus(result));
    } catch (error) {
      console.error('Failed to get session status:', error);
    }
  };

  const terminateSession = async () => {
    const agreed = await NEXUS.utilities.confirm({
      question: 'Are you sure you want to terminate the current session?',
    });

    if (agreed) {
      try {
        setLoading(true);
        await NEXUS.utilities.apiCall('sessions/terminate/local', {
          pin: sessionForm.pin,
        });

        dispatch(setSessionStatus(null));
        NEXUS.utilities.showSuccessDialog({
          message: 'Session Terminated',
          note: 'The session has been successfully terminated',
        });
      } catch (error) {
        NEXUS.utilities.showErrorDialog({
          message: 'Failed to Terminate Session',
          note: error?.message || 'Unknown error occurred',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getSessionStatus();
  }, []);

  // Load wallet data when marketplace tab is selected
  useEffect(() => {
    if (activeTab === 'marketplace') {
      refreshWalletData();
    }
  }, [activeTab]);

  const renderDashboard = () => (
    <div>
      <Card>
        <h2 style={{ color: '#8b5cf6', marginBottom: '16px' }}>🌱 Carbon Credits Marketplace</h2>
        <p style={{ color: '#8892b0', lineHeight: 1.6 }}>
          Welcome to the decentralized carbon credits marketplace built on Nexus Protocol. 
          Trade, verify, and track carbon credits with complete transparency and security.
        </p>

        <GridContainer>
          <Card>
            <h3>Profile Status</h3>
            <StatusIndicator status={userProfile ? 'connected' : 'disconnected'}>
              {userProfile ? '✅ Profile Loaded' : '❌ No Profile'}
            </StatusIndicator>
            {userProfile && (
              <div style={{ marginTop: '12px', fontSize: '14px', color: '#8892b0' }}>
                <div>Genesis: {userProfile.genesis?.substring(0, 16)}...</div>
                <div>Transactions: {userProfile.transactions}</div>
                <div>Recovery: {userProfile.recovery ? '✅' : '❌'}</div>
              </div>
            )}
          </Card>

          <Card>
            <h3>Session Status</h3>
            <StatusIndicator status={sessionStatus ? 'connected' : 'disconnected'}>
              {sessionStatus ? '✅ Session Active' : '❌ No Session'}
            </StatusIndicator>
            {sessionStatus && (
              <div style={{ marginTop: '12px', fontSize: '14px', color: '#8892b0' }}>
                <div>Transactions: {sessionStatus.unlocked?.transactions ? '✅' : '❌'}</div>
                <div>Notifications: {sessionStatus.unlocked?.notifications ? '✅' : '❌'}</div>
                <div>Last Access: {new Date(sessionStatus.accessed * 1000).toLocaleString()}</div>
              </div>
            )}
          </Card>
        </GridContainer>
      </Card>
    </div>
  );

  const renderProfileManagement = () => (
    <div>
      <Card>
        <h2 style={{ color: '#8b5cf6', marginBottom: '16px' }}>👤 Profile Management</h2>

        <FieldSet legend="Create New Profile">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            <StyledTextField
              placeholder="Username (min 2 characters)"
              value={profileForm.username}
              onChange={(e) => dispatch(updateProfileForm({ username: e.target.value }))}
            />
            <StyledTextField
              type="password"
              placeholder="Password (min 8 characters)"
              value={profileForm.password}
              onChange={(e) => dispatch(updateProfileForm({ password: e.target.value }))}
            />
            <StyledTextField
              type="password"
              placeholder="PIN (min 4 characters)"
              value={profileForm.pin}
              onChange={(e) => dispatch(updateProfileForm({ pin: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ActionButton onClick={createProfile} disabled={loading}>
              {loading ? 'Creating...' : 'Create Profile'}
            </ActionButton>
            <ActionButton variant="secondary" onClick={getProfileStatus} disabled={loading}>
              Get Profile Status
            </ActionButton>
          </div>
        </FieldSet>

        {userProfile && (
          <Card>
            <h3>Current Profile Information</h3>
            <div style={{ fontSize: '14px', color: '#8892b0' }}>
              <div><strong>Genesis Hash:</strong> {userProfile.genesis}</div>
              <div><strong>Confirmed:</strong> {userProfile.confirmed ? 'Yes' : 'No'}</div>
              <div><strong>Recovery Set:</strong> {userProfile.recovery ? 'Yes' : 'No'}</div>
              <div><strong>Crypto Object:</strong> {userProfile.crypto ? 'Yes' : 'No'}</div>
              <div><strong>Total Transactions:</strong> {userProfile.transactions}</div>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );

  const renderSessionControl = () => (
    <div>
      <Card>
        <h2 style={{ color: '#8b5cf6', marginBottom: '16px' }}>🔐 Session Control</h2>

        <FieldSet legend="Session Management">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            <StyledTextField
              placeholder="Username"
              value={sessionForm.username}
              onChange={(e) => dispatch(updateSessionForm({ username: e.target.value }))}
            />
            <StyledTextField
              type="password"
              placeholder="Password"
              value={sessionForm.password}
              onChange={(e) => dispatch(updateSessionForm({ password: e.target.value }))}
            />
            <StyledTextField
              type="password"
              placeholder="PIN"
              value={sessionForm.pin}
              onChange={(e) => dispatch(updateSessionForm({ pin: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ActionButton onClick={createSession} disabled={loading}>
              {loading ? 'Creating...' : 'Create Session'}
            </ActionButton>
            <ActionButton onClick={unlockSession} disabled={loading}>
              Unlock Session
            </ActionButton>
            <ActionButton variant="secondary" onClick={getSessionStatus} disabled={loading}>
              Check Status
            </ActionButton>
            <ActionButton variant="danger" onClick={terminateSession} disabled={loading}>
              Terminate Session
            </ActionButton>
          </div>
        </FieldSet>

        {sessionStatus && (
          <Card>
            <h3>Session Information</h3>
            <div style={{ fontSize: '14px', color: '#8892b0' }}>
              <div><strong>Genesis:</strong> {sessionStatus.genesis}</div>
              <div><strong>Location:</strong> {sessionStatus.location}</div>
              <div><strong>Last Accessed:</strong> {new Date(sessionStatus.accessed * 1000).toLocaleString()}</div>

              <h4 style={{ color: '#00d4aa', marginTop: '16px' }}>Unlock Status:</h4>
              <div>Mining: {sessionStatus.unlocked?.mining ? '✅ Enabled' : '❌ Disabled'}</div>
              <div>Notifications: {sessionStatus.unlocked?.notifications ? '✅ Enabled' : '❌ Disabled'}</div>
              <div>Staking: {sessionStatus.unlocked?.staking ? '✅ Enabled' : '❌ Disabled'}</div>
              <div>Transactions: {sessionStatus.unlocked?.transactions ? '✅ Enabled' : '❌ Disabled'}</div>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );

  // Market API state
  const [marketData, setMarketData] = useState({ bids: [], asks: [] });
  const [userOrders, setUserOrders] = useState({ bids: [], asks: [] });
  const [selectedMarket, setSelectedMarket] = useState('CARBON/NXS');
  const [orderForm, setOrderForm] = useState({
    type: 'bid',
    amount: '',
    price: '',
    from: '',
    to: ''
  });

  //  // Market API Functions
  const createMarketOrder = async () => {
    if (!orderForm.amount || !orderForm.price || !orderForm.from || !orderForm.to) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Required Fields',
        note: 'Please fill in all order details',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await NEXUS.utilities.secureApiCall(`market/create/${orderForm.type}`, {
        market: selectedMarket,
        amount: parseFloat(orderForm.amount),
        price: parseFloat(orderForm.price),
        from: orderForm.from,
        to: orderForm.to
      });

      NEXUS.utilities.showSuccessDialog({
        message: 'Order Created Successfully',
        note: `Transaction ID: ${result.txid}`,
      });

      setOrderForm({ type: 'bid', amount: '', price: '', from: '', to: '' });
      await refreshMarketData();
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Order Creation Failed',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const executeOrder = async (txid) => {
    if (!orderForm.from || !orderForm.to) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Account Details',
        note: 'Please specify from and to accounts',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await NEXUS.utilities.secureApiCall('market/execute/order', {
        txid,
        from: orderForm.from,
        to: orderForm.to
      });

      NEXUS.utilities.showSuccessDialog({
        message: 'Order Executed Successfully',
        note: `Transaction ID: ${result.txid}`,
      });

      await refreshMarketData();
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Order Execution Failed',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (txid) => {
    try {
      setLoading(true);
      const result = await NEXUS.utilities.secureApiCall('market/cancel/order', {
        txid
      });

      NEXUS.utilities.showSuccessDialog({
        message: 'Order Canceled Successfully',
        note: `Transaction ID: ${result.txid}`,
      });

      await refreshMarketData();
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Order Cancellation Failed',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  // Optimized market data refresh with parallel API calls and error handling
  const refreshMarketData = async () => {
    try {
      // Use Promise.allSettled to load market data and user orders in parallel
      const [marketResult, userResult] = await Promise.allSettled([
        NEXUS.utilities.apiCall('market/list/order', {
          market: selectedMarket,
          limit: 100 // Limit results for better performance
        }),
        NEXUS.utilities.apiCall('market/user/order', {
          market: selectedMarket
        })
      ]);

      // Handle market data result
      if (marketResult.status === 'fulfilled') {
        setMarketData(marketResult.value || { bids: [], asks: [] });
      } else {
        console.error('Failed to load market data:', marketResult.reason);
        setMarketData({ bids: [], asks: [] });
      }

      // Handle user orders result
      if (userResult.status === 'fulfilled') {
        setUserOrders(userResult.value || { bids: [], asks: [] });
      } else {
        console.error('Failed to load user orders:', userResult.reason);
        setUserOrders({ bids: [], asks: [] });
      }

    } catch (error) {
      console.error('Failed to refresh market data:', error);
      setMarketData({ bids: [], asks: [] });
      setUserOrders({ bids: [], asks: [] });
    }
  };

  const loadUserAccounts = async () => {
    try {
      const accounts = await NEXUS.utilities.apiCall('finance/list/account');
      setUserAccounts(accounts || []);
    } catch (error) {
      console.error('Failed to load user accounts:', error);
    }
  };

  // Memoized order processing functions to avoid recalculation
  const processedMarketData = useMemo(() => {
    const processOrders = (orders) => {
      return orders?.map(order => {
        // Helper function to convert NXS divisible units to display units
        const convertNXSAmount = (amount, ticker) => {
          if (ticker === 'NXS' || !ticker) {
            return parseFloat(amount || 0) / 1000000; // Convert from divisible units
          }
          return parseFloat(amount || 0);
        };

        // Convert both contract and order amounts properly
        const contractAmount = convertNXSAmount(order.contract?.amount, order.contract?.ticker);
        const orderAmount = convertNXSAmount(order.order?.amount, order.order?.ticker);
        
        // Convert price if it's in NXS divisible units
        let price = parseFloat(order.price || 0);
        // If price seems to be in divisible units (very large number), convert it
        if (price > 100000) {
          price = price / 1000000;
        }
        
        // Calculate total value based on the type of order
        let totalValue;
        let sellingAmount, wantingAmount, sellingTicker, wantingTicker;
        
        if (order.type === 'bid') {
          // For bid orders: user wants to buy CARBON with NXS
          // They're selling NXS (order amount) to get CARBON (contract amount)
          sellingAmount = orderAmount; // NXS they're spending
          wantingAmount = contractAmount; // CARBON they want
          sellingTicker = order.order?.ticker || 'NXS';
          wantingTicker = order.contract?.ticker || 'CARBON';
          totalValue = price * contractAmount; // Total NXS cost
        } else {
          // For ask orders: user wants to sell CARBON for NXS  
          // They're selling CARBON (contract amount) to get NXS (order amount)
          sellingAmount = contractAmount; // CARBON they're selling
          wantingAmount = orderAmount; // NXS they want
          sellingTicker = order.contract?.ticker || 'CARBON';
          wantingTicker = order.order?.ticker || 'NXS';
          totalValue = price * contractAmount; // Total NXS value
        }

        return {
          ...order,
          processedData: {
            contractAmount,
            orderAmount,
            price,
            totalValue,
            formattedPrice: price.toFixed(6),
            formattedContractAmount: contractAmount.toFixed(2),
            formattedOrderAmount: orderAmount.toFixed(2),
            formattedTotalValue: totalValue.toFixed(6),
            shortTxid: order.txid?.substring(0, 16),
            shortFromAddress: order.contract?.from?.substring(0, 20),
            shortToAddress: order.order?.to?.substring(0, 20),
            formattedTimestamp: new Date(order.timestamp * 1000).toLocaleString(),
            formattedSelling: sellingAmount.toFixed(2),
            formattedWanting: wantingAmount.toFixed(2),
            sellingTicker,
            wantingTicker,
          }
        };
      }) || [];
    };

    return {
      bids: processOrders(marketData.bids),
      asks: processOrders(marketData.asks)
    };
  }, [marketData]);

  // Optimized initial load effect
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        refreshMarketData(),
        loadUserAccounts(),
        refreshWalletData() // Also load wallet data for account dropdowns
      ]);
    };

    loadInitialData();
  }, [selectedMarket]);

  // Optimized auto-refresh effect
  useEffect(() => {
    let intervalId = null;

    if (autoRefresh) {
      intervalId = setInterval(() => {
        // Only refresh if not currently loading to prevent race conditions
        if (!loading) {
          refreshMarketData();
        }
      }, 15000); // Reduced to 15 seconds for faster updates
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, loading]);

  const renderMarketplace = () => (
    <div>
      <Card>
        <h2 style={{ color: '#00d4aa', marginBottom: '16px' }}>🌱 Carbon Credits Marketplace</h2>
        <p style={{ color: '#8892b0', marginBottom: '24px' }}>
          Trade verified carbon credits on the decentralized Nexus network using the Market API. 
          Each CARBON token represents one metric ton of CO2 equivalent.
        </p>

        {/* Market Selection & Statistics */}
        <FieldSet legend="Market Overview">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <Button
              variant={selectedMarket === 'CARBON/NXS' ? 'primary' : 'secondary'}
              onClick={() => setSelectedMarket('CARBON/NXS')}
              style={{
                background: selectedMarket === 'CARBON/NXS' 
                  ? 'linear-gradient(135deg, #00d4aa 0%, #4ade80 100%)' 
                  : 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              CARBON/NXS Market
            </Button>
            <Button
              variant="secondary"
              onClick={refreshMarketData}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh Market'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                background: autoRefresh 
                  ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' 
                  : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              {autoRefresh ? '⏸️ Auto-Refresh ON' : '▶️ Auto-Refresh OFF'}
            </Button>
          </div>

          {/* Market Statistics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '12px',
            padding: '16px',
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            borderRadius: '12px',
            border: '1px solid #4b5563'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Last Price</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#00d4aa' }}>
                {marketStats.lastPrice.toFixed(4)} NXS
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>24h Volume</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#8892b0' }}>
                {marketStats.volume24h.toFixed(2)} CARBON
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>24h High</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#4ade80' }}>
                {marketStats.highPrice.toFixed(4)} NXS
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>24h Low</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#f87171' }}>
                {marketStats.lowPrice.toFixed(4)} NXS
              </div>
            </div>
          </div>
        </FieldSet>

        {/* Create Order */}
        <FieldSet legend="Create Order">
          {/* Order Type Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#8892b0', marginBottom: '12px', display: 'block', fontSize: '16px', fontWeight: '500' }}>
              Select Order Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button
                onClick={() => setOrderForm({ ...orderForm, type: 'bid' })}
                style={{
                  background: orderForm.type === 'bid' 
                    ? 'linear-gradient(135deg, #4ade80 0%, #059669 100%)' 
                    : 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
                  border: orderForm.type === 'bid' ? '2px solid #4ade80' : '1px solid #6b7280',
                  color: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                🟢 BUY ORDER (Bid)
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                  Buy CARBON with NXS
                </div>
              </button>
              <button
                onClick={() => setOrderForm({ ...orderForm, type: 'ask' })}
                style={{
                  background: orderForm.type === 'ask' 
                    ? 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)' 
                    : 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
                  border: orderForm.type === 'ask' ? '2px solid #f87171' : '1px solid #6b7280',
                  color: '#ffffff',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                🔴 SELL ORDER (Ask)
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                  Sell CARBON for NXS
                </div>
              </button>
            </div>
          </div>

          {/* Order Details Card */}
          <div style={{
            background: orderForm.type === 'bid' 
              ? 'rgba(74, 222, 128, 0.1)' 
              : 'rgba(248, 113, 113, 0.1)',
            border: `1px solid ${orderForm.type === 'bid' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ 
              color: orderForm.type === 'bid' ? '#4ade80' : '#f87171',
              marginBottom: '16px',
              fontSize: '16px'
            }}>
              {orderForm.type === 'bid' ? '🟢 Buy Order Details' : '🔴 Sell Order Details'}
            </h4>

            {/* Order Flow Explanation */}
            <div style={{
              background: 'rgba(26, 32, 44, 0.8)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#8892b0'
            }}>
              <strong>Order Flow:</strong><br/>
              {orderForm.type === 'bid' ? (
                <>
                  • You will <strong style={{color: '#4ade80'}}>spend NXS</strong> from your NXS account<br/>
                  • You will <strong style={{color: '#4ade80'}}>receive CARBON</strong> tokens to your CARBON account<br/>
                  • Price: How much NXS you pay per CARBON token
                </>
              ) : (
                <>
                  • You will <strong style={{color: '#f87171'}}>spend CARBON</strong> tokens from your CARBON account<br/>
                  • You will <strong style={{color: '#f87171'}}>receive NXS</strong> to your NXS account<br/>
                  • Price: How much NXS you get per CARBON token
                </>
              )}
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '20px', 
              marginBottom: '16px' 
            }}>
              {/* Amount and Price */}
              <StyledTextField
                placeholder={`Amount of CARBON tokens to ${orderForm.type === 'bid' ? 'buy' : 'sell'}`}
                value={orderForm.amount}
                onChange={(e) => setOrderForm({ ...orderForm, amount: e.target.value })}
              />
              <StyledTextField
                placeholder="Price (NXS per CARBON)"
                value={orderForm.price}
                onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
              />
            </div>

            {/* Account Selection Section with Better Layout */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '24px', 
              marginBottom: '16px' 
            }}>
              {/* FROM Account Selection */}
              <div>
                <label style={{ 
                  color: orderForm.type === 'bid' ? '#4ade80' : '#f87171', 
                  marginBottom: '12px', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  <span>{orderForm.type === 'bid' ? '🪙' : '🌱'}</span>
                  {orderForm.type === 'bid' ? 'From: Your NXS Account' : 'From: Your CARBON Account'}
                  <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#8892b0' }}>
                    (paying account)
                  </span>
                </label>
                
                <StyledTextField
                  placeholder={orderForm.type === 'bid' 
                    ? "NXS account name/address" 
                    : "CARBON token account name/address"
                  }
                  value={orderForm.from}
                  onChange={(e) => setOrderForm({ ...orderForm, from: e.target.value })}
                  style={{ marginBottom: '8px' }}
                />
                
                <select
                  value={orderForm.from}
                  onChange={(e) => setOrderForm({ ...orderForm, from: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.9) 0%, rgba(45, 55, 72, 0.8) 100%)',
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '400',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#1a202c', color: '#e2e8f0' }}>
                    {orderForm.type === 'bid' ? '🪙 Select your NXS account' : '🌱 Select your CARBON account'}
                  </option>
                  {walletData.accounts
                    ?.filter(account => {
                      if (orderForm.type === 'bid') {
                        return !account.ticker || account.ticker === 'NXS';
                      } else {
                        return account.ticker === 'CARBON';
                      }
                    })
                    ?.map((account, idx) => (
                    <option key={idx} value={account.name || account.address} style={{ background: '#1a202c', color: '#e2e8f0' }}>
                      {account.ticker || 'NXS'} - {account.name || account.address.substring(0, 20)}... - Balance: {parseFloat(account.balance || 0).toFixed(2)}
                    </option>
                  ))}
                </select>

                {walletData.accounts?.length === 0 && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#f87171', 
                    padding: '8px', 
                    background: 'rgba(248, 113, 113, 0.1)', 
                    borderRadius: '6px',
                    border: '1px solid rgba(248, 113, 113, 0.2)'
                  }}>
                    ⚠️ No accounts found. Please create accounts in the Wallet tab first.
                  </div>
                )}
              </div>

              {/* TO Account Selection */}
              <div>
                <label style={{ 
                  color: orderForm.type === 'bid' ? '#4ade80' : '#f87171', 
                  marginBottom: '12px', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  <span>{orderForm.type === 'bid' ? '🌱' : '🪙'}</span>
                  {orderForm.type === 'bid' ? 'To: Your CARBON Account' : 'To: Your NXS Account'}
                  <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#8892b0' }}>
                    (receiving account)
                  </span>
                </label>
                
                <StyledTextField
                  placeholder={orderForm.type === 'bid' 
                    ? "CARBON token account name/address" 
                    : "NXS account name/address"
                  }
                  value={orderForm.to}
                  onChange={(e) => setOrderForm({ ...orderForm, to: e.target.value })}
                  style={{ marginBottom: '8px' }}
                />
                
                <select
                  value={orderForm.to}
                  onChange={(e) => setOrderForm({ ...orderForm, to: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.9) 0%, rgba(45, 55, 72, 0.8) 100%)',
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '400',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#1a202c', color: '#e2e8f0' }}>
                    {orderForm.type === 'bid' ? '🌱 Select your CARBON account' : '🪙 Select your NXS account'}
                  </option>
                  {walletData.accounts
                    ?.filter(account => {
                      if (orderForm.type === 'bid') {
                        return account.ticker === 'CARBON';
                      } else {
                        return !account.ticker || account.ticker === 'NXS';
                      }
                    })
                    ?.map((account, idx) => (
                    <option key={idx} value={account.name || account.address} style={{ background: '#1a202c', color: '#e2e8f0' }}>
                      {account.ticker || 'NXS'} - {account.name || account.address.substring(0, 20)}... - Balance: {parseFloat(account.balance || 0).toFixed(2)}
                    </option>
                  ))}
                </select>

                {walletData.accounts?.length === 0 && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#f87171', 
                    padding: '8px', 
                    background: 'rgba(248, 113, 113, 0.1)', 
                    borderRadius: '6px',
                    border: '1px solid rgba(248, 113, 113, 0.2)'
                  }}>
                    ⚠️ No accounts found. Please create accounts in the Wallet tab first.
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            {orderForm.amount && orderForm.price && (
              <div style={{
                background: 'rgba(26, 32, 44, 0.9)',
                padding: '16px',
                borderRadius: '8px',
                marginTop: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h5 style={{ color: '#8b5cf6', marginBottom: '12px' }}>📋 Order Summary</h5>
                <div style={{ fontSize: '14px', color: '#8892b0', lineHeight: '1.6' }}>
                  {orderForm.type === 'bid' ? (
                    <>
                      <div>• You will <strong style={{color: '#4ade80'}}>buy {orderForm.amount} CARBON</strong> tokens</div>
                      <div>• At <strong style={{color: '#4ade80'}}>{orderForm.price} NXS per CARBON</strong></div>
                      <div>• Total cost: <strong style={{color: '#fbbf24'}}>{(parseFloat(orderForm.amount || 0) * parseFloat(orderForm.price || 0)).toFixed(6)} NXS</strong></div>
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                        💸 Spending from: {orderForm.from || 'Select NXS account'}<br/>
                        💰 Receiving to: {orderForm.to || 'Select CARBON account'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>• You will <strong style={{color: '#f87171'}}>sell {orderForm.amount} CARBON</strong> tokens</div>
                      <div>• At <strong style={{color: '#f87171'}}>{orderForm.price} NXS per CARBON</strong></div>
                      <div>• Total revenue: <strong style={{color: '#fbbf24'}}>{(parseFloat(orderForm.amount || 0) * parseFloat(orderForm.price || 0)).toFixed(6)} NXS</strong></div>
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                        💸 Sending from: {orderForm.from || 'Select CARBON account'}<br/>
                        💰 Receiving to: {orderForm.to || 'Select NXS account'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={createMarketOrder}
            disabled={loading || !orderForm.amount || !orderForm.price || !orderForm.from || !orderForm.to}
            style={{
              background: !loading && orderForm.amount && orderForm.price && orderForm.from && orderForm.to
                ? (orderForm.type === 'bid' 
                  ? 'linear-gradient(135deg, #4ade80 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)')
                : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.2s ease',
              cursor: !loading && orderForm.amount && orderForm.price && orderForm.from && orderForm.to ? 'pointer' : 'not-allowed',
              width: '100%',
              marginTop: '16px'
            }}
          >
            {loading ? (
              '⏳ Creating Order...'
            ) : (
              orderForm.type === 'bid' 
                ? `🟢 Create Buy Order - Pay ${(parseFloat(orderForm.amount || 0) * parseFloat(orderForm.price || 0)).toFixed(6)} NXS`
                : `🔴 Create Sell Order - Receive ${(parseFloat(orderForm.amount || 0) * parseFloat(orderForm.price || 0)).toFixed(6)} NXS`
            )}
          </Button>
        </FieldSet>

        {/* Simplified Market Orders Display */}
        <FieldSet legend="🌟 Active Market Orders - Simplified View">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Buy Orders - Simple List */}
            <div>
              <h4 style={{ 
                color: '#4ade80', 
                marginBottom: '16px',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🟢 Buy Orders ({processedMarketData.bids?.length || 0})
                <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#8892b0' }}>
                  (Buying CARBON with NXS)
                </span>
              </h4>

              <div style={{ 
                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(74, 222, 128, 0.05) 100%)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                {processedMarketData.bids?.length > 0 ? (
                  <>
                    {/* Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr auto',
                      gap: '12px',
                      padding: '8px 12px',
                      borderBottom: '1px solid rgba(74, 222, 128, 0.3)',
                      marginBottom: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#4ade80'
                    }}>
                      <div>💰 Price (NXS)</div>
                      <div>🌱 Amount (CARBON)</div>
                      <div>💵 Total (NXS)</div>
                      <div>Action</div>
                    </div>

                    {/* Orders List */}
                    {processedMarketData.bids.slice(0, 15).map((order, index) => (
                      <div 
                        key={order.txid}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr auto',
                          gap: '12px',
                          padding: '8px 12px',
                          borderBottom: index < Math.min(14, processedMarketData.bids.length - 1) 
                            ? '1px solid rgba(74, 222, 128, 0.1)' 
                            : 'none',
                          fontSize: '13px',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                          borderRadius: '6px',
                          '&:hover': {
                            background: 'rgba(74, 222, 128, 0.1)'
                          }
                        }}
                      >
                        <div style={{ color: '#4ade80', fontWeight: '600' }}>
                          {order.processedData.formattedPrice}
                        </div>
                        <div style={{ color: '#e2e8f0' }}>
                          {order.processedData.formattedSelling}
                        </div>
                        <div style={{ color: '#fbbf24', fontWeight: '500' }}>
                          {order.processedData.formattedTotalValue}
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              if (!orderForm.from || !orderForm.to) {
                                NEXUS.utilities.showErrorDialog({
                                  message: 'Set Account Details First',
                                  note: 'To execute this BUY order:\n\n• Set FROM: Your CARBON account\n• Set TO: Your NXS account\n\nUse the order form above.',
                                });
                                return;
                              }
                              executeOrder(order.txid);
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '10px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            🎯 Sell
                          </button>
                        </div>
                      </div>
                    ))}

                    {processedMarketData.bids.length > 15 && (
                      <div style={{ 
                        textAlign: 'center', 
                        marginTop: '12px', 
                        fontSize: '12px', 
                        color: '#8892b0' 
                      }}>
                        ... and {processedMarketData.bids.length - 15} more orders
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#8892b0', 
                    padding: '40px 20px',
                    fontSize: '14px'
                  }}>
                    No buy orders available
                  </div>
                )}
              </div>
            </div>

            {/* Sell Orders - Simple List */}
            <div>
              <h4 style={{ 
                color: '#f87171', 
                marginBottom: '16px',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔴 Sell Orders ({processedMarketData.asks?.length || 0})
                <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#8892b0' }}>
                  (Selling CARBON for NXS)
                </span>
              </h4>

              <div style={{ 
                background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.1) 0%, rgba(248, 113, 113, 0.05) 100%)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                {processedMarketData.asks?.length > 0 ? (
                  <>
                    {/* Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr auto',
                      gap: '12px',
                      padding: '8px 12px',
                      borderBottom: '1px solid rgba(248, 113, 113, 0.3)',
                      marginBottom: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#f87171'
                    }}>
                      <div>💰 Price (NXS)</div>
                      <div>🌱 Amount (CARBON)</div>
                      <div>💵 Total (NXS)</div>
                      <div>Action</div>
                    </div>

                    {/* Orders List */}
                    {processedMarketData.asks.slice(0, 15).map((order, index) => (
                      <div 
                        key={order.txid}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr auto',
                          gap: '12px',
                          padding: '8px 12px',
                          borderBottom: index < Math.min(14, processedMarketData.asks.length - 1) 
                            ? '1px solid rgba(248, 113, 113, 0.1)' 
                            : 'none',
                          fontSize: '13px',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                          borderRadius: '6px',
                          '&:hover': {
                            background: 'rgba(248, 113, 113, 0.1)'
                          }
                        }}
                      >
                        <div style={{ color: '#f87171', fontWeight: '600' }}>
                          {order.processedData.formattedPrice}
                        </div>
                        <div style={{ color: '#e2e8f0' }}>
                          {order.processedData.formattedSelling}
                        </div>
                        <div style={{ color: '#fbbf24', fontWeight: '500' }}>
                          {order.processedData.formattedTotalValue}
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              if (!orderForm.from || !orderForm.to) {
                                NEXUS.utilities.showErrorDialog({
                                  message: 'Set Account Details First',
                                  note: 'To execute this SELL order:\n\n• Set FROM: Your NXS account\n• Set TO: Your CARBON account\n\nUse the order form above.',
                                });
                                return;
                              }
                              executeOrder(order.txid);
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '10px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            🎯 Buy
                          </button>
                        </div>
                      </div>
                    ))}

                    {processedMarketData.asks.length > 15 && (
                      <div style={{ 
                        textAlign: 'center', 
                        marginTop: '12px', 
                        fontSize: '12px', 
                        color: '#8892b0' 
                      }}>
                        ... and {processedMarketData.asks.length - 15} more orders
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#8892b0', 
                    padding: '40px 20px',
                    fontSize: '14px'
                  }}>
                    No sell orders available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Trading Guide */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '12px',
            color: '#a5b4fc'
          }}>
            <strong style={{ color: '#8b5cf6' }}>💡 Quick Trading Guide:</strong><br/>
            1. Set your account details in the "Create Order" section above<br/>
            2. Click "🎯 Sell" to sell CARBON tokens to a buyer, or "🎯 Buy" to buy CARBON tokens from a seller<br/>
            3. The order will execute automatically when you have the required tokens/NXS
          </div>
        </FieldSet>

        {/* Detailed Market Orders (Original) */}
        <FieldSet legend="📋 Detailed Market Orders">
          <GridContainer>
            {/* Buy Orders (Bids) */}
            <Card>
              <h4 style={{ color: '#4ade80', marginBottom: '16px' }}>
                🟢 Buy Orders (Bids) ({processedMarketData.bids?.length || 0})
              </h4>
              <div style={{ 
                marginBottom: '12px', 
                padding: '8px', 
                background: 'rgba(74, 222, 128, 0.1)', 
                borderRadius: '6px', 
                fontSize: '12px', 
                color: '#4ade80',
                border: '1px solid rgba(74, 222, 128, 0.3)'
              }}>
                <strong>💡 Buy Orders:</strong> Users wanting to <strong>buy CARBON with NXS</strong>
              </div>
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '4px',
                margin: '-4px'
              }}>
                {processedMarketData.bids?.length > 0 ? (
                  <>
                    {processedMarketData.bids.slice(bidPage * ORDERS_PER_PAGE, (bidPage + 1) * ORDERS_PER_PAGE).map((order) => (
                      <div 
                        key={order.txid} 
                        style={{ 
                          background: 'rgba(75, 222, 128, 0.1)', 
                          border: '1px solid rgba(75, 222, 128, 0.3)',
                          borderRadius: '8px', 
                          padding: '12px', 
                          marginBottom: '8px' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <span style={{ fontWeight: '600', color: '#4ade80', fontSize: '16px' }}>
                              💰 {order.processedData.formattedPrice} NXS per CARBON
                            </span>
                            <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '2px' }}>
                              Order ID: {order.processedData.shortTxid}...
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', color: '#4ade80', fontWeight: '500' }}>
                              Buying: {order.processedData.formattedSelling} CARBON
                            </div>
                            <div style={{ fontSize: '11px', color: '#8892b0' }}>
                              Total: {order.processedData.formattedTotalValue} NXS
                            </div>
                          </div>
                        </div>

                        {/* Account Flow Information */}
                        <div style={{ 
                          background: 'rgba(26, 32, 44, 0.8)', 
                          padding: '8px', 
                          borderRadius: '6px', 
                          marginBottom: '8px',
                          fontSize: '12px'
                        }}>
                          <div style={{ color: '#8892b0', marginBottom: '4px' }}>
                            <strong>💸 Buyer's Flow:</strong>
                          </div>
                          <div style={{ color: '#f87171', marginBottom: '2px' }}>
                            • Paying from: {order.processedData.sellingTicker} account ({order.processedData.shortFromAddress}...)
                          </div>
                          <div style={{ color: '#4ade80' }}>
                            • Receiving to: CARBON account ({order.processedData.shortToAddress}...)
                          </div>
                        </div>

                        {/* Execution Information for Sellers */}
                        <div style={{ 
                          background: 'rgba(139, 92, 246, 0.1)', 
                          padding: '8px', 
                          borderRadius: '6px', 
                          marginBottom: '8px',
                          border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}>
                          <div style={{ color: '#8b5cf6', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                            🎯 To Execute This Order (as seller):
                          </div>
                          <div style={{ fontSize: '11px', color: '#a5b4fc' }}>
                            • You need: {order.processedData.formattedSelling} CARBON tokens<br/>
                            • You'll receive: {order.processedData.formattedWanting} {order.processedData.wantingTicker}<br/>
                            • Set your FROM account: Your CARBON token account<br/>
                            • Set your TO account: Your {order.processedData.wantingTicker} account
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>
                            {order.processedData.formattedTimestamp}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                              onClick={() => {
                                if (!orderForm.from || !orderForm.to) {
                                  NEXUS.utilities.showErrorDialog({
                                    message: 'Missing Account Details',
                                    note: 'To execute this BUY order as a seller:\n\n• Set FROM: Your CARBON token account\n• Set TO: Your NXS account\n\nThen specify these accounts in the order form above.',
                                  });
                                  return;
                                }
                                executeOrder(order.txid);
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}
                            >
                              🎯 Sell to This Buyer
                            </Button>
                            {order.owner === sessionStatus?.genesis && (
                              <Button
                                onClick={() => cancelOrder(order.txid)}
                                style={{
                                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  fontWeight: '500'
                                }}
                              >
                                🗑️ Cancel My Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination Controls for Bids */}
                    {marketData.bids.length > ORDERS_PER_PAGE && (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginTop: '16px',
                        padding: '8px'
                      }}>
                        <Button
                          onClick={() => setBidPage(Math.max(0, bidPage - 1))}
                          disabled={bidPage === 0}
                          style={{
                            background: bidPage === 0 ? '#374151' : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px'
                          }}
                        >
                          ← Prev
                        </Button>
                        <span style={{ color: '#8892b0', fontSize: '12px' }}>
                          Page {bidPage + 1} of {Math.ceil(marketData.bids.length / ORDERS_PER_PAGE)}
                        </span>
                        <Button
                          onClick={() => setBidPage(Math.min(Math.ceil(marketData.bids.length / ORDERS_PER_PAGE) - 1, bidPage + 1))}
                          disabled={bidPage >= Math.ceil(marketData.bids.length / ORDERS_PER_PAGE) - 1}
                          style={{
                            background: bidPage >= Math.ceil(marketData.bids.length / ORDERS_PER_PAGE) - 1 ? '#374151' : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px'
                          }}
                        >
                          Next →
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: '#8892b0', textAlign: 'center', padding: '20px' }}>
                    No buy orders available
                  </div>
                )}
              </div>
            </Card>

            {/* Sell Orders (Asks) */}
            <Card>
              <h4 style={{ color: '#f87171', marginBottom: '16px' }}>🔴 Sell Orders (Asks) ({processedMarketData.asks?.length || 0})</h4>
              <div style={{ 
                marginBottom: '12px', 
                padding: '8px', 
                background: 'rgba(248, 113, 113, 0.1)', 
                borderRadius: '6px', 
                fontSize: '12px', 
                color: '#f87171',
                border: '1px solid rgba(248, 113, 113, 0.3)'
              }}>
                <strong>💡 Sell Orders:</strong> Users wanting to <strong>sell CARBON for NXS</strong>
              </div>
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '4px',
                margin: '-4px'
              }}>
                {processedMarketData.asks?.length > 0 ? (
                  <>
                    {processedMarketData.asks.slice(askPage * ORDERS_PER_PAGE, (askPage + 1) * ORDERS_PER_PAGE).map((order) => (
                      <div 
                        key={order.txid} 
                        style={{ 
                          background: 'rgba(248, 113, 113, 0.1)', 
                          border: '1px solid rgba(248, 113, 113, 0.3)',
                          borderRadius: '8px', 
                          padding: '12px', 
                          marginBottom: '8px' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <span style={{ fontWeight: '600', color: '#f87171', fontSize: '16px' }}>
                              💰 {order.processedData.formattedPrice} NXS per CARBON
                            </span>
                            <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '2px' }}>
                              Order ID: {order.processedData.shortTxid}...
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', color: '#f87171', fontWeight: '500' }}>
                              Selling: {order.processedData.formattedSelling} CARBON
                            </div>
                            <div style={{ fontSize: '11px', color: '#8892b0' }}>
                              For: {order.processedData.formattedTotalValue} NXS
                            </div>
                          </div>
                        </div>

                        {/* Account Flow Information */}
                        <div style={{ 
                          background: 'rgba(26, 32, 44, 0.8)', 
                          padding: '8px', 
                          borderRadius: '6px', 
                          marginBottom: '8px',
                          fontSize: '12px'
                        }}>
                          <div style={{ color: '#8892b0', marginBottom: '4px' }}>
                            <strong>💸 Seller's Flow:</strong>
                          </div>
                          <div style={{ color: '#f87171', marginBottom: '2px' }}>
                            • Sending from: CARBON account ({order.processedData.shortFromAddress}...)
                          </div>
                          <div style={{ color: '#4ade80' }}>
                            • Receiving to: NXS account ({order.processedData.shortToAddress}...)
                          </div>
                        </div>

                        {/* Execution Information for Buyers */}
                        <div style={{ 
                          background: 'rgba(139, 92, 246, 0.1)', 
                          padding: '8px', 
                          borderRadius: '6px', 
                          marginBottom: '8px',
                          border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}>
                          <div style={{ color: '#8b5cf6', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                            🎯 To Execute This Order (as buyer):
                          </div>
                          <div style={{ fontSize: '11px', color: '#a5b4fc' }}>
                            • You need: {order.processedData.formattedWanting} {order.processedData.wantingTicker}<br/>
                            • You'll receive: {order.processedData.formattedSelling} CARBON tokens<br/>
                            • Set your FROM account: Your {order.processedData.wantingTicker} account<br/>
                            • Set your TO account: Your CARBON token account
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>
                            {order.processedData.formattedTimestamp}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                              onClick={() => {
                                if (!orderForm.from || !orderForm.to) {
                                  NEXUS.utilities.showErrorDialog({
                                    message: 'Missing Account Details',
                                    note: 'To execute this SELL order as a buyer:\n\n• Set FROM: Your NXS account\n• Set TO: Your CARBON token account\n\nThen specify these accounts in the order form above.',
                                  });
                                  return;
                                }
                                executeOrder(order.txid);
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}
                            >
                              🎯 Buy from This Seller
                            </Button>
                            {order.owner === sessionStatus?.genesis && (
                              <Button
                                onClick={() => cancelOrder(order.txid)}
                                style={{
                                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  fontWeight: '500'
                                }}
                              >
                                🗑️ Cancel My Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination Controls for Asks */}
                    {marketData.asks.length > ORDERS_PER_PAGE && (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginTop: '16px',
                        padding: '8px'
                      }}>
                        <Button
                          onClick={() => setAskPage(Math.max(0, askPage - 1))}
                          disabled={askPage === 0}
                          style={{
                            background: askPage === 0 ? '#374151' : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px'
                          }}
                        >
                          ← Prev
                        </Button>
                        <span style={{ color: '#8892b0', fontSize: '12px' }}>
                          Page {askPage + 1} of {Math.ceil(marketData.asks.length / ORDERS_PER_PAGE)}
                        </span>
                        <Button
                          onClick={() => setAskPage(Math.min(Math.ceil(marketData.asks.length / ORDERS_PER_PAGE) - 1, askPage + 1))}
                          disabled={askPage >= Math.ceil(marketData.asks.length / ORDERS_PER_PAGE) - 1}
                          style={{
                            background: askPage >= Math.ceil(marketData.asks.length / ORDERS_PER_PAGE) - 1 ? '#374151' : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px'
                          }}
                        >
                          Next →
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: '#8892b0', textAlign: 'center', padding: '20px' }}>
                    No sell orders available
                  </div>
                )}
              </div>
            </Card>
          </GridContainer>
        </FieldSet>

        {/* User Orders Section */}
        <FieldSet legend="My Trading Activity">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <Card>
              <h4 style={{ color: '#4ade80', marginBottom: '16px' }}>📈 My Buy Orders</h4>
              <div style={{ 
                maxHeight: '250px', 
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '4px',
                margin: '-4px'
              }}>
                {userOrders.bids?.length > 0 ? (
                  userOrders.bids.map((order, index) => (
                    <div key={order.txid} style={{
                      padding: '12px',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                    }}>
                      <div style={{ fontSize: '13px', color: '#8892b0', marginBottom: '8px' }}>
                        <div><strong>Price:</strong> {order.price} NXS</div>
                        <div><strong>Amount:</strong> {order.contract?.amount || 'N/A'} CARBON</div>
                        <div><strong>Total:</strong> {(order.price * (order.contract?.amount || 0)).toFixed(4)} NXS</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {new Date(order.timestamp * 1000).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        onClick={() => cancelOrder(order.txid)}
                        style={{
                          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        🗑️ Cancel Order
                      </Button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                    No active buy orders
                  </p>
                )}
              </div>
            </Card>

            <Card>
              <h4 style={{ color: '#f87171', marginBottom: '16px' }}>📉 My Sell Orders</h4>
              <div style={{ 
                maxHeight: '250px', 
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '4px',
                margin: '-4px'
              }}>
                {userOrders.asks?.length > 0 ? (
                  userOrders.asks.map((order, index) => (
                    <div key={order.txid} style={{
                      padding: '12px',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                    }}>
                      <div style={{ fontSize: '13px', color: '#8892b0', marginBottom: '8px' }}>
                        <div><strong>Price:</strong> {order.price} NXS</div>
                        <div><strong>Amount:</strong> {order.contract?.amount || 'N/A'} CARBON</div>
                        <div><strong>Total:</strong> {(order.price * (order.contract?.amount || 0)).toFixed(4)} NXS</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {new Date(order.timestamp * 1000).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        onClick={() => cancelOrder(order.txid)}
                        style={{
                          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        🗑️ Cancel Order
                      </Button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                    No active sell orders
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Order History */}
          <Card style={{ marginTop: '16px' }}>
            <h4 style={{ color: '#8b5cf6', marginBottom: '16px' }}>📊 Recent Trade History</h4>
            <div style={{ 
                maxHeight: '200px', 
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '4px',
                margin: '-4px'
              }}>
              {orderHistory?.length > 0 ? (
                orderHistory.slice(0, 10).map((trade, index) => (
                  <div key={trade.txid || index} style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #374151',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '13px', color: '#8892b0' }}>
                      <span style={{ color: trade.type === 'bid' ? '#4ade80' : '#f87171' }}>
                        {trade.type === 'bid' ? '📈 BUY' : '📉 SELL'}
                      </span>
                      <span style={{ marginLeft: '8px' }}>{trade.price} NXS</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {trade.contract?.amount || 'N/A'} CARBON
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                  No recent trades
                </p>
              )}
            </div>
          </Card>
        </FieldSet>
      </Card>
    </div>
  );

  // Finance API State
  const [walletData, setWalletData] = useState({
    balances: [],
    stakeInfo: null,
    accounts: [],
    tokens: [],
    transactions: []
  });

  const [debitForm, setDebitForm] = useState({
    from: '',
    to: '',
    amount: '',
    reference: '',
    expires: ''
  });

  const [creditForm, setCreditForm] = useState({
    txid: ''
  });

  const [tokenForm, setTokenForm] = useState({
    name: '',
    supply: '',
    decimals: '2'
  });

  const [accountForm, setAccountForm] = useState({
    name: '',
    token: 'NXS'
  });

  const [stakeForm, setStakeForm] = useState({
    amount: '',
    expires: '0'
  });

  const [burnForm, setBurnForm] = useState({
    account: '',
    amount: '',
    reference: ''
  });

  const [voidForm, setVoidForm] = useState({
    txid: ''
  });

  // Separate forms for account-to-account and token-to-account transfers
  const [accountTransferForm, setAccountTransferForm] = useState({
    from: '',
    to: '',
    amount: '',
    reference: '',
    expires: ''
  });

  const [tokenTransferForm, setTokenTransferForm] = useState({
    tokenAddress: '',
    to: '',
    amount: '',
    reference: '',
    expires: ''
  });

  const [selectedAccount, setSelectedAccount] = useState('');
  const [activeWalletTab, setActiveWalletTab] = useState('overview');

  // Finance API Functions
  const refreshWalletData = async () => {
    try {
      setLoading(true);

      // Fetch comprehensive balance information
      const balancesResult = await NEXUS.utilities.apiCall('finance/get/balances');

      // Fetch stake information
      let stakeResult = null;
      try {
        stakeResult = await NEXUS.utilities.apiCall('finance/get/stakeinfo');
      } catch (error) {
        console.log('Stake info not available:', error.message);
      }

      // Fetch accounts - try multiple methods to ensure we get all accounts
      let accountsResult = [];
      try {
        // Primary method
        accountsResult = await NEXUS.utilities.apiCall('finance/list/account');
      } catch (error) {
        console.log('Primary account list failed:', error.message);
        try {
          // Alternative method - list all accounts
          accountsResult = await NEXUS.utilities.apiCall('finance/list/accounts');
        } catch (error2) {
          console.log('Alternative account list failed:', error2.message);
        }
      }

      // Fetch tokens
      const tokensResult = await NEXUS.utilities.apiCall('finance/list/token');

      setWalletData({
        balances: balancesResult || [],
        stakeInfo: stakeResult,
        accounts: accountsResult || [],
        tokens: tokensResult || [],
        transactions: []
      });

    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Failed to Refresh Wallet Data',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  // finance/debit/account - Transfer from account to account
  const debitFromAccount = async () => {
    if (!accountTransferForm.from || !accountTransferForm.to || !accountTransferForm.amount) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Transfer Details',
        note: 'Please fill in from account, to account, and amount',
      });
      return;
    }

    try {
      setLoading(true);

      // Validate account name formats
      const validateAccountName = (account) => {
        if (account.includes(':') || account.includes('::') || account.length >= 51) {
          return account; // Already properly formatted
        }
        return account; // Local name, use as-is
      };

      const params = {
        from: validateAccountName(accountTransferForm.from.trim()),
        to: validateAccountName(accountTransferForm.to.trim()),
        amount: parseFloat(accountTransferForm.amount),
      };

      if (accountTransferForm.reference) {
        params.reference = parseInt(accountTransferForm.reference, 10);
      }

      if (accountTransferForm.expires) {
        params.expires = parseInt(accountTransferForm.expires, 10);
      }

      const result = await NEXUS.utilities.secureApiCall('finance/debit/account', params);

      NEXUS.utilities.showSuccessDialog({
        message: 'Account Transfer Successful',
        note: `Transaction ID: ${result.txid}`,
      });

      setAccountTransferForm({ from: '', to: '', amount: '', reference: '', expires: '' });
      await refreshWalletData();
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Account Transfer Failed',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  // finance/debit/token - Transfer from token address to account
  const debitFromToken = async () => {
    if (!tokenTransferForm.tokenAddress || !tokenTransferForm.to || !tokenTransferForm.amount) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Token Transfer Details',
        note: 'Please fill in token address, recipient account, and amount',
      });
      return;
    }

    try {
      setLoading(true);

      const params = {
        from: tokenTransferForm.tokenAddress.trim(),
        to: tokenTransferForm.to.trim(),
        amount: parseFloat(tokenTransferForm.amount),
      };

      if (tokenTransferForm.reference) {
        params.reference = parseInt(tokenTransferForm.reference, 10);
      }

      if (tokenTransferForm.expires) {
        params.expires = parseInt(tokenTransferForm.expires, 10);
      }

      const result = await NEXUS.utilities.secureApiCall('finance/debit/token', params);

      NEXUS.utilities.showSuccessDialog({
        message: 'Token Transfer Successful',
        note: `Transaction ID: ${result.txid}`,
      });

      setTokenTransferForm({ tokenAddress: '', to: '', amount: '', reference: '', expires: '' });
      await refreshWalletData();
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Token Transfer Failed',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  // finance/credit/token - Increment tokens received from a token account
  const creditTokenTransaction = async () => {
    if (!creditForm.txid) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Transaction ID',
        note: 'Please enter the transaction ID to credit',
      });
      return;
    }

    // Validate transaction ID format - allow various Nexus transaction ID formats
    const trimmedTxid = creditForm.txid.trim();
    if (trimmedTxid.length < 16 || !/^[0-9a-fA-F]+$/.test(trimmedTxid)) {
      NEXUS.utilities.showErrorDialog({
        message: 'Invalid Transaction ID Format',
        note: 'Transaction ID must be a hexadecimal string (typically 64 characters, but other lengths are accepted)',
      });
      return;
    }

    try {
      setLoading(true);

      // Call finance/credit/token endpoint
      const result = await NEXUS.utilities.secureApiCall('finance/credit/token', {
        txid: trimmedTxid
      });

      NEXUS.utilities.showSuccessDialog({
        message: 'Token Credit Successful',
        note: `Tokens credited successfully. Transaction ID: ${result.txid}`,
      });

      setCreditForm({ txid: '' });
      await refreshWalletData();

    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Token Credit Failed',
        note: error?.message || 'Transaction not found, already credited, or not a valid token transaction. Verify the transaction ID corresponds to a token debit sent to your account.',
      });
    } finally {
      setLoading(false);
    }
  };

  // finance/credit/account - Increment NXS received from an account
  const creditAccountTransaction = async () => {
    if (!creditForm.txid) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Transaction ID',
        note: 'Please enter the transaction ID to credit',
      });
      return;
    }

    // Validate transaction ID format
    const trimmedTxid = creditForm.txid.trim();
    if (trimmedTxid.length < 16 || !/^[0-9a-fA-F]+$/.test(trimmedTxid)) {
      NEXUS.utilities.showErrorDialog({
        message: 'Invalid Transaction ID Format',
        note: 'Transaction ID must be a hexadecimal string (typically 64 characters, but other lengths are accepted)',
      });
      return;
    }

    try {
      setLoading(true);

      // Call finance/credit/account endpoint
      const result = await NEXUS.utilities.secureApiCall('finance/credit/account', {
        txid: trimmedTxid
      });

      NEXUS.utilities.showSuccessDialog({
        message: 'Account Credit Successful',
        note: `NXS credited successfully. Transaction ID: ${result.txid}`,
      });

      setCreditForm({ txid: '' });
      await refreshWalletData();

    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Account Credit Failed',
        note: error?.message || 'Transaction not found, already credited, or not a valid NXS transaction. Verify the transaction ID corresponds to an NXS debit sent to your account.',
      });
    } finally {
      setLoading(false);
    }
  };

  const createToken = async () => {
    if (!tokenForm.name || !tokenForm.supply) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Token Details',
        note: 'Please fill in token name and supply',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await NEXUS.utilities.secureApiCall('finance/create/token', {
        name: tokenForm.name,
        supply: parseFloat(tokenForm.supply),
        decimals: parseInt(tokenForm.decimals, 10)
      });

      NEXUS.utilities.showSuccessDialog({
        message: 'Token Created Successfully',
        note: `Token Address: ${result.address}`,
      });

      setTokenForm({ name: '', supply: '', decimals: '2' });
      await refreshWalletData();
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Token Creation Failed',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    if (!accountForm.name) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Account Name',
        note: 'Please enter an account name',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await NEXUS.utilities.secureApiCall('finance/create/account', {
        name: accountForm.name,
        token: accountForm.token
      });

      NEXUS.utilities.showSuccessDialog({
        message: 'Account Created Successfully',
        note: `Account Address: ${result.address}`,
      });

      setAccountForm({ name: '', token: 'NXS' });

      // Wait a moment for the transaction to be processed, then refresh
      setTimeout(async () => {
        await refreshWalletData();
      }, 1000);

    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Account Creation Failed',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const setStake = async () => {
    if (!stakeForm.amount) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Stake Amount',
        note: 'Please enter the desired stake amount',
      });
      return;
    }

    try {
      setLoading(true);
      const result = await NEXUS.utilities.secureApiCall('finance/set/stake', {
        amount: parseFloat(stakeForm.amount),
        expires: parseInt(stakeForm.expires, 10)
      });

      NEXUS.utilities.showSuccessDialog({
        message: 'Stake Updated Successfully',
        note: `Transaction ID: ${result.txid}`,
      });

      setStakeForm({ amount: '', expires: '0' });
      await refreshWalletData();
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Stake Update Failed',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const burnTokens = async () => {
    if (!burnForm.account || !burnForm.amount) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Burn Details',
        note: 'Please specify account and amount to burn',
      });
      return;
    }

    try {
      setLoading(true);
      const params = {
        name: burnForm.account,
        amount: parseFloat(burnForm.amount)
      };

      if (burnForm.reference) {
        params.reference = parseInt(burnForm.reference, 10);
      }

      const result = await NEXUS.utilities.secureApiCall('finance/burn/account', params);

      NEXUS.utilities.showSuccessDialog({
        message: 'Tokens Burned Successfully',
        note: `Transaction ID: ${result.txid}`,
      });

      setBurnForm({ account: '', amount: '', reference: '' });
      await refreshWalletData();
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Token Burn Failed',
        note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const voidTransaction = async () => {
    if (!voidForm.txid) {
      NEXUS.utilities.showErrorDialog({
        message: 'Missing Transaction ID',
        note: 'Please enter the transaction ID to void',
      });
      return;
    }

    const confirmed = await NEXUS.utilities.confirm({
      question: 'Are you sure you want to void this transaction?',
      note: 'This action cannot be undone and only works on unclaimed transactions.',
    });

    if (confirmed) {
      try {
        setLoading(true);
        const result = await NEXUS.utilities.secureApiCall('finance/void/transaction', {
          txid: voidForm.txid
        });

        NEXUS.utilities.showSuccessDialog({
          message: 'Transaction Voided Successfully',
          note: `New Transaction Hash: ${result.hash}`,
        });

        setVoidForm({ txid: '' });
        await refreshWalletData();
      } catch (error) {
        NEXUS.utilities.showErrorDialog({
          message: 'Transaction Void Failed',
          note: error?.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
    }
  };

  const getAccountDetails = async (accountName) => {
    try {
      const result = await NEXUS.utilities.apiCall('finance/get/account', {
        name: accountName
      });

      NEXUS.utilities.showInfoDialog({
        message: 'Account Details',
        note: JSON.stringify(result, null, 2)
      });
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Failed to Get Account Details',
        note: error?.message || 'Unknown error occurred',
      });
    }
  };

  const getAccountHistory = async (accountName) => {
    try {
      const result = await NEXUS.utilities.apiCall('finance/history/account', {
        name: accountName
      });

      NEXUS.utilities.showInfoDialog({
        message: 'Account History',
        note: JSON.stringify(result, null, 2)
      });
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Failed to Get Account History',
        note: error?.message || 'Unknown error occurred',
      });
    }
  };

  const getAccountTransactions = async (accountName) => {
    try {
      const result = await NEXUS.utilities.apiCall('finance/transactions/account', {
        name: accountName,
        verbose: 'summary'
      });

      setWalletData(prev => ({
        ...prev,
        transactions: result || []
      }));

      NEXUS.utilities.showSuccessDialog({
        message: 'Transactions Loaded',
        note: `Found ${result?.length || 0} transactions`
      });
    } catch (error) {
      NEXUS.utilities.showErrorDialog({
        message: 'Failed to Get Account Transactions',
        note: error?.message || 'Unknown error occurred',
      });
    }
  };



  const WalletTabButton = styled.button(({ active }) => ({
    background: active 
      ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' 
      : 'transparent',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    color: active ? '#ffffff' : '#8b5cf6',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    margin: '0 4px 8px 0',
    '&:hover': {
      background: active 
        ? 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' 
        : 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 0.5)',
    },
  }));

  const renderWallet = () => (
    <div>
      <Card>
        <h2 style={{ color: '#8b5cf6', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          💰 Finance API - Comprehensive Wallet Management
          <ActionButton 
            variant="secondary" 
            onClick={refreshWalletData} 
            disabled={loading}
            style={{ fontSize: '12px', padding: '8px 16px', minWidth: 'auto' }}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </ActionButton>
        </h2>

        {/* Wallet Navigation Tabs */}
        <div style={{ marginBottom: '24px', borderBottom: '1px solid rgba(139, 92, 246, 0.2)', paddingBottom: '16px' }}>
          <WalletTabButton 
            active={activeWalletTab === 'overview'} 
            onClick={() => setActiveWalletTab('overview')}
          >
            📊 Overview
          </WalletTabButton>
          <WalletTabButton 
            active={activeWalletTab === 'transactions'} 
            onClick={() => setActiveWalletTab('transactions')}
          >
            💸 Transactions
          </WalletTabButton>
          <WalletTabButton 
            active={activeWalletTab === 'accounts'} 
            onClick={() => setActiveWalletTab('accounts')}
          >
            📁 Accounts
          </WalletTabButton>
          <WalletTabButton 
            active={activeWalletTab === 'tokens'} 
            onClick={() => setActiveWalletTab('tokens')}
          >
            🪙 Tokens
          </WalletTabButton>
          <WalletTabButton 
            active={activeWalletTab === 'staking'} 
            onClick={() => setActiveWalletTab('staking')}
          >
            🥩 Staking
          </WalletTabButton>
          <WalletTabButton 
            active={activeWalletTab === 'advanced'} 
            onClick={() => setActiveWalletTab('advanced')}
          >
            ⚙️ Advanced
          </WalletTabButton>
        </div>

        {/* Overview Tab */}
        {activeWalletTab === 'overview' && (
          <div>
            {/* Balance Summary Cards */}
            <GridContainer>
              {walletData.balances?.length > 0 ? (
                walletData.balances.map((balance, index) => (
                  <Card key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ color: '#8b5cf6', margin: 0 }}>
                        💳 {balance.ticker || 'Unknown'}
                      </h3>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4aa' }}>
                        {parseFloat(balance.available || 0).toFixed(balance.decimals || 6)}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#8892b0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div><strong>Available:</strong> {parseFloat(balance.available || 0).toFixed(balance.decimals || 6)}</div>
                      <div><strong>Unclaimed:</strong> {parseFloat(balance.unclaimed || 0).toFixed(balance.decimals || 6)}</div>
                      <div><strong>Unconfirmed:</strong> {parseFloat(balance.unconfirmed || 0).toFixed(balance.decimals || 6)}</div>
                      <div><strong>Pending:</strong> {parseFloat(balance.pending || 0).toFixed(balance.decimals || 6)}</div>
                      {balance.stake && (
                        <>
                          <div><strong>Staked:</strong> {parseFloat(balance.stake || 0).toFixed(balance.decimals || 6)}</div>
                          <div><strong>Immature:</strong> {parseFloat(balance.immature || 0).toFixed(balance.decimals || 6)}</div>
                        </>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <p style={{ color: '#6b7280', textAlign: 'center', margin: 0 }}>
                    No balance information available. Try refreshing or creating an account.
                  </p>
                </Card>
              )}

              {/* Stake Information Card */}
              {walletData.stakeInfo && (
                <Card>
                  <h3 style={{ color: '#f59e0b', marginBottom: '16px' }}>🥩 Staking Status</h3>
                  <div style={{ fontSize: '14px', color: '#8892b0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div><strong>Balance:</strong> {parseFloat(walletData.stakeInfo.balance || 0).toFixed(6)} NXS</div>
                    <div><strong>Staked:</strong> {parseFloat(walletData.stakeInfo.stake || 0).toFixed(6)} NXS</div>
                    <div><strong>Trust Score:</strong> {walletData.stakeInfo.trust || 0}</div>
                    <div><strong>Stake Rate:</strong> {parseFloat(walletData.stakeInfo.stakerate || 0).toFixed(2)}%</div>
                    <div><strong>Trust Weight:</strong> {parseFloat(walletData.stakeInfo.trustweight || 0).toFixed(2)}%</div>
                    <div><strong>Block Weight:</strong> {parseFloat(walletData.stakeInfo.blockweight || 0).toFixed(2)}%</div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <StatusIndicator status={walletData.stakeInfo.staking ? 'connected' : 'disconnected'}>
                        {walletData.stakeInfo.staking ? '✅ Staking Active' : '❌ Staking Inactive'}
                      </StatusIndicator>
                      {walletData.stakeInfo.onhold && (
                        <StatusIndicator status="disconnected" style={{ marginLeft: '8px' }}>
                          ⏳ On Hold
                        </StatusIndicator>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </GridContainer>
          </div>
        )}

        {/* Transactions Tab */}
        {activeWalletTab === 'transactions' && (
          <div>
            {/* Account to Account Transfer (finance/debit/account) */}
            <Card>
              <h3 style={{ color: '#3b82f6' }}>🏦 Account to Account Transfer</h3>
              <FieldSet legend="finance/debit/account - Transfer between accounts">
                <div style={{ marginBottom: '12px', padding: '8px', background: '#1f2937', borderRadius: '6px', fontSize: '12px', color: '#8892b0' }}>
                  <strong>Account Name Formats:</strong><br/>
                  • Local: <code>myaccount</code><br/>
                  • User-scoped: <code>username:accountname</code><br/>
                  • Namespace: <code>namespace::accountname</code><br/>
                  • Register Address: <code>8ABC...51chars</code>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <StyledTextField
                      placeholder="From Account (name or address)"
                      value={accountTransferForm.from}
                      onChange={(e) => setAccountTransferForm(prev => ({ ...prev, from: e.target.value }))}
                    />
                    <select
                      value={accountTransferForm.from}
                      onChange={(e) => setAccountTransferForm(prev => ({ ...prev, from: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                        background: '#1f2937',
                        color: '#ffffff',
                        fontSize: '13px',
                        marginBottom: '12px'
                      }}
                    >
                      <option value="">Select Account</option>
                      {walletData.accounts?.map((account, idx) => (
                        <option key={idx} value={account.name || account.address}>
                          {account.ticker} - {parseFloat(account.balance || 0).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <StyledTextField
                    placeholder="To Account (name or address)"
                    value={accountTransferForm.to}
                    onChange={(e) => setAccountTransferForm(prev => ({ ...prev, to: e.target.value }))}
                  />

                  <StyledTextField
                    type="number"
                    step="any"
                    placeholder="Amount"
                    value={accountTransferForm.amount}
                    onChange={(e) => setAccountTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <StyledTextField
                    placeholder="Reference (optional integer)"
                    value={accountTransferForm.reference}
                    onChange={(e) => setAccountTransferForm(prev => ({ ...prev, reference: e.target.value }))}
                  />
                  <StyledTextField
                    placeholder="Expires (seconds, 0 = never, default = 604800)"
                    value={accountTransferForm.expires}
                    onChange={(e) => setAccountTransferForm(prev => ({ ...prev, expires: e.target.value }))}
                  />
                </div>

                <ActionButton onClick={debitFromAccount} disabled={loading}>
                  {loading ? 'Processing...' : '🏦 Transfer from Account'}
                </ActionButton>
              </FieldSet>
            </Card>

            {/* Token to Account Transfer (finance/debit/token) */}
            <Card>
              <h3 style={{ color: '#8b5cf6' }}>🪙 Token to Account Transfer</h3>
              <FieldSet legend="finance/debit/token - Transfer from token address to account">
                <div style={{ marginBottom: '12px', padding: '8px', background: '#1f2937', borderRadius: '6px', fontSize: '12px', color: '#8892b0' }}>
                  <strong>Note:</strong> This transfers tokens from a token address (token issuer) to an account. Use the token's register address as the "from" field.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <StyledTextField
                      placeholder="Token Address (register address)"
                      value={tokenTransferForm.tokenAddress}
                      onChange={(e) => setTokenTransferForm(prev => ({ ...prev, tokenAddress: e.target.value }))}
                    />
                    <select
                      value={tokenTransferForm.tokenAddress}
                      onChange={(e) => setTokenTransferForm(prev => ({ ...prev, tokenAddress: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                        background: '#1f2937',
                        color: '#ffffff',
                        fontSize: '13px',
                        marginBottom: '12px'
                      }}
                    >
                      <option value="">Select Token</option>
                      {walletData.tokens?.map((token, idx) => (
                        <option key={idx} value={token.address}>
                          {token.ticker} - {parseFloat(token.currentsupply || 0).toFixed(2)} / {parseFloat(token.maxsupply || 0).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <StyledTextField
                    placeholder="To Account (recipient account name or address)"
                    value={tokenTransferForm.to}
                    onChange={(e) => setTokenTransferForm(prev => ({ ...prev, to: e.target.value }))}
                  />

                  <StyledTextField
                    type="number"
                    step="any"
                    placeholder="Amount"
                    value={tokenTransferForm.amount}
                    onChange={(e) => setTokenTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <StyledTextField
                    placeholder="Reference (optional integer)"
                    value={tokenTransferForm.reference}
                    onChange={(e) => setTokenTransferForm(prev => ({ ...prev, reference: e.target.value }))}
                  />
                  <StyledTextField
                    placeholder="Expires (seconds, 0 = never, default = 604800)"
                    value={tokenTransferForm.expires}
                    onChange={(e) => setTokenTransferForm(prev => ({ ...prev, expires: e.target.value }))}
                  />
                </div>

                <ActionButton onClick={debitFromToken} disabled={loading}>
                  {loading ? 'Processing...' : '🪙 Transfer from Token'}
                </ActionButton>
              </FieldSet>
            </Card>

            {/* Credit Transactions */}
            <Card>
              <h3 style={{ color: '#10b981' }}>💳 Credit (Receive) Transactions</h3>

              {/* Token Credit */}
              <FieldSet legend="finance/credit/token - Credit token transactions">
                <div style={{ marginBottom: '12px', padding: '8px', background: '#1f2937', borderRadius: '6px', fontSize: '12px', color: '#8892b0' }}>
                  <strong>Purpose:</strong> Increment an amount of tokens received from a token account. Use this for token debit transactions sent to your account.
                </div>

                <StyledTextField
                  placeholder="Transaction ID (txid) for token transaction"
                  value={creditForm.txid}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, txid: e.target.value }))}
                />

                <ActionButton onClick={creditTokenTransaction} disabled={loading} style={{ marginBottom: '16px' }}>
                  {loading ? 'Processing...' : '🪙 Credit Token Transaction'}
                </ActionButton>
              </FieldSet>

              {/* Account Credit */}
              <FieldSet legend="finance/credit/account - Credit NXS transactions">
                <div style={{ marginBottom: '12px', padding: '8px', background: '#1f2937', borderRadius: '6px', fontSize: '12px', color: '#8892b0' }}>
                  <strong>Purpose:</strong> Increment an amount received from an NXS account. Use this for NXS debit transactions sent to your account.
                </div>

                <StyledTextField
                  placeholder="Transaction ID (txid) for NXS transaction"
                  value={creditForm.txid}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, txid: e.target.value }))}
                />

                <ActionButton onClick={creditAccountTransaction} disabled={loading}>
                  {loading ? 'Processing...' : '🏦 Credit NXS Transaction'}
                </ActionButton>
              </FieldSet>
            </Card>

            {/* Transaction History */}
            <Card>
              <h3 style={{ color: '#8b5cf6' }}>📋 Recent Transactions</h3>
              <div style={{ marginBottom: '16px' }}>
                <StyledTextField
                  placeholder="Account name to load transactions"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  style={{ marginRight: '12px', display: 'inline-block', width: 'auto' }}
                />
                <ActionButton 
                  variant="secondary" 
                  onClick={() => getAccountTransactions(selectedAccount)}
                  disabled={!selectedAccount || loading}
                  style={{ display: 'inline-block' }}
                >
                  📋 Load Transactions
                </ActionButton>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {walletData.transactions?.length > 0 ? (
                  walletData.transactions.map((tx, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      background: '#1f2937'
                    }}>
                      <div style={{ fontSize: '13px', color: '#8892b0', marginBottom: '8px' }}>
                        <div><strong>TxID:</strong> {tx.txid?.substring(0, 32)}...</div>
                        <div><strong>Type:</strong> {tx.type} | <strong>Sequence:</strong> {tx.sequence}</div>
                        <div><strong>Time:</strong> {new Date(tx.timestamp * 1000).toLocaleString()}</div>
                        <div><strong>Confirmations:</strong> {tx.confirmations}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center' }}>
                    No transactions loaded. Enter an account name and click "Load Transactions".
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Accounts Tab */}
        {activeWalletTab === 'accounts' && (
          <div>
            <GridContainer>
              {/* Create Account */}
              <Card>
                <h3 style={{ color: '#06b6d4' }}>📁 Create New Account</h3>
                <FieldSet legend="Create a new token account">
                  <StyledTextField
                    placeholder="Account Name"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <StyledTextField
                    placeholder="Token (address, ticker, or 'NXS')"
                    value={accountForm.token}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, token: e.target.value }))}
                  />
                  <ActionButton onClick={createAccount} disabled={loading}>
                    {loading ? 'Creating...' : '📁 Create Account'}
                  </ActionButton>
                </FieldSet>
              </Card>

              {/* Account Management */}
              <Card>
                <h3 style={{ color: '#8b5cf6' }}>📊 Account Management</h3>
                <FieldSet legend="Get account information">
                  <StyledTextField
                    placeholder="Account name for details/history"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <ActionButton 
                      variant="secondary" 
                      onClick={() => getAccountDetails(selectedAccount)}
                      disabled={!selectedAccount || loading}
                    >
                      📋 Get Details
                    </ActionButton>
                    <ActionButton 
                      variant="secondary" 
                      onClick={() => getAccountHistory(selectedAccount)}
                      disabled={!selectedAccount || loading}
                    >
                      📜 Get History
                    </ActionButton>
                  </div>
                </FieldSet>
              </Card>
            </GridContainer>

            {/* Accounts List */}
            <Card>
              <h3>📋 Your Accounts</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {walletData.accounts?.length > 0 ? (
                  walletData.accounts.map((account, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      borderBottom: '1px solid #374151',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>
                          {account.ticker || 'N/A'} Account
                        </span>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Balance: {parseFloat(account.balance || 0).toFixed(account.decimals || 6)}
                        </div>
                        <div style={{ fontSize: '10px', color: '#4b5563' }}>
                          {account.address}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => setSelectedAccount(account.name || account.address)}
                          style={{
                            background: '#374151',
                            border: 'none',
                            color: '#8b5cf6',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center' }}>
                    No accounts found. Create your first account above.
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Tokens Tab */}
        {activeWalletTab === 'tokens' && (
          <div>
            <GridContainer>
              {/* Create Token */}
              <Card>
                <h3 style={{ color: '#8b5cf6' }}>🪙 Create New Token</h3>
                <FieldSet legend="Create a new token">
                  <StyledTextField
                    placeholder="Token Name"
                    value={tokenForm.name}
                    onChange={(e) => setTokenForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <StyledTextField
                    type="number"
                    placeholder="Total Supply"
                    value={tokenForm.supply}
                    onChange={(e) => setTokenForm(prev => ({ ...prev, supply: e.target.value }))}
                  />
                  <div>
                    <label style={{ color: '#8892b0', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                      Token Decimals (0-18, default: 2)
                    </label>
                    <StyledTextField
                      type="number"
                      placeholder="2"
                      value={tokenForm.decimals}
                      min="0"
                      max="18"
                      onChange={(e) => {
                        const value = Math.max(0, Math.min(18, parseInt(e.target.value) || 0));
                        setTokenForm(prev => ({ ...prev, decimals: value.toString() }));
                      }}
                    />
                  </div>
                  <ActionButton onClick={createToken} disabled={loading}>
                    {loading ? 'Creating...' : '🪙 Create Token'}
                  </ActionButton>
                </FieldSet>
              </Card>

              {/* Burn Tokens */}
              <Card>
                <h3 style={{ color: '#ef4444' }}>🔥 Burn Tokens</h3>
                <FieldSet legend="Permanently remove tokens from circulation">
                  <StyledTextField
                    placeholder="Account Name or Address"
                    value={burnForm.account}
                    onChange={(e) => setBurnForm(prev => ({ ...prev, account: e.target.value }))}
                  />
                  <StyledTextField
                    type="number"
                    placeholder="Amount to Burn"
                    value={burnForm.amount}
                    onChange={(e) => setBurnForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                  <StyledTextField
                    placeholder="Reference (optional)"
                    value={burnForm.reference}
                    onChange={(e) => setBurnForm(prev => ({ ...prev, reference: e.target.value }))}
                  />
                  <ActionButton variant="danger" onClick={burnTokens} disabled={loading}>
                    {loading ? 'Burning...' : '🔥 Burn Tokens'}
                  </ActionButton>
                </FieldSet>
              </Card>
            </GridContainer>

            {/* Tokens List */}
            <Card>
              <h3>🪙 Your Tokens</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {walletData.tokens?.length > 0 ? (
                  walletData.tokens.map((token, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      borderBottom: '1px solid #374151',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>
                          {token.ticker || 'Unknown Token'}
                        </span>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Supply: {parseFloat(token.currentsupply || 0).toFixed(token.decimals || 2)} / {parseFloat(token.maxsupply || 0).toFixed(token.decimals || 2)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Decimals: {token.decimals || 0}
                        </div>
                        <div style={{ fontSize: '10px', color: '#4b5563' }}>
                          {token.address}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center' }}>
                    No tokens found. Create your first token above.
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Staking Tab */}
        {activeWalletTab === 'staking' && (
          <div>
            <GridContainer>
              {/* Set Stake */}
              <Card>
                <h3 style={{ color: '#f59e0b' }}>🥩 Manage Stake</h3>
                <FieldSet legend="Set staking amount">
                  <StyledTextField
                    type="number"
                    placeholder="New Stake Amount (total stake, not additional)"
                    value={stakeForm.amount}
                    onChange={(e) => setStakeForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                  <StyledTextField
                    type="number"
                    placeholder="Expires (seconds, 0 = never)"
                    value={stakeForm.expires}
                    onChange={(e) => setStakeForm(prev => ({ ...prev, expires: e.target.value }))}
                  />
                  <ActionButton onClick={setStake} disabled={loading}>
                    {loading ? 'Updating...' : '🥩 Update Stake'}
                  </ActionButton>
                </FieldSet>
                <div style={{ marginTop: '16px', padding: '12px', background: '#1f2937', borderRadius: '8px', fontSize: '13px', color: '#8892b0' }}>
                  <strong>Note:</strong> This sets the total stake amount. If you currently have 10,000 NXS staked and want to add 5,000 more, enter 15,000.
                </div>
              </Card>

              {/* Staking Information */}
              {walletData.stakeInfo && (
                <Card>
                  <h3 style={{ color: '#10b981' }}>📊 Current Staking Status</h3>
                  <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', color: '#8892b0' }}>
                      <div><strong>Address:</strong></div>
                      <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>{walletData.stakeInfo.address}</div>

                      <div><strong>Available Balance:</strong></div>
                      <div>{parseFloat(walletData.stakeInfo.balance || 0).toFixed(6)} NXS</div>

                      <div><strong>Staked Amount:</strong></div>
                      <div>{parseFloat(walletData.stakeInfo.stake || 0).toFixed(6)} NXS</div>

                      <div><strong>Trust Score:</strong></div>
                      <div>{walletData.stakeInfo.trust || 0}</div>

                      <div><strong>Annual Stake Rate:</strong></div>
                      <div>{parseFloat(walletData.stakeInfo.stakerate || 0).toFixed(4)}%</div>

                      <div><strong>Trust Weight:</strong></div>
                      <div>{parseFloat(walletData.stakeInfo.trustweight || 0).toFixed(2)}%</div>

                      <div><strong>Block Weight:</strong></div>
                      <div>{parseFloat(walletData.stakeInfo.blockweight || 0).toFixed(2)}%</div>

                      <div><strong>Stake Weight:</strong></div>
                      <div>{parseFloat(walletData.stakeInfo.stakeweight || 0).toFixed(2)}%</div>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <StatusIndicator status={walletData.stakeInfo.staking ? 'connected' : 'disconnected'}>
                        {walletData.stakeInfo.staking ? '✅ Staking Active' : '❌ Staking Inactive'}
                      </StatusIndicator>
                      <StatusIndicator status={walletData.stakeInfo.onhold ? 'disconnected' : 'connected'}>
                        {walletData.stakeInfo.onhold ? '⏳ On Hold' : '🚀 Ready'}
                      </StatusIndicator>
                      {walletData.stakeInfo.change && (
                        <StatusIndicator status="disconnected">
                          🔄 Pending Change
                        </StatusIndicator>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </GridContainer>
          </div>
        )}

        {/* Advanced Tab */}
        {activeWalletTab === 'advanced' && (
          <div>
            <GridContainer>
              {/* Void Transaction */}
              <Card>
                <h3 style={{ color: '#ef4444' }}>❌ Void Transaction</h3>
                <FieldSet legend="Reverse unclaimed debit transactions">
                  <StyledTextField
                    placeholder="Transaction ID to void"
                    value={voidForm.txid}
                    onChange={(e) => setVoidForm(prev => ({ ...prev, txid: e.target.value }))}
                  />
                  <ActionButton variant="danger" onClick={voidTransaction} disabled={loading}>
                    {loading ? 'Voiding...' : '❌ Void Transaction'}
                  </ActionButton>
                </FieldSet>
                <div style={{ marginTop: '16px', padding: '12px', background: '#7f1d1d', borderRadius: '8px', fontSize: '13px', color: '#fecaca' }}>
                  <strong>Warning:</strong> Only works on unclaimed debit/transfer transactions. This action cannot be undone once confirmed.
                </div>
              </Card>

              {/* Migration Tools */}
              <Card>
                <h3 style={{ color: '#8b5cf6' }}>🔄 Migration & Tools</h3>
                <FieldSet legend="Advanced operations">
                  <ActionButton 
                    variant="secondary" 
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const result = await NEXUS.utilities.secureApiCall('finance/migrate/accounts', {
                          createname: true
                        });
                        NEXUS.utilities.showSuccessDialog({
                          message: 'Legacy Accounts Migrated',
                          note: `Migrated ${result?.length || 0} accounts successfully`,
                        });
                        await refreshWalletData();
                      } catch (error) {
                        NEXUS.utilities.showErrorDialog({
                          message: 'Migration Failed',
                          note: error?.message || 'Unknown error occurred',
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    🔄 Migrate Legacy Accounts
                  </ActionButton>
                </FieldSet>
                <div style={{ marginTop: '16px', padding: '12px', background: '#1f2937', borderRadius: '8px', fontSize: '13px', color: '#8892b0' }}>
                  <strong>Info:</strong> This migrates legacy wallet accounts to signature chain accounts. Each migration incurs a 0.01 NXS fee per account.
                </div>
              </Card>
            </GridContainer>

            {/* API Information */}
            <Card>
              <h3 style={{ color: '#06b6d4' }}>📚 Finance API Endpoints Available</h3>
              <div style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', fontSize: '13px', color: '#8892b0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  <div><strong>Verbs:</strong> create, debit, credit, burn, get, list, history, transactions</div>
                  <div><strong>Nouns:</strong> account, trust, token, any, all</div>
                  <div><strong>Direct:</strong> get/balances, get/stakeinfo, set/stake, void/transaction, migrate/accounts</div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <strong>Pattern:</strong> finance/verb/noun/filter/operator
                </div>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'profile':
        return renderProfileManagement();
      case 'session':
        return renderSessionControl();
      case 'marketplace':
        return renderMarketplace();
      case 'wallet':
        return renderWallet();
      default:
        return renderDashboard();
    }
  };

  return (
    <DarkContainer>
      <NavigationBar>
        {tabs.map((tab) => (
          <NavTab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => dispatch(setActiveTab(tab.id))}
          >
            {tab.icon} {tab.label}
          </NavTab>
        ))}
      </NavigationBar>

      <ContentArea>
        {renderTabContent()}
      </ContentArea>
    </DarkContainer>
  );
}