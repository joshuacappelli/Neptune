import { AppBar as MuiAppBar, Toolbar, IconButton, Menu, MenuItem, Typography, Box } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Code as CodeIcon, CloudDownload as CloneIcon, AccountCircle as AccountIcon, Help as HelpIcon } from '@mui/icons-material';
import { useState } from 'react';

interface AppBarProps {
  onNewTab: () => void;
  onCloseTab: () => void;
  onInitRepo: () => void;
  onCloneRepo: () => void;
  onSignIn: () => void;
}

export const AppBar = ({
  onNewTab,
  onCloseTab,
  onInitRepo,
  onCloneRepo,
  onSignIn
}: AppBarProps) => {
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);
  const [fileAnchorEl, setFileAnchorEl] = useState<null | HTMLElement>(null);

  const handleHelpMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setHelpAnchorEl(event.currentTarget);
  };

  const handleFileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFileAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setHelpAnchorEl(null);
    setFileAnchorEl(null);
  };

  return (
    <MuiAppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'rgba(31, 41, 55)',
        backdropFilter: 'blur(8px)',
        minHeight: '30px',
        height: '30px'
      }}
    >
      <Toolbar sx={{ minHeight: '30px !important', justifyContent: 'flex-start', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleFileMenuOpen}>
            <Typography variant="body1" sx={{ color: 'white', fontSize: '12px' }}>File</Typography>
          </IconButton>
          <Menu
            anchorEl={fileAnchorEl}
            open={Boolean(fileAnchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: 'rgba(31, 41, 55)',
                backdropFilter: 'blur(8px)',
                '& .MuiMenuItem-root': {
                  fontSize: '12px',
                  color: 'white'
                }
              }
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); onNewTab(); }}>
              <AddIcon sx={{ mr: 1, fontSize: '16px' }} /> New Tab
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); onCloseTab(); }}>
              <CloseIcon sx={{ mr: 1, fontSize: '16px' }} /> Close Tab
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); onInitRepo(); }}>
              <CodeIcon sx={{ mr: 1, fontSize: '16px' }} /> Initialize Repository
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); onCloneRepo(); }}>
              <CloneIcon sx={{ mr: 1, fontSize: '16px' }} /> Clone Repository
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); onSignIn(); }}>
              <AccountIcon sx={{ mr: 1, fontSize: '16px' }} /> Sign In
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleHelpMenuOpen}>
            <Typography variant="body1" sx={{ color: 'white', fontSize: '12px' }}>Help</Typography>
          </IconButton>
          <Menu
            anchorEl={helpAnchorEl}
            open={Boolean(helpAnchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: 'rgba(31, 41, 55)',
                backdropFilter: 'blur(8px)',
                '& .MuiMenuItem-root': {
                  fontSize: '12px',
                  color: 'white'
                }
              }
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <Typography sx={{ fontSize: '12px' }}>About Neptune</Typography>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Typography sx={{ fontSize: '12px' }}>Submit Feature Request</Typography>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Typography sx={{ fontSize: '12px' }}>Follow us on Twitter</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};
