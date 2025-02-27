import { Box } from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const optimizedChildren = React.Children.map(children, child => {
    return React.cloneElement(child, {
      ...child.props,
    });
  });
  //
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {optimizedChildren}
        </Box>
      )}
    </div>
  );
}

export const MemoizedTabPanel = React.memo(TabPanel); //{ TabPanel };