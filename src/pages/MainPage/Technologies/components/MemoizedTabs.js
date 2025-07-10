import React from 'react';
import { 
    Box,
    CircularProgress,
    IconButton,
    Tab,
    Tabs
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";

//Tabs, Tab
const MemoizedTabs = React.memo(({ tabs, tabValue, handleRemoveTab, setTabValue, loadingTimer }) => {
  return (
    <Tabs
      value={tabValue}
      onChange={(event, newValue) => setTabValue(newValue)}
      variant='scrollable'
      scrollButtons='auto'
      textColor="inherit"
      sx={{ maxWidth: '100%', overflow: 'hidden' }}
    >
      {tabs.map((tab, index) => (
        <Tab
          key={tab.id}
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {tab.label}
              {loadingTimer && <CircularProgress size={20} color="inherit" />}
              <IconButton
                size="small"
                sx={{ marginLeft: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTab(tab.id);
                }}
              >
                <CloseIcon fontSize="small" sx={{ color: 'white' }} />
              </IconButton>
            </Box>
          }
          /*onMouseUp={(e) => handleTabMouseUp(e, tab.id)}*/
        />
      ))}
    </Tabs>
  );
});

export { MemoizedTabs };  
  
  